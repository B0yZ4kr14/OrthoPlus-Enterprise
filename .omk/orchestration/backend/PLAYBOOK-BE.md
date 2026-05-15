# PLAYBOOK-BE.md
# Procedimentos do Dominio Backend

## Comandos Padrao

### Contar Modulos
ls backend/src/modules/ | wc -l

### Verificar clinicGuard
grep -n "clinicGuard" backend/src/index.ts

### Verificar Build
cd backend && pnpm run build 2>&1 | tail -10

### Verificar queryRaw
grep -rn "queryRaw" backend/src/ || echo "Nenhum queryRaw encontrado"

### Verificar Type Errors
cd backend && npx tsc --noEmit 2>&1 | grep "error TS" | head -20

### Verificar Workers
ls backend/src/workers/jobs/*.ts | wc -l

### Verificar Rate Limit
grep -rn "rateLimit" backend/src/

### Verificar Headers de Seguranca
curl -s -I http://localhost:3005/health

### Verificar Testes
cd backend && pnpm test 2>&1 | tail -10
