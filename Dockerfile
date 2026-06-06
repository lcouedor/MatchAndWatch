# Étape 1 : Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier package.json et lockfile du backend
COPY backend/package*.json ./backend/

# Copier le code backend et shared-types
COPY backend ./backend
COPY shared-types ./shared-types

# Installer les dépendances du backend
RUN cd backend && npm install

# Compiler le backend (avec accès à shared-types)
RUN cd backend && npm run build

# Étape 2 : Image de production
FROM node:18-alpine AS production

WORKDIR /app

# Copier build, node_modules, package.json depuis build stage
COPY --from=build /app/backend/build ./build
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package*.json ./
COPY --from=build /app/shared-types ./shared-types

# Copier les fichiers de config nécessaires
COPY backend/.env .env
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/.adonisrc.json ./.adonisrc.json

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

CMD ["sh", "-c", "cd /app && node build/ace serve"]