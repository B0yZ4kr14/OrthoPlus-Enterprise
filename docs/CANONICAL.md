# OrthoPlus Enterprise — Documentacao Canonica

> Status: CANONICA  
> Atualizado: 2026-06-01
> Deploy: VPS tsiapp.io — Frontend v2.9.10 / Backend v2.5.4
> Status: ONLINE / HTTPS 200 / API OK  
> Branch: main  
> Testes: 755 passando  
> Type-check: 0 erros  
> GitNexus: 31.861 nodes, 66.380 edges, 883 clusters  
> Specs: 42/42 completas ✅ (100%)  

---

## Visao Geral

Monorepo full-stack de gestao odontologica:

- Frontend: React 18 + Vite + Tailwind + TypeScript (porta 3000 dev)
- Backend: Node.js 20 + Express + Prisma + PostgreSQL (porta 3005)
- Agent Service: Python + FastAPI + Agno (porta 8000)
- Cache: Redis 7 (porta 6379)
- Proxy: Nginx + Cloudflare (TLS 1.3)

## Modulos

Ver documento completo em `docs/MODULES.md`.

Resumo: 39 diretorios frontend, 38 modulos backend.

## Glossario de Nomes Divergentes

| Funcionalidade | Frontend | Backend |
|----------------|----------|---------|
| Administracao | admin | admin_tools |
| Configuracoes | settings | configuracoes |
| Crypto | crypto | crypto_config |
| Financeiro | financeiro | faturamento |
| Marketing | marketing-auto | marketing |
| IA Radiografia | ia-radiografia | ai |
| Cobranca | cobranca / inadimplencia | inadimplencia |
| Estoque | estoque / inventario | inventario |
| Split | split-pagamento | split_pagamento |

## Comandos Essenciais

```bash
pnpm install
pnpm dev          # Turbo dev
pnpm build        # Turbo build
pnpm type-check   # 0 erros
pnpm test         # 1129 testes
```

## Deploy

Docker Compose producao: `docker-compose -f docker-compose.prod.yml up -d`

VPS via GitHub Actions: build + SCP + PM2 reload

## Variaveis Criticas

- DATABASE_URL
- JWT_SECRET (min. 256 bits)
- REDIS_PASSWORD
- AUTH_ALLOW_MOCK (proibido em producao)
