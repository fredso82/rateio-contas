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
- `npm run build:standalone`
- `npm run start:standalone`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`

## Docker Compose

1. Copie `.env.docker.example` para `.env.docker`.
2. Ajuste pelo menos `POSTGRES_PASSWORD`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL` e, se quiser, `APP_PORT`.
3. Suba tudo com `docker compose --env-file .env.docker up -d --build`.
4. A aplicação ficará disponível em `http://localhost:APP_PORT`.

Observações:

- O serviço `app` aplica `npm run db:deploy` via `prisma migrate deploy` antes de iniciar o servidor.
- Para acesso inicial por IP, use `AUTH_URL=http://SEU_IP:APP_PORT` e `NEXT_PUBLIC_APP_URL=http://SEU_IP:APP_PORT`.
- O login com Google deve permanecer desabilitado enquanto a aplicação estiver acessível apenas por IP público.

## Seed de demonstração

- `npm run db:seed` cria dois usuários de demonstração com senha `demo123456`.
- A seed monta uma dupla ativa com um período já fechado, outro período aberto e uma dupla arquivada para QA manual rápido.
- Contas criadas:
  - `demo@rateiocontas.app`
  - `parceira@rateiocontas.app`

## Deploy em VPS

- O projeto já está configurado com `output: "standalone"` no `Next.js`.
- Use `npm run build:standalone` para gerar o artefato pronto para rodar com `node .next/standalone/server.js`.
- Em produção, use as variáveis de `.env.production.example`.
- Migrations de produção podem ser aplicadas com `npm run db:deploy`.
- Um passo a passo para Hostinger está em `docs/deploy-hostinger-vps.md`.

## Checklist de deploy na Hostinger

1. Provisionar PostgreSQL e preencher `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`.
2. Rodar `npm ci`, `npm run db:deploy` e `npm run build:standalone` no servidor.
3. Subir a aplicação com `node .next/standalone/server.js` atrás de um proxy reverso com HTTPS.
4. Configurar domínio, renovação de SSL, restart automático do processo e política de logs.
5. Validar manualmente login, convite, abertura de período, fechamento, reabertura e consulta de histórico.

## Backup e restauração mínimos

- Backup lógico diário: `pg_dump "$DATABASE_URL" --format=custom --file=backup.dump`
- Teste de restauração em ambiente separado:
  - `createdb rateio_contas_restore`
  - `pg_restore --clean --no-owner --dbname=rateio_contas_restore backup.dump`
- Antes do primeiro uso real, faça ao menos um ensaio completo de backup + restauração.
