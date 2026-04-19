# Deploy na VPS da Hostinger

Este projeto roda bem em uma VPS Linux comum com:

- Node.js 22 LTS
- PostgreSQL 16
- `systemd` para restart automático
- `nginx` como proxy reverso

Se você ainda não tem domínio, pode publicar primeiro por IP usando `http://IP_DA_VPS`. Nesse modo, o acesso com `email/senha` funciona, mas o login com Google deve ficar desabilitado até existir um domínio público.

O fluxo abaixo assume Ubuntu 24.04 na VPS, que é a recomendação atual da Hostinger para deploy manual de aplicações Node.js em VPS.

## 1. Preparar a VPS

Conecte por SSH usando o acesso exibido no painel da Hostinger.

```bash
ssh root@IP_DA_VPS
```

Atualize o sistema e crie um usuário de deploy:

```bash
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
```

Opcional, mas recomendado: configure chave SSH para o usuário `deploy` e desative o uso diário de `root`.

## 2. Instalar Node.js 22, PostgreSQL e nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx
node -v
npm -v
```

## 3. Criar banco e usuário PostgreSQL

Entre no Postgres:

```bash
sudo -u postgres psql
```

Crie o banco:

```sql
CREATE USER rateio WITH ENCRYPTED PASSWORD 'troque-essa-senha';
CREATE DATABASE rateio_contas OWNER rateio;
\q
```

## 4. Publicar o código

Como usuário `deploy`:

```bash
sudo mkdir -p /var/www/rateio-contas
sudo chown -R deploy:deploy /var/www/rateio-contas
cd /var/www/rateio-contas
git clone SEU_REPOSITORIO_GIT .
npm ci
```

## 5. Criar o arquivo de ambiente de produção

Use este arquivo como base:

```bash
cp .env.production.example .env.production
```

Preencha com valores reais:

```env
DATABASE_URL="postgresql://rateio:SENHA_FORTE@localhost:5432/rateio_contas?schema=public"
AUTH_SECRET="gere-um-segredo-com-32-caracteres-ou-mais"
AUTH_URL="https://rateio-contas.seudominio.com"
AUTH_TRUST_HOST="true"
AUTH_GOOGLE_ID="seu-client-id"
AUTH_GOOGLE_SECRET="seu-client-secret"
NEXT_PUBLIC_APP_URL="https://rateio-contas.seudominio.com"
LOG_LEVEL="info"
```

Para um acesso inicial só por IP, use:

```env
AUTH_URL="http://IP_DA_VPS"
NEXT_PUBLIC_APP_URL="http://IP_DA_VPS"
```

Quando você estiver acessando por IP, não configure o OAuth do Google ainda. Pelas regras atuais do Google para apps web, origem e `redirect_uri` não podem usar IP bruto público; a exceção é apenas `localhost`. Quando houver domínio, o callback do Google deve apontar para:

```text
https://rateio-contas.seudominio.com/api/auth/callback/google
```

## 6. Build e migrações

```bash
cd /var/www/rateio-contas
set -a && source ./.env.production && set +a
npm run db:deploy
npm run build:standalone
```

O script `build:standalone` já copia `public` e `.next/static` para dentro de `.next/standalone`, o que deixa o artefato pronto para rodar com `node .next/standalone/server.js`.

## 7. Subir com systemd

Descubra o caminho do Node:

```bash
which node
```

Copie o template do repositório e ajuste `User`, `Group`, `WorkingDirectory`, `EnvironmentFile` e `ExecStart`:

```bash
sudo cp deploy/hostinger/rateio-contas.service.example /etc/systemd/system/rateio-contas.service
sudo nano /etc/systemd/system/rateio-contas.service
```

Depois:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rateio-contas
sudo systemctl start rateio-contas
sudo systemctl status rateio-contas
```

Logs:

```bash
journalctl -u rateio-contas -n 200 --no-pager
```

## 8. Configurar nginx

Copie o template:

```bash
sudo cp deploy/hostinger/nginx-rateio-contas.conf.example /etc/nginx/sites-available/rateio-contas
sudo nano /etc/nginx/sites-available/rateio-contas
sudo ln -s /etc/nginx/sites-available/rateio-contas /etc/nginx/sites-enabled/rateio-contas
sudo nginx -t
sudo systemctl reload nginx
```

Antes do SSL, a aplicação já deve responder em HTTP.

## 9. Configurar SSL com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d rateio-contas.seudominio.com
```

Teste a renovação:

```bash
sudo certbot renew --dry-run
```

## 10. Firewall

Na Hostinger e no sistema operacional, libere pelo menos:

- `22/tcp` para SSH
- `80/tcp` para HTTP
- `443/tcp` para HTTPS

Não exponha `5432` publicamente se o banco estiver na mesma VPS.

## 11. Atualizações futuras

Para subir uma nova versão:

```bash
cd /var/www/rateio-contas
git pull
npm ci
set -a && source ./.env.production && set +a
npm run db:deploy
npm run build:standalone
sudo systemctl restart rateio-contas
```

## 12. Checklist rápido

- Domínio apontando para o IP da VPS
- `AUTH_URL` igual ao domínio final com `https`
- Callback do Google configurado com o mesmo domínio
- `npm run db:deploy` executado sem erro
- `systemctl status rateio-contas` em estado `active`
- `nginx -t` sem erro
- Certificado SSL emitido
- Fluxos validados: cadastro, login, criação de dupla, convite e período
