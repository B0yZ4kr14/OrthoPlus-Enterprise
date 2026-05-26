# Queue-004 — Memory Hub Robustez (Verify Run Remediation)

**Data:** 2026-05-26  
**Prioridade:** Media  
**Status:** Em andamento

---

## Itens

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 018 | Retry com exponential backoff nos embedding clients | Media | ✅ Concluido |
| 019 | Provider failover (primary → Ollama fallback) | Media | ✅ Concluido |
| 020 | Hot-swap API keys via endpoint admin | Media | ✅ Concluido |

## Resumo

Remediation das falhas do verify run 020 (memory-hub):

- **NFR-007**: Implementado `ResilientEmbeddingClient` com retry exponencial (3 tentativas, backoff 1s/2s/4s) e fallback automatico para Ollama quando o provider primario (OpenAI/Anthropic/Google) falha.
- **FR-012**: Implementado `POST /api/memory-hub/rotate-key` endpoint para atualizar provider, apiKey, model e baseUrl em runtime via `EmbeddingClientFactory.updateConfig()`.
- **Factory**: Refatorado `EmbeddingClientFactory.create()` para usar `createPrimary()` + `ResilientEmbeddingClient` wrapper com fallback Ollama.

## Arquivos alterados

- `backend/src/modules/memory_hub/infrastructure/ResilientEmbeddingClient.ts` (novo)
- `backend/src/modules/memory_hub/infrastructure/EmbeddingClientFactory.ts`
- `backend/src/modules/memory_hub/api/controller.ts`
- `backend/src/modules/memory_hub/api/router.ts`
- `backend/tests/unit/memory_hub/resilientEmbeddingClient.test.ts` (novo, 5 testes)
- `backend/tests/unit/memory_hub/embeddingClientFactory.test.ts` (novo, 5 testes)

## Testes

- 680/680 passando (+10 novos)
- Build: 0 erros
