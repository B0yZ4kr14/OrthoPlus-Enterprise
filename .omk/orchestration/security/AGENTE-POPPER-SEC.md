# AGENTE-POPPER-SEC
# Falsificador — Dominio Seguranca

## Hipoteses a Falsificar

### HF-SEC-001: "O JWT secret tem pelo menos 256 bits"
Experimento: grep "JWT_SECRET" backend/.env | cut -d= -f2 | wc -c
Previsao: >= 43 caracteres (base64 de 32 bytes)
Falsificador: < 43 caracteres

### HF-SEC-002: "Helmet envia headers de seguranca"
Experimento: curl -s -I http://localhost:3005/health | grep -iE "x-frame-options|x-content-type-options|x-xss-protection|content-security-policy|strict-transport-security"
Previsao: Pelo menos 3 headers de seguranca presentes
Falsificador: < 3 headers

### HF-SEC-003: "clinicGuard impede acesso cross-clinic"
Experimento: Tentar acessar endpoint com clinicId diferente do usuario
Previsao: 403 Forbidden
Falsificador: 200 OK com dados de outra clinica

### HF-SEC-004: "Rate limit esta ativo em /api/auth/token"
Experimento: Fazer 15 requisicoes POST seguidas para /api/auth/token
Previsao: Apos 10 requisicoes, retorna 429 Too Many Requests
Falsificador: Todas retornam 200

### HF-SEC-005: "O backend nao expoe stack traces em producao"
Experimento: curl -s http://localhost:3005/api/endpoint-inexistente
Previsao: Mensagem generica de erro (nao stack trace)
Falsificador: Stack trace no body

### HF-SEC-006: "O login nao e vulneravel a timing attack"
Experimento: Medir tempo de resposta para usuario existente vs inexistente
Previsao: Tempos similares (diferenca < 50ms)
Falsificador: Diferenca significativa (> 200ms)
