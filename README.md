# OrthoPlus Enterprise

> Sistema de Gestão Odontológica Enterprise — Monorepo Full-Stack

## Visão Geral

O **OrthoPlus Enterprise** é um sistema de gestão odontológica completo, composto por:

- **Frontend** — React 19 + Vite 6 + Tailwind CSS + shadcn/ui
- **Backend** — Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16
- **Agent Service** — Python 3.14 + FastAPI + Agno (IA generativa)
- **Infraestrutura** — Docker, PM2, Nginx, Redis

## VPS TSiAPP — Deploy Canônico

> **Arquivo de configuração:** `VPS-TSiAPP.md`

| Variável                  | Valor                            |
| ------------------------- | -------------------------------- | --------------------------- |
| Variável                  | Valor                            | Descrição                   |
| ----------                | -------                          | -----------                 |
| `VPS_TSiAPP_HOSTNAME`     | `TSiAPP`                         | Hostname do servidor        |
| `VPS_TSiAPP_IP_PUBLIC`    | `179.190.15.116`                 | IP público (Internet)       |
| `VPS_TSiAPP_IP_TAILSCALE` | `100.111.74.69`                  | IP Tailscale (rede privada) |
| `VPS_TSiAPP_KEY`          | `~/.ssh/keys/private/TSiHomeLab` | Chave SSH canônica          |
| `VPS_TSiAPP_USER`         | `tsi`                            | Usuário padrão              |
| `VPS_TSiAPP_PORT`         | `22`                             | Porta SSH                   |

### Acesso SSH (passwordless)

```bash
# Usuário tsi — Tailscale (rede privada)
ssh -i ~/.ssh/keys/private/TSiHomeLab tsi@100.111.74.69

# Usuário tsi — IP público (fallback)
ssh -i ~/.ssh/keys/private/TSiHomeLab tsi@179.190.15.116

# Usuário root — Tailscale
ssh -i ~/.ssh/keys/private/TSiHomeLab root@100.111.74.69

# Usuário root — IP público
ssh -i ~/.ssh/keys/private/TSiHomeLab root@179.190.15.116
```

### Deploy

```bash
cd /home/tsi/OrthoPlus-Enterprise
docker compose up -d
docker compose ps
```

### Healthchecks

| Serviço       | URL Local                      | Via Nginx                                |
| ------------- | ------------------------------ | ---------------------------------------- |
| Backend API   | `http://127.0.0.1:3005/health` | `https://tsiapp.io/api/orthoplus/health` |
| Frontend SPA  | `http://127.0.0.1:8083/`       | `https://tsiapp.io/`                     |
| Agent Service | `http://127.0.0.1:8000/`       | `https://tsiapp.io/api/agent/`           |

## Estrutura do Monorepo

```
OrthoPlus-Enterprise/
├── apps/web/                  # Frontend React (porta 5173)
├── backend/                   # Backend Node.js/Express (porta 3005)
│   ├── src/modules/           # 35 módulos de domínio
│   ├── src/routes/            # Rotas Express
│   ├── prisma/                # Schema Prisma (171 models)
│   └── workers/               # 9 cron jobs
├── agent-service/             # Serviço Python/FastAPI (porta 8000)
├── shared-types/              # Tipos TypeScript compartilhados
├── categories/@orthoplus/     # Pacotes internos
└── docs/                      # Documentação
```

## Módulos Backend (35)

| Domínio         | Módulo            | Status       |
| --------------- | ----------------- | ------------ |
| Agenda          | `agenda`          | ✅ Funcional |
| Admin           | `admin_tools`     | ✅ Funcional |
| Analytics       | `analytics`       | ✅ Funcional |
| Auth            | `auth`            | ✅ Funcional |
| Backups         | `backups`         | ✅ Funcional |
| BI              | `bi`              | ✅ Funcional |
| Comunicação     | `comm`            | ✅ Funcional |
| Configurações   | `configuracoes`   | ✅ Funcional |
| Contratos       | `contratos`       | ✅ Funcional |
| CRM             | `crm`             | ✅ Funcional |
| Crypto          | `crypto_config`   | ✅ Funcional |
| Dashboard       | `dashboard`       | ✅ Funcional |
| Database Admin  | `database_admin`  | ✅ Funcional |
| Faturamento     | `faturamento`     | ✅ Funcional |
| Fidelidade      | `fidelidade`      | ✅ Funcional |
| Arquivos        | `files`           | ✅ Funcional |
| Financeiro      | `financeiro`      | ✅ Funcional |
| Funcionários    | `funcionarios`    | ✅ Funcional |
| GitHub Tools    | `github_tools`    | ✅ Funcional |
| Inadimplência   | `inadimplencia`   | ✅ Funcional |
| Inventário      | `inventario`      | ✅ Funcional |
| LGPD            | `lgpd`            | ✅ Funcional |
| Marketing       | `marketing`       | ✅ Funcional |
| NF-e            | `nfe`             | ✅ Funcional |
| Notificações    | `notifications`   | ✅ Funcional |
| Orçamentos      | `orcamentos`      | ✅ Funcional |
| Pacientes       | `pacientes`       | ✅ Funcional |
| PDV             | `pdv`             | ✅ Funcional |
| PEP             | `pep`             | ✅ Funcional |
| Procedimentos   | `procedimentos`   | ✅ Funcional |
| Split Pagamento | `split_pagamento` | ✅ Funcional |
| Teleodonto      | `teleodonto`      | ✅ Funcional |
| Terminal        | `terminal`        | ✅ Funcional |
| TISS            | `tiss`            | ✅ Funcional |
| Usuários        | `usuarios`        | ✅ Funcional |
| Agents IA       | `agents`          | ✅ Funcional |

## Stack Tecnológica

| Camada            | Tecnologia                                         |
| ----------------- | -------------------------------------------------- |
| **Frontend**      | React 19, Vite 6, Tailwind CSS, shadcn/ui, Zustand |
| **Backend**       | Node.js 20, Express 4, Prisma 6, TypeScript 5.9    |
| **Agent Service** | Python 3.14, FastAPI, Agno 2.5                     |
| **Database**      | PostgreSQL 16, Redis 7                             |
| **Auth**          | JWT + bcrypt                                       |
| **Deploy**        | PM2, Nginx, Docker                                 |

## Comandos

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev          # Inicia todos os apps
pnpm build        # Build de todos os workspaces
pnpm lint         # ESLint em todos os workspaces
pnpm type-check   # TypeScript --noEmit

# Backend específico
cd backend && pnpm build    # Build TypeScript
cd backend && pnpm dev      # Desenvolvimento com nodemon

# Frontend específico
cd apps/web && pnpm dev     # Vite dev server

# Agent Service
cd agent-service && python src/main.py
```

## Segurança

- JWT secret com 256 bits de entropia
- clinicGuard middleware em todos os routers (35 módulos)
- Rate limiting por contexto (auth, upload, API geral)
- CSRF protection com sameSite=strict
- Helmet para headers de segurança
- Redis auth-enabled

## Documentação

- [`backend/ARCHITECTURE.md`](backend/ARCHITECTURE.md) — Arquitetura do backend
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Guia de deploy
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — Guia de contribuição

## Licença

Proprietary — All rights reserved.
