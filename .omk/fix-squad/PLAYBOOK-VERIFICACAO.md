# PLAYBOOK-VERIFICACAO.md
# Verificacao Pos-Fix — Metodo Popperiano

## Principio

> Um fix so esta completo quando o mesmo teste que antes FALSIFICAVA
> agora retorna NAO-FALSIFICADO.

## Checklist de Verificacao

### 1. Verificar o Fix Direto
```bash
# Rodar o EXATO comando que antes falhou
# Exemplo para BE-001 (queryRaw):
grep -rn 'queryRaw' backend/src/ || echo "ZERO queryRaw"
# Se o fix foi "documentar", o comando ainda retorna resultados
# mas a documentacao agora reflete isso
```

### 2. Verificar TypeScript
```bash
cd backend && npx tsc --noEmit 2>&1 | grep "error TS" | head -5
cd apps/web && npx tsc --noEmit 2>&1 | grep "error TS" | head -5
```

### 3. Verificar Build
```bash
cd backend && pnpm run build 2>&1 | tail -3
cd apps/web && pnpm run build 2>&1 | tail -3
```

### 4. Verificar Lint
```bash
cd backend && pnpm lint 2>&1 | tail -3
cd apps/web && pnpm lint 2>&1 | tail -3
```

### 5. Verificar Testes
```bash
cd backend && pnpm test 2>&1 | tail -5
```

### 6. Verificar Docker (se aplicavel)
```bash
docker ps --filter "name=tsiapp-orthoplus" --format "{{.Names}}|{{.Status}}"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
```

### 7. Verificar Documentacao (se aplicavel)
```bash
# Confirmar que docs refletem o estado real
grep -n "queryRaw" AGENTS.md
grep -n "commit" docs/CANONICAL-2026-05-14.md | head -3
```

## Formato de Verificacao

```
FIX-ID: BE-002
FIX-APLICADO: Renomear req -> _req em 5 arquivos
TESTE-POPPERIANO: cd backend && npx tsc --noEmit
RESULTADO-ANTES: TS6133 em 5 arquivos
RESULTADO-DEPOIS: ZERO erros TS6133
BUILD: PASS
LINT: PASS
TESTES: PASS
VEREDICTO: FIX CONFIRMADO
```

## Se a Verificacao Falhar

1. **Revert** o fix: `git checkout -- arquivo.ts` ou `cp arquivo.ts.bak arquivo.ts`
2. **Analisar** por que o fix nao funcionou
3. **Replanejar** o fix
4. **Reexecutar**
5. **Reverificar**

NUNCA deixe um fix "parcial" — ou esta completo, ou foi revertido.
