# rateio-contas

Aplicação mobile first para rateio de despesas entre duas pessoas.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL
- Auth.js com `credentials` e `Google`

## Primeiros passos

1. Suba o banco local com `docker compose up -d`.
2. Copie `.env.example` para `.env`.
3. Instale as dependências com `npm install`.
4. Gere e aplique a base do banco com `npm run db:migrate`.
5. Rode a aplicação com `npm run dev`.

## Scripts úteis

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`

## Deploy em VPS

- O projeto já está configurado com `output: "standalone"` no `Next.js`.
- Em produção, use as variáveis de `.env.production.example`.
- Migrations de produção podem ser aplicadas com `npm run db:deploy`.
