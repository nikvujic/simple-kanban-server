# Simple Kanban Server

A kanban board REST API built with Express, TypeScript, Prisma, and PostgreSQL.

## Prerequisites

- Docker
- Node.js (only needed for the local dev workflow)

## Quick start (Docker)

Runs the API and Postgres together. Migrations run automatically on startup.

```bash
cp .env.example .env   # then edit values as needed
docker compose up -d --build
```

API is available at `http://localhost:17600`.

To seed the database (one-off):

```bash
docker compose exec app npx prisma db seed
```

## Local dev workflow

Runs Postgres in Docker and the server on the host with hot reload.

```bash
docker compose up -d postgres
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API is available at `http://localhost:4000` (or whatever `PORT` is set to in `.env`).

## Environment

```env
DATABASE_URL="postgresql://kanban_user:kanban_password@localhost:5433/simple-kanban?schema=public"
PORT=4000
JWT_SECRET="change-me"

# Seed config
SEED_USER_EMAIL=your@email.com
SEED_USER_NAME=Name
SEED_USER_PASSWORD=some-password
```

When running via `docker compose up`, `DATABASE_URL` is overridden to point at the `postgres` service inside the Docker network — the value above is for local dev against the published port.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JS |

## Docker reference

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start app + db in background |
| `docker compose up -d --build` | Rebuild image and start |
| `docker compose logs -f app` | Tail server logs |
| `docker compose stop` | Stop without removing containers |
| `docker compose down` | Stop and remove containers (volume kept) |
| `docker compose down -v` | Stop and remove containers **and database volume** |
