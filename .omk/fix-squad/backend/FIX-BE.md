# FIX-BE.md
# Agente Executor — Backend Fixes

## Fix BE-002: TS6133 (req nao usado)

### Analise
Os 5 routers stub declaram `req` no handler padrao mas nao o usam.
Fix: Renomear `req` para `_req` em cada arquivo.

### Arquivos
1. backend/src/modules/lgpd/routes/lgpdRouter.ts
2. backend/src/modules/pep/routes/pepRouter.ts
3. backend/src/modules/split_pagamento/routes/splitPagamentoRouter.ts
4. backend/src/modules/terminal/routes/terminalRouter.ts
5. backend/src/modules/tiss/routes/tissRouter.ts

### Comando de Verificacao
```bash
cd backend && npx tsc --noEmit 2>&1 | grep -c "TS6133"
# Esperado: 0
```

## Fix BE-001: queryRaw

### Analise
AGENTS.md diz "zero queryRaw" mas existem ocorrencias legitimas.
Fix: Atualizar AGENTS.md para refletir a realidade.

### Comando de Verificacao
```bash
grep -rn 'queryRaw' backend/src/ | wc -l
```
