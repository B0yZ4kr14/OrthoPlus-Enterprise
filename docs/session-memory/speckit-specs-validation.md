# Relatório de Validação Cross-Artifact — Specs OrthoPlus Enterprise

> **Gerado em:** 2026-05-24 20:39:34
> **Specs analisadas:** 29
> **Validador:** speckit-specs-validation (automated + manual review)

---

## 1. Resumo Executivo

| Métrica | Valor | Status |
|---------|-------|--------|
| Total de specs | 29 | — |
| Com spec.md + plan.md + tasks.md | 29/29 (100%) | ✅ |
| Com 100% tasks completas | 28/29 | ⚠️ |
| Com tarefas fantasma (arquivos inexistentes) | 7/29 | ❌ |
| Com FR IDs duplicados cross-spec | 24 specs | ⚠️ |
| Sem FR-* requirements | 2 specs | ⚠️ |

**Status geral:** A estrutura de artefatos está completa, mas há problemas críticos de rastreabilidade e integridade.

---

## 2. Issues Críticas

### 2.1 Tarefas Fantasma (Phantom Completions)

Tarefas marcadas como `[x]` concluídas mas referenciam arquivos que **não existem** no projeto:

| Spec | Arquivos inexistentes referenciados | Severidade |
|------|-------------------------------------|------------|
| `001-pacientes` | `pacientesService.ts`, `pacientesController.ts` | 🔴 Alta |
| `002-agenda` | `agendaService.ts` | 🔴 Alta |
| `005-auth-usuarios` | `authService.ts`, `authController.ts` | 🔴 Alta |
| `015-files` | `filesService.ts` | 🔴 Alta |
| `019-ia-radiografia` | `backend/tests/unit/ia-radiografia/*.test.ts` (5 arquivos) | 🔴 Alta |
| `020-spec-memory-hub` | `SqliteDatabase.ts`, `domain/MemoryDocument.ts`, `domain/Chunk.ts` | 🔴 Alta |
| `pacientes` (unnumbered) | `PatientEntity.ts` | 🟡 Média |

> **Nota:** Os testes de ia-radiografia existem em `apps/web/src/modules/ia-radiografia/**/__tests__/`, mas as tasks referenciam caminhos inexistentes em `backend/tests/unit/ia-radiografia/`.

### 2.2 FR IDs Não Únicos Cross-Spec

**24 specs** compartilham os mesmos IDs `FR-001` a `FR-005` e `SC-001` a `SC-003`. Isso impede rastreabilidade global. IDs como `FR-001` aparecem em:
- `001-pacientes`, `002-agenda`, `003-pep`, `004-financeiro`, `005-auth-usuarios`, `006-orcamentos`, `007-procedimentos`, `008-pdv`, `009-faturamento`, `010-funcionarios`, `011-inventario`, `012-tiss`, `013-crm`, `014-notificacoes`, `015-files`, `017-omk-governance-integration`, `018-sidebar-collapsed-default`, `019-ia-radiografia`, `020-spec-memory-hub`, `022-marketing`, `023-dashboard`, `024-nfe`, `025-fidelidade`, `021-teleodontologia`

**Recomendação:** Adotar prefixo por spec (ex: `PAC-FR-001`, `AGD-FR-001`) ou namespace global.

### 2.3 Specs Sem FR-* Requirements

| Spec | Observação |
|------|------------|
| `agenda` | Requisitos em formato narrativo, sem IDs FR-* |
| `pacientes` | Requisitos em formato narrativo, sem IDs FR-* |

### 2.4 Desconexão Spec ↔ Plan ↔ Tasks

**22 specs** têm FR-* definidos em `spec.md` mas **não são referenciados** explicitamente em `plan.md` ou `tasks.md`:

- `002-agenda`, `003-pep`, `004-financeiro`, `005-auth-usuarios`, `006-orcamentos`, `007-procedimentos`, `008-pdv`, `009-faturamento`, `010-funcionarios`, `011-inventario`, `012-tiss`, `013-crm`, `014-notificacoes`, `015-files`, `017-omk-governance-integration`, `019-ia-radiografia`, `020-spec-memory-hub`, `021-teleodontologia`, `022-marketing`, `023-dashboard`, `024-nfe`, `025-fidelidade`, `analytics`, `bi`

> **Nota:** Em alguns casos os FRs são referenciados em `blueprint.md` (ex: `001-pacientes`), mas o plan.md principal não os cita. Isso fragmenta a rastreabilidade.

---

## 3. Anomalias

### 3.1 Conclusão em Massa Suspeita

**18 specs** têm 100% das tasks marcadas como completas, incluindo specs grandes:

| Spec | Tasks | Completas | Suspeita |
|------|-------|-----------|----------|
| `agenda` | 87 | 87 | 🔴 Bulk-marking provável |
| `pacientes` | 88 | 88 | 🔴 Bulk-marking provável |
| `020-spec-memory-hub` | 49 | 49 | 🔴 Bulk-marking provável |
| `019-ia-radiografia` | 45 | 45 | 🔴 Bulk-marking provável |
| `022-marketing` | 43 | 43 | 🟡 Verificar |
| `021-teleodontologia` | 36 | 36 | 🟡 Verificar |
| `018-sidebar-collapsed-default` | 37 | 37 | 🟡 Verificar |
| `001-pacientes` | 38 | 38 | 🟡 Verificar |
| `002-agenda` | 38 | 38 | 🟡 Verificar |
| `003-pep` | 38 | 38 | 🟡 Verificar |
| `004-financeiro` | 38 | 38 | 🟡 Verificar |
| `005-auth-usuarios` | 39 | 39 | 🟡 Verificar |
| `015-files` | 73 | 73 | 🔴 Bulk-marking provável |

### 3.2 Spec Sem Tasks

| Spec | Tasks | Observação |
|------|-------|------------|
| `016-theme-premium-fix` | 0 | Tem spec.md e plan.md, mas tasks.md está vazio de tasks |

### 3.3 Formato de ID Inconsistente

- Specs numeradas (`001`–`025`): usam `FR-001`, `SC-001` (3 dígitos com zero-padding)
- `016-theme-premium-fix`: usa `FR-1`, `SC-1` (sem zero-padding)
- `analytics`, `bi`: usam `FR-1`, `SC-1`
- `agenda`, `pacientes`: sem FR IDs

---

## 4. Consistência Cross-Artifact por Spec

| Spec | spec.md | plan.md | tasks.md | FRs cobertos em plan | FRs cobertos em tasks | Arquivos fantasmas |
|------|---------|---------|----------|----------------------|-----------------------|-------------------|
| 001-pacientes | ✅ | ✅ | ✅ | ✅ (blueprint) | ❌ | 2 |
| 002-agenda | ✅ | ✅ | ✅ | ❌ | ❌ | 1 |
| 003-pep | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 004-financeiro | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 005-auth-usuarios | ✅ | ✅ | ✅ | ❌ | ❌ | 2 |
| 006-orcamentos | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 007-procedimentos | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 008-pdv | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 009-faturamento | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 010-funcionarios | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 011-inventario | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 012-tiss | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 013-crm | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 014-notificacoes | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 015-files | ✅ | ✅ | ✅ | ❌ | ❌ | 1 |
| 016-theme-premium-fix | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 017-omk-governance-integration | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 018-sidebar-collapsed-default | ✅ | ✅ | ✅ | ✅ | ❌ | 0 |
| 019-ia-radiografia | ✅ | ✅ | ✅ | ❌ | ❌ | 5 |
| 020-spec-memory-hub | ✅ | ✅ | ✅ | ❌ (parcial) | ❌ | 3 |
| 021-teleodontologia | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 022-marketing | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 023-dashboard | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 024-nfe | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| 025-fidelidade | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| agenda | ✅ | ✅ | ✅ | N/A | N/A | 0 |
| analytics | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| bi | ✅ | ✅ | ✅ | ❌ | ❌ | 0 |
| pacientes | ✅ | ✅ | ✅ | N/A | N/A | 1 |

---

## 5. Recomendações

### Imediatas (Alta Prioridade)
1. **Corrigir tarefas fantasma** — 7 specs referenciam arquivos inexistentes. Verificar se o código foi movido/renomeado ou se as tarefas nunca foram de fato implementadas.
2. **Renomear arquivos de teste de ia-radiografia** — Atualizar tasks.md para apontar para os testes reais em `apps/web/src/modules/ia-radiografia/**/__tests__/`.
3. **Verificar specs com 100% completion em massa** — Rodar `speckit-verify-tasks` nas specs com >30 tasks completas.

### Médio Prazo
4. **Padronizar IDs de requisitos** — Adotar prefixo por spec (ex: `PAC-FR-001`, `AGD-FR-001`) para evitar colisões cross-spec.
5. **Adicionar rastreabilidade FR → tasks** — Garantir que cada task em tasks.md referencie pelo menos um FR-* do spec.md correspondente.
6. **Unificar blueprint.md e plan.md** — Consolidar referências a FRs no plan.md principal ou estabelecer convenção de que blueprint é extensão do plan.

### Baixo Prazo
7. **Adotar FR-* nos specs `agenda` e `pacientes`** — Converter requisitos narrativos para formato IDed.
8. **Preencher tasks.md de `016-theme-premium-fix`** — Gerar tasks a partir do plan.md existente.

---

*Relatório gerado automaticamente por validação cross-artifact.*
