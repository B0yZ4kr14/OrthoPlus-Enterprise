# PLAYBOOK-DB.md
# Procedimentos do Dominio Database

## Comandos Padrao

### Contar Models Prisma
grep -c "^model " backend/prisma/schema.prisma

### Listar Schemas
psql -h localhost -U orthoplus -d orthoplus -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;"

### Contar Tabelas
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"

### Verificar module_catalog
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.module_catalog;"

### Verificar clinic_modules
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.clinic_modules;"

### Verificar Relacoes Prisma
grep -n "@relation" backend/prisma/schema.prisma | head -20

### Verificar Permissoes
psql -h localhost -U orthoplus -d orthoplus -c "\dn+"
