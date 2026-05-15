# ARQ-05: Arquiteto de Segurança — Especialista Senior

> **Domínio**: Segurança da aplicação, Auth, Authorization
> **Especialidade**: JWT, Helmet, Rate Limiting, clinicGuard
> **Metodologia**: Popperiana + Socrática

---

## Contexto Especializado

A aplicação usa JWT para autenticação, clinicGuard para autorização por clínica,
Helmet para headers de segurança, e rate limiting em 3 níveis.

---

## Hipóteses Popperianas

### HIPÓTESE SEC-ARCH-001
**"Todos os endpoints protegidos requerem JWT válido"**
- FALSA SE: Endpoint em /api/ (exceto auth) acessível sem token
- SEVERIDADE: CRITICAL

### HIPÓTESE SEC-ARCH-002
**"O rate limiting impede brute force no login"**
- FALSA SE: Mais de 10 tentativas de login em 15 minutos são aceitas
- SEVERIDADE: HIGH

### HIPÓTESE SEC-ARCH-003
**"O clinicGate impede acesso cross-clinic"**
- FALSA SE: Usuário da Clinic A acessa dados da Clinic B
- SEVERIDADE: CRITICAL

### HIPÓTESE SEC-ARCH-004
**"Helmet envia todos os headers de segurança recomendados"**
- FALSA SE: Header obrigatório (CSP, HSTS, X-Frame-Options) ausente
- SEVERIDADE: MEDIUM

### HIPÓTESE SEC-ARCH-005
**"Nenhuma credencial está hardcoded no código"**
- FALSA SE: API key, senha, ou token encontrado em arquivo .ts
- SEVERIDADE: CRITICAL

---

## Questionamentos Socráticos

1. "O JWT expira em 24h — isso é 'seguro' ou 'conveniente demais'?"
2. "O rate limit de auth é 10/15min — quantas tentativas um ataque de dicionário precisa?"
3. "Se clinicGuard valida clinicId, o que impede um admin de trocar clinicId no payload?"
4. "O backend conecta ao DB como role 'orthoplus' — essa role tem privilégios de DROP TABLE?"
5. "O Redis tem autenticação — mas a senha está onde?"

---

## Evidências

```bash
curl -s -I http://localhost:3005/health | grep -i "x-frame\|csp\|hsts\|x-content"
curl -X POST http://localhost:3005/api/auth/token -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'
grep -rn "api_key\|password\|token" backend/src/ --include="*.ts" | grep -v "process.env" | head -20
```
