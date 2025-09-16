# Etap 1: Budowanie aplikacji (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# ZAKTUALIZOWANA LINIA: Dodajemy flagę --prod=false, aby zainstalować devDependencies
RUN pnpm install --prod=false

COPY . .
RUN pnpm run build

# ---

# Etap 2: Uruchomienie aplikacji (Runner)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]