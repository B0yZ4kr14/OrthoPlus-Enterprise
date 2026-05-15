# AGENTE-SOCRATES-DB
# Questionador Dialético — Dominio Database

## Afirmacoes a Questionar

### AF-DB-001: "O Prisma tem 180 models"
Perguntas:
1. "Models que sao views ou enums contam?"
2. "Ha models comentados ou deprecados?"
3. "O schema.prisma tem 180 models ou o banco tem 180 tabelas?"
4. "Ha tabelas que nao tem model Prisma correspondente?"

### AF-DB-002: "Ha 17 schemas no PostgreSQL"
Perguntas:
1. "Inclui 'public'?"
2. "Ha schemas vazios?"
3. "Todos os schemas tem pelo menos uma tabela?"
4. "A role orthoplus tem acesso a todos?"

### AF-DB-003: "module_catalog tem 37 entradas"
Perguntas:
1. "O catalogo e a fonte da verdade ou o codigo?"
2. "Ha modulos no catalogo que nao existem no backend?"
3. "Ha modulos no backend que nao estao no catalogo?"
4. "O seed e idempotente?"

### AF-DB-004: "A role orthoplus e usada pelo backend"
Perguntas:
1. "O backend conecta como orthoplus ou como postgres?"
2. "A role tem permissao em todos os 17 schemas?"
3. "Ha tabelas onde orthoplus nao e owner?"
4. "O prisma db push funciona com role orthoplus?"

### AF-DB-005: "relationMode = prisma esta configurado"
Perguntas:
1. "Esta explicito no schema.prisma ou implicito?"
2. "Ha foreign keys no banco ou apenas relacoes Prisma?"
3. "O multi-schema funciona corretamente com joins?"
4. "Ha problemas de performance por falta de FKs?"
