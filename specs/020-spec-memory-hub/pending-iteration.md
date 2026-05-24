---
status: applied
created: 2026-05-24
change_request: "Resolver conflitos no spec.md antes de qualquer implementação. Adicionar NFR para API keys: segurança, custos, failover. Atualizar Dependencies: remover Ollama, adicionar providers suportados. Documentar LGPD compliance para envio de dados a APIs externas."
scope: "Feature-wide"
---

## Change Summary

Atualizar o spec.md do Memory Hub para refletir a mudança arquitetural de Ollama (local) para API-key-based LLM providers (cloud), resolver conflitos com NFR-004 (local-first), e documentar implicações de segurança, custos, failover e LGPD.

## Implementation Progress

- **Tasks completed**: T001–T049 (49 of 49 total) — 100% completo
- **Current phase**: Todas as 9 fases finalizadas
- **Files changed on branch**: N/A (trabalho na main, feature já mergeada)
- **Potential task completions to mark**: Nenhuma — implementação concluída
- **Adhoc changes**: Nenhuma detectada

## Impact Assessment

| Artifact | Action | Details |
|----------|--------|---------|
| spec.md | Modify | Dependencies, NFRs, Clarificações, Assumptions |
| plan.md | No change | Arquitetura já suporta múltiplos providers via abstração |
| tasks.md | No change | Todas as tasks estão completas |
| data-model.md | No change | Schema de embeddings é agnóstico a provider |
| research.md | Modify | Adicionar decisão arquitetural: API keys vs Ollama |
| checklists/ | Append | Novo checklist de validação pós-iteração |

## Risk Checks

- [x] Nenhuma task completa invalidada — a mudança é puramente documental
- [x] Sem violação de boundary de escopo — mantém-se dentro do Memory Hub
- [x] Sem quebra de downstream dependencies — tasks já implementadas

> **Nota**: Esta iteração é documental/pós-implementação. O código já suporta múltiplos providers via `OllamaEmbeddingClient.ts` e configuração via env vars. O objetivo é alinhar a especificação com a realidade arquitetural desejada (API keys).

## Planned Changes

### spec.md

#### 1. Dependencies (§Dependencies)
- **Remover**: "Embedding model: Ollama embeddings (local endpoint, consistent with existing ia-radiografia module)"
- **Adicionar**: 
  - "Embedding providers suportados: OpenAI (text-embedding-3-small/ada-002), Anthropic, Google, ou qualquer provider OpenAI-compatible"
  - "Configuração via environment variables: `MEMORY_HUB_EMBEDDING_PROVIDER`, `MEMORY_HUB_API_KEY`, `MEMORY_HUB_API_BASE_URL` (opcional, para proxies/custom endpoints)"
  - "Fallback para Ollama local mantido como opção de desenvolvimento via `MEMORY_HUB_EMBEDDING_PROVIDER=ollama`"

#### 2. Non-Functional Requirements (§NFR)
- **Adicionar NFR-006**: "API keys MUST be stored encrypted at rest (AES-256-GCM) and never logged or exposed in error messages."
- **Adicionar NFR-007**: "The system MUST support provider failover: if the primary API fails (timeout, rate limit, invalid key), fallback to secondary provider or queue for retry."
- **Adicionar NFR-008**: "API usage costs MUST be trackable per clinic/workspace with monthly budget alerts configurable via environment."
- **Adicionar NFR-009**: "Embedding requests MUST include request ID for provider-side tracing and cost attribution."
- **Modificar NFR-004**: "The system SHOULD be operable without external cloud dependencies (local-first architecture). Ollama fallback ensures local operation; API-key providers are optional enhancements."

#### 3. Functional Requirements (§FR)
- **Adicionar FR-011**: "The system MUST validate API key permissions (read/test call) on startup and fail fast with descriptive error if invalid."
- **Adicionar FR-012**: "The system MUST support hot-swapping of API keys without restart (via file watcher on `.env` or SIGHUP)."

#### 4. Clarifications (§Clarifications)
- **Adicionar Q6/A6**: 
  - Q: "Which embedding provider should be used in production?"
  - A: "API-key based providers (OpenAI, Anthropic, Google) for production; Ollama for local development and air-gapped environments."
- **Adicionar Q7/A7**:
  - Q: "How are API keys managed across clinics?"
  - A: "API keys are configured per deployment (not per clinic) via environment variables. Multi-tenancy uses separate deployments or provider API sub-accounts."

#### 5. Assumptions (§Assumptions)
- **Adicionar**: "API provider accounts have sufficient quota for embedding operations."
- **Adicionar**: "Network connectivity to API provider endpoints is available in production."
- **Adicionar**: "API provider SLAs meet the project's latency requirements (<2s per search query)."

#### 6. Edge Cases (§Edge Cases)
- **Adicionar**: "API key exhaustion: When monthly quota is reached, the system MUST queue requests and notify administrators, falling back to cached embeddings or local Ollama if available."
- **Adicionar**: "Provider outage: When the primary API provider is unreachable, the system MUST retry with exponential backoff and failover to secondary provider."
- **Adicionar**: "LGPD compliance for cloud embeddings: Before sending document content to external APIs, the system MUST verify no PII/sensitive data is present (via PIIDetector.ts) and log all outbound requests for audit."

### research.md

- **Adicionar decisão arquitetural**:
  - Título: "ADR-006: API-Key LLM Providers vs Ollama Local para Embeddings"
  - Contexto: "Ollama local satisfaz NFR-004 (local-first) mas requer GPU/CPU significativa e não escala horizontalmente. API keys oferecem embeddings de maior qualidade e escalabilidade mas introduzem dependência cloud, custos e questões de compliance."
  - Decisão: "Adotar API-key providers como padrão em produção, com Ollama como fallback de desenvolvimento."
  - Consequências: "Necessidade de gerenciamento de secrets, monitoramento de custos, failover entre providers, e conformidade LGPD para dados enviados à cloud."

### checklists/ (novo arquivo)

- **Criar**: `checklists/post-iteration-validation.md`
  - Validar se todos os conflitos NFR-004 foram resolvidos
  - Validar se LGPD compliance está documentada
  - Validar se failover requirements são mensuráveis

## Métricas de Qualidade da Iteração

| Critério | Antes | Depois |
|----------|-------|--------|
| Conflitos NFR-004 | Não resolvido | Resolvido (Ollama = fallback, API = primary) |
| NFRs para API keys | 0 | 4 (NFR-006 a NFR-009) |
| FRs para API keys | 0 | 2 (FR-011, FR-012) |
| Documentação LGPD | Ausente | Documentada em Edge Cases + Assumptions |
| Providers suportados | 1 (Ollama) | 4+ (OpenAI, Anthropic, Google, Ollama fallback) |

## Próximos Passos

1. **Aplicar iteração** com `/speckit.iterate.apply`
2. **Revisar** spec.md atualizado
3. **Validar** com checklist `checklists/post-iteration-validation.md`
4. **Atualizar implementação** se necessário (OllamaEmbeddingClient.ts → LLMEmbeddingClient.ts)
