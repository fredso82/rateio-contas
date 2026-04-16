---
name: commit-ptbr
description: "Cria commits Git padronizados em português brasileiro (pt-BR). Use esta skill sempre que o usuário pedir para fazer commit, commitar, salvar alterações no git, ou usar /commit. Também use quando o usuário disser 'commita isso', 'faz um commit', 'salva no git', ou qualquer variação de pedido de commit. A skill analisa o diff, gera a mensagem no formato correto e executa o commit automaticamente."
---

# Commit em pt-BR

Esta skill cria commits Git seguindo um padrão consistente em português brasileiro. Ela analisa as mudanças no repositório, gera uma mensagem de commit bem formatada e executa o commit automaticamente.

## Por que padronizar commits em pt-BR

Este projeto é brasileiro e todo o código, variáveis e mensagens estão em português. Os commits seguem a mesma convenção para manter consistência e facilitar a leitura do histórico por toda a equipe.

## Fluxo de execução

### 1. Coletar informações

Execute em paralelo:
- `git status` (sem flag `-uall`) para ver arquivos modificados e não rastreados
- `git diff` e `git diff --staged` para ver as mudanças
- `git log --oneline -5` para ver o estilo dos commits recentes

### 2. Analisar as mudanças

Leia os diffs com atenção. Entenda:
- **O que** mudou (arquivos, funções, configurações)
- **Por que** mudou (correção de bug, nova funcionalidade, refatoração, melhoria)
- **Como** mudou (abordagem técnica, se relevante)

### 3. Compor a mensagem de commit

#### Título (primeira linha)
- Máximo **50 caracteres**
- Tempo verbal no **particípio** (ex: "Realizada correção", "Adicionado filtro", "Refatorado serviço")
- Sem ponto final
- Curto e descritivo — deve dar uma ideia clara da mudança

**Exemplos de bons títulos:**
```
Realizada correção no envio de e-mail
Adicionado filtro por data no relatório
Refatorado serviço de autenticação
Removida dependência não utilizada
Atualizado mapeamento do AutoMapper
```

#### Corpo (linhas seguintes)
- Separado do título por uma **linha em branco**
- Máximo **72 caracteres por linha**
- Explique o que foi feito, por que e como (quando não for óbvio)
- Use parágrafos curtos
- Pode usar listas com `-` para enumerar mudanças

**Exemplo de corpo:**
```
Corrigida a logica de refresh do token que causava
logout inesperado quando o token expirava durante
uma requisicao longa.

- Adicionado retry automatico apos refresh
- Ajustado timeout do token para 5 minutos
```

**Encoding:** No corpo do commit, evite caracteres acentuados (ç, ã, é, í, ó, ú, â, ê, ô) para prevenir problemas de encoding em diferentes terminais e ferramentas Git. Use versões sem acento (ex: "correcao" em vez de "correção", "autenticacao" em vez de "autenticação"). O título pode usar acentos normalmente pois é curto e exibido de forma controlada.

### 4. Staging dos arquivos

- Prefira adicionar arquivos **específicos por nome** em vez de `git add -A` ou `git add .`
- Nunca inclua arquivos que possam conter segredos (`.env`, `credentials.json`, etc.) — se encontrar, avise o usuário
- Se houver arquivos não rastreados que fazem parte da mudança, adicione-os

### 5. Executar o commit

Use HEREDOC para garantir formatação correta:

```bash
git commit -m "$(cat <<'EOF'
Titulo do commit aqui

Corpo explicativo aqui, respeitando o limite
de 72 caracteres por linha.
EOF
)"
```

### 6. Verificar o resultado

Execute `git status` após o commit para confirmar que foi criado com sucesso.

Se um hook de pre-commit falhar:
- Corrija o problema identificado
- Faça stage novamente dos arquivos
- Crie um **novo** commit (nunca use `--amend`, pois o commit anterior não existe)

## Regras importantes

- Nunca use `--no-verify` ou `--no-gpg-sign`
- Nunca use `git add -i` ou `git rebase -i` (modo interativo não é suportado)
- Nunca faça push automaticamente — apenas o commit
- Se não houver mudanças para commitar, informe o usuário em vez de criar commit vazio
- Nunca altere a configuração do git
