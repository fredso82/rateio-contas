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
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`

## Seed de demonstração

- `npm run db:seed` cria dois usuários de demonstração com senha `demo123456`.
- A seed monta uma dupla ativa com um período já fechado, outro período aberto e uma dupla arquivada para QA manual rápido.
- Contas criadas:
  - `demo@rateiocontas.app`
  - `parceira@rateiocontas.app`

## Deploy em VPS

- O projeto já está configurado com `output: "standalone"` no `Next.js`.
- Em produção, use as variáveis de `.env.production.example`.
- Migrations de produção podem ser aplicadas com `npm run db:deploy`.

## Checklist de deploy na Hostinger

1. Provisionar PostgreSQL e preencher `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
2. Rodar `npm ci`, `npm run build` e `npm run db:deploy` no servidor.
3. Subir a aplicação com `npm run start` atrás de um proxy reverso com HTTPS.
4. Configurar domínio, renovação de SSL, restart automático do processo e política de logs.
5. Validar manualmente login, convite, abertura de período, fechamento, reabertura e consulta de histórico.

## Backup e restauração mínimos

- Backup lógico diário: `pg_dump "$DATABASE_URL" --format=custom --file=backup.dump`
- Teste de restauração em ambiente separado:
  - `createdb rateio_contas_restore`
  - `pg_restore --clean --no-owner --dbname=rateio_contas_restore backup.dump`
- Antes do primeiro uso real, faça ao menos um ensaio completo de backup + restauração.
