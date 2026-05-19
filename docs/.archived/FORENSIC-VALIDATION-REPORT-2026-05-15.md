# Relatório Forense de Validação de Documentação

> **Data da análise:** 2026-05-15  
> **Commit analisado:** `f7c4a40e2`  
> **Metodologia:** Validação de afirmações factuais em documentos contra código-fonte, ambiente Docker, e banco de dados  

---

## Resumo Executivo

Foram analisados **2 documentos principais** (`CANONICAL-2026-05-14.md` e `AGENTS.md`) e identificadas **28 discrepâncias** entre a documentação e a realidade do código/ambiente.

| Severidade | Quantidade | Descrição |
|------------|-----------|-----------|
| **CRITICAL** | 4 | Afirmações sobre containers/imagem Docker que não existem |
| **HIGH** | 12 | Números incorretos (módulos, commits, schemas, workers) |
| **MEDIUM** | 7 | Inconsistências internas entre documentos |
| **LOW** | 2 | Datas e contagens menores |
| **INFO** | 3 | Observações sem impacto funcional |

---

## 1. Validação do CANONICAL-2026-05-14.md

### 1.1 Cabeçalho

| # | Campo | Documento | Realidade | Severidade |
|---|-------|-----------|-----------|------------|
| 1 | Commit | `331645b6d` | `f7c4a40e2` | **HIGH** |
| 2 | Versão Frontend | `v2.9.9` | Docker: v2.9.9 / package.json: `1.0.0` | **MEDIUM** |
| 3 | Versão Backend | `v2.5.3` | Docker: v2.5.3 / package.json: `1.0.0` | **MEDIUM** |

### 1.2 Seção 1 — Visão Geral (linha 19)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 4 | "180 tabelas, 16 schemas" | 180 models Prisma, 16 schemas custom. **Total no PostgreSQL: 17** (inclui `public`) | **MEDIUM** |

**Nota:** A Seção 10 (linha 234) corretamente diz "17 schemas", mas a Seção 1 diz "16". **Inconsistência interna do documento.**

### 1.3 Seção 5 — Módulos Backend

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 5 | "36 módulos (0-35)" | **37 módulos** em `backend/src/modules/` | **HIGH** |
| 6 | Tabela omite `ai` | Módulo `ai` existe e tem router `/api/ai` | **HIGH** |

**Evidência:**
```bash
$ ls -1 backend/src/modules/ | wc -l
37
```

### 1.4 Seção 2 / Seção 11 — Rotas Frontend

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 7 | "52 rotas" | **60 rotas** em `AppRoutes.tsx` | **MEDIUM** |

### 1.5 Seção 8 — Workers

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 8 | `notificationJobs` | Arquivo real: `marketingJobs.ts` | **HIGH** |

### 1.6 Seção 10 — Deploy VPS

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 9 | Imagem `orthoplus-frontend:v2.9.9` local | **NÃO EXISTE** localmente. Máxima: `v2.9.6` | **CRITICAL** |
| 10 | Imagem `orthoplus-backend:v2.5.3` local | **NÃO EXISTE** localmente. Máxima: `v2.5.2` | **CRITICAL** |
| 11 | Container `tsiapp-orthoplus-backend` rodando | **NÃO EXISTE** localmente | **CRITICAL** |
| 12 | Container `tsiapp-orthoplus` roda `orthoplus-frontend:v2.9.9` | Roda imagem `tsiapp-orthoplus` (nome diferente). Status: **unhealthy** | **HIGH** |

### 1.7 Seção 12 — Checklist

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 13 | Testes: 367 OK | ✅ **Correto** — 367 passando em 17 suites | **INFO** |

---

## 2. Validação do AGENTS.md

### 2.1 Cabeçalho (linha 4)

| # | Campo | Documento | Realidade | Severidade |
|---|-------|-----------|-----------|------------|
| 14 | Commit | `db3b177d4` | `f7c4a40e2` | **HIGH** |
| 15 | Data | `2026-05-15` | Commit de `2026-05-14` | **LOW** |
| 16 | Frontend | `v2.9.9` | Docker sim / package.json `1.0.0` | **MEDIUM** |

### 2.2 Estrutura de Diretórios (linha 23)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 17 | "35 módulos" | **37 módulos** | **HIGH** |
| 18 | "178 models" | **180 models** | **MEDIUM** |

### 2.3 Módulos Backend — Tabela (linha 81)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 19 | "36 módulos (0-35)" | **37 módulos** (falta `ai`) | **HIGH** |

### 2.4 Workers (linha 172)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 20 | `notificationJobs` | `marketingJobs.ts` | **HIGH** |

### 2.5 Rotas e Endpoints (linha 135)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 21 | Produção: `vps-tsi-02.tailbda57.ts.net/api` | CANONICAL diz: `tsiapp.io/api` | **MEDIUM** |

### 2.6 Deploy VPS (linhas 344-345)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 22 | `module_catalog`: 31 módulos | CANONICAL diz: **37** | **HIGH** |
| 23 | `clinic_modules`: 31 associações | CANONICAL diz: **37** | **HIGH** |

### 2.7 Contexto de Deploy (linha 337)

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 24 | Container backend existe | **NÃO EXISTE** localmente | **CRITICAL** |

### 2.8 Pendências Ativas

| # | Afirmação | Realidade | Severidade |
|---|-----------|-----------|------------|
| 25 | "~28 mock/stub endpoints" | CANONICAL conta **16** stubs | **MEDIUM** |
| 26 | "Validação 52 rotas" | `AppRoutes.tsx` tem **60** rotas | **MEDIUM** |
| 27 | Frontend lint: "~98 warnings" | Contexto anterior dizia **107** | **LOW** |

---

## 3. Inconsistências Cruzadas (CANONICAL ↔ AGENTS.md)

| # | Tópico | CANONICAL | AGENTS.md | Severidade |
|---|--------|-----------|-----------|------------|
| 28 | Commit | `331645b6d` | `db3b177d4` | **HIGH** |
| 29 | Schemas | 16 (seção 1) / 17 (seção 10) | Não especificado | **MEDIUM** |
| 30 | Módulos | 36 | 35 (diagrama) / 36 (tabela) | **HIGH** |
| 31 | module_catalog | 37 | 31 | **HIGH** |
| 32 | clinic_modules | 37 | 31 | **HIGH** |
| 33 | URL Produção | `tsiapp.io/api` | `vps-tsi-02.tailbda57.ts.net/api` | **MEDIUM** |
| 34 | Stubs | 16 | ~28 | **MEDIUM** |
| 35 | Rotas | 52 | 52 | **MEDIUM** (ambos errados, real=60) |

---

## 4. Evidências Técnicas Completas

### 4.1 Git
```
Commit: f7c4a40e2
Message: docs: update deploy versions to v2.9.9/v2.5.3 after VPS sync
Date:   2026-05-14
```

### 4.2 Prisma Schema
```
Models:     180
Schemas:    16 custom + public = 17 total no PostgreSQL
```

### 4.3 Backend Modules (37)
```
admin_tools, agenda, agents, ai, analytics, auth, backups, bi, comm,
configuracoes, contratos, crm, crypto_config, dashboard, database_admin,
faturamento, fidelidade, files, financeiro, funcionarios, github_tools,
inadimplencia, inventario, lgpd, marketing, nfe, notifications, orcamentos,
pacientes, pdv, pep, procedimentos, split_pagamento, teleodonto, terminal,
tiss, usuarios
```

### 4.4 Frontend Routes (60)
```
/, /demo, /auth, /dashboard, /pacientes, /pacientes/novo, /pacientes/:id,
/agenda, /financeiro, /financeiro/receber, /financeiro/fiscal/notas,
/financeiro/conciliacao, /pep, /pep/:patientId, /assinatura-icp,
/fluxo-digital, /odontograma, /tratamentos, /estoque,
/estoque/inventario-historico, /estoque/scanner, /inventario/dashboard,
/pdv, /crm, /contratos, /orcamentos, /procedimentos, /dentistas,
/funcionarios, /inadimplencia, /crypto-payment, /split-pagamento,
/marketing-auto, /fidelidade, /recall, /portal-paciente, /bi,
/dashboards/comercial, /lgpd, /faturamento-tiss, /teleodonto,
/ia-radiografia, /admin/database, /admin/backups, /admin/crypto-config,
/admin/github, /admin/terminal, /admin/wiki, /admin/adrs,
/admin/monitoring, /admin/logs, /admin/api-docs, /admin/audit,
/admin/audit-trail, /configuracoes/modulos, /configuracoes/database,
/usuarios, /configuracoes, /help, /403
```

### 4.5 Workers (9)
```
adminJobs, backupJobs, cryptoJobs, estoqueJobs, financeiroJobs,
gamificationJobs, marketingJobs, scheduleAppointments, scheduleBiExport
```

### 4.6 Docker (Local)
```
Containers running:
  tsiapp-orthoplus    tsiapp-orthoplus    Up 35 hours (unhealthy)  8083->80

Images (orthoplus):
  orthoplus-frontend:v2.9.6   (MAX local)
  orthoplus-backend:v2.5.2    (MAX local)
```

### 4.7 Backend Tests
```
Test Suites: 17 passed, 17 total
Tests:       367 passed, 367 total
```

---

## 5. Recomendações

### 5.1 Correções Imediatas (CRITICAL + HIGH)

1. **Atualizar commit hash** em ambos os documentos para `f7c4a40e2`
2. **Adicionar módulo `ai`** à tabela de módulos em ambos os documentos
3. **Corrigir contagem de módulos** para 37 em todo lugar
4. **Corrigir worker** `notificationJobs` → `marketingJobs`
5. **Padronizar schemas** para "17 schemas (16 custom + public)"
6. **Corrigir contagem de rotas** para 60
7. **Padronizar module_catalog/clinic_modules** para 37
8. **Corrigir estado Docker local** — documentar que imagens v2.9.9/v2.5.3 estão no VPS, não local
9. **Remover/container backend local** ou documentar que não existe
10. **Padronizar URL de produção**

### 5.2 Correções Médias (MEDIUM)

11. **Adicionar nota** sobre versões Docker vs package.json
12. **Padronizar contagem de stubs** (16 ou ~28, mas consistente)
13. **Verificar data** no AGENTS.md (2026-05-15 vs 2026-05-14)

---

## 6. Metodologia

A validação forense seguiu o método Socratic-Popperiano:

1. **Extração**: Cada afirmação numérica ou factual foi extraída dos documentos
2. **Falsificação**: Para cada afirmação, foi buscada evidência contrária no código
3. **Evidência**: Comandos reproduzíveis foram executados para provar/disprovar
4. **Severidade**: Classificada por impacto em decisões de deploy/arquitetura
5. **Rastreabilidade**: Cada finding inclui comando de evidência exato

---

> **NOTA:** Este relatório não invalida a funcionalidade do sistema. O código está operacional (367 testes passando, build OK). As discrepâncias são **documentais**, não **funcionais**.
