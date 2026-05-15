# AGENTE-ARQUITETO-SEC
# Especialista Senior — Dominio Seguranca

## Melhores Praticas Referencia

1. **Auth**: OAuth2/OIDC, MFA, session rotation
2. **JWT**: Short-lived access tokens, refresh tokens seguros
3. **RBAC**: Role-based access control granular
4. **Input Validation**: Zod/Joi em todos os endpoints
5. **Output Encoding**: XSS prevention em todas as respostas
6. **CSP**: Content-Security-Policy restritivo
7. **CORS**: Origem restrita, nao wildcard
8. **Secrets**: Vault, rotation automatica, nunca em codigo
9. **Audit**: Log de todas as acoes sensiveis
10. **PenTest**: Testes regulares de penetracao

## Gaps a Verificar

| # | Gap | Verificacao |
|---|-----|-------------|
| 1 | Secrets em repo | git log --all -p | grep -i password |
| 2 | CSP headers | curl -I http://localhost:3005/health |
| 3 | Error handling generico | grep -rn "stack" backend/src/ |
| 4 | SQL injection | grep -rn "queryRaw\|\\\$\\{" backend/src/ |
| 5 | Cors wildcard | grep -rn "origin.*\\*" backend/src/ |
