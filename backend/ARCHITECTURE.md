# OrthoPlus Backend — Architecture

> Auto-generated post-migration architecture map

## Infrastructure

```
┌─────────────────────────────────────────────────────┐
│  VM200 (172.21.10.200) — App Server                 │
│  ┌──────────────────────────────────────────────┐   │
│  │  PM2: ortho-backend (port 3005)              │   │
│  │  ├── Express + Helmet + CORS                 │   │
│  │  ├── 10 Legacy Routes                        │   │
│  │  ├── 33 Modular Domains                      │   │
│  │  └── 8 Background Workers (cron)             │   │
│  └──────────────────────────────────────────────┘   │
│  Nginx reverse proxy (port 80 → 3005)               │
└─────────────────────────────────────────────────────┘
         │ PostgreSQL (5432)
         ▼
┌─────────────────────────────────────────────────────┐
│  VM201 (172.21.10.201) — Database Server            │
│  PostgreSQL 16 • orthoplus_db • 154 tables          │
│  Auth: scram-sha-256 • User: orthoplus_user         │
└─────────────────────────────────────────────────────┘
```

## Backend Modules (33)

| Domain | Module | Description |
|--------|--------|-------------|
| Agenda | `agenda` | Scheduling, appointments |
| Admin | `admin_tools` | Admin operations |
| Analytics | `analytics` | Reports, dashboards |
| Backups | `backups` | Backup management |
| BI | `bi` | Business intelligence |
| Communication | `comm` | SMS, email, WhatsApp |
| Config | `configuracoes` | System config |
| Contracts | `contratos` | Patient contracts |
| CRM | `crm` | Customer relationship |
| Crypto Config | `crypto_config` | Crypto settings |
| Dashboard | `dashboard` | Main dashboard |
| Database Admin | `database_admin` | DB management |
| Billing | `faturamento` | Invoicing |
| Loyalty | `fidelidade` | Points, rewards |
| Files | `files` | File storage |
| Finance | `financeiro` | Financial ops |
| Employees | `funcionarios` | HR management |
| GitHub Tools | `github_tools` | GitHub integration |
| Collections | `inadimplencia` | Debt collection |
| Inventory | `inventario` | Stock management |
| LGPD | `lgpd` | Data privacy |
| Marketing | `marketing` | Campaigns |
| Notifications | `notifications` | Push, alerts |
| Quotes | `orcamentos` | Budgets |
| Patients | `pacientes` | Patient records |
| PDV | `pdv` | Point of sale |
| PEP | `pep` | Electronic records |
| Procedures | `procedimentos` | Clinical procedures |
| Split Payment | `split_pagamento` | Payment splitting |
| Teleodonto | `teleodonto` | Teledentistry |
| Terminal | `terminal` | Admin terminal |
| TISS | `tiss` | Insurance integration |
| Users | `usuarios` | User management |

## Legacy Routes (10)

`admin` · `auth` · `configuracoes` · `crypto` · `estoque` · `financeiro` · `fiscal` · `modules` · `payments` · `rest`

## Workers (8 cron jobs)

`adminJobs` · `backupJobs` · `cryptoJobs` · `estoqueJobs` · `financeiroJobs` · `gamificationJobs` · `scheduleAppointments` · `scheduleBiExport`

## Tech Stack

- **Runtime:** Node.js + tsx (TypeScript execution)
- **Framework:** Express 4 + Helmet + CORS
- **ORM:** Prisma (2652-line schema, 154 models)
- **Auth:** JWT + bcrypt (scram-sha-256 on DB)
- **Process Manager:** PM2 (auto-restart, startup script)
