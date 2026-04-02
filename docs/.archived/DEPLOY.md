# OrthoPlus — Deploy Guide

## Requisitos de Sistema

| Componente | Versão mínima |
|------------|---------------|
| Docker | 24.x |
| Docker Compose | v2.x (plugin) |
| RAM | 4 GB |
| Disco | 20 GB |
| CPU | 2 vCPUs |
| SO | Ubuntu 22.04 LTS (recomendado) |

---

## Variáveis de Ambiente Obrigatórias

Copie `.env.production.example` para `.env.production` e preencha os valores:

```bash
cp .env.production.example .env.production
```

### Variáveis críticas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `JWT_SECRET` | Chave secreta JWT (256-bit) | `openssl rand -base64 32` |
| `DB_HOST` | Host do PostgreSQL | `db.example.com` |
| `DB_NAME` | Nome do banco | `orthoplus` |
| `DB_USER` | Usuário do banco | `orthoplus` |
| `DB_PASSWORD` | Senha do banco (forte) | — |
| `DATABASE_URL` | Connection string completa | `postgresql://...` |
| `ALLOWED_ORIGINS` | Origens CORS permitidas | `https://seu-dominio.com.br` |
| `REDIS_PASSWORD` | Senha do Redis | — |

### Variáveis que devem ser `false` em produção

```env
AUTH_ALLOW_MOCK=false
ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false
```

---

## Deploy com Docker

### 1. Preparar o ambiente

```bash
# Clone ou atualize o repositório
git clone https://github.com/B0yZ4kr14/OrthoPlus-ModularDB.git
cd OrthoPlus-ModularDB

# Configure variáveis de ambiente
cp .env.production.example .env.production
# Edite .env.production com seus valores reais
```

### 2. Configurar SSL

Coloque seus certificados em `./ssl/`:

```bash
mkdir -p ssl
# Certbot (Let's Encrypt):
# certbot certonly --standalone -d seu-dominio.com.br
# cp /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem ssl/cert.pem
# cp /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem ssl/key.pem
# openssl dhparam -out ssl/dhparam.pem 2048
```

### 3. Executar o deploy

```bash
chmod +x scripts/deploy-prod.sh
./scripts/deploy-prod.sh
```

Ou manualmente:

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### 4. Executar migrations do banco

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## Checklist Pré-Deploy

```
[ ] .env.production criado a partir de .env.production.example
[ ] JWT_SECRET gerado com openssl rand -base64 32
[ ] AUTH_ALLOW_MOCK=false
[ ] ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false
[ ] DB_HOST aponta para servidor de produção (não IP hardcoded)
[ ] DATABASE_URL configurado com SSL (sslmode=require)
[ ] REDIS_PASSWORD configurado
[ ] ALLOWED_ORIGINS contém apenas o domínio de produção
[ ] Certificados SSL em ./ssl/ (cert.pem, key.pem, dhparam.pem)
[ ] docker compose -f docker-compose.prod.yml build sem erros
[ ] Healthchecks respondendo após deploy
[ ] Backup do banco configurado
[ ] Prisma migrate deploy executado
```

---

## Estrutura dos Serviços (docker-compose.prod.yml)

| Serviço | Porta interna | Descrição |
|---------|---------------|-----------|
| `backend` | 3005 | API Node.js/Express |
| `app` | 80 | Frontend React/Nginx |
| `nginx` | 80, 443 | Reverse proxy |
| `redis` | 6379 | Cache/filas |

---

## Troubleshooting

### Backend não inicia

```bash
docker compose -f docker-compose.prod.yml logs backend
```

Causas comuns:
- Variáveis de ambiente faltando → verifique `.env.production`
- Banco inacessível → verifique `DB_HOST` e `DATABASE_URL`
- JWT_SECRET não configurado

### Nginx retorna 502 Bad Gateway

```bash
docker compose -f docker-compose.prod.yml logs nginx
```

Causas comuns:
- Backend não está rodando (porta 3005)
- Container `backend` com nome errado (verifique `nginx.conf` upstream)

### Problemas de conexão com banco

```bash
# Testar conexão dentro do container backend
docker compose -f docker-compose.prod.yml exec backend \
  npx prisma db pull
```

### Verificar status dos healthchecks

```bash
docker compose -f docker-compose.prod.yml ps
# STATUS deve ser "healthy" para backend e app
```

### Reiniciar serviços sem downtime

```bash
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
```

---

## Logs

```bash
# Todos os serviços
docker compose -f docker-compose.prod.yml logs -f

# Apenas backend
docker compose -f docker-compose.prod.yml logs -f backend

# Últimas 100 linhas
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

---

## Atualizações

```bash
git pull origin main
./scripts/deploy-prod.sh
```
