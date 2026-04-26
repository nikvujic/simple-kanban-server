# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build


FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/server.js"]
