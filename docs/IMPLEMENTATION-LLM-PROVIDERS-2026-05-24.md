# Implementação: Multi-Provider Embedding Client

## Data: 2026-05-24
## Commit: ac73f6b2d

---

## Resumo

Refatoração do sistema de embeddings do Memory Hub para suportar múltiplos providers de LLM (OpenAI, Anthropic, Google) além do Ollama local, conforme especificado na iteração aplicada ao spec.md.

---

## Arquivos Criados

| Arquivo | Propósito |
|---------|-----------|
| `EmbeddingClient.ts` | Classe abstrata base com caching SHA-256 |
| `OpenAIEmbeddingClient.ts` | Cliente OpenAI-compatible (OpenAI, Anthropic, Google) |
| `EmbeddingClientFactory.ts` | Factory para instanciar provider correto via env vars |

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `OllamaEmbeddingClient.ts` | Refatorado para estender `EmbeddingClient` |
| `MemoryHubModule.ts` | Usa `EmbeddingClientFactory.create()` |
| `IndexingService.ts` | Usa `EmbeddingClientFactory.create()` |
| `SearchService.ts` | Aceita `EmbeddingClient` interface |
| `cli/search.ts` | Usa factory |
| `cli/brief.ts` | Usa factory |

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `MEMORY_HUB_EMBEDDING_PROVIDER` | Provider: `ollama`, `openai`, `anthropic`, `google` | `ollama` |
| `MEMORY_HUB_API_KEY` | API key do provider | — |
| `MEMORY_HUB_API_BASE_URL` | URL base customizada (opcional) | Provider default |
| `MEMORY_HUB_EMBEDDING_MODEL` | Modelo de embeddings | Provider default |

## Providers Suportados

| Provider | Modelo Padrão | Base URL |
|----------|--------------|----------|
| Ollama | `nomic-embed-text` | `http://localhost:11434` |
| OpenAI | `text-embedding-3-small` | `https://api.openai.com/v1` |
| Anthropic | `text-embedding-3-small` | `https://api.anthropic.com/v1` |
| Google | `text-embedding-004` | `https://generativelanguage.googleapis.com/v1beta` |

## Validação

- [x] Build local: 0 erros
- [x] Build VPS: 0 erros
- [x] Testes: 622/622 passaram
- [x] Frontend: 200
- [x] API Health: 200
- [x] Memory Hub Health: 200
- [x] Login: 401 (errado) / 200 (correto)
