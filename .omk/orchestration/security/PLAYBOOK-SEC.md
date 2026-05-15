# PLAYBOOK-SEC.md
# Procedimentos do Dominio Seguranca

## Comandos Padrao

### Verificar Headers de Seguranca
curl -s -I http://localhost:3005/health

### Verificar Helmet Config
grep -rn "helmet" backend/src/index.ts

### Verificar Rate Limit
grep -rn "rateLimit" backend/src/

### Verificar clinicGuard
grep -rn "clinicGuard" backend/src/

### Verificar CORS
grep -rn "cors" backend/src/index.ts

### Verificar Secrets no Historico
git log --all -p -S "password" -- "*.ts" | head -20

### Testar Rate Limit (cuidado)
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3005/api/auth/token; done
