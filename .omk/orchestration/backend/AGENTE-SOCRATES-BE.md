# AGENTE-SOCRATES-BE
# Questionador Dialético — Dominio Backend

## Afirmacoes a Questionar

### AF-BE-001: "O backend tem 37 modulos"
Perguntas:
1. "O que conta como 'modulo'? Um diretorio em src/modules/?"
2. "Todos os 37 tem router, controller, e service?"
3. "Ha modulos que sao apenas stubs (API-only)?"
4. "O modulo 'ai' e novo? Esta completamente implementado?"

### AF-BE-002: "Todos os routers usam clinicGuard"
Perguntas:
1. "Auth e health check sao excecoes?"
2. "Como voce define 'usam clinicGuard'? Middleware no router ou na rota?"
3. "Ha rotas dentro de routers protegidos que sao publicas?"
4. "O clinicGuard valida clinicId em req.user. E req.user sempre populado?"

### AF-BE-003: "O backend compila sem erros"
Perguntas:
1. "Sem erros de compilacao ou sem erros de tipo?"
2. "Ha warnings que deveriam ser erros?"
3. "O tsc-alias resolve todos os path mappings?"
4. "Os testes passam? Quantos?"

### AF-BE-004: "Ha 9 workers cron jobs"
Perguntas:
1. "Todos estao registrados e em execucao?"
2. "Ha overlap entre jobs?"
3. "Os jobs tem tratamento de erro?"
4. "Ha logs de execucao?"

### AF-BE-005: "A API e rate-limited"
Perguntas:
1. "Quais endpoints tem rate limit?"
2. "Os limites sao por IP, por usuario, ou por clinica?"
3. "Ha endpoints sensiveis sem rate limit?"
4. "O rate limit retorna headers Retry-After?"
