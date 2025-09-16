# Etap 1: Budowanie aplikacji (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm --version && pnpm install --prod=false
COPY . .
RUN pnpm run build

# ---

# Etap 2: Uruchomienie aplikacji (Runner)
FROM node:20-alpine

# ===================================================================
# DODAJ TĘ LINIĘ: Instalujemy zależności systemowe dla 'sharp' (używanego przez NuxtImg)
RUN apk add --no-cache vips-dev g++ make
# ===================================================================

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]