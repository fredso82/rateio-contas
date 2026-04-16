## Especificação inicial do produto

`rateio-contas` é uma aplicação web mobile first para casais que dividem despesas e querem fechar contas com clareza, rapidez e pouco atrito.

O objetivo da primeira versão é provar a experiência principal do produto com uma interface bem resolvida, visualmente caprichada e utilizável no dia a dia. O projeto será usado como produto pessoal e também como peça de portfólio.

## Requisitos

### Requisitos de produto

- O público inicial do produto é casal.
- O sistema deve ser pensado para uso pessoal, sem monetização planejada.
- A primeira versão deve ser confiável o suficiente para uso real.
- O foco da primeira versão deve ser aparência, polimento e experiência de uso.
- O sucesso da primeira entrega será provar a experiência completa de formação da dupla, lançamento de despesas, fechamento do período e cálculo do acerto.

### Requisitos funcionais

- O sistema deve permitir cadastro com email e senha.
- O sistema deve permitir login com email e senha.
- O sistema deve permitir cadastro e login com conta Google.
- O sistema deve permitir que o usuário tenha um perfil com nome e chave Pix.
- A chave Pix não deve ser obrigatória no cadastro inicial e pode ser preenchida depois.
- O sistema deve permitir que um usuário participe de várias duplas.
- O sistema deve permitir criar uma nova dupla.
- O sistema deve permitir gerar um convite por link para entrada em uma dupla.
- O convite deve expirar em 24 horas.
- O sistema deve permitir copiar e compartilhar o link do convite.
- Ao acessar o convite, a pessoa convidada deve fazer login ou cadastro antes de entrar na dupla.
- Após autenticação válida e convite ainda ativo, a pessoa convidada deve entrar automaticamente na dupla.
- Se um convite válido for aberto por alguém que já faz parte da dupla, o sistema deve apenas redirecionar para a tela da dupla sem efeitos colaterais.
- O sistema deve permitir gerar um novo convite para a mesma dupla quando o anterior expirar, for revogado ou já tiver sido consumido.
- O sistema deve permitir arquivar uma dupla.
- O sistema deve permitir reativar uma dupla arquivada.
- O sistema deve permitir abrir um período em uma dupla.
- O criador da dupla pode abrir período e lançar despesas mesmo antes da segunda pessoa aceitar o convite.
- O sistema deve permitir apenas um período aberto por dupla ao mesmo tempo.
- O sistema deve permitir cadastrar despesas dentro de um período aberto.
- O sistema deve permitir editar e excluir despesas apenas enquanto a participação do usuário estiver aberta.
- O sistema deve mostrar o total parcial do período para cada participante.
- O sistema deve permitir fechamento individual da participação no período.
- O sistema deve consolidar o resultado final apenas quando os dois participantes tiverem fechado.
- O sistema deve mostrar quem deve pagar, quanto deve pagar e qual chave Pix usar para o acerto.
- O sistema deve permitir copiar a chave Pix do recebedor.
- O sistema deve manter histórico básico de períodos encerrados por dupla.
- O sistema deve permitir reabrir um período apenas se ele for o mais recente da dupla.
- Ao reabrir um período encerrado, o sistema deve descartar o resultado anterior e recalcular após novo fechamento dos dois participantes.
- Se a segunda pessoa entrar em uma dupla que já tenha período aberto, o sistema deve adicioná-la automaticamente ao período atual.

### Regras de negócio

- O sistema trabalha apenas com rateio 50/50.
- Toda despesa lançada entra obrigatoriamente no rateio.
- Não existe, na primeira versão, despesa pessoal, parcial ou fora do rateio.
- O usuário que lança a despesa é obrigatoriamente quem realizou o pagamento.
- Não é permitido lançar despesa sem período aberto.
- O sistema opera apenas em `BRL` na primeira versão.
- Se apenas uma pessoa fechar sua participação, o período continua aberto para a dupla.
- Enquanto houver um período aberto ou parcialmente fechado, não deve ser possível abrir um novo período naquela dupla.
- O período pode ter os estados `open`, `partially_closed` e `closed`.
- O rótulo do período deve ser gerado automaticamente pelo sistema.
- Se a dupla ainda tiver apenas um membro, o período pode receber despesas, mas o fechamento deve ficar bloqueado até a entrada do segundo participante.
- A reabertura de um período encerrado deve ser confirmada por modal simples.
- Ao reabrir um período encerrado, ambos os registros de `PeriodParticipant` devem voltar para `open`.
- O arquivamento de uma dupla não deve apagar seu histórico.
- Quando o acerto final for zero, a interface deve deixar explícito que ninguém deve nada.

### Requisitos de interface e experiência

- A experiência deve priorizar celular.
- A navegação deve ser curta, direta e orientada a ação rápida.
- Em telas pequenas, as despesas devem aparecer em cards.
- Em telas maiores, o sistema pode usar lista densa ou tabela.
- A interface deve transmitir clareza, leveza e confiança no fechamento.
- O visual deve parecer produto real, não apenas protótipo funcional.
- O projeto deve usar Tailwind CSS.

### Requisitos técnicos da primeira versão

- A aplicação deve ser responsiva.
- A primeira versão deve ter suporte a PWA.
- O PWA deve permitir instalação em celular e desktop compatíveis.
- O PWA deve ter ícones, manifesto e comportamento básico de aplicação instalável.
- A arquitetura da primeira versão deve priorizar base sólida e preparada para evolução.
- O primeiro deploy deve prever execução em `VPS` da Hostinger.
- O sistema não precisa ter integração com WhatsApp.
- O sistema não precisa ter landing page pública na primeira versão.

### Itens fora do escopo da primeira versão

- integração oficial com WhatsApp
- notificações automáticas fora da aplicação
- categorias e filtros de despesas
- anexos de comprovantes
- auditoria detalhada de alterações
- landing page pública

## Telas principais

### 1. Tela de login e cadastro

- Entrada por email e senha.
- Entrada com Google.
- Alternância simples entre login e criação de conta.
- Mensagens claras para convite expirado, credenciais inválidas e conta já existente.

### 2. Tela de complemento de perfil

- Preenchimento de nome.
- Preenchimento opcional de chave Pix.
- Mensagem explicando que a chave Pix pode ser adicionada depois, mas será necessária para receber acertos.

### 3. Tela inicial de duplas

- Lista de duplas ativas.
- Ação para criar nova dupla.
- Ação para visualizar duplas arquivadas.
- Estado vazio bem trabalhado para primeira utilização.

### 4. Tela de criação de dupla e convite

- Criação da dupla com nome identificável.
- Geração de link de convite.
- Ação para gerar novo convite quando o anterior expirar ou ficar inválido.
- Ação de copiar.
- Ação de compartilhar.
- Informação visível de expiração em 24 horas.

### 5. Tela de entrada por convite

- Validação do convite.
- Redirecionamento para login ou cadastro quando necessário.
- Entrada automática na dupla após autenticação.
- Mensagem específica para convite expirado ou já consumido.

### 6. Tela de detalhe da dupla

- Cabeçalho com nome da dupla.
- Resumo do estado atual.
- Estado claro para dupla incompleta, com reforço do convite pendente.
- Ação para abrir novo período quando permitido.
- Lista de períodos encerrados.
- Ação para arquivar dupla.

### 7. Tela de período aberto

- Resumo parcial do total gasto por cada participante.
- Lista de despesas do período.
- Ação principal para adicionar despesa.
- Ação para editar e excluir apenas as despesas permitidas.
- Ação para fechar participação.
- Indicação visual de quem já fechou e quem ainda está lançando.

### 8. Tela ou modal de criação e edição de despesa

- Campos de descrição, valor e data.
- Validação simples e rápida.
- Fluxo otimizado para uso no celular.

### 9. Tela de resultado do período

- Exibição clara do total do período.
- Exibição de quanto cada pessoa pagou.
- Exibição de quanto cada pessoa deveria pagar.
- Destaque para quem deve transferir e quanto deve transferir.
- Estado explícito para o caso em que ninguém deve nada.
- Exibição da chave Pix de quem vai receber.
- Ação para copiar chave Pix.
- Ação para reabrir período, se permitido.

### 10. Modal de reabertura de período

- Confirmação simples.
- Texto objetivo avisando que o resultado atual será descartado e recalculado depois.

### 11. Tela de duplas arquivadas

- Lista de duplas arquivadas.
- Ação para reativar a dupla.
- Histórico preservado para consulta.

## Fluxo do usuário

### Fluxo 1. Primeiro acesso

1. A pessoa acessa a aplicação.
2. Ela escolhe entrar com email e senha ou Google.
3. Após autenticação, completa o perfil com nome.
4. A chave Pix pode ser preenchida nesse momento ou depois.
5. O sistema leva o usuário para a tela inicial de duplas.

### Fluxo 2. Criação da primeira dupla

1. A pessoa toca em criar dupla.
2. Informa um nome para identificar a dupla.
3. O sistema cria a dupla.
4. O sistema gera um convite com validade de 24 horas.
5. A pessoa pode copiar ou compartilhar o link.
6. Mesmo antes da segunda pessoa entrar, o criador já pode abrir um período e começar a lançar despesas.

### Fluxo 3. Entrada do segundo participante

1. A pessoa convidada acessa o link.
2. O sistema valida o convite.
3. Se ela não estiver autenticada, precisa fazer login ou cadastro.
4. Após autenticação, o sistema adiciona a pessoa na dupla automaticamente.
5. Se o convite tiver expirado, o sistema informa isso e orienta a gerar um novo link.
6. Se a pessoa já fizer parte da dupla, o sistema apenas abre a tela daquela dupla.
7. Se existir um período aberto, a nova participante é adicionada automaticamente a ele.

### Fluxo 4. Abertura do período

1. Com a dupla criada, um dos participantes abre um novo período.
2. O sistema marca a dupla como tendo um período ativo.
3. A partir desse momento, os membros presentes podem lançar despesas.
4. Se a dupla ainda tiver apenas uma pessoa, o sistema permite lançamentos, mas bloqueia o fechamento até a entrada da segunda participante.

### Fluxo 5. Lançamento de despesas

1. A pessoa acessa o período aberto.
2. Toca em adicionar despesa.
3. Informa descrição, valor e data.
4. O sistema associa automaticamente a despesa ao usuário logado.
5. A despesa passa a compor o total parcial do período.
6. Enquanto sua participação estiver aberta, a pessoa pode editar ou excluir suas despesas.

### Fluxo 6. Fechamento individual

1. Quando termina de lançar seus gastos, a pessoa tenta fechar sua participação.
2. O sistema bloqueia edição e exclusão das despesas daquele participante.
3. Se apenas uma pessoa fechar, o período entra em estado `partially_closed`.
4. Enquanto esse estado existir, não é possível abrir um novo período para aquela dupla.
5. Se a dupla ainda não estiver completa, o sistema orienta a concluir o convite antes de permitir o fechamento.

### Fluxo 7. Consolidação do resultado

1. Quando a segunda pessoa também fecha sua participação, o sistema encerra o período.
2. O sistema soma todas as despesas válidas.
3. O sistema divide o total igualmente entre os dois participantes.
4. O sistema compara quanto cada um pagou com quanto deveria pagar.
5. O sistema exibe o resultado final com o valor do acerto.
6. Se a pessoa que deve receber tiver chave Pix cadastrada, a chave é exibida com ação de copiar.

### Fluxo 8. Reabertura do período

1. Em um período encerrado e mais recente da dupla, o usuário escolhe reabrir.
2. O sistema mostra um modal simples de confirmação.
3. Ao confirmar, o resultado consolidado é descartado.
4. O período volta a aceitar ajustes conforme as regras de edição e os dois participantes retornam para `open`.
5. O novo resultado só é gerado quando os dois participantes fecharem novamente.

### Fluxo 9. Arquivamento da dupla

1. O usuário acessa os detalhes da dupla.
2. Escolhe arquivar a dupla.
3. O sistema remove a dupla da lista principal.
4. O histórico permanece acessível na área de arquivadas.

### Fluxo 10. Reativação da dupla

1. O usuário acessa a área de duplas arquivadas.
2. Escolhe reativar uma dupla.
3. O sistema devolve a dupla para a lista principal.
4. O histórico anterior permanece preservado.

## Modelo de dados inicial

O modelo abaixo foi pensado para sustentar o MVP com clareza e pouca gambiarra, mantendo espaço para crescer depois sem retrabalho desnecessário.

### Entidades principais

#### `User`

Representa a pessoa que usa o sistema.

- `id`
- `name`
- `email`
- `pixKey` nullable
- `createdAt`
- `updatedAt`

Observações:

- A chave Pix é opcional no cadastro inicial.
- O email deve ser único.

#### `AuthAccount`

Representa a forma de autenticação da conta, caso o projeto precise modelar isso no banco da aplicação. Se a autenticação ficar totalmente delegada a um provedor externo, esta entidade pode nem existir no domínio principal.

- `id`
- `userId`
- `provider`
- `providerAccountId`
- `passwordHash` nullable
- `createdAt`

Observações:

- `provider` pode assumir valores como `credentials` e `google`.
- Para login por email e senha, `passwordHash` é usado.
- Para Google, o identificador externo fica em `providerAccountId`.

#### `Pair`

Representa a dupla de rateio.

- `id`
- `name`
- `status`
- `archivedAt` nullable
- `createdByUserId`
- `createdAt`
- `updatedAt`

Observações:

- `status` pode assumir `active` ou `archived`.
- Arquivar a dupla não apaga histórico.
- A dupla pode ser reativada no MVP.

#### `PairMember`

Representa a associação entre usuário e dupla.

- `id`
- `pairId`
- `userId`
- `joinedAt`

Observações:

- Esta entidade resolve o relacionamento de muitos para muitos entre usuários e duplas.
- No MVP, uma dupla deve ter no máximo dois membros ativos.
- Deve existir restrição de unicidade para `pairId + userId`.

#### `Invite`

Representa o convite para entrada em uma dupla.

- `id`
- `pairId`
- `token`
- `createdByUserId`
- `status`
- `expiresAt`
- `acceptedByUserId` nullable
- `acceptedAt` nullable
- `createdAt`

Observações:

- `status` pode assumir `pending`, `accepted`, `expired` ou `revoked`.
- O convite expira em 24 horas.
- Ao aceitar um convite, o sistema deve registrar quem entrou e quando entrou.
- Deve ser possível gerar novo convite para a mesma dupla sem criar uma nova dupla.

#### `Period`

Representa um ciclo de rateio dentro de uma dupla.

- `id`
- `pairId`
- `label` nullable
- `status`
- `openedByUserId`
- `openedAt`
- `closedAt` nullable
- `reopenedAt` nullable
- `createdAt`
- `updatedAt`

Observações:

- `status` pode assumir `open`, `partially_closed` ou `closed`.
- `label` deve ser gerado automaticamente pelo sistema, algo como `Abril 2026`.
- Só pode existir um período não encerrado por dupla.

#### `PeriodParticipant`

Representa o estado individual de cada participante dentro de um período.

- `id`
- `periodId`
- `userId`
- `status`
- `closedAt` nullable
- `createdAt`

Observações:

- `status` pode assumir `open` ou `closed`.
- Esta entidade existe porque o fechamento do período é individual.
- Deve existir restrição de unicidade para `periodId + userId`.
- Ao reabrir o período, todos os participantes devem voltar para `open`.

#### `Expense`

Representa uma despesa lançada dentro de um período.

- `id`
- `periodId`
- `paidByUserId`
- `description`
- `amountCents`
- `occurredOn`
- `createdAt`
- `updatedAt`

Observações:

- O valor deve ser armazenado em centavos para evitar erro de arredondamento.
- `paidByUserId` deve ser o usuário autenticado que lançou a despesa.
- No MVP, não existe categoria, anexo ou rateio parcial.

#### `SettlementResult`

Representa o resultado consolidado de um período encerrado.

- `id`
- `periodId`
- `totalAmountCents`
- `sharePerPersonCents`
- `payerUserId`
- `receiverUserId`
- `transferAmountCents`
- `calculatedAt`

Observações:

- Deve existir no máximo um resultado por período encerrado.
- Ao reabrir o período, este resultado deve ser descartado.
- Se o valor do acerto for zero, o sistema deve registrar o resultado e exibir o estado `ninguém deve nada`.

### Relacionamentos

- Um `User` pode participar de várias `Pair`.
- Uma `Pair` pode começar com um `PairMember` e ser completada depois com o segundo.
- Uma `Pair` pode ter vários `Invite`.
- Uma `Pair` pode ter vários `Period`.
- Um `Period` pertence a uma única `Pair`.
- Um `Period` pode ter um ou dois registros em `PeriodParticipant`, conforme a composição da dupla no momento.
- Um `Period` pode ter várias `Expense`.
- Uma `Expense` pertence a um único `Period`.
- Uma `Expense` é sempre associada a um único `User` pagador.
- Um `Period` pode ter zero ou um `SettlementResult`.

### Restrições importantes de banco e domínio

- `users.email` deve ser único.
- `pair_members` deve impedir o mesmo usuário duplicado na mesma dupla.
- `pair_members` deve impedir mais de dois membros ativos por dupla.
- `invites.token` deve ser único.
- `period_participants` deve impedir o mesmo usuário duplicado no mesmo período.
- Deve existir regra para impedir criação de novo período quando já houver um período `open` ou `partially_closed` na mesma dupla.
- Se a segunda pessoa entrar em uma dupla com período ativo, deve ser criado um `PeriodParticipant` aberto para ela automaticamente.
- Despesas só podem ser criadas em período com status `open` ou `partially_closed`, respeitando o fechamento individual do autor.
- Despesas não podem ser editadas ou excluídas depois que o respectivo participante fechar sua participação.
- Um período só pode ir para `closed` quando os dois registros de `PeriodParticipant` estiverem fechados.
- Enquanto a dupla tiver apenas um membro, o período deve permanecer lançável, mas sem fechamento.

### Estrutura relacional sugerida

Uma forma simples de pensar a estrutura é:

- `users`
- `auth_accounts`
- `pairs`
- `pair_members`
- `invites`
- `periods`
- `period_participants`
- `expenses`
- `settlement_results`

### Decisões de modelagem que ajudam no MVP

- Usar `PairMember` é melhor do que colocar `user1Id` e `user2Id` direto em `Pair`.
- Usar `PeriodParticipant` evita lógica frágil para o fechamento individual.
- Guardar `SettlementResult` separado de `Period` facilita reabertura e recálculo.
- Armazenar valores em centavos evita erro com dinheiro.
- Tratar `Invite` com status e expiração deixa o fluxo de entrada mais fácil de validar.
