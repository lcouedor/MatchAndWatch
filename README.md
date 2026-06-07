# Match & Watch

> *"On regarde quoi ce soir ?"* — enfin une réponse.

Application mobile-first permettant à un groupe de choisir collectivement un film à regarder. Chacun swipe de son côté, le système agrège les préférences et désigne un gagnant.

---

## Liens

| Service | URL |
|---------|-----|
| **Frontend (prod)** | https://match-and-watch.vercel.app |
| **Backend (prod)** | https://matchandwatch-backend.onrender.com |
| **Base de données** | Supabase — projet `Match&Watch` (région `eu-west-1`) |

> Le backend tourne sur Render free tier : il se met en veille après 15 minutes d'inactivité. La première requête après une période d'inactivité peut prendre 30 à 60 secondes le temps du cold start.

---

## Sommaire

- [Comment ça marche](#comment-ça-marche)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer en développement](#lancer-en-développement)
- [Déploiement](#déploiement)
- [API Backend](#api-backend)
- [Schéma de base de données](#schéma-de-base-de-données)

---

## Comment ça marche

### Flux principal

```
Créer une room → Partager le code → Swiper → Voter → Résultat
```

**1. Création de la room**
Le créateur configure la session : nombre de films à liker par personne (bucket size), filtres (genre, année, note, durée, popularité), mode de filtres et timer optionnel par étape.

**2. Rejoindre**
Les participants rejoignent via le code à 4 caractères affiché en haut de l'écran ou en scannant le QR code généré dans l'app.

**3. Swipe**
Chaque participant voit les films dans un ordre aléatoire (style Tinder). Swipe à droite → like, à gauche → passe. La session se termine quand le quota de likes est atteint ou que tous les films ont été vus.

**4. Vote**
Une fois que tout le monde a swipé, l'union des films likés par au moins une personne passe au vote. Chaque participant note chaque film sur une échelle en 5 niveaux (❌ Jamais · 👎 Bof · Neutre · 👍 Ouais · ❤️ Top).

**5. Résultats**
Le film avec le score cumulé le plus élevé est désigné gagnant. Un classement des 5 premiers est affiché, ainsi qu'un carousel des films collectivement rejetés pendant le swipe.

### Modes de filtres

| Mode | Comportement |
|------|-------------|
| **Créateur** | Le créateur définit les filtres avant le début. Les films sont tirés immédiatement à la création. |
| **Vote** | Chaque participant soumet ses préférences de filtres. Les sliders sont résolus par médiane, les genres par union. Les films sont tirés une fois que tous ont voté. |

### Timer optionnel

Le créateur peut définir un temps limite par étape. À expiration, la contribution en cours est soumise automatiquement.

---

## Stack technique

### Backend — [AdonisJS 5](https://adonisjs.com/)

| Brique | Usage |
|--------|-------|
| AdonisJS 5 | Framework Node.js (routing, ORM, validation) |
| Lucid ORM | Accès base de données avec migrations |
| Socket.IO | Synchronisation temps réel entre participants |
| PostgreSQL | Base de données production (Supabase) |
| SQLite | Base de données développement local |
| TMDB API | Sélection aléatoire de films + métadonnées en français |
| TypeScript | Typage complet |

### Frontend — [Vue 3](https://vuejs.org/)

| Brique | Usage |
|--------|-------|
| Vue 3 (Composition API, `<script setup>`) | Framework UI |
| Vue Router 4 | Navigation (hash history) |
| Socket.IO Client | Écoute des événements temps réel |
| SCSS | Styles avec variables, nesting et modules |
| qrcode | Génération du QR code de partage |
| TypeScript | Typage complet |

### Shared types

Le répertoire `shared-types/` contient les interfaces TypeScript partagées entre backend et frontend (`Room`, `Watcher`, `BucketRoom`, `TMDBFilm`, `Filters`, `apiResponse`), évitant toute désynchronisation de contrats.

---

## Structure du projet

```
matchAndWatch/
├── backend/                    # AdonisJS 5
│   ├── app/
│   │   ├── Controllers/Http/   # RoomController, WatcherController
│   │   ├── Models/             # Room, Watcher, BucketRoom, FilterVote
│   │   ├── Services/           # RoomService, TMDBService, Ws (Socket.IO)
│   │   ├── Validators/         # Validation des payloads entrants
│   │   └── Exceptions/         # AppError (erreurs métier typées)
│   ├── config/
│   │   ├── database.ts         # Config SQLite / PostgreSQL
│   │   └── game.ts             # Paramètres métier (taille max room, bucket…)
│   ├── database/
│   │   └── migrations/         # Schéma de la base de données
│   └── start/
│       ├── routes.ts           # Déclaration des routes HTTP
│       └── sockets.ts          # Initialisation Socket.IO
│
├── frontend/                   # Vue 3
│   └── src/
│       ├── views/              # HomeView, MainView, SwipeView, VoteView, ResultsView
│       ├── components/         # DualRangeSlider, StepProgress, QrCodeOverlay…
│       ├── modales/            # ModaleInfo, ModaleCreateRoom, ModalSlug
│       ├── assets/style/       # SCSS global + fichiers par vue
│       ├── api/                # Wrapper axios (get / post / del)
│       └── router/             # createWebHashHistory
│
└── shared-types/               # Interfaces TypeScript partagées
    ├── room.ts
    ├── watcher.ts
    ├── bucketRoom.ts
    ├── tmdb.ts
    ├── filters.ts
    └── apiResponse.ts
```

---

## Installation

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Un compte [TMDB](https://www.themoviedb.org/settings/api) pour obtenir les clés API

### Cloner et installer les dépendances

```bash
git clone <repo-url>
cd matchAndWatch

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

Les `shared-types` sont référencés via des chemins relatifs dans les `tsconfig.json` de chaque sous-projet — aucune installation supplémentaire n'est nécessaire.

---

## Variables d'environnement

### Backend — `backend/.env`

Copier `backend/.env.example` et remplir les valeurs :

```env
HOST=0.0.0.0
PORT=3333
NODE_ENV=development
APP_NAME=Match&Watch
APP_KEY=                          # généré avec : node ace generate:key

DRIVE_DISK=local

# Base de données
DB_CONNECTION=sqlite              # sqlite (dev) ou pg (prod)
DB_FILE=database/database.sqlite

# PostgreSQL (production uniquement)
PG_HOST=
PG_PORT=5432
PG_USER=
PG_PASSWORD=
PG_DB_NAME=postgres

# TMDB (obligatoire)
TMDB_API_KEY=
TMDB_READ_ACCESS_TOKEN=
TMDB_BASE_URL=https://api.themoviedb.org/3
```

Générer la clé d'application :

```bash
cd backend && node ace generate:key
```

### Frontend — `frontend/.env`

```env
# URL du backend
VUE_APP_API_URL=http://localhost:3333

# URL publique pour les QR codes (optionnel)
# Utile pour rejoindre depuis un autre appareil sur le même réseau local
# VUE_APP_PUBLIC_URL=http://192.168.x.x:8080
```

---

## Lancer en développement

### Backend

```bash
cd backend

# Appliquer les migrations
node ace migration:run

# Démarrer avec hot reload
npm run dev
# → http://localhost:3333
```

### Frontend

```bash
cd frontend
npm run serve
# → http://localhost:8080
```

Le frontend est accessible depuis d'autres appareils sur le réseau local (l'option `--host 0.0.0.0` est déjà configurée dans le script `serve`). Pensez à renseigner `VUE_APP_PUBLIC_URL` avec l'IP locale si vous testez le QR code depuis mobile.

---

## Déploiement

L'application est déployée sur trois services :

| Composant | Service | Déclencheur |
|-----------|---------|-------------|
| Backend | [Render](https://render.com) (Web Service) | Push sur `main` |
| Frontend | [Vercel](https://vercel.com) (Static) | Push sur `main` |
| Base de données | [Supabase](https://supabase.com) (PostgreSQL) | Manuel (migrations) |

### Backend sur Render

**Configuration actuelle :**
- Root Directory : `backend`
- Build Command :
  ```
  cd ../shared-types && npm install && npm run build && mkdir -p ../backend/shared-types && cp -r ./build ../backend/shared-types/ && cd ../backend && npm install --include=dev && node ace generate:manifest && node ace build --production --ignore-ts-errors && cd build && npm install --production
  ```
- Start Command : `cd build && node ace migration:run --force && node server.js`
- Branch : `main` uniquement

**Variables d'environnement Render :**

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `10000` |
| `APP_KEY` | *(généré avec `node ace generate:key`)* |
| `APP_NAME` | `Match&Watch` |
| `DRIVE_DISK` | `local` |
| `DB_CONNECTION` | `pg` |
| `PG_HOST` | `aws-0-eu-west-1.pooler.supabase.com` |
| `PG_PORT` | `5432` |
| `PG_USER` | `postgres.gfvatelivexmwfikhoqe` |
| `PG_PASSWORD` | *(mot de passe Supabase)* |
| `PG_DB_NAME` | `postgres` |
| `TMDB_API_KEY` | *(clé TMDB)* |
| `TMDB_READ_ACCESS_TOKEN` | *(token TMDB)* |
| `TMDB_BASE_URL` | `https://api.themoviedb.org/3` |

> **Note Supabase** : on utilise le **connection pooler** Supabase (hostname `aws-0-eu-west-1.pooler.supabase.com`) plutôt que la connexion directe, car Render free tier ne supporte pas IPv6 et le hostname direct de Supabase résout en IPv6. Le format du `PG_USER` avec le pooler est `postgres.{project_ref}`.

### Frontend sur Vercel

**Configuration actuelle :**
- Root Directory : `frontend`
- Build Command : `npm run build`
- Output Directory : `dist`
- Branch : `main` uniquement (désactiver les Preview Deployments dans Settings → Git)

**Variables d'environnement Vercel :**

| Variable | Valeur |
|----------|--------|
| `VUE_APP_API_URL` | `https://matchandwatch-backend.onrender.com` |

### Base de données Supabase

Les migrations sont appliquées automatiquement au démarrage du backend (`node ace migration:run --force` dans le Start Command). Pour appliquer une migration manuellement, utiliser le dashboard Supabase → SQL Editor, ou via le MCP Supabase.

**Projet Supabase :** `gfvatelivexmwfikhoqe` — région `eu-west-1`

---

## API Backend

### Rooms

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/room` | Créer une room |
| `GET` | `/room/:code` | Récupérer l'état d'une room |
| `POST` | `/room/join` | Rejoindre une room |
| `DELETE` | `/room/leave` | Quitter une room |
| `POST` | `/room/addFilmBucket` | Soumettre les likes et dislikes (fin de swipe) |
| `POST` | `/room/voteForFilm` | Soumettre les notes (fin d'étape vote) |
| `POST` | `/room/filterVote` | Soumettre ses préférences de filtres (mode vote) |
| `DELETE` | `/room` | Supprimer une room |

### Films

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/movie` | Détails TMDB d'un film en français (`?movieId=<id>`) |

### Temps réel

La synchronisation entre participants transite par Socket.IO. Le frontend écoute l'événement `updateRoom:<code>` pour déclencher un rechargement de l'état de la room après chaque action (fin de swipe, vote, verrouillage des filtres…).

---

## Schéma de base de données

```
rooms
  id, code, bucket_size, filter_mode, filters (JSON), step_timeout

watchers
  id, room_id, name, step

buckets_rooms
  id, room_id, film_id, weight, is_active, dislike_count

filter_votes
  id, room_id, watcher_id, filters (JSON)
```

**`is_active`** — `true` si au moins un participant a liké le film (il passe au vote).  
**`dislike_count`** — nombre de participants qui ont swipé le film à gauche. Utilisé pour la section "Les oubliés" dans les résultats.  
**`weight`** — score cumulé des votes (somme des notes de tous les participants). Détermine le classement final.
