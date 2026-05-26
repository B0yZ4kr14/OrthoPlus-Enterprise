# Queue-005 — Memory Hub Verify Run Completion (FR-005 + NFR-008)

**Data:** 2026-05-26
**Prioridade:** Media
**Status:** Em andamento

---

## Itens

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 021 | detectOutdatedDecisions() no DriftDetectionService | Media | Concluido |
| 022 | Cost tracking per clinic com budget alerts | Media | Concluido |

## Resumo

Remediation das falhas restantes do verify run 020 (memory-hub):

- **FR-005**: Implementado `detectOutdatedDecisions()` no `DriftDetectionService`. Detecta documentos modificados no filesystem apos a ultima indexacao. Severity: medium (< 30 dias) ou high (> 30 dias).
- **NFR-008**: Implementado `CostTrackingService` com estimativa de tokens, precos por provider, tabela SQLite, resumo mensal por clinica com alerta de budget, e endpoint `GET /api/memory-hub/costs`.

## Arquivos alterados

- `backend/src/modules/memory_hub/domain/services/DriftDetectionService.ts`
- `backend/src/modules/memory_hub/domain/services/CostTrackingService.ts` (novo)
- `backend/src/modules/memory_hub/api/controller.ts`
- `backend/src/modules/memory_hub/api/router.ts`
- `backend/src/modules/memory_hub/MemoryHubModule.ts`
- `backend/tests/unit/memory_hub/driftDetection.test.ts` (+2 testes)
- `backend/tests/unit/memory_hub/costTracking.test.ts` (novo, 6 testes)

## Testes

- 689/689 passando
- Build: 0 erros
