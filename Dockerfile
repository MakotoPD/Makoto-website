# Etap 1: Budowanie aplikacji (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm

# Zależności build-time dla "sharp" (Nuxt Image / IPX)
# libc6-compat jest wymagane dla prekompilowanych binarek, a jeśli będą kompilowane z źródeł,
# potrzebne są python3, g++ i make oraz vips-dev
RUN apk add --update --no-cache python3 make g++ vips-dev fftw-dev gcc libc6-compat autoconf automake libtool nasm libpng-dev

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm --version && pnpm install --prod=false
COPY . .
RUN pnpm run build


# Etap 2: Uruchomienie aplikacji (Runner)
FROM node:20-alpine

# ===================================================================
# Zależności runtime dla "sharp" (IPX) – tylko biblioteki, bez narzędzi kompilacji
# vips zapewnia biblioteki czasu wykonania, libc6-compat dla zgodności binarek
RUN apk add --no-cache vips libc6-compat
# ===================================================================

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["node", ".output/server/index.mjs"]