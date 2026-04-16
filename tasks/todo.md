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
- `prisma/schema.prisma` foi criado assumindo PostgreSQL + Prisma como stack inicial de persistência.
- `prisma/migrations/20260415211500_init/migration.sql` cria tabelas, enums, índices, foreign keys e reforços de domínio no banco.
- `tasks/plano-implementacao.md` organiza a implementação em etapas com objetivo, tarefas, dependências, entregáveis e critérios de conclusão.
- A especificação agora também reflete que a primeira versão é para uso real, com arquitetura mais sólida, deploy previsto em VPS da Hostinger e operação apenas em BRL.
- O plano agora cobre melhor casos de borda importantes, como dupla incompleta com período aberto, regeneração de convite, reativação de dupla arquivada e exibição de acerto zero.
- O plano de implementação agora também traz um checklist técnico por etapa, o que o deixa mais utilizável como roteiro direto de execução.
