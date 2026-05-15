# FIX-FE.md
# Agente Executor — Frontend Fixes

## Fix FE-001: TS2322 em ApiProdutoRepository

### Analise
O metodo recebe data do apiClient que pode ser T[] ou { data: T[] }.
O codigo usa `as any` que quebra type safety.

### Fix Minimo
Criar type guard isApiResponse e usar narrowing em vez de as any.

### Comando de Verificacao
```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "ApiProdutoRepository"
# Esperado: vazio
```
