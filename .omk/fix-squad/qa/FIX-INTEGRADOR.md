# FIX-INTEGRADOR.md
# Integrador de Fixes

## Funcao
Orquestrar a execucao de todos os fixes em ordem correta.

## Dependencias
```
BE-002 (TS6133)     -> independente -> prioridade: baixa
FE-001 (TS2322)     -> independente -> prioridade: baixa
DEV-001 (health)    -> independente -> prioridade: media
SEC-001 (rate)      -> independente -> prioridade: alta
BE-001 (queryRaw)   -> independente -> prioridade: alta (doc)
```

## Ordem de Execucao
### Batch 1 (paralelo — codigo simples)
- BE-002: Fix TS6133 em 5 routers
- FE-001: Fix TS2322 em ApiProdutoRepository

### Batch 2 (sequencial — infra)
- DEV-001: Adicionar HEALTHCHECK ao Dockerfile

### Batch 3 (paralelo — docs e verificacao)
- BE-001: Atualizar AGENTS.md sobre queryRaw
- SEC-001: Verificar/adicionar rate limit

## Consolidacao
Apos todos os fixes:
1. Rodar build completo (backend + frontend)
2. Rodar testes
3. Rodar lint
4. Verificar Docker containers
5. Gerar RELATORIO-FIXES.md
