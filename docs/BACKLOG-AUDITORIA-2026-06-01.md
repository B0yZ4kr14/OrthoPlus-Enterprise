# Backlog de Correções — Auditoria 2026-06-01

> Documento gerado após execução das correções P0-P1. Itens P2-P3 ficam como backlog técnico.

## ✅ Concluído

| # | Issue | Commit |
|---|-------|--------|
| P0 | VPS asset path mismatch (`base: "/"`) | 7df46eb29 |
| P1 | Backfill 14 brownfield specs (tasks → `[x]`) | 7df46eb29 |
| P1 | 019-ia-radiografia verificado (45/45 tasks) | — |
| P2 | Acessibilidade: aria-label em componentes críticos | 833d3dab9 |
| Docs | AGENTS.md atualizado com findings | 833d3dab9 |
| Docs | Relatório consolidado de auditoria | ee050d016 |

## 📋 Backlog P2 — Média

### 1. Acessibilidade Completa
- **Escopo**: 45 botões de ícone restantes sem aria-label
- **Arquivo**: `docs/a11y-audit-remaining.md` (gerar via script)
- **Prioridade**: Média
- **Esforço estimado**: 2-3h

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
| Specs completos | 35/36 (97%) |
| Specs backfilled | 14 |
| Botões com aria-label | +7 (em andamento) |

---

Gerado em 2026-06-01 após execução de correções via Speckit + GitNexus
