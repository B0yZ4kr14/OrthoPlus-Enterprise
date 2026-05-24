# Tech Debt Report: Post-Implementation Cleanup

**Generated**: 2026-05-24
**Source**: `/speckit.cleanup` after brownfield gap resolution (agenda + pacientes)
**Features Affected**: `specs/agenda/`, `specs/pacientes/`, `020-spec-memory-hub`

---

## Executive Summary

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| Critical | 0 | None |
| Large | 4 | Review and prioritize |
| Medium | 5 | Tasks created in tasks.md |
| Small | 4 | Fixed during cleanup |

---

## Small Issues Fixed During Cleanup

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | `AppointmentForm.tsx:37` | `@ts-expect-error` supressao em novo codigo (CQ-2) | Substituido `z.date({ required_error })` por `z.date({ message })` |
| 2 | `PatientRepositoryApi.ts:9` | Cast complexo desnecessario | Simplificado para `as PatientAPI[]` |
| 3 | `PatientRepositoryApi.ts:18,24` | Cast `patient as Patient` desnecessario | Removido |
| 4 | `usePatientsClean.ts:34` | `console.error` debugging artifact | Removido (toast ja cobre UX) |

**Validation**: Backend build pass, Frontend type-check pass, Lint 0 erros, Tests 625/625 pass

---

## Large Issues Requiring Analysis

### [ISSUE-001] 71 Arquivos de Cleanup Legado Nao Commitados

**Category**: Maintenance / Repository Hygiene
**Location**: Working tree (staged deletions)
**Constitution Impact**: BR-1 (branch naming), DOC-1 (AGENTS.md authority)

#### Problem Description

A sessao anterior removeu 71 arquivos legados. Essas delecoes nunca foram commitadas.

#### Options

**Option 1: Commit Cleanup Legado (Recommended)**
- **Approach**: `git add -A && git commit -m "chore(cleanup): remove componentes legados"`
- **Effort**: S | **Risk**: Low

**Option 2: Discard All Deletions**
- **Approach**: `git checkout -- .`
- **Effort**: XS | **Risk**: Medium (perda de trabalho)

**Option 3: Commit Parcial por Dominio**
- **Approach**: Separar em 3-4 commits por area
- **Effort**: M | **Risk**: Low

#### Recommendation: Option 1

---

### [ISSUE-002] Memory Hub Controller — Cast `(req as any).user?.clinicId`

**Category**: Security / Type Safety
**Location**: `backend/src/modules/memory_hub/`
**Constitution Impact**: CQ-2 (no new `as any`), GP-1 (clinic isolation)

#### Problem Description

O Memory Hub Controller usa `(req as any).user?.clinicId` para acessar o clinicId. Isso viola CQ-2 e quebra clinic isolation.

#### Options

**Option 1: Tipar req.user Corretamente (Recommended)**
- **Approach**: Usar interface `Request` estendida ja existente em `custom.d.ts`
- **Effort**: S | **Risk**: Low

**Option 2: Extrair para Helper Tipado**
- **Approach**: Criar `getClinicId(req: Request): string` que lanca `ApiError` se ausente
- **Effort**: S | **Risk**: Low

#### Recommendation: Option 1 + Option 2 combinados

---

### [ISSUE-003] FileWatcher Side-Effect — Auto-Start em Import de Modulo

**Category**: Architecture / Test Flakiness
**Location**: `backend/src/modules/memory_hub/`
**Constitution Impact**: TP-1 (test coverage), EP-4 (observability)

#### Problem Description

O FileWatcher inicia automaticamente no `import` do modulo, nao na inicializacao da aplicacao.

#### Options

**Option 1: Lazy Initialization com Controle Explicito (Recommended)**
- **Approach**: Mover `FileWatcher.start()` para `index.ts` (app startup)
- **Effort**: M | **Risk**: Low

**Option 2: Factory Pattern**
- **Approach**: Criar via factory, nao singleton auto-iniciante
- **Effort**: M | **Risk**: Low

#### Recommendation: Option 1

---

### [ISSUE-004] Branch Constraint Violation (BR-1)

**Category**: Governance / Process
**Constitution Impact**: BR-1 (branch naming), BR-4 (merge requirements)

#### Problem Description

Todas as 8 commits da sessao foram feitas diretamente na `main`, violando BR-1.

#### Options

**Option 1: Documentar Excecao (Recommended)**
- **Approach**: Adicionar nota em `docs/session-memory/`
- **Effort**: XS | **Risk**: Low

**Option 2: Retroactive Branch + PR**
- **Approach**: Cherry-pick commits para branch de feature
- **Effort**: M | **Risk**: Medium

#### Recommendation: Option 1

---

## Cross-References

- **Agenda Tasks**: `specs/agenda/tasks.md` (Tech Debt section)
- **Pacientes Tasks**: `specs/pacientes/tasks.md` (Tech Debt section)
- **Constitution**: `.specify/memory/constitution.md`

## Next Steps

1. [ ] Commitar 71 arquivos de cleanup legado (ISSUE-001)
2. [ ] Resolver cast no Memory Hub (ISSUE-002)
3. [ ] Mover FileWatcher para inicializacao explicita (ISSUE-003)
4. [ ] Documentar excecao de branch (ISSUE-004)
5. [ ] Rodar `/speckit.implement` para TD tasks
6. [ ] Re-rodar `/speckit.cleanup` apos implementacao
