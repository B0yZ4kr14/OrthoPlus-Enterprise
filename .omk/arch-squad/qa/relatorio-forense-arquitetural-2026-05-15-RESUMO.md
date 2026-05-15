# Relatorio Forense Arquitetural

**Data:** 2026-05-15
**Commit:** `79fd4532`
**Agentes:** 10
**Evidencias:** 18

## Resumo

| Metrica | Valor |
|---------|-------|
| Findings | 12 |
| CRITICAL | 1 |
| HIGH | 6 |
| MEDIUM | 5 |
| LOW | 0 |

## Findings

### [1] [HIGH] ARQ-01
- **Doc:** Codigo::clinicGuard
- **Claim:** clinicGuard em 37 routers
- **Reality:** Apenas 0
- **Action:** Verificar routers sem clinicGuard

### [2] [MEDIUM] ARQ-01
- **Doc:** Codigo::queryRaw
- **Claim:** queryRaw: 16 ocorrencias
- **Reality:** Documentado como ~14
- **Action:** Reclassificar se necessario

### [3] [HIGH] ARQ-03
- **Doc:** DB::Models vs Tables
- **Claim:** Models (180) == Tables (1)
- **Reality:** Divergencia
- **Action:** Sincronizar schema

### [4] [HIGH] ARQ-03
- **Doc:** Schema::@@schema
- **Claim:** Todos models tem @@schema
- **Reality:** Models sem schema
- **Action:** Adicionar @@schema

### [5] [CRITICAL] ARQ-03
- **Doc:** Schema::relationMode
- **Claim:** relationMode = 'prisma'
- **Reality:** Nao encontrado
- **Action:** Adicionar relationMode

### [6] [MEDIUM] ARQ-04
- **Doc:** Docker::HEALTHCHECK
- **Claim:** Backend Dockerfile tem HEALTHCHECK
- **Reality:** Nao encontrado
- **Action:** Adicionar HEALTHCHECK (DEV-001)

### [7] [MEDIUM] ARQ-08
- **Doc:** Arquitetura::queryRaw
- **Claim:** Criterio claro para 'legitimo'
- **Reality:** Ocorrencias sem classificacao formal
- **Action:** Criar documento de classificacao

### [8] [MEDIUM] ARQ-08
- **Doc:** Arquitetura::Stub Definition
- **Claim:** 8 modulos com stubs
- **Reality:** Definicao de 'completo' vs 'stub' nao formalizada
- **Action:** Documentar criterios de completude

### [9] [MEDIUM] ARQ-09
- **Doc:** VPS::Sync
- **Claim:** VPS sincronizada com GitHub
- **Reality:** VPS: Warning: vs LOCAL: 79fd4532
- **Action:** git pull na VPS

### [10] [HIGH] ARQ-10
- **Doc:** Sync::DB
- **Claim:** Models == DB Tables
- **Reality:** 180 != 1
- **Action:** Sincronizar

### [11] [HIGH] ARQ-10
- **Doc:** Sync::TSi-Vault
- **Claim:** TSi-Vault tem commit atual
- **Reality:** DESATUALIZADO
- **Action:** Atualizar checkpoint

### [12] [HIGH] ARQ-10
- **Doc:** Sync::OMK
- **Claim:** OMK tem commit atual
- **Reality:** DESATUALIZADO
- **Action:** Atualizar OMK

---

**JSON:** `/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/.omk/arch-squad/qa/relatorio-forense-arquitetural-2026-05-15.json`
**EV:** `/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/.omk/arch-squad/evidencias/2026-05-15`

## Analise de Falsos Positivos

### [FP-1] ARQ-01 clinicGuard
- **Status:** FALSO POSITIVO
- **Razao:** `clinicGuard` esta presente em TODOS os 37 routers (via `router.use(clinicGuard)`), mas o comando grep procurou apenas em `backend/src/index.ts`, onde nao aparece explicitamente. O middleware eh aplicado em cada router individual.
- **Evidencia:** `grep -rn 'clinicGuard' backend/src/modules/*/api/router.ts` retorna 37+ ocorrencias.

### [FP-2] ARQ-03 Models vs Tables
- **Status:** FALSO POSITIVO
- **Razao:** O comando psql no script falhou devido a escaping incorreto de aspas (`chr(39)` nao funciona no shell). Verificacao manual: `psql ... SELECT COUNT(*) ...` retorna **180** tables, igual aos 180 models.
- **Evidencia:** EV manual — psql retorna count=180.

### [FP-3] ARQ-03 Models sem @@schema
- **Status:** FALSO POSITIVO
- **Razao:** O comando `grep -B1 '^model ' | grep -v '@@schema' | grep '^model'` lista TODOS os models porque `grep -v '@@schema'` remove apenas a linha do `@@schema`, nao o bloco inteiro. Todos os 180 models possuem `@@schema` (verificado: `grep -c '@@schema' schema.prisma` = 180).
- **Evidencia:** EV-007-ARQ-03 lista todos os models, mas cada um tem `@@schema` na linha seguinte.

## Findings Reais Consolidados

| # | Agente | Finding | Severidade | Acao |
|---|--------|---------|------------|------|
| 1 | ARQ-01 | queryRaw: 16 ocorrencias (doc diz ~14) | MEDIUM | Reclassificar contagem |
| 2 | ARQ-03 | `relationMode = "prisma"` documentado mas nao existe no schema | HIGH | Corrigir AGENTS.md |
| 3 | ARQ-04 | Backend Dockerfile sem HEALTHCHECK (DEV-001) | MEDIUM | Adicionar HEALTHCHECK |
| 4 | ARQ-08 | Criterio para queryRaw "legitimo" nao formalizado | MEDIUM | Criar doc de classificacao |
| 5 | ARQ-08 | Definicao de "completo" vs "stub" nao formalizada | MEDIUM | Documentar criterios |
| 6 | ARQ-09 | VPS 1 commit atras (`3e7f0f9d` vs `79fd4532`) | MEDIUM | git pull na VPS |
| 7 | ARQ-10 | TSi-Vault checkpoint desatualizado | HIGH | Atualizar checkpoint |
| 8 | ARQ-10 | OMK memory desatualizada | HIGH | Atualizar memory |

## Acoes Imediatas

1. [ ] Corrigir AGENTS.md — remover afirmacao falsa sobre `relationMode`
2. [ ] Atualizar TSi-Vault checkpoint com commit `79fd4532`
3. [ ] Atualizar OMK memory com commit `79fd4532`
4. [ ] Criar `.omk/arch-squad/docs/criterios-stubs.md`
5. [ ] Criar `.omk/arch-squad/docs/criterios-queryraw.md`
6. [ ] VPS: executar `git pull` em `/home/tsi/OrthoPlus-Enterprise`
