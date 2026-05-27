# Relatório de Análise Speckit — Problemas Pendentes, Tarefas e Implementações Incompletas

**Projeto:** OrthoPlus Enterprise
**Data:** 2026-05-28
**Branch:** main (62 commits à frente de origin/main)
**Análise realizada por:** Speckit Doctor + Drift Analysis + Status Scan

---

## 1. Resumo Executivo

| Categoria | Status |
|-----------|--------|
| Features com spec/plan/tasks.md | 30 (100% cobertura documental) |
| Features 100% implementadas (código real) | 20 (001–020) |
| Features "migrated" (reverse-engineered) | 5 (021–025) — documentam código pré-existente |
| Specs legadas sem numeração | 5 (agenda, analytics, bi, architecture-refactor, pacientes) |
| **Architecture Refactor incompleto** | **13/40 tasks pendentes (32,5%)** |
| **Migrations Prisma pendentes** | **7 migrations não aplicadas no banco local** |
| Testes falhando | 1 pré-existente (frontend) |
| Cores dark: hardcoded restantes | ~41 ocorrências em 8 arquivos |
| Módulos backend sem spec | 20 |
| Módulos frontend sem spec | 20 |

---

## 2. Problemas Críticos (Requerem Ação Imediata)

### 2.1 — 7 Migrations Prisma Pendentes no Banco Local

Status: CRÍTICO
Impacto: Runtime errors se código espera colunas/tabelas inexistentes

Migrations não aplicadas em backend/prisma/migrations/:

| Migration | Data | Escopo |
|-----------|------|--------|
| add_dentista_procedimentos | 2026-05-26 | Relação dentista-procedimento |
| add_faturamento_config | 2026-05-26 | Configurações de faturamento |
| add_glosa_fields | 2026-05-27 | Campos de glosa TISS |
| add_paciente_convenios | 2026-05-27 | Vínculo paciente-convênio |
| add_pdv_venda_itens | 2026-05-27 | Itens de venda PDV |
| add_tabela_precos | 2026-05-26 | Tabela de preços de procedimentos |
| add_tiss_convenios | 2026-05-26 | Convênios TISS |

Ação recomendada:
    cd backend
    npx prisma migrate deploy

Nota: O ambiente de desenvolvimento não suporta prisma migrate dev com shadow DB por causa do multi-schema PostgreSQL. Aplicar via migrate deploy ou criar migration SQL custom.

---

### 2.2 — Architecture Refactor: 13 Tasks Pendentes

Status: CRÍTICO
Local: specs/architecture-refactor/tasks.md
Progresso: 27/40 tasks (67,5%)

A refatoração arquitetural está parada na Phase 3–6.

#### Tasks pendentes:

**Phase 3 — Dependency Inversion (memory_hub)**
- T3.1 Criar interfaces de repositório (IDocumentRepository, IEmbeddingRepository, ISearchAuditRepository)
- T3.2 Refatorar domain services para usar interfaces
- T3.3 Refatorar IndexingService com factory pattern
- T3.4 Ajustar MemoryHubModule.ts para DI adequado

**Phase 4 — Frontend Hooks (1 pendente)**
- T4.3 Refatorar páginas admin para usar hooks

**Phase 5 — DTOs e Contratos API (5 pendentes)**
- T5.1 Definir TransactionDTO, DashboardOverviewDTO, UserDTO em shared-types
- T5.2 Criar entity-to-DTO mappers
- T5.3 Atualizar frontend para consumir DTOs
- T5.4 Documentar contratos API com Zod schemas
- T5.5 Padronizar envelope de resposta { success, data, error }

**Phase 6 — Repository Coverage (3 pendentes)**
- T6.1 Adicionar repository layer a módulos com >=5 entidades E alterações recentes (<3 meses)
- T6.2 Prioridade P0: analytics, auth, files, notifications, pacientes
- T6.3 Excluir módulos legados estáveis (tolerância brownfield EP-2)

Risco: O memory_hub (Feature 020) foi implementado sem as interfaces de repositório, criando débito técnico.

---

## 3. Problemas de Médio Impacto

### 3.1 — Teste Frontend Falhando (Pré-existente)

Arquivo: apps/web/src/modules/faturamento/ui/pages/__tests__/RelatorioFiscalPage.test.tsx
Erro: ReferenceError: ResizeObserver is not defined
Status: 1164/1165 passando (99,9%)

Ação recomendada: Adicionar mock de ResizeObserver no vitest.setup.ts ou no teste.

---

### 3.2 — Cores dark: Hardcoded Restantes

Status: 41 ocorrências em 8 arquivos
Contexto: Refatoração de cores Tailwind (726 substituições em 189 arquivos — 98,4% completo)

| Arquivo | Ocorrências | Prioridade |
|---------|-------------|------------|
| landpage/ui/pages/Landpage.tsx | 18 | Média |
| theme/semantic-colors.ts | 8 | Baixa |
| types/patient-status.ts | 6 | Baixa |
| pacientes/components/PatientTimeline.tsx | 3 | Média |
| procedimentos/ui/pages/TemplatesProcedimentos.tsx | 2 | Média |
| admin/ui/pages/AuditTrailViewer.tsx | 2 | Baixa |
| auth/ui/pages/Auth.tsx | 1 | Baixa |
| modules/Auth.tsx | 1 | Baixa |

---

### 3.3 — 62 Commits Não Pushados para origin/main

Status: Risco de divergência
Último push: desconhecido (branch local está 62 commits à frente)

Risco: Perda de trabalho se o repositório local for corrompido. Divergência dificulta colaboração.

---

## 4. Baixo Impacto / Observações

### 4.1 — Features 021–025: Specs Migradas (Não São Pendências)

| Feature | Backend Module | Frontend Module | Notas |
|---------|---------------|-----------------|-------|
| 021-teleodontologia | teleodonto | — | Backend existe; frontend não tem módulo dedicado |
| 022-marketing | marketing | marketing-auto | Código pré-existente |
| 023-dashboard | dashboard | dashboard / dashboards | Código pré-existente |
| 024-nfe | nfe | — | Backend existe; frontend usa faturamento |
| 025-fidelidade | fidelidade | fidelidade | Código pré-existente |

Essas features foram criadas via speckit-brownfield-scan. Não são pendências de implementação.

---

### 4.2 — Módulos Sem Spec Documental

Backend (20 módulos):
memory_hub, configuracoes, ia_radiografia, contratos, admin_tools, search_index,
database_admin, crypto_config, agents, notifications, terminal, split_pagamento,
relatorios, lgpd, github_tools, comm, inadimplencia, backups, ai, crypto

Frontend (20 módulos):
admin, application, cobranca, contratos, core, crypto, dashboards, dentistas,
domain, estoque, inadimplencia, landpage, lgpd, marketing-auto, odontograma,
portal-paciente, settings, split-pagamento, tratamentos, ui

Observação: Muitos são sub-módulos, utilitários ou módulos legados estáveis.

---

### 4.3 — CI/CD: Continue-on-Error em Workflows

| Workflow | Blocos continue-on-error |
|----------|---------------------------|
| e2e-tests.yml | 1 |
| production-validation.yml | 1 |
| quality-check.yml | 2 |
| security.yml | 3 |
| speckit-compliance.yml | 2 |

Total: 9 blocos em 5 workflows. O security.yml tem 3 blocos, o que pode mascarar falhas.

---

## 5. Matrix de Risco Consolidada

| # | Problema | Severidade | Esforço Est. |
|---|----------|------------|--------------|
| 1 | Aplicar 7 migrations pendentes | Crítico | 30 min |
| 2 | Architecture Refactor — Phase 3 (DI memory_hub) | Crítico | 4–6h |
| 3 | Architecture Refactor — Phase 5 (DTOs) | Crítico | 6–8h |
| 4 | Architecture Refactor — Phase 6 (Repository coverage) | Médio | 8–12h |
| 5 | Fix teste RelatorioFiscalPage (ResizeObserver) | Médio | 15 min |
| 6 | Eliminar dark: hardcoded restantes | Médio | 2–3h |
| 7 | Push 62 commits para origin/main | Médio | 5 min |
| 8 | Criar specs para módulos sem documentação | Baixo | 4–8h |
| 9 | Revisar continue-on-error em CI/CD | Baixo | 1–2h |

---

## 6. Próximos Passos Recomendados

### Imediato (Hoje)
1. Aplicar migrations pendentes no banco local e no VPS
2. Push dos 62 commits para origin/main
3. Fix do teste ResizeObserver (mock no vitest.setup)

### Curto Prazo (Esta Semana)
4. Retomar Architecture Refactor — Phase 3: Criar interfaces de repositório no memory_hub
5. Eliminar dark: hardcoded em Landpage.tsx e TemplatesProcedimentos.tsx
6. Revisar CI/CD: Remover continue-on-error desnecessário de security.yml

### Médio Prazo (Próximas 2 Semanas)
7. Architecture Refactor — Phase 5: DTOs em shared-types + mappers
8. Architecture Refactor — Phase 6: Repository layer para módulos P0
9. Criar specs brownfield para os 20 módulos backend sem documentação

---

## 7. Dados Brutos da Análise

### Speckit Doctor
- Project structure: 6/6 checks OK
- AI agents: 4 dirs OK
- Features: 30 total, 30 complete per tasks.md
- Scripts health: 6/6 executable
- Extensions: ~190 installed
- Git: main branch, working tree clean

### Testes
- Backend: 49 suites, 711 tests — 100% passando
- Frontend: 113 arquivos, 1165 tests — 99,9% passando (1 falha pré-existente)

### Build Gates
- Backend tsc: 0 erros, ~437 warnings
- Frontend tsc: 0 erros, 103 warnings pré-existentes
- Lint: 0 erros, 103 warnings

---

Relatório gerado automaticamente via análise Speckit.
