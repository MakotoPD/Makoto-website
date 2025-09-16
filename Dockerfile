# Etap 1: Budowanie aplikacji (Builder)
# Używamy oficjalnego obrazu Node.js w wersji 20 (Alpine to lekka wersja Linuksa)
FROM node:20-alpine AS builder

# Ustawiamy katalog roboczy wewnątrz kontenera
WORKDIR /app

# Instalujemy pnpm globalnie w kontenerze
RUN npm i

# Kopiujemy pliki manifestu zależności
COPY package.json ./

# Instalujemy zależności używając pnpm
RUN npm install

# Kopiujemy resztę kodu źródłowego aplikacji
COPY . .

# Budujemy aplikację Nuxt w trybie produkcyjnym
RUN npm run build

# ---

# Etap 2: Uruchomienie aplikacji (Runner)
# Zaczynamy od nowego, czystego obrazu Node.js, aby finalny obraz był jak najmniejszy
FROM node:20-alpine

WORKDIR /app

# Ustawiamy zmienną środowiskową na produkcję
ENV NODE_ENV=production

# Kopiujemy tylko i wyłącznie zbudowaną aplikację (.output) z poprzedniego etapu
COPY --from=builder /app/.output ./.output

# Informujemy Docker, że nasza aplikacja będzie działać na porcie 3000
EXPOSE 3000

# Komenda, która uruchomi serwer Nuxt po starcie kontenera
CMD ["node", ".output/server/index.mjs"]