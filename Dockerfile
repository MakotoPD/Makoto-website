FROM node:24-bookworm-slim AS builder
WORKDIR /app
RUN npm install --global pnpm@10.33.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

# Only the public widget key is needed while building the client.
ARG TURNSTILE_SITE_KEY
ENV TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY
RUN pnpm build
# Nitro may trace only part of Drizzle when a server plugin imports the database.
# Include the complete package, including its PostgreSQL driver, in the runtime.
RUN rm -rf .output/server/node_modules/dotenv .output/server/node_modules/drizzle-orm \
    && cp -RL node_modules/dotenv node_modules/drizzle-orm .output/server/node_modules/

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/db/migrations ./db/migrations
COPY --from=builder /app/data/strapi-public-export.json ./data/strapi-public-export.json
COPY --from=builder /app/data/strapi-media ./data/strapi-media
COPY --from=builder /app/data/project-media ./data/project-media
COPY --from=builder /app/package.json ./package.json
RUN ln -s .output/server/node_modules node_modules \
    && node --input-type=module -e "await Promise.all(['pg','drizzle-orm/node-postgres','drizzle-orm/pg-core','dotenv/config','markdown-it','@aws-sdk/client-s3','argon2','sharp'].map(name => import(name)))"
EXPOSE 3000
CMD ["node", "scripts/start-production.mjs"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
