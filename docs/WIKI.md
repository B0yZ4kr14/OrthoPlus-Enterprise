# OrthoPlus Enterprise — Wiki Oficial

> **Versao:** 2.9.10 (Frontend) / 2.5.4 (Backend)
> **Atualizado:** 2026-05-31
> **Status:** Producao

---

## Indice por Perfil

Escolha a secao adequada ao seu perfil:

| Perfil | Secao | Descricao |
|---|---|---|
| **DevOps / SRE** | [Secao 1](#1-devops--sre) | Deploy, Docker, CI/CD, monitoramento, seguranca |
| **Administradores** | [Secao 2](#2-administradores) | RBAC, multi-tenant, backup, LGPD, troubleshooting |
| **Dentistas** | [Secao 3](#3-dentistas) | Agenda, PEP, odontograma, procedimentos, prescricoes |
| **Recepcionistas** | [Secao 4](#4-recepcionistas) | Agenda, pacientes, fila de espera, orcamentos |
| **Auxiliares** | [Secao 5](#5-auxiliares) | Estoque, preparo de sala, auxilio em procedimentos |
| **Gestores Financeiros** | [Secao 6](#6-gestores-financeiros) | Contas, conciliacao, caixa, relatorios, NF-e |
| **Desenvolvedores** | [Secao 7](#7-desenvolvedores) | Setup, build, testes, padroes de codigo |
| **Arquitetura** | [Secao 8](#8-arquitetura-tecnica) | Stack, monorepo, schemas, modulos |
| **Governanca** | [Secao 9](#9-governanca-e-qualidade) | Git, CI/CD, testes, checklist |
| **Referencia** | [Secao 10](#10-referencia-rapida) | Comandos, siglas, arquivos de config |

---

## 1. DevOps / SRE

### 1.1 Visao Geral do Pipeline

O OrthoPlus Enterprise suporta 6 estrategias de deploy. Prioridade de consolidacao: unificar para 2 arquivos (dev + prod).

| Estrategia | Arquivo | Ambiente |
|---|---|---|
| Docker Compose Local | `docker-compose.yml` | Desenvolvimento |
| Docker Compose Ubuntu | `docker-compose.ubuntu.yml` | Ubuntu dedicado |
| Docker Compose Producao | `docker-compose.prod.yml` | Cloud (DB externo) |
| Docker Compose On-Premise | `docker-compose.onprem.yml` | Infra privada |
| VPS Hibrido (PM2 + Nginx) | `scripts/deploy-orthoplus-full.sh` | VPS tradicional |
| Ubuntu Bootstrap | `scripts/deploy-ubuntu.sh` | Nova instalacao |

### 1.2 Docker Compose

**Stack local completa:**
```bash
docker compose up -d
```
Servicos: frontend (8083), backend (3005), postgres (16), redis (7), nginx, prometheus, grafana (3000).

> **Conflito:** Grafana na porta 3000 conflita com Vite dev server.

**Producao Cloud:**
- Sem PostgreSQL — espera DB externo via DATABASE_URL
- Healthcheck do Redis esta quebrado (ping sem senha)

### 1.3 Scripts de Deploy

| Script | Proposito |
|---|---|
| `deploy-orthoplus-full.sh` | Build local + rsync + PM2 reload |
| `deploy-vps.sh` | Rsync + build no servidor |
| `deploy-prod.sh` | Docker Compose producao |
| `deploy-ubuntu.sh` | Bootstrap Ubuntu Server |
| `validate-production.sh` | Validacao de env vars (pre-deploy) |
| `health-check.sh` | Verifica stack (pos-deploy) |

> **RISCO CRITICO:** `deploy-orthoplus-full.sh` contem `prisma db push --accept-data-loss` como fallback. **Remover imediatamente** — pode causar perda de dados.

### 1.4 CI/CD — GitHub Actions (15 workflows)

| Workflow | Gatilho | Proposito |
|---|---|---|
| `ci.yml` | push/PR main | Build sequencial |
| `build.yml` | push/PR main, develop | Type-check + build + test |
| `quality-check.yml` | push/PR main, develop | Lint + format + bundle gate |
| `test.yml` | push/PR main, develop | Vitest + Codecov |
| `e2e-tests.yml` | push/PR main, develop | Playwright (3 browsers) |
| `security.yml` | push/PR main + cron | pnpm audit + ESLint security |
| `production-validation.yml` | push/PR main | Validacao de producao |
| `deploy-vps-orthoplus.yml` | push main | Deploy VPS |
| `deploy-vps-tsi-02.yml` | push main | **IDEM ao orthoplus — DUPLICADO** |

> **Acao:** Remover `deploy-vps-tsi-02.yml` (identico ao orthoplus).

### 1.5 Nginx

Configuracao hardened: TLS 1.2/1.3, rate limiting, CSP, HSTS, OCSP stapling.
Upstreams: backend (3005), agent-service (8000), MinIO (9000).

### 1.6 Variaveis de Ambiente Criticas

| Variavel | Obrig | Descricao |
|---|---|---|
| DATABASE_URL | Sim | PostgreSQL connection string |
| JWT_SECRET | Sim | Chave JWT (min. 256 bits) |
| REDIS_URL | Sim | Redis connection string |
| NODE_ENV | Sim | development / production |
| ~~FRONTEND_URL~~ | — | **Legacy** — nao utilizado pelo codigo. Use `ALLOWED_ORIGINS` para CORS. |
| ALLOWED_ORIGINS | Sim | CORS whitelist |
| DB_SSL | Prod | true em producao |
| AUTH_ALLOW_MOCK | Nao | **PROIBIDO em producao** |
| ENABLE_DANGEROUS_ADMIN | Nao | **PROIBIDO em producao** |

### 1.7 Checklist Pre-Deploy

- [ ] `validate-production.sh` passa
- [ ] `pnpm build` passa no root
- [ ] `pnpm test` passa (backend + frontend)
- [ ] `pnpm lint` passa
- [ ] Nenhuma credencial no codigo
- [ ] `.env` nao commitado
- [ ] `clinicGuard` em novos routers
- [ ] Backup executado

### 1.8 VPS Health Check

```bash
# Verificar saude completa do VPS
./scripts/vps-health-check.sh

# Checagens incluidas:
# - Frontend HTTPS 200
# - API Health HTTPS 200
# - Wiki HTTPS 200
# - SSL valido
# - SSH via Tailscale
# - Docker containers healthy
# - Zero stale domains
```

**VPS TSiAPP:**
- Tailscale: `$VPS_TAILSCALE_IP` (configurado via secret)
- Public IP: `$VPS_PUBLIC_IP` (configurado via secret)
- Domain: `$VPS_DOMAIN` (configurado via secret)
- SSL: Cloudflare Origin CA
- Usuario: `$VPS_USER` (configurado via secret)
- SSH Key: `$SSH_KEY_PATH` (configurado via secret)

### 1.9 Gaps Criticos (Prioridade)

| Prioridade | Gap | Acao |
|---|---|---|
| **CRITICO** | README-orthoplus-deploy.md expoe IPs/credenciais | Sanitizar |
| **CRITICO** | `db push --accept-data-loss` em deploy | Remover |
| **CRITICO** | docker-compose.ubuntu.yml DATABASE_URL hardcoded | Usar variaveis |
| **CRITICO** | Redis onprem sem senha | Adicionar --requirepass |
| **ALTO** | Agent Service ausente dos compose | Adicionar servico Python |
| **ALTO** | 4 compose com configs divergentes | Consolidar para 2 |
| **ALTO** | Workflow deploy duplicado | Remover duplicata |
| **ALTO** | SSL expira em breve | Renovar |


---

## 2. Administradores

### 2.1 Primeiro Acesso e Setup

1. Acesse a URL de producao
2. Login com credenciais de admin
3. **Configuracoes -> Clinica** — configure a clinica principal
4. **Configuracoes -> Dentistas** — cadastre os dentistas
5. **Configuracoes -> Agenda** — horarios de atendimento
6. Importe pacientes via CSV (se houver)

### 2.2 Multi-Tenancy por clinic_id

Cada clinica tem um UUID unico (clinic_id). Todo dado esta vinculado a esse ID. O middleware `clinicGuard` garante isolamento. Superadmins acessam multiplas clinicas.

### 2.3 Matriz de Permissoes (RBAC)

| Papel | Acesso |
|---|---|
| **Superadmin** | Todas as clinicas, todas as funcoes |
| **Admin de Clinica** | Configuracoes, relatorios, usuarios |
| **Dentista** | Agenda, PEP, orcamentos, procedimentos |
| **Recepcionista** | Agenda, pacientes, orcamentos (visualizar) |
| **Auxiliar** | Agenda, estoque (limitado) |
| **Financeiro** | Contas, conciliacao, relatorios |

### 2.4 Backup e Recuperacao

**Automatico:**
- Cron no servidor (scripts em backend/src/workers/)
- Retencao: 7 dias
- Local: /opt/orthoplus/backups/

**Manual:**
```bash
cd backend
pnpm prisma db execute --file backup.sql
```

**Restauracao:**
```bash
docker exec -i orthoplus-postgres psql -U orthoplus < backup.sql
```

### 2.5 LGPD e Compliance

- **Logs de auditoria:** Schema `audit` registra acoes sensiveis
- **Consentimento:** Anamnese inclui termo de consentimento
- **Anonimizacao:** Endpoint para exclusao de dados de pacientes
- **Exportacao:** Pacientes podem solicitar copia dos dados
- **Retencao:** Politica configuravel

### 2.6 Troubleshooting Comum

| Problema | Causa | Solucao |
|---|---|---|
| Erro 401 | JWT expirado | Logout/login |
| Erro 403 | clinicId ausente | Verificar cadastro |
| Agenda nao carrega | Cache | Ctrl+Shift+R |
| Orcamento nao salva | Paciente nao selecionado | Selecionar paciente |
| Imagens nao aparecem | MinIO URL errada | Verificar S3_ENDPOINT |
| E-mails nao enviam | SMTP nao configurado | Verificar SMTP no .env |

---

## 3. Dentistas

### 3.1 Acesso ao Sistema

Login -> Dashboard -> selecione seu modulo.

### 3.2 Agenda

- **Visualizacoes:** Dia, semana, mes, lista
- **Criar consulta:** Click no horario -> paciente -> tipo
- **Bloqueios:** Click direito -> "Bloquear"
- **Recorrencia:** Semanal, mensal
- **Confirmacoes:** Sistema envia lembrete automatico

### 3.3 Pacientes — PEP (Prontuario Eletronico)

- **Anamnese:** Formularios personalizaveis por clinica
- **Odontograma:** Visualizacao grafica SVG com marcacoes de dentes
- **Imagens:** Upload de radiografias, fotos intraorais (DICOM suportado)
- **Procedimentos:** Vinculados a consultas e orcamentos
- **Prescricoes:** Geracao de receitas odontologicas

### 3.4 Orcamentos

- **Criar:** Paciente + itens (procedimentos) + valores
- **Status:** RASCUNHO -> PENDENTE -> APROVADO/REJEITADO
- **Enviar:** Por e-mail/WhatsApp
- **Aprovar:** Paciente aprova via link

### 3.5 Procedimentos

- Use **templates** para acelerar cadastro
- Vincule ao odontograma para registro visual
- Registre materiais utilizados (vincula ao estoque)

### 3.6 Dicas

- `Ctrl + K` — Busca global
- `Ctrl + Shift + A` — Nova consulta rapida
- Favorite pacientes frequentes com estrela

---

## 4. Recepcionistas

### 4.1 Agenda — Gerenciamento Diario

- Visualize a agenda de todos os dentistas
- Marque, remarque e cancele consultas
- Gerencie confirmacoes e faltas
- Bloqueie horarios para reunioes ou emergencias

### 4.2 Pacientes — Cadastro e Busca

- **Cadastro rapido:** Nome, telefone, CPF, nascimento
- **Ficha completa:** Endereco, convenio, responsavel
- **Busca avancada:** Por nome, CPF, telefone, ultima visita
- **Importacao:** CSV para migracao em massa

### 4.3 Fila de Espera

- Pacientes sem horario podem ser colocados na fila
- Ordenacao por prioridade e hora de chegada
- Notificacao automatica quando ha desistencia

### 4.4 Orcamentos — Visualizacao

- Visualize orcamentos criados por dentistas
- Acompanhe status (RASCUNHO, PENDENTE, APROVADO)
- Imprima ou envie por e-mail

### 4.5 Comunicacao

- Envie lembretes de consulta (SMS/e-mail)
- Confirme consultas por telefone
- Registre observacoes no prontuario

---

## 5. Auxiliares

### 5.1 Estoque

- **Consulta:** Verifique disponibilidade de materiais
- **Saida:** Registre consumo em procedimentos
- **Alertas:** Receba notificacoes de estoque baixo
- **Inventario:** Contagem periodica

### 5.2 Preparo de Sala

- Checklist de materiais por tipo de procedimento
- Esterilizacao e controle de instrumentos
- Registro de limpeza e preparo

### 5.3 Auxilio em Procedimentos

- Acesse o PEP durante a consulta
- Registre materiais utilizados
- Anote observacoes do dentista

### 5.4 Agenda — Consultas do Dia

- Visualize sua agenda atribuida
- Acompanhe tempo de cada procedimento
- Registre inicio e termino das consultas


---

## 6. Gestores Financeiros

### 6.1 Contas a Receber

- Parcelas de orcamentos aprovados
- Controle de pagamentos parciais
- Inadimplencia e cobranca
- Boleto, PIX, cartao

### 6.2 Contas a Pagar

- Despesas da clinica (aluguel, fornecedores, salarios)
- Controle de vencimentos
- Programacao de pagamentos

### 6.3 Conciliacao Bancaria

- Importacao de extratos (OFX, CSV)
- Match automatico de lancamentos
- Identificacao de divergencias

### 6.4 Caixa / PDV

- Registro de entradas e saidas diarias
- Fechamento de caixa
- Sangria e suprimento

### 6.5 NF-e (Nota Fiscal Eletronica)

- Emissao de NF-e de servicos
- Configuracao de serie e numeracao
- Transmissao e cancelamento

### 6.6 Relatorios Financeiros

- Faturamento por periodo
- Faturamento por dentista
- Faturamento por procedimento
- DRE (Demonstracao de Resultado)
- Fluxo de caixa

---

## 7. Desenvolvedores

### 7.1 Pre-requisitos

- Node.js 20.x
- pnpm 10.33.0
- Python 3.14 (agent-service)
- Docker + Docker Compose

### 7.2 Instalacao

```bash
git clone <repo>
cd OrthoPlus-Enterprise
pnpm install
cp .env.example .env
cp .env.production.example .env.production
docker compose up -d postgres redis
cd backend && pnpm prisma migrate dev && pnpm prisma generate
cd .. && pnpm dev
```

### 7.3 Comandos

| Comando | Escopo | Descricao |
|---|---|---|
| `pnpm dev` | Root | Todos os servicos em paralelo |
| `pnpm build` | Root | Build em ordem |
| `pnpm lint` | Root | ESLint |
| `pnpm type-check` | Root | TS --noEmit |
| `pnpm test` | Root | Todos os testes |
| `pnpm format` | Root | Prettier |

**Backend:**
```bash
cd backend
pnpm dev        # hot reload
pnpm build      # tsc + tsc-alias
pnpm test       # Jest (23 suites)
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma studio
```

**Frontend:**
```bash
cd apps/web
pnpm dev        # Vite (porta 3000)
pnpm build
pnpm lint
pnpm type-check
```

**Agent Service:**
```bash
cd agent-service
python src/main.py
uvicorn src.main:app --reload --port 8000
```

### 7.4 Padroes de Codigo

- ES Modules (import/export), nunca require
- Strict TypeScript, sem `as any` novos
- Async/await sempre, sem callbacks
- Sem ponto e virgula
- Frontend: apiClient (nunca axios direto), useAuth, RHF + Zod
- Backend: ApiError (nunca Error generico), clinicGuard, Winston logger
- Prisma: singleton do prismaClient.ts

### 7.5 Testes

| Camada | Ferramenta | Cobertura |
|---|---|---|
| Frontend | Vitest + jsdom | Componentes, hooks |
| Backend | Jest + ts-jest | Controllers, use-cases (threshold 20%) |
| E2E | Playwright | Fluxos criticos |

### 7.6 Anti-padroes

**NUNCA editar manualmente:**
- `apps/web/src/types/database.ts` (~8.929 linhas, autogerado pelo Prisma)

**Erros TS pre-existentes (nao regredir):**
- agenda/api/agendaController.ts — 4 erros
- auth/api/AuthController.ts — 1 erro
- crypto-pagamentos — aliases nao mapeados
- marketing-auto/IndicacoesTab.tsx — variant incompativel

---

## 8. Arquitetura Tecnica

### 8.1 Stack

| Camada | Tecnologia | Versao |
|---|---|---|
| Frontend | React + Vite + Tailwind + TS | 18.3 / 8.0 / 3.4 / 5.8 |
| Backend | Node.js + Express + Prisma | 20 / 4.18 / 6.19 |
| Banco | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Agent Service | Python + FastAPI + Agno | 3.14 / 0.135 / 2.5 |
| Infra | Docker + Nginx + Prometheus + Grafana | — |

### 8.2 Monorepo

```
apps/web/          # Frontend SPA (~1.116 componentes, 37 modulos)
backend/           # Backend Express (38 modulos, 180 models Prisma)
agent-service/     # Python/FastAPI (agentes LLM)
shared-types/      # TypeScript cross-stack
categories/@orthoplus/  # Pacotes internos (UI, hooks, utils)
```

### 8.3 Portas

| Servico | Dev | Producao |
|---|---|---|
| Frontend | 3000 | 8080 |
| Backend | 3005 | 3005 |
| Agent | 8000 | 8000 |
| Postgres | container | 5432 |
| Redis | container | 6379 |
| Grafana | 3000 | 3000 |

### 8.4 Schemas PostgreSQL (18)

public, agenda, financeiro, faturamento, crm, fidelidade, estoque, pep, anamnese, imaging, odontograma, procedimentos, relatorios, comunicacao, configuracoes, audit, marketing, telemedicina.

### 8.5 Modulos Frontend (37)

auth, dashboard, layout, configuracoes, pacientes, dentistas, funcionarios, usuarios, agenda, telemedicina, fila-de-espera, orcamentos, faturamento, contas-a-receber, contas-a-pagar, conciliacao-bancaria, caixa, nfe, pep, anamnese, procedimentos, odontograma, imaging, laboratorio, estoque, produtos, fornecedores, crm, marketing-auto, fidelidade, comunicacao, relatorios, analytics, split-pagamento, backup, logs, permissoes.

### 8.6 Glossario de Nomes Divergentes

| Frontend | Backend |
|---|---|
| pacientes | patients |
| orcamentos | budgets |
| caixa | pdv |
| fila-de-espera | waiting_queue |
| telemedicina | telemedicine |
| fidelidade | loyalty |
| procedimentos | procedures |
| marketing-auto | marketing_auto |
| odontograma | dental_chart |


---

## 9. Governanca e Qualidade

### 9.1 Estrategia de Branch

- `main` — Producao (deploy automatico)
- `develop` — Integracao (PRs passam CI)
- `feature/*` — Funcionalidades
- `hotfix/*` — Emergencia (push direto em main permitido)

### 9.2 Pre-commit Hook

`.husky/pre-commit`:
```bash
pnpm lint
pnpm type-check
```
Falha = commit abortado.

### 9.3 Checklist de Commit

- [ ] `cd backend && pnpm build` passa
- [ ] `cd apps/web && pnpm type-check` passa
- [ ] `pnpm lint` passa
- [ ] Nenhuma credencial no codigo
- [ ] `.env` nao commitado
- [ ] `clinicGuard` em novos routers
- [ ] `pnpm test` passa
- [ ] Se modificou schema.prisma, regenerar database.ts

### 9.4 Metricas

| Metrica | Valor |
|---|---|
| Testes | 1.634 (1.129 + 505) |
| Suites backend | 23 |
| Componentes frontend | ~1.116 |
| Modulos backend | 38 |
| Models Prisma | 180 |
| GitNexus nodes | 33.855 |
| GitNexus edges | 71.081 |
| GitNexus clusters | 706 |
| GitNexus flows | 288 |
| SpecKit features | 17 |

### 9.5 Ferramentas de Governanca

#### GitNexus (Code Intelligence)

Indexacao completa do monorepo para analise de impacto e navegacao segura.

```bash
# Re-indexar codebase
npx gitnexus analyze

# Verificar status do index
npx gitnexus status

# Query de impacto (exemplo)
gitnexus_impact({target: "AuthController", direction: "upstream"})
```

- **Index**: 33.855 nodes, 71.081 edges, 706 clusters
- **CI**: Re-index automatico em push para `main` (`.github/workflows/gitnexus-index.yml`)
- **Docs**: `.claude/skills/gitnexus-*`

#### SpecKit (SDD Workflow)

Workflow de especificacao-driven development para todas as features.

```bash
# Criar nova feature
/speckit-specify "Descricao da feature"

# Gerar plano
/speckit-plan

# Gerar tasks
/speckit-tasks

# Implementar
/speckit-implement

# Verificar
/speckit-verify
```

- **Specs**: `specs/<NNN>-<nome>/`
- **Feature ativa**: `017-omk-governance-integration`
- **Config**: `.specify/` (v0.8.11)

#### OMK (Multi-Agent Orchestration)

Orquestracao autonoma do workflow SpecKit via squad agents.

| Agente | Fase | Funcao |
|--------|------|--------|
| Planner | specify/plan/tasks | Arquitetura e especificacao |
| Implementer | implement | Desenvolvimento |
| Reviewer | review | Analise de impacto e seguranca |
| Verifier | verify | Testes e quality gates |

- **Quality Gates**: lint, type-check, test, build
- **Playbooks**: `.omk/orchestration/`
- **Memoria**: `.omk/memory/`

---

## 10. Referencia Rapida

### 10.1 Comandos Docker

```bash
docker compose up -d                    # Stack completa
docker compose logs -f backend          # Logs
docker compose restart backend          # Restart
docker exec -it orthoplus-backend sh    # Shell
docker exec -it orthoplus-postgres psql -U orthoplus  # SQL
docker exec orthoplus-postgres pg_dump -U orthoplus orthoplus > backup-$(date +%Y%m%d).sql
```

### 10.2 Comandos PM2 (VPS)

```bash
pm2 status
pm2 logs backend
pm2 reload backend
```

### 10.3 Arquivos de Configuracao

| Arquivo | Proposito |
|---|---|
| `.env` | Desenvolvimento |
| `.env.production` | Producao |
| `docker-compose.yml` | Stack local |
| `docker-compose.prod.yml` | Producao (DB externo) |
| `nginx.conf` | Reverse proxy |
| `backend/prisma/schema.prisma` | Dados |
| `turbo.json` | Turbo |
| `pnpm-workspace.yaml` | Workspaces |

### 10.4 Glossario de Siglas

| Sigla | Significado |
|---|---|
| PEP | Prontuario Eletronico do Paciente |
| TISS | Troca de Informacoes em Saude Suplementar |
| NF-e | Nota Fiscal Eletronica |
| PDV | Ponto de Venda |
| CRM | Customer Relationship Management |
| LGPD | Lei Geral de Protecao de Dados |
| RBAC | Role-Based Access Control |
| CSP | Content Security Policy |
| HSTS | HTTP Strict Transport Security |
| CORS | Cross-Origin Resource Sharing |
| SPA | Single Page Application |
| SRE | Site Reliability Engineering |

### 10.5 Links Uteis

- Repositorio: OrthoPlus-Enterprise
- Issues: GitHub Issues
- Documentacao: docs/WIKI.md
- Rota interna: /admin/wiki (acesso admin)

### 10.6 Documentacao de Governanca

| Recurso | Local |
|---|---|
| Feature Spec (ativa) | `specs/017-omk-governance-integration/spec.md` |
| Plan de Implementacao | `specs/017-omk-governance-integration/plan.md` |
| Tasks | `specs/017-omk-governance-integration/tasks.md` |
| VPS Topology | `specs/017-omk-governance-integration/vps-topology.md` |
| VPS Services | `specs/017-omk-governance-integration/vps-services.md` |
| GitNexus Skills | `.claude/skills/gitnexus-*` |
| OMK Squad | `.omk/orchestration/squad-agents.md` |
| OMK Quality Gates | `.omk/orchestration/quality-gates.md` |
| Health Check Script | `scripts/vps-health-check.sh` |

---

> **Nota:** Esta Wiki e um documento vivo. Para sugestoes, abra uma issue ou atualize via PR.

---

*OrthoPlus Enterprise — Gestao Odontologica Inteligente*  
*Ultima atualizacao: 2026-05-19*

### 10.7 Rotacao de Chave SSH

**Procedimento:**

1. Gerar nova chave Ed25519:
   ```bash
   ssh-keygen -t ed25519 -C "orthoplus@$(date +%Y%m%d)" -f ~/.ssh/id_ed25519_orthoplus_new
   ```

2. Adicionar chave publica ao VPS:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519_orthoplus_new.pub $VPS_USER@$VPS_HOST
   ```

3. Testar acesso com nova chave:
   ```bash
   ssh -i ~/.ssh/id_ed25519_orthoplus_new $VPS_USER@$VPS_HOST "echo OK"
   ```

4. Remover chave antiga do `~/.ssh/authorized_keys` no VPS

5. Atualizar scripts e documentacao referenciando a nova chave

6. Revogar chave antiga em todos os locais

**Frequencia**: A cada 90 dias ou apos rotacao de pessoal.
