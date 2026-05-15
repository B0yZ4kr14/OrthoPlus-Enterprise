# Validacao Canônica Forense — 5 Tiers

**Data:** 2026-05-15
**Commit:** `d25ca3a6`
**Agentes:** 15
**Tiers:** 5
**Evidencias:** 55

## Resumo

| Métrica | Valor |
|---------|-------|
| Conformidades | 45 |
| Findings | 13 |
| CRITICAL | 4 |
| HIGH | 7 |
| MEDIUM | 2 |
| LOW | 0 |

## Conformidades (45)

1. **A1** [Local] — Git: Local sincronizado (d25ca3a6)
2. **A1** [GitHub] — Git: GitHub sincronizado (d25ca3a6)
3. **A2** [Tier2] — AGENTS.md: module_count=37 encontrado
4. **A2** [Tier2] — AGENTS.md: models=180 encontrado
5. **A2** [Tier2] — AGENTS.md: schemas=17 encontrado
6. **A2** [Tier2] — AGENTS.md: routes=60 encontrado
7. **A2** [Tier2] — AGENTS.md: workers=9 encontrado
8. **A2** [Tier2] — AGENTS.md: Tabela de modulos: 37 linhas >= 37
9. **A3** [Tier2] — CANONICAL.md: module_count=37 encontrado
10. **A3** [Tier2] — CANONICAL.md: models=180 encontrado
11. **A3** [Tier2] — CANONICAL.md: schemas=17 encontrado
12. **A3** [Tier2] — CANONICAL.md: routes=60 encontrado
13. **A3** [Tier2] — CANONICAL.md: workers=9 encontrado
14. **A3** [Tier2] — CANONICAL.md: db_tables=1 encontrado
15. **A4** [Tier2] — PROMPT.md: 27 referencias explicitas (>=20)
16. **A4** [Tier2] — PROMPT.md: Tier 1 documentado
17. **A4** [Tier2] — PROMPT.md: Tier 2 documentado
18. **A4** [Tier2] — PROMPT.md: Tier 3 documentado
19. **A4** [Tier2] — PROMPT.md: Tier 4 documentado
20. **A4** [Tier2] — PROMPT.md: Tier 5 documentado
21. **A5** [Tier3] — TSi-Vault: Checkpoint existe
22. **A5** [Tier3] — TSi-Vault: Commit d25ca3a6 presente
23. **A5** [Tier3] — TSi-Vault: modules=37
24. **A5** [Tier3] — TSi-Vault: models=180
25. **A6** [Tier3] — OMK: Memory JSON existe
26. **A6** [Tier3] — OMK: modules=37
27. **A6** [Tier3] — OMK: models=180
28. **A6** [Tier3] — OMK: routes=60
29. **A7** [Tier5] — VPS: Backend healthcheck OK
30. **A8** [Tier5] — VPS: Nginx configurado

... e mais 15 conformidades.

## Findings (13)

### [1] [HIGH] A1 [VPS]
- **Doc:** Git::Sync
- **Claim:** VPS == Local
- **Reality:** VPS: Warning: vs Local: d25ca3a6
- **Action:** Sincronizar VPS

### [2] [MEDIUM] A2 [Tier2]
- **Doc:** AGENTS.md::Commit tracking
- **Claim:** Commit atual documentado
- **Reality:** Nao encontrado
- **Action:** Atualizar header com commit atual

### [3] [HIGH] A4 [Tier2]
- **Doc:** PROMPT.md::Commit ref
- **Claim:** Commit atual no prompt
- **Reality:** Nao encontrado
- **Action:** Atualizar prompt

### [4] [HIGH] A6 [Tier3]
- **Doc:** OMK::Commit
- **Claim:** d25ca3a6
- **Reality:** 301f9e63
- **Action:** Atualizar OMK memory

### [5] [HIGH] A7 [Tier5]
- **Doc:** VPS::Git sync
- **Claim:** d25ca3a6
- **Reality:** Warning:
- **Action:** git pull na VPS

### [6] [CRITICAL] A7 [Tier5]
- **Doc:** VPS::Container tsiapp-orthoplus
- **Claim:** Rodando
- **Reality:** Ausente
- **Action:** Verificar container tsiapp-orthoplus

### [7] [CRITICAL] A7 [Tier5]
- **Doc:** VPS::Container tsiapp-orthoplus-backend
- **Claim:** Rodando
- **Reality:** Ausente
- **Action:** Verificar container tsiapp-orthoplus-backend

### [8] [CRITICAL] A7 [Tier5]
- **Doc:** VPS::Container orthoplus-redis
- **Claim:** Rodando
- **Reality:** Ausente
- **Action:** Verificar container orthoplus-redis

### [9] [HIGH] A8 [Tier5]
- **Doc:** VPS::Port mapping
- **Claim:** 8083:8080
- **Reality:** Divergente
- **Action:** Corrigir port mapping

### [10] [HIGH] A10 [Tier1]
- **Doc:** Backend::Registration
- **Claim:** >=37
- **Reality:** 0
- **Action:** Registrar routers faltantes

### [11] [CRITICAL] A10 [Tier1]
- **Doc:** Backend::clinicGuard
- **Claim:** Todos os routers
- **Reality:** Faltando em: ['ai', 'auth']
- **Action:** Adicionar clinicGuard

### [12] [HIGH] A12 [Tier1]
- **Doc:** DB::Models vs Tables
- **Claim:** 180 == 1
- **Reality:** Divergencia
- **Action:** Sincronizar schema

### [13] [MEDIUM] A14 [Tier1]
- **Doc:** Workers::Cron jobs
- **Claim:** >=9
- **Reality:** 0
- **Action:** Verificar registro de workers

---

**JSON:** `/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/.omk/arch-squad/qa/validacao-canonica-2026-05-15.json`
**EV:** `/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/.omk/arch-squad/evidencias/2026-05-15-consolidacao`
