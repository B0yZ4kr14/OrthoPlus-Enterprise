# AGENTE-SOCRATES-SEC
# Questionador Dialético — Dominio Seguranca

## Afirmacoes a Questionar

### AF-SEC-001: "A autenticacao usa JWT com 256-bit secret"
Perguntas:
1. "Onde esta o secret? Em .env?"
2. "Qual o comprimento real do secret em caracteres?"
3. "O secret e rotacionado periodicamente?"
4. "Ha log de tokens invalidos?"

### AF-SEC-002: "clinicGuard valida clinicId em todas as rotas protegidas"
Perguntas:
1. "O que acontece se req.user nao tiver clinicId?"
2. "Ha validacao de que clinicId existe no banco?"
3. "Um usuario pode acessar dados de outra clinica?"
4. "Ha testes que simulam clinic hopping?"

### AF-SEC-003: "Rate limiting protege a API"
Perguntas:
1. "Qual e o limite por endpoint?"
2. "O rate limit e por IP ou por usuario?"
3. "Um atacante pode bypassar com IP spoofing?"
4. "Ha rate limit no nginx tambem?"

### AF-SEC-004: "Helmet protege contra ataques comuns"
Perguntas:
1. "Quais headers o Helmet esta configurado para enviar?"
2. "O CSP esta configurado?"
3. "Ha HSTS?"
4. "O X-Powered-By esta removido?"

### AF-SEC-005: "CSRF esta protegido"
Perguntas:
1. "O sameSite=strict funciona para todas as cookies?"
2. "Ha origin check?"
3. "O frontend envia token CSRF?"
4. "Ha endpoints state-changing que nao verificam CSRF?"
