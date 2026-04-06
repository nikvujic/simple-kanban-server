# Simple Kanban Server

A kanban board REST API built with Express, TypeScript, Prisma, and PostgreSQL.

## Prerequisites

- Node.js
- Docker

## Setup

### 1. Start the database

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://kanban_user:kanban_password@localhost:5433/simple-kanban?schema=public"
PORT=4000

# Seed config
SEED_USER_EMAIL=your@email.com
SEED_USER_NAME=Name
SEED_USER_PASSWORD=some-password
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npx prisma db seed
```

### 6. Start the dev server

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |
