## Plano de implementação

Este plano transforma a especificação atual do `rateio-contas` em uma sequência de execução prática. A ideia é construir o MVP em camadas, validando o núcleo do produto antes de investir pesado em refinamento visual e acabamento final.

## Premissas do plano

- O stack sugerido para a primeira versão é `Next.js + TypeScript + Tailwind CSS + Prisma + PostgreSQL`.
- A autenticação deve suportar `email/senha` e `Google`.
- O produto será `mobile first`.
- O MVP deve incluir `PWA`.
- O foco da entrega é `experiência polida`, mas sem pular as regras centrais de domínio.
- A primeira versão deve ser viável para `uso real`, não apenas demonstração.
- A arquitetura inicial deve priorizar solidez e evolução segura.
- O MVP opera apenas em `BRL`.
- O deploy alvo da primeira versão é uma `VPS` na Hostinger.

## Decisões consolidadas após entrevista

- Duplas arquivadas podem ser reativadas no MVP.
- Convites expirados ou inválidos devem poder ser regenerados para a mesma dupla.
- O criador da dupla pode começar a usar a dupla antes da entrada da segunda pessoa.
- Se um convite for aberto por alguém que já está na dupla, o sistema deve apenas redirecionar para a tela da dupla.
- A reabertura do período deve devolver ambos os participantes para `open`.
- O resultado com acerto zero deve comunicar explicitamente que ninguém deve nada.
- O rótulo do período deve ser gerado automaticamente pelo sistema.

## Pontos operacionais para validar cedo

- Se a segunda pessoa entrar em uma dupla com período já aberto, ela deve ser adicionada automaticamente ao período atual.
- Enquanto a dupla tiver apenas um membro, vale bloquear o fechamento do período para evitar estados ambíguos de resultado.

## Estratégia geral

- Primeiro estabilizar fundação técnica e modelo de dados.
- Depois implementar autenticação e estrutura base de navegação.
- Em seguida construir o fluxo principal: dupla, convite, período, despesas e resultado.
- Só depois fechar histórico, arquivamento, PWA e polimento visual final.
- Cada etapa deve terminar com algo funcional e verificável.
- Regras críticas de domínio devem ganhar testes na etapa em que surgirem, não só no final.
- Casos de concorrência e idempotência devem ser tratados desde cedo em convite, abertura de período e fechamento.
- Decisões de deploy, observabilidade e operação entram no plano desde a base porque o produto será de uso real.

## Formato sugerido de execução por etapa

- Começar cada etapa fechando as decisões técnicas específicas que podem bloquear implementação.
- Implementar primeiro domínio, acesso a dados e regras de servidor; depois conectar interface e estados visuais.
- Validar estados de erro, loading e empty state dentro da própria etapa, não como acabamento posterior.
- Adicionar pelo menos um smoke test manual ou automatizado antes de considerar a etapa pronta.
- Só avançar para a etapa seguinte quando o critério de conclusão e o checklist técnico estiverem satisfatórios.

## Etapa 1. Fundação do projeto

Status: concluída

### Objetivo

Criar a base técnica do app para permitir evolução segura e rápida.

### Tarefas

- Inicializar projeto com `Next.js`, `TypeScript` e `Tailwind CSS`.
- Configurar lint, formatação e estrutura inicial de pastas.
- Configurar `Prisma` com `PostgreSQL`.
- Adicionar o schema atual e preparar fluxo de migrações.
- Criar arquivo de variáveis de ambiente de exemplo.
- Definir ambiente local e produção pensando em deploy na Hostinger.
- Definir padrão inicial para tratamento de erro, logs e segredos.
- Definir convenções iniciais de nomes, rotas, componentes e ações de servidor.

### Checklist técnico sugerido

- [x] Fechar estrutura base do app, incluindo organização de rotas, aliases e separação entre UI, domínio e acesso a dados.
- [x] Subir `PostgreSQL` local, conectar `Prisma`, aplicar migração inicial e gerar client.
- [x] Criar `envs` mínimas para local e produção, incluindo autenticação, banco e URL base da aplicação.
- [x] Preparar scripts de `dev`, `lint`, `typecheck`, `build`, `db:migrate` e `db:seed`.
- [x] Definir padrão inicial para logs, captura de erros e respostas de falha em ações de servidor.
- [x] Validar que a aplicação sobe, conecta no banco e gera build de produção sem erro.

### Entregáveis

- projeto rodando localmente
- conexão com banco configurada
- migração inicial aplicável
- estrutura inicial de app pronta para crescer
- build de produção executável

### Dependências

- nenhuma

### Critério de conclusão

- aplicação sobe sem erro
- banco conecta corretamente
- schema e migração inicial são executáveis
- build de produção roda sem erro
- variáveis de ambiente mínimas de local e produção estão mapeadas

## Etapa 2. Base visual e shell da aplicação

Status: concluída

### Objetivo

Montar a casca da aplicação com identidade visual inicial e navegação coerente com o produto.

### Tarefas

- Definir direção visual inicial do produto.
- Criar tokens básicos de interface: cores, tipografia, espaçamento e estados.
- Implementar layout principal mobile first.
- Criar componentes base reutilizáveis: botão, input, card, modal, toast, empty state e loader.
- Definir padrão de feedback visual para sucesso, erro, loading e confirmação.

### Checklist técnico sugerido

- [x] Definir identidade visual inicial com tokens de cor, tipografia, espaçamento e radius.
- [x] Criar layout raiz da aplicação, separando claramente áreas públicas, autenticadas e páginas de fluxo especial como convite.
- [x] Implementar componentes base com variantes suficientes para reutilização sem retrabalho imediato.
- [x] Padronizar estados de loading, erro, sucesso e confirmação com comportamento consistente.
- [x] Montar ao menos uma tela autenticada e uma tela pública usando apenas a base criada, para testar a robustez do shell.

### Entregáveis

- design base consistente
- layout principal funcionando
- biblioteca mínima de componentes do produto

### Dependências

- Etapa 1

### Critério de conclusão

- telas iniciais conseguem ser montadas sem retrabalho estrutural
- a interface já tem cara de produto, não de protótipo cru

## Etapa 3. Autenticação e sessão

Status: concluída

### Objetivo

Permitir entrada segura no sistema com os dois métodos previstos no MVP.

### Tarefas

- Implementar cadastro com email e senha.
- Implementar login com email e senha.
- Implementar login com Google.
- Configurar persistência de sessão.
- Criar proteção para rotas autenticadas.
- Implementar logout.
- Implementar estados e mensagens de erro de autenticação.

### Checklist técnico sugerido

- [x] Fechar solução de autenticação, sessão e estratégia de persistência para web e PWA.
- [x] Implementar cadastro e login com `email/senha`, incluindo hash seguro e validação de formulário.
- [x] Implementar login com `Google` e mapear corretamente contas para o mesmo usuário quando necessário.
- [x] Proteger rotas privadas e padronizar redirecionamentos após login, logout e tentativa de acesso sem sessão.
- [x] Garantir retorno correto ao fluxo de convite após autenticação.
- [x] Executar smoke test com conta nova, conta existente, logout e retorno com sessão persistida.

### Entregáveis

- fluxo completo de autenticação
- sessão persistida
- rotas protegidas

### Dependências

- Etapa 1
- Etapa 2

### Critério de conclusão

- usuário consegue criar conta, entrar, sair e voltar com sessão válida
- rotas privadas não ficam acessíveis sem autenticação

## Etapa 4. Perfil do usuário

### Objetivo

Permitir que cada usuário complete e atualize seus dados essenciais para o rateio.

### Tarefas

- Criar tela de complemento de perfil após primeiro acesso.
- Salvar nome do usuário.
- Salvar chave Pix opcional.
- Permitir edição posterior do perfil.
- Exibir mensagens explicando que a chave Pix pode ser preenchida depois.

### Checklist técnico sugerido

- [ ] Definir quais campos são obrigatórios no primeiro acesso e quais podem ser adiados.
- [ ] Criar regra de redirecionamento para complemento de perfil após autenticação inicial.
- [ ] Implementar formulário de perfil inicial com foco em rapidez no celular.
- [ ] Implementar edição posterior do perfil sem quebrar o fluxo principal da aplicação.
- [ ] Validar cenários de primeiro acesso via `credentials` e via `Google`.

### Entregáveis

- fluxo de perfil inicial
- edição simples de perfil

### Dependências

- Etapa 3

### Critério de conclusão

- novo usuário autenticado consegue completar perfil e seguir para a área principal
- perfil pode ser atualizado sem quebrar fluxos existentes

## Etapa 5. Estrutura de duplas

### Objetivo

Permitir criação e visualização de duplas, que são a unidade central do produto.

### Tarefas

- Criar tela inicial de duplas ativas.
- Implementar criação de nova dupla.
- Persistir relação entre usuário e dupla.
- Exibir estado vazio para quem ainda não tem dupla.
- Exibir claramente quando a dupla ainda está incompleta.
- Criar tela de detalhe da dupla.

### Checklist técnico sugerido

- [ ] Criar consultas para listar duplas ativas, arquivadas e memberships do usuário logado.
- [ ] Implementar criação de dupla com inclusão automática do criador como primeiro membro.
- [ ] Construir tela inicial com estado vazio e CTA forte para primeira dupla.
- [ ] Construir tela de detalhe da dupla com destaque para estado incompleto e próximos passos.
- [ ] Garantir navegação clara entre lista de duplas, detalhe da dupla e criação de nova dupla.

### Entregáveis

- home de duplas
- criação de dupla funcional
- detalhe de dupla básico
- estado de dupla incompleta resolvido

### Dependências

- Etapa 3
- Etapa 4

### Critério de conclusão

- usuário autenticado consegue criar e visualizar suas duplas
- criador consegue começar o uso da dupla mesmo antes da entrada do segundo membro

## Etapa 6. Convites por link

### Objetivo

Permitir formação da dupla por meio de link compartilhável com validade de 24 horas.

### Tarefas

- Implementar geração de convite com token único.
- Definir validade de 24 horas.
- Criar ação de copiar link.
- Criar ação de compartilhar no celular quando disponível.
- Implementar tela ou rota de entrada por convite.
- Validar convite pendente, expirado, aceito ou inválido.
- Vincular automaticamente o usuário autenticado à dupla quando o convite for válido.
- Permitir gerar novo convite para a mesma dupla quando o anterior não for mais utilizável.
- Redirecionar para a tela da dupla quando quem abrir o convite já for membro.
- Bloquear entrada quando a dupla já tiver dois membros.

### Checklist técnico sugerido

- [ ] Definir ciclo de vida do convite, incluindo criação, expiração, consumo, revogação e regeneração.
- [ ] Implementar geração de token único com validade de `24h` e persistência consistente.
- [ ] Criar rota de entrada por convite com tratamento de usuário autenticado e não autenticado.
- [ ] Garantir retorno ao convite após login ou cadastro, sem perder o contexto.
- [ ] Tratar idempotência para quem já é membro e concorrência quando duas pessoas tentarem aceitar ao mesmo tempo.
- [ ] Executar smoke test para convite válido, expirado, usado, revogado e já pertencente ao membro.

### Entregáveis

- convite gerado e persistido
- entrada por convite funcionando
- mensagens claras para estados de erro
- regeneração de convite funcionando

### Dependências

- Etapa 5

### Critério de conclusão

- dois usuários conseguem formar uma dupla de ponta a ponta usando link
- abrir um convite já consumido pelo próprio membro não gera efeito colateral

## Etapa 7. Períodos de rateio

### Objetivo

Criar a base operacional do ciclo de rateio dentro de cada dupla.

### Tarefas

- Implementar abertura de período.
- Garantir regra de apenas um período aberto ou parcialmente fechado por dupla.
- Gerar `label` automático para o período.
- Criar `PeriodParticipant` para os membros presentes na dupla.
- Adicionar automaticamente o segundo membro ao período atual se ele entrar na dupla com período ativo.
- Exibir estado atual do período na tela da dupla.
- Bloquear abertura de novo período quando já houver período ativo.

### Checklist técnico sugerido

- [ ] Definir algoritmo de `label` automático do período e garantir consistência com locale e timezone do produto.
- [ ] Implementar abertura de período em transação, evitando criação duplicada em clique concorrente.
- [ ] Criar `PeriodParticipant` apenas para os membros presentes no momento da abertura.
- [ ] Garantir inclusão automática do segundo membro no período ativo quando ele entrar depois.
- [ ] Expor estado atual do período na tela da dupla com mensagens claras para dupla incompleta e dupla completa.
- [ ] Validar regra de unicidade de período ativo tanto na aplicação quanto no banco, quando possível.

### Entregáveis

- criação de período funcional
- status do período visível
- bloqueios de regra aplicados
- label automático visível

### Dependências

- Etapa 6

### Critério de conclusão

- dupla com um ou dois membros consegue abrir um período válido dentro das regras do domínio
- sistema impede abertura indevida de novo período
- entrada do segundo membro em dupla com período aberto mantém o período consistente

## Etapa 8. Cadastro e gestão de despesas

### Objetivo

Implementar o coração do uso diário do produto: lançar gastos com rapidez e clareza.

### Tarefas

- Criar tela de período aberto.
- Criar modal ou tela de nova despesa.
- Salvar descrição, valor e data.
- Associar automaticamente a despesa ao usuário logado.
- Implementar edição de despesa.
- Implementar exclusão de despesa.
- Exibir lista de despesas do período.
- Exibir total parcial por participante.
- Garantir validações de formulário e dinheiro em `BRL`.

### Checklist técnico sugerido

- [ ] Criar schema de validação para despesa, incluindo descrição, valor em `BRL` e data.
- [ ] Implementar criação, edição e exclusão de despesa sempre vinculada ao usuário logado.
- [ ] Garantir que apenas participantes abertos possam manipular suas próprias despesas.
- [ ] Construir experiência de lançamento de despesa otimizada para celular, com baixo atrito.
- [ ] Exibir lista de despesas, totais por participante e resumo do período com atualização confiável.
- [ ] Validar conversão de valor para centavos, datas e arredondamentos antes de considerar a etapa pronta.

### Entregáveis

- lançamento de despesa funcional
- edição e exclusão funcionando
- resumo parcial visível

### Dependências

- Etapa 7

### Critério de conclusão

- cada participante consegue registrar seus gastos sem fricção
- totais parciais refletem o estado real das despesas

## Etapa 9. Fechamento individual do período

### Objetivo

Transformar o período em fluxo controlado por participação individual.

### Tarefas

- Implementar ação de fechar participação.
- Alterar status individual em `PeriodParticipant`.
- Bloquear fechamento enquanto a dupla ainda não tiver dois membros.
- Bloquear edição e exclusão das despesas daquele participante após fechamento.
- Atualizar status geral do período para `partially_closed` quando apenas um fechar.
- Atualizar para `closed` quando os dois fecharem.
- Exibir visualmente quem já fechou e quem ainda não fechou.

### Checklist técnico sugerido

- [ ] Implementar fechamento individual em transação, com atualização consistente do status do participante e do período.
- [ ] Bloquear fechamento enquanto a dupla estiver incompleta.
- [ ] Impedir edição e exclusão de despesas do participante após o fechamento.
- [ ] Garantir que o outro participante continue podendo lançar e ajustar despesas enquanto estiver aberto.
- [ ] Exibir status de cada participante de forma legível na interface.
- [ ] Testar o fluxo em que uma pessoa fecha antes da outra e o período permanece parcialmente fechado.

### Entregáveis

- fechamento individual funcionando
- regras de bloqueio aplicadas
- estado do período coerente na interface
- fechamento indisponível para dupla incompleta

### Dependências

- Etapa 8

### Critério de conclusão

- o sistema respeita corretamente o fechamento individual
- não é possível alterar gastos de quem já fechou
- não é possível fechar período em cenário que ainda não comporta cálculo final

## Etapa 10. Cálculo do resultado final

### Objetivo

Entregar o principal valor do produto: calcular o acerto final de forma clara e confiável.

### Tarefas

- Somar despesas válidas do período.
- Calcular total geral.
- Calcular metade do total para cada participante.
- Comparar valor pago por pessoa versus valor devido.
- Persistir `SettlementResult`.
- Criar tela de resultado do período.
- Exibir chave Pix do recebedor quando houver.
- Implementar ação de copiar chave Pix.
- Tratar caso de acerto igual a zero.
- Exibir estado explícito de `ninguém deve nada` quando o acerto for zero.

### Checklist técnico sugerido

- [ ] Centralizar a regra de cálculo em uma função ou serviço puro, fácil de testar.
- [ ] Garantir que o resultado seja persistido de forma atômica quando o segundo participante fechar.
- [ ] Tratar corretamente cenários com acerto positivo, acerto negativo implícito e acerto zero.
- [ ] Construir tela de resultado com foco em clareza visual e leitura rápida no celular.
- [ ] Exibir chave Pix do recebedor quando existir e estado alternativo quando não existir.
- [ ] Cobrir com testes ao menos três cenários: uma pessoa deve pagar, outra deve pagar e ninguém deve nada.

### Entregáveis

- cálculo de rateio funcional
- tela de resultado clara
- resultado persistido no banco
- caso de acerto zero resolvido na interface

### Dependências

- Etapa 9

### Critério de conclusão

- ao fechar o segundo participante, o sistema mostra corretamente quem paga quanto para quem ou deixa explícito que ninguém deve nada

## Etapa 11. Reabertura do período

### Objetivo

Permitir correção de períodos encerrados com o mínimo de atrito.

### Tarefas

- Permitir reabertura apenas do período mais recente.
- Exibir modal simples de confirmação.
- Remover ou invalidar o `SettlementResult` anterior.
- Recolocar o período em estado editável.
- Retornar ambos os `PeriodParticipant` para `open`.
- Garantir novo recálculo apenas após novo fechamento de ambos.

### Checklist técnico sugerido

- [ ] Garantir regra que permita reabrir apenas o último período encerrado da dupla.
- [ ] Implementar confirmação explícita antes da reabertura.
- [ ] Remover ou invalidar o resultado consolidado anterior de forma segura.
- [ ] Reabrir período e participantes em uma única operação consistente.
- [ ] Garantir que o novo cálculo só aconteça após novo fechamento completo.
- [ ] Testar fluxo completo de reabrir, editar, fechar novamente e recalcular.

### Entregáveis

- reabertura funcional
- recálculo coerente após ajustes
- participantes reabertos corretamente

### Dependências

- Etapa 10

### Critério de conclusão

- usuário consegue reabrir, corrigir e recalcular o período sem inconsistência

## Etapa 12. Histórico e arquivamento de dupla

### Objetivo

Completar o fluxo de organização do uso contínuo do produto.

### Tarefas

- Exibir histórico de períodos encerrados por dupla.
- Permitir acessar resultados anteriores.
- Implementar arquivamento de dupla.
- Remover duplas arquivadas da lista principal.
- Criar tela de duplas arquivadas.
- Implementar reativação de dupla arquivada.

### Checklist técnico sugerido

- [ ] Criar consulta eficiente para histórico de períodos encerrados e resultados anteriores.
- [ ] Construir área de duplas arquivadas separada da lista principal.
- [ ] Implementar arquivamento sem perda de histórico ou vínculo de membros.
- [ ] Implementar reativação devolvendo a dupla para a lista principal com estado íntegro.
- [ ] Validar navegação entre dupla ativa, arquivada e histórico de resultados.

### Entregáveis

- histórico básico funcional
- arquivamento de dupla funcionando
- reativação funcionando

### Dependências

- Etapa 11

### Critério de conclusão

- usuário consegue consultar histórico e organizar suas duplas sem perder dados
- usuário consegue arquivar e reativar dupla sem perda de contexto

## Etapa 13. PWA

### Objetivo

Transformar o produto em aplicação instalável com comportamento consistente em dispositivos compatíveis.

### Tarefas

- Criar manifesto da aplicação.
- Definir nome curto, nome completo, ícones e cores do app.
- Configurar comportamento instalável.
- Garantir tela inicial e navegação adequadas ao uso como app.
- Validar instalação em Android e desktop compatível.
- Ajustar experiência de splash e ícones.

### Checklist técnico sugerido

- [ ] Definir estratégia de PWA e os requisitos mínimos para instalação na primeira versão.
- [ ] Criar manifesto, ícones e metadados visuais coerentes com a identidade do produto.
- [ ] Garantir comportamento instalável e navegação adequada quando aberto como app.
- [ ] Validar instalação em Android e em desktop compatível.
- [ ] Verificar se fluxos críticos como autenticação e convite continuam íntegros no modo instalado.

### Entregáveis

- PWA instalável
- manifesto e ícones configurados

### Dependências

- Etapa 2
- Etapa 5

### Critério de conclusão

- app pode ser instalado com comportamento visual aceitável em ambiente compatível

## Etapa 14. Polimento visual e experiência

### Objetivo

Levar o produto do funcional para um nível de acabamento bom o suficiente para uso real e portfólio.

### Tarefas

- Refinar hierarquia visual das telas principais.
- Melhorar estados vazios, confirmações e mensagens de erro.
- Ajustar animações leves e transições relevantes.
- Revisar legibilidade de cards, totais e resultado final.
- Refinar ações principais para uso com uma mão no celular.
- Revisar consistência visual entre telas.

### Checklist técnico sugerido

- [ ] Revisar tela por tela a hierarquia visual das ações e informações principais.
- [ ] Melhorar estados vazios, mensagens de erro e confirmações para reduzir ambiguidade.
- [ ] Ajustar tipografia, contraste, espaçamento e tamanho de toque para uso frequente no celular.
- [ ] Inserir animações leves apenas onde ajudam a compreensão do fluxo.
- [ ] Fazer uma passada final de consistência visual entre telas, componentes e transições.

### Entregáveis

- interface polida
- experiência mais fluida
- apresentação mais forte para portfólio

### Dependências

- Etapas 2 a 13

### Critério de conclusão

- produto transmite confiança, clareza e acabamento acima de um CRUD comum

## Etapa 15. Testes, deploy e validação final

### Objetivo

Garantir que o fluxo principal esteja estável e preparado para o primeiro uso real.

### Tarefas

- Criar dados de seed para usuários, dupla, período e despesas.
- Criar testes para regras críticas de domínio.
- Cobrir ao menos o fluxo principal de autenticação, convite, período, despesas e cálculo.
- Validar regras de reabertura e bloqueio.
- Fazer revisão manual mobile first.
- Testar instalação do PWA.
- Revisar acessibilidade básica e responsividade.
- Validar build e start de produção em ambiente próximo ao deploy real.
- Preparar checklist de deploy para VPS da Hostinger.
- Definir rotina mínima de backup e restauração do banco.

### Checklist técnico sugerido

- [ ] Criar `seed` realista para demonstrar o produto e acelerar QA manual.
- [ ] Cobrir com testes automatizados as regras críticas de convite, período ativo, fechamento, reabertura e cálculo.
- [ ] Garantir ao menos um fluxo ponta a ponta automatizado ou rigidamente validado para login, convite, despesas e resultado.
- [ ] Validar `lint`, `typecheck`, `build` e execução em modo de produção.
- [ ] Preparar checklist de deploy na Hostinger, incluindo variáveis, banco, domínio, SSL, processo da aplicação e restart.
- [ ] Definir rotina mínima de backup e ensaio de restauração antes do primeiro uso real.

### Entregáveis

- seed inicial
- testes dos fluxos principais
- checklist de validação da primeira versão
- checklist de deploy inicial

### Dependências

- Etapas 1 a 14

### Critério de conclusão

- fluxo principal funciona de ponta a ponta com confiança suficiente para uso real
- aplicação está pronta para primeiro deploy com operação básica viável

## Ordem recomendada de execução

1. Etapa 1. Fundação do projeto
2. Etapa 2. Base visual e shell da aplicação
3. Etapa 3. Autenticação e sessão
4. Etapa 4. Perfil do usuário
5. Etapa 5. Estrutura de duplas
6. Etapa 6. Convites por link
7. Etapa 7. Períodos de rateio
8. Etapa 8. Cadastro e gestão de despesas
9. Etapa 9. Fechamento individual do período
10. Etapa 10. Cálculo do resultado final
11. Etapa 11. Reabertura do período
12. Etapa 12. Histórico e arquivamento de dupla
13. Etapa 13. PWA
14. Etapa 14. Polimento visual e experiência
15. Etapa 15. Testes, deploy e validação final

## Marcos de entrega

### Marco 1. Base pronta para desenvolver

Inclui etapas 1 a 3.

### Marco 2. Fluxo de entrada de usuários e formação de dupla

Inclui etapas 4 a 6.

### Marco 3. Núcleo do produto funcionando

Inclui etapas 7 a 10.

### Marco 4. Produto completo no escopo do MVP

Inclui etapas 11 a 13.

### Marco 5. Entrega polida

Inclui etapas 14 e 15.

## Riscos principais

- gastar tempo cedo demais em polimento visual antes de estabilizar domínio e autenticação
- subestimar complexidade do fluxo de convite e entrada automática na dupla
- permitir uso com dupla incompleta sem definir claramente como o segundo membro entra no período ativo
- deixar regras de fechamento e reabertura inconsistentes entre banco, backend e interface
- tratar PWA como detalhe de última hora e descobrir problemas tarde demais
- adiar decisões de deploy, logs e backup até o fim mesmo sendo um produto para uso real

## Próxima ação recomendada

Começar pela `Etapa 1`, já fechando stack, autenticação, forma de deploy na Hostinger e as regras de domínio para dupla incompleta com período ativo.
