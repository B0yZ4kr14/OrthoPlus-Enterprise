# Plano de Remediacao — OrthoPlus Enterprise
**Data:** 2026-05-31
**Fonte:** Auditoria SpecKit + GitNexus + OMK

## Resumo dos Achados

| Categoria | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Frontend UI/UX | 0 | 14 | 31 | 24 | 69 |
| VPS/Config/Deploy | 8 | 18 | 25 | 12 | 63 |
| **Total** | **8** | **32** | **56** | **36** | **132** |

## Fases de Execucao

### Fase 1: CRITICAL Fixes (8 issues)
1. Fix app name mismatch: `ortho-backend` -> `orthoplus-backend` (ecosystem.config.cjs + playbooks + scripts)
2. Add REDIS_PASSWORD to .env.example
3. Fix nginx upstreams hardcoded 127.0.0.1 in docker-compose context
4. Fix /api/ stripping in deploy-vps.sh and deploy-vps-lite.sh
5. Fix docker-compose.prod.yml build sections

### Fase 2: HIGH Priority (32 issues)
1. Fix dashboard link in sidebar ("/" -> "/dashboard")
2. Fix moduleKey inconsistencies (FISCAL, HELP)
3. Add aria-label to icon-only buttons (15+ instances)
4. Fix inputs without labels (RepositoryManager, ForgotPassword)
5. Remove double ErrorBoundary wrapping
6. Fix trust proxy for Docker ranges
7. Add DATABASE_URL validation
8. Fix .env.example missing vars

### Fase 3: MEDIUM Priority (56 issues)
1. Fix duplicate icons in sidebar
2. Remove dead code (registerServiceWorker, commented exports)
3. Fix hardcoded Tailwind colors
4. Fix vite.config.ts issues
5. Fix card inconsistencies

### Fase 4: LOW Priority (36 issues)
1. Remove static badges or make dynamic
2. Clean commented code
3. Fix minor CSS issues
4. Add missing healthchecks

## Quality Gates
- After each batch: type-check, lint, build
- After each phase: test
- Final: full validation
