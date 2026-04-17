## Tarefas

- [x] Consolidar respostas da entrevista de produto
- [x] Atualizar `ideia.md` com decisões pendentes sobre perfil, convite e arquivamento
- [x] Reestruturar `ideia.md` no formato requisitos + telas principais + fluxo do usuário
- [x] Revisar consistência entre MVP, regras de negócio e decisões fechadas
- [x] Adicionar modelo de dados inicial com entidades, relacionamentos e restrições
- [x] Criar schema Prisma inicial com base no modelo de dados do MVP
- [x] Criar migração SQL inicial para PostgreSQL alinhada ao schema Prisma
- [x] Criar plano de implementação detalhado dividido em etapas
- [x] Consolidar respostas da entrevista complementar sobre uso real, arquitetura e deploy
- [x] Atualizar `ideia.md` com decisões sobre reativação, uso solo inicial, convite reaproveitável e resultado zero
- [x] Refinar `tasks/plano-implementacao.md` com critérios mais verificáveis, riscos adicionais e preparação para deploy em VPS
- [x] Revisar consistência entre especificação e plano após as novas decisões
- [x] Detalhar `tasks/plano-implementacao.md` em formato mais executável com checklists técnicos por etapa

## Revisão

- `ideia.md` foi convertido para uma especificação inicial mais pronta para implementação.
- O documento agora incorpora as decisões de chave Pix opcional, ausência de WhatsApp, convite com expiração de 24 horas, arquivamento de dupla, reabertura com modal simples e suporte a PWA na primeira versão.
- A seção de modelo de dados inicial agora define a base relacional sugerida para o MVP.
- `src/server/db/prisma/schema.prisma` foi criado assumindo PostgreSQL + Prisma como stack inicial de persistência.
- `src/server/db/prisma/migrations/20260415211500_init/migration.sql` cria tabelas, enums, índices, foreign keys e reforços de domínio no banco.
- `tasks/plano-implementacao.md` organiza a implementação em etapas com objetivo, tarefas, dependências, entregáveis e critérios de conclusão.
- A especificação agora também reflete que a primeira versão é para uso real, com arquitetura mais sólida, deploy previsto em VPS da Hostinger e operação apenas em BRL.
- O plano agora cobre melhor casos de borda importantes, como dupla incompleta com período aberto, regeneração de convite, reativação de dupla arquivada e exibição de acerto zero.
- O plano de implementação agora também traz um checklist técnico por etapa, o que o deixa mais utilizável como roteiro direto de execução.

## Tarefas atuais

- [x] Criar branch dedicada para a implementação das etapas 1 a 3
- [x] Estruturar o projeto com `Next.js`, `TypeScript`, `Tailwind CSS` e organização base em `src`
- [x] Mover schema e migração do Prisma para dentro de `src` e preparar scripts de banco
- [x] Configurar envs de exemplo, `docker compose`, `build` standalone e seed inicial
- [x] Criar tokens visuais, layouts público/privado e componentes base reutilizáveis
- [x] Implementar páginas iniciais pública, autenticada e fluxo especial de convite
- [x] Implementar cadastro/login com `email/senha`
- [x] Implementar login com `Google`, sessão persistida, logout e proteção de rota privada
- [x] Validar `lint`, `typecheck`, `build`, migração inicial e seed em banco local

## Revisão atual

- As etapas 1 a 3 agora estão implementadas sobre `Next.js 16`, com toda a lógica de aplicação concentrada em `src`.
- O Prisma foi reposicionado para `src/server/db/prisma`, preservando a migração inicial e funcionando com scripts dedicados de `generate`, `migrate`, `deploy`, `seed` e `studio`.
- A fundação operacional inclui `compose.yml`, `.env.example`, `.env.production.example`, `README.md` atualizado, `output: "standalone"` e `seed` com usuário demo.
- A base visual já separa áreas públicas, privadas e o fluxo de convite, com identidade própria, componentes reutilizáveis e estados consistentes de loading, erro e vazio.
- A autenticação cobre `credentials` e `Google`, com hash seguro via `bcryptjs`, vínculo de conta por email, sessão JWT persistida, logout e proteção da rota `/app`.
- O fluxo de retorno pós-login para convite já está preservado via `callbackUrl`, mesmo antes da implementação funcional de aceite do convite.
- As validações executadas nesta entrega foram: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:deploy` e `npm run db:seed`, usando PostgreSQL local via Docker.

## Tarefas de teste

- [x] Configurar infraestrutura de testes com `Vitest` e scripts dedicados
- [x] Manter a configuração executável da suíte dentro de `src/test/config`
- [x] Criar testes unitários para navegação, validação de auth, configuração do `Auth.js` e server actions
- [x] Criar testes de integração para o repositório de autenticação com PostgreSQL de teste
- [x] Automatizar preparo do banco de teste com criação do database e aplicação de migrações
- [x] Validar `npm test`, `npm run lint`, `npm run typecheck` e `npm run format:check`

## Revisão dos testes

- A suíte unitária cobre redirecionamento seguro, schemas de autenticação, callbacks/configuração do `Auth.js` e ações de login/cadastro/logout com mocks.
- A suíte de integração cobre criação de conta por `credentials`, verificação de senha, vínculo e criação de conta via `Google` e snapshot do painel autenticado.
- O banco de teste usa `rateio_contas_test` por padrão e é preparado automaticamente por `src/test/scripts/prepare-test-db.ts`.
- Todos os artefatos executáveis adicionados para testes ficaram sob `src`, com exceção dos arquivos de configuração exigidos pelo próprio framework (`next.config.ts`, `next-env.d.ts` e afins).

## Tarefas atuais

- [x] Adicionar marcação de `profileCompletedAt` no schema e migração correspondente
- [x] Implementar fluxo de primeiro acesso e edição de perfil com redirecionamento seguro
- [x] Implementar listagem, criação e detalhe de duplas com navegação dedicada
- [x] Implementar geração, regeneração e aceite automático de convites por link
- [x] Cobrir etapas 4 a 6 com testes unitários e de integração
- [x] Atualizar `tasks/plano-implementacao.md` marcando as etapas 4 a 6 como concluídas

## Revisão atual

- A etapa 4 agora força o complemento de perfil no primeiro acesso via `profileCompletedAt`, mantendo nome como obrigatório e chave Pix como opcional, com edição posterior em `/app/perfil`.
- A etapa 5 agora entrega a área de duplas em `/app/duplas`, com estado vazio, criação de nova dupla, membership automático do criador e tela de detalhe destacando claramente quando a dupla ainda está incompleta.
- A etapa 6 agora entrega geração de convites com validade de `24h`, revogação do link anterior ao regenerar, rota de convite com preservação de `callbackUrl`, aceite automático para usuário autenticado e bloqueios para convite inválido, expirado, revogado, já usado ou dupla cheia.
- A cobertura de testes passou a incluir validações e server actions de perfil/duplas, além de integração para persistência de perfil, criação/listagem de duplas e ciclo de vida dos convites.

## Tarefas atuais

- [x] Implementar reabertura do período mais recente com invalidação segura do resultado anterior
- [x] Expor reabertura na interface com confirmação explícita e cobertura de testes
- [x] Implementar arquivamento e reativação de duplas com regras de integridade e testes
- [x] Exibir histórico de períodos encerrados e permitir consulta de resultados anteriores
- [x] Criar área dedicada para duplas arquivadas e ajustar navegação entre listas
- [x] Concluir PWA com manifesto refinado, ícones e registro de service worker
- [x] Refinar shell e telas principais com polimento visual mobile first
- [x] Expandir seed para um cenário realista de QA manual
- [x] Atualizar README com checklist de deploy, backup e restauração para VPS
- [x] Validar `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e corrigir qualquer falha

## Revisão atual

- A etapa 11 agora reabre apenas o período encerrado mais recente, remove o `SettlementResult` anterior, devolve os dois participantes para `open` e exige novo fechamento completo para recalcular.
- A etapa 12 agora entrega histórico navegável direto na tela da dupla, consulta de resultados anteriores, área dedicada para duplas arquivadas e ações seguras de arquivar/reativar.
- A etapa 13 agora tem manifesto completo, metadados de instalação, ícones próprios e registro de `service worker` para viabilizar o modo instalável.
- A etapa 14 refinou a navegação mobile, criou estados mais claros para dupla arquivada/histórico/reabertura e adicionou transição leve de entrada sem comprometer acessibilidade.
- A etapa 15 agora inclui seed mais realista para QA manual, checklist de deploy/backup no `README` e cobertura automatizada para reabertura, histórico e arquivamento.
- As validações executadas nesta entrega foram: `npm test`, `npm run lint`, `npm run typecheck` e `npm run build`.

## Tarefas atuais

- [x] Remover vínculo automático entre `credentials` e `Google` por coincidência de email
- [x] Implementar vínculo explícito do `Google` a partir do perfil autenticado
- [x] Trocar aceite automático de convite por ação explícita via `POST`
- [x] Adicionar rate limiting básico para autenticação, início de OAuth e aceite de convite
- [x] Sanitizar mensagens inesperadas para o usuário e reduzir vazamento em logs
- [x] Proteger tokens de convite em repouso com hash para lookup e cifra para recuperação controlada
- [x] Adicionar headers HTTP de hardening
- [x] Cobrir as correções de segurança com testes automatizados

## Revisão atual

- O login com `Google` deixou de vincular contas existentes apenas por email; quando já existe usuário local, o app exige autenticação pelo método atual e vínculo explícito pelo perfil.
- A tela de perfil agora permite vincular `Google` com cookie de intenção assinado e retorno controlado para `/app/perfil`.
- O fluxo de convite não executa mais mutação em `GET`: a rota pública apenas valida/exibe o estado e o aceite passa por `server action` dedicada.
- Convites novos agora são persistidos com `tokenHash` para lookup e `tokenCiphertext` para recuperação controlada do link atual, mantendo compatibilidade com convites legados.
- A camada de erro passou a expor mensagens genéricas para falhas inesperadas e os logs passaram a serializar erros sem despejar objetos crus.
- O app agora aplica `CSP`, `HSTS`, `Referrer-Policy`, `X-Frame-Options`, `X-Content-Type-Options` e `Permissions-Policy` via `next.config.ts`.
- As validações executadas nesta entrega foram: `npm run db:generate`, `npm run typecheck`, `npm test`, `npm run lint` e `npm run build`.
