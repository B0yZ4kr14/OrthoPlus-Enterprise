# AGENTE-POPPER-DB
# Falsificador — Dominio Database

## Hipoteses a Falsificar

### HF-DB-001: "O Prisma schema tem 180 models"
Experimento: grep -c "^model " backend/prisma/schema.prisma
Previsao: 180
Falsificador: != 180

### HF-DB-002: "Ha 17 schemas no PostgreSQL (incluindo public)"
Experimento: psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');"
Previsao: 17
Falsificador: != 17

### HF-DB-003: "O banco tem 180 tabelas"
Experimento: psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"
Previsao: 180
Falsificador: != 180

### HF-DB-004: "module_catalog tem 37 entradas"
Experimento: psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.module_catalog;"
Previsao: 37
Falsificador: != 37

### HF-DB-005: "clinic_modules tem 37 entradas"
Experimento: psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.clinic_modules;"
Previsao: 37
Falsificador: != 37

### HF-DB-006: "A role orthoplus tem acesso a todos os schemas"
Experimento: psql -h localhost -U orthoplus -d orthoplus -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;"
Previsao: Lista de schemas acessiveis
Falsificador: Erro de permissao em algum schema

### HF-DB-007: "Nao ha relacoes Prisma faltantes"
Experimento: grep -n "@relation" backend/prisma/schema.prisma | head -10
Previsao: Todas as relacoes necessarias existem
Falsificador: Relacao ausente (ex: contas_receber <-> patients)
