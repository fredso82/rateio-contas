FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
COPY src/server/db/prisma/schema.prisma ./src/server/db/prisma/schema.prisma
RUN npm ci

FROM deps AS builder

COPY . .
RUN npm run build:standalone

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/src/server/db/prisma ./src/server/db/prisma
COPY --from=builder /app/docker/entrypoint.sh ./docker/entrypoint.sh

RUN chmod +x ./docker/entrypoint.sh

EXPOSE 3000

CMD ["./docker/entrypoint.sh"]
