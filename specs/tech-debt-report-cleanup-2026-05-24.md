# Tech Debt Report: Post-Implementation Cleanup

**Generated**: 2026-05-24
**Updated**: 2026-05-24
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

**Validation**: Backend build pass, Frontend type-check pass, Lint 0 erros, Tests 636/636 pass

---

## Large Issues — Status Update

### [ISSUE-001] 71 Arquivos de Cleanup Legado ✅ RESOLVIDO

**Category**: Maintenance / Repository Hygiene
**Location**: Working tree (staged deletions)
**Status**: **RESOLVIDO** — Arquivos ja foram commitados em commits anteriores. Working tree esta clean.

---

### [ISSUE-002] Memory Hub Controller — Cast `(req as any).user?.clinicId` ✅ RESOLVIDO

**Category**: Security / Type Safety
**Location**: `backend/src/modules/memory_hub/`
**Constitution Impact**: CQ-2 (no new `as any`), GP-1 (clinic isolation)
**Status**: **RESOLVIDO** — Nao ha cast `(req as any)` no modulo memory_hub. O controller usa `req.user?.clinicId` diretamente. O `clinicGuard` ja valida a presenca do clinicId antes de propagar a requisicao. O tipo `user?: any` em `custom.d.ts` eh um debito tecnico global do backend (nao especifico do Memory Hub).

**Nota**: O custom.d.ts ainda declara `user?: any`, mas isso eh um problema arquitetural global que requer refatoracao cross-module.

---

### [ISSUE-003] FileWatcher Side-Effect — Auto-Start em Factory Function ⏸️ NAO-BLOQUEANTE

**Category**: Architecture / Test Flakiness
**Location**: `backend/src/modules/memory_hub/`
**Constitution Impact**: TP-1 (test coverage), EP-4 (observability)
**Status**: **NAO-BLOQUEANTE** — O FileWatcher inicia dentro de `createMemoryHubModule()` factory quando `enabled === true`. Os testes passam (636/636) e o FileWatcher eh corretamente parado no teardown dos testes.

**Impacto Atual**: Nenhum — testes estaveis, backend estavel em producao.
**Recomendacao**: Manter como observacao para futura refatoracao se o modulo crescer em complexidade.

---

### [ISSUE-004] Branch Constraint Violation (BR-1) ✅ DOCUMENTADO

**Category**: Governance / Process
**Constitution Impact**: BR-1 (branch naming), BR-4 (merge requirements)
**Status**: **DOCUMENTADO** — Commits diretos na `main` foram realizados durante sessoes de hotfix/deploy de emergencia (IA_ENCRYPTION_KEY ausente, Redis WRONGPASS, deploy script path incorreto). Estes commits foram necessarios para estabilizar a VPS em producao.

**Justificativa**: Os commits diretos na main foram feitos para resolver problemas criticos de producao. Em condicoes normais de desenvolvimento, deve-se usar branches de feature + PR.

---

## Novos Issues Identificados Durante Sessao

### [ISSUE-005] Deploy Script Path Incorreto ✅ RESOLVIDO

**Category**: DevOps / Deploy
**Location**: `scripts/deploy-orthoplus-full.sh`
**Status**: **RESOLVIDO** — O script referenciava path incorreto mas o PM2 rodava de outro. Corrigido no commit `fc9d99926`.

**Mudancas aplicadas**:
- Corrigido REMOTE_BACKEND path
- `pnpm install` (sem `--prod`, para instalar prisma CLI)
- Corrigido paths prisma e pm2 start

---

### [ISSUE-006] Prisma em devDependencies — Impossibilita Migrations em Producao ✅ RESOLVIDO

**Category**: DevOps / Dependencies
**Location**: `backend/package.json`
**Status**: **RESOLVIDO** — O `prisma` estava em `devDependencies`, fazendo com que `pnpm install --prod` nao instalasse o CLI. Movido para `dependencies` no commit `fc9d99926`.

---

### [ISSUE-007] Ecosystem.json Desatualizado na VPS ✅ RESOLVIDO

**Category**: DevOps / PM2 Config
**Location**: `/home/tsi/OrthoPlus-Enterprise/ecosystem.json`
**Status**: **RESOLVIDO** — O ecosystem.json apontava para paths inexistentes. Atualizado para refletir os paths reais.

---

## Estado do Sistema (2026-05-24)

| Componente | Status |
|------------|--------|
| Backend VPS | ✅ Online, uptime 7m+, 0 unstable restarts |
| Redis | ✅ Conectado (Main/Publisher/Subscriber) |
| Health Check | ✅ `{"status":"ok"}` |
| Frontend | ✅ HTTP 200 |
| Tests Local | ✅ 636/636 pass |
| Backend Build | ✅ tsc 0 errors |
| Frontend Type-Check | ✅ 0 errors |
| Lint | ✅ 0 errors / 96 warnings |

## Next Steps

1. [x] Commitar 71 arquivos de cleanup legado (ISSUE-001)
2. [x] Resolver cast no Memory Hub (ISSUE-002)
3. [~] Mover FileWatcher para inicializacao explicita (ISSUE-003) — Nao-bloqueante, observacao
4. [x] Documentar excecao de branch (ISSUE-004)
5. [x] Corrigir deploy script path (ISSUE-005)
6. [x] Mover prisma para dependencies (ISSUE-006)
7. [x] Atualizar ecosystem.json na VPS (ISSUE-007)
