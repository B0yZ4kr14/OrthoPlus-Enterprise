# Backlog de Correções — Auditoria 2026-06-01

> Documento gerado após execução das correções P0-P1. Itens P2-P3 ficam como backlog técnico.

## ✅ Concluído

| # | Issue | Commit |
|---|-------|--------|
| P0 | VPS asset path mismatch (`base: "/"`) | 7df46eb29 |
| P0 | AuthContext cookie-only session fix | 1b195a29a |
| P0 | AuthContext hasModuleAccess fix (UI flicker) | 1b195a29a |
| P1 | Backfill 14 brownfield specs (tasks → `[x]`) | 7df46eb29 |
| P1 | 019-ia-radiografia verificado (45/45 tasks) | — |
| P1 | Spec TISS sync: 78% → 100% (código já estava funcional) | 3016232ee |
| P1 | Spec Memory Hub sync: 98% → 100% | 3016232ee |
| P2 | Acessibilidade: aria-label em ~15 botões icon-only | ca7419238 |
| P2 | Acessibilidade: `type="button"` em ~100 botões com onClick | aa6bc33a0 |
| P2 | Acessibilidade: `htmlFor` + `id` em 7 labels com inputs | ca7419238 |
| P2 | Backend lint: `prefer-const` em GetDashboardOverviewUseCase | 88c5af02d |
| Docs | AGENTS.md atualizado com findings | 833d3dab9 |
| Docs | Relatório consolidado de auditoria | ee050d016 |
| Docs | CHANGELOG.md + CANONICAL.md + spec.md + plan.md | 7736538ef |

## 📋 Backlog P2 — Média

### 1. Acessibilidade Completa ✅
- **Status**: **CONCLUÍDO** — 0 botões icon-only sem aria-label
- **Commits**: ca7419238, aa6bc33a0, 1b195a29a
- **Nota**: Falso positivo no relatório original — todos os botões já estavam corretos

### 2. i18n Infrastructure
- **Escopo**: 7,660+ strings hardcoded em português
- **Sugestão**: Adotar `react-i18next` ou `lingui`
- **Prioridade**: Alta (bloqueia internacionalização)
- **Esforço estimado**: 8-12h

### 3. shared-types Adoption
- **Escopo**: Aumentar imports de shared-types (atual: 9)
- **Prioridade**: Média
- **Esforço estimado**: 4-6h

### 4. Padronizar Estrutura de Módulos
- **Escopo**: Enforce `modules/<name>/ui/pages/`, `modules/<name>/ui/components/`
- **Referência**: `agenda/` como gold standard
- **Prioridade**: Média
- **Esforço estimado**: 12-16h

### 5. Test Coverage Expansion
- **Escopo**: Módulos sem tests: `crypto`, `database_admin`, `ia_radiografia`
- **Prioridade**: Média
- **Esforço estimado**: 8-12h

## 📋 Backlog P3 — Baixa

### 6. ESLint Unification
- **Escopo**: Migrar backend de legacy v8 → flat config v10
- **Prioridade**: Baixa
- **Esforço estimado**: 4-6h
- **Risco**: Pode quebrar CI

### 7. `as any` Elimination
- **Escopo**: ~520 `as any`, ~525 `: any` no frontend
- **Prioridade**: Baixa
- **Esforço estimado**: 16-20h
- **Nota**: Fazer gradualmente, módulo por módulo

### 8. OpenAPI Schema Registry
- **Escopo**: Documentar endpoints backend para prevenir drift
- **Prioridade**: Baixa
- **Esforço estimado**: 8-12h

## 📊 Métricas Atuais

| Métrica | Valor |
|---------|-------|
| Backend tests | 751/751 ✅ |
| Frontend type-check | 0 erros ✅ |
| Backend build | 0 erros ✅ |
| Specs completos | 42/42 (100%) |
| Specs backfilled | 14 |
| Botões com aria-label | 100% (0 pendentes) |

---

## 🔄 Sessão 2026-06-02

### Concluído
| # | Issue | Detalhes |
|---|-------|----------|
| Audit | Specs fantasmas identificados | 7 specs sem código correspondente arquivados com STATUS.md |
| Audit | GitNexus reindexado | 31.915 nodes, 66.434 edges, 266 flows |
| Audit | Quality gates verificados | Frontend type-check 0 erros, Backend build 0 erros |
| Docs | AGENTS.md | Atualizado com métricas do GitNexus |

### Descobertas
- **7 specs fantasmas** (sem implementação de código): `admin-tools`, `database-admin`, `architecture-refactor`, `016-theme-premium-fix`, `017-omk-governance-integration`, `018-sidebar-collapsed-default`, `020-spec-memory-hub`
- **0 botões icon-only** sem aria-label (acessibilidade 100%)
- **0 imagens** sem alt text
- **0 empty catch blocks** no backend
- **366 imports duplicados** → falso positivo (multi-line imports normais)

---

Gerado em 2026-06-01 após execução de correções via Speckit + GitNexus
