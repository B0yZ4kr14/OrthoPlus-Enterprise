# Guia de Deploy - OrthoPlus Enterprise

## Visão Geral

Este guia cobre o deploy do OrthoPlus Enterprise em ambientes de produção.

---

## Requisitos de Sistema

### Mínimos
- Node.js >= 20.19.0
- pnpm >= 10.0.0
- 2GB RAM
- 10GB disco

### Recomendados
- Node.js >= 22.0.0
- pnpm >= 10.33.0
- 4GB RAM
- 20GB disco SSD

---

## Deploy com pnpm

### 1. Preparação

```bash
# Clone o repositório
git clone [repo-url]
cd orthoplus-enterprise

# Instale o pnpm (se não tiver)
npm install -g pnpm@latest

# Instale as dependências
pnpm install
```

### 2. Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp apps/web/.env.example apps/web/.env

# Edite as variáveis
VITE_API_URL=http://api.orthoplus.com.br
VITE_APP_TITLE=OrthoPlus Enterprise
```

### 3. Build

```bash
# Type-check em todo o monorepo
pnpm run type-check

# Build completo
pnpm run build
```

### 4. Start

```bash
cd apps/web
pnpm run preview
```

---

## Deploy com Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://api:8080
    depends_on:
      - api

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/orthoplus
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=orthoplus
      - POSTGRES_PASSWORD=senha_segura
      - POSTGRES_DB=orthoplus
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Comandos Docker

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f web

# Parar
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

---

## Deploy em Produção

### 1. Servidor

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instale pnpm
npm install -g pnpm

# Clone o projeto
git clone [repo-url] /var/www/orthoplus
cd /var/www/orthoplus
```

### 2. PM2 (Process Manager)

```bash
# Instale o PM2
npm install -g pm2

# Crie o ecosystem file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'orthoplus-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'run preview -- --port 3000 --host',
      env: {
        NODE_ENV: 'production',
        VITE_API_URL: 'http://api.orthoplus.com.br'
      }
    }
  ]
}
EOF

# Start com PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 3. Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name orthoplus.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ative o site
sudo ln -s /etc/nginx/sites-available/orthoplus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL (Let's Encrypt)

```bash
# Instale Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenha o certificado
sudo certbot --nginx -d orthoplus.com.br
```

---

## Deploy de Categoria Específica

Para deploy de apenas uma categoria:

```bash
# Build apenas da categoria Admin-DevOps
cd categories/@orthoplus/admin-devops
pnpm run build

# Deploy apenas desta categoria
pnpm run deploy
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm run type-check
      - run: pnpm run build
      
      - name: Deploy
        run: |
          # Comando de deploy
          echo "Deploy para produção"
```

---

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpe o cache
pnpm store prune
rm -rf node_modules
pnpm install
```

### Erro: "Port already in use"

```bash
# Mude a porta no vite.config.ts
server: {
  port: 3001
}
```

### Erro: "Out of memory"

```bash
# Aumente o limite de memória
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm run build
```

---

## Monitoramento

### Health Check

```bash
# Verifique se a aplicação está rodando
curl http://localhost:3000/health

# Resposta esperada
{"status":"ok","version":"5.5.0"}
```

### Logs

```bash
# Logs do PM2
pm2 logs orthoplus-web

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
```

---

## Rollback

```bash
# Voltar para versão anterior
git checkout v5.4.0
pnpm install
pnpm run build
pm2 restart orthoplus-web
```

---

## Referências

- [Arquitetura](ARCHITECTURE.md)
- [Categorias](CATEGORIES.md)
- [Contribuição](CONTRIBUTING.md)
