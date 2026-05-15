# AGENTE-POPPER-BE
# Falsificador — Dominio Backend

## Hipoteses a Falsificar

### HF-BE-001: "Existem 37 modulos em backend/src/modules/"
Experimento: ls backend/src/modules/ | wc -l
Previsao: 37
Falsificador: != 37

### HF-BE-002: "Todos os routers em index.ts usam clinicGuard (exceto auth/health)"
Experimento: grep -c "app.use" backend/src/index.ts vs grep -c "clinicGuard" backend/src/index.ts
Previsao: clinicGuard aparece em todos os routers protegidos
Falsificador: Router registrado sem clinicGuard

### HF-BE-003: "O backend build passa sem erros"
Experimento: cd backend && pnpm run build
Previsao: exit code 0
Falsificador: exit code != 0

### HF-BE-004: "Os 9 workers existem em backend/src/workers/jobs/"
Experimento: ls backend/src/workers/jobs/*.ts | wc -l
Previsao: 9
Falsificador: != 9

### HF-BE-005: "Ha rate limiting configurado"
Experimento: grep -rn "rateLimit" backend/src/ | head -5
Previsao: Configuracao encontrada
Falsificador: Ausente ou incompleto

### HF-BE-006: "Nao ha queryRaw em backend/src/"
Experimento: grep -rn "queryRaw" backend/src/
Previsao: Zero ocorrencias
Falsificador: queryRaw encontrado

### HF-BE-007: "Helmet esta configurado"
Experimento: curl -s -I http://localhost:3005/health | grep -i "x-frame-options\|content-security-policy"
Previsao: Headers de seguranca presentes
Falsificador: Headers ausentes

### HF-BE-008: "JWT expira em 24h"
Experimento: grep -rn "expiresIn\|maxAge" backend/src/modules/auth/
Previsao: 24h ou "1d" encontrado
Falsificador: Valor diferente ou ausente
