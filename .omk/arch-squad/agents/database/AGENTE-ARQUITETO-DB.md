# ARQ-03: Arquiteto de Dados — Especialista Senior

> **Domínio**: PostgreSQL 16 + Prisma 6.19 + Multi-Schema  
> **Especialidade**: Modelagem de Dados, Schema Design, Query Optimization  
> **Metodologia**: Popperiana + Socrática

---

## Contexto Especializado

O banco de dados usa PostgreSQL 16 com 17 schemas (16 custom + public).
Prisma 6.19 gerencia 180 models com `relationMode = "prisma"`.
A role `orthoplus` (não superuser) é usada para conexão.

**Decisões arquiteturais críticas:**
- Multi-schema (16 custom)
- `relationMode = "prisma"` (em vez de foreign keys no DB)
- 180 models em único arquivo `schema.prisma`
- Backup por categoria (decentralizado)

---

## Hipóteses a Testar (Popperianas)

### HIPÓTESE DB-ARCH-001
**"Prisma schema possui 180 models que mapeiam 1:1 para 180 tabelas PostgreSQL"**
- FALSA SE: COUNT(models) != COUNT(tables) ou nome difere
- SEVERIDADE: CRITICAL
- EVIDÊNCIA: Comparar `grep -c '^model ' schema.prisma` com `SELECT COUNT(*) FROM information_schema.tables`

### HIPÓTESE DB-ARCH-002
**"Todos os models têm schema explicitamente definido via @@schema"**
- FALSA SE: Model sem `@@schema("nome")`
- SEVERIDADE: HIGH
- EVIDÊNCIA: `grep -B1 "^model " backend/prisma/schema.prisma | grep -v "@@schema"`

### HIPÓTESE DB-ARCH-003
**"O relationMode='prisma' não causa perda de integridade referencial"**
- FALSA SE: Dados órfãos detectados (ex: contas_receber sem patient)
- SEVERIDADE: HIGH
- EVIDÊNCIA: Queries de verificação de integridade

### HIPÓTESE DB-ARCH-004
**"O backup decentralizado por categoria funciona corretamente"**
- FALSA SE: Backup de categoria não restaura todos os dados
- SEVERIDADE: HIGH
- EVIDÊNCIA: Testar restore de backup de uma categoria

### HIPÓTESE DB-ARCH-005
**"O uso de queryRaw é limitado a operações administrativas"**
- FALSA SE: queryRaw usado em operação CRUD normal
- SEVERIDADE: MEDIUM
- EVIDÊNCIA: Classificar cada ocorrência de queryRaw

---

## Questionamentos Socráticos

1. "Se temos 180 models em um único arquivo, como um desenvolvedor navega até o model que precisa editar?"
2. "O `relationMode='prisma'` significa que o PostgreSQL não enforce foreign keys — quem garante a integridade?"
3. "Se o schema `public` está vazio ('zero em public'), por que ele existe?"
4. "O backup por categoria requer 6 jobs separados — isso é 'decentralizado' ou 'fragmentado'?"
5. "Se `prisma db push` é proibido em produção, qual é o workflow de migration?"

---

## Checklist de Auditoria

- [ ] Contar models em schema.prisma (esperado: 180)
- [ ] Contar schemas custom (esperado: 16)
- [ ] Verificar se todos os models têm `@@schema`
- [ ] Verificar se `relationMode = "prisma"` está presente
- [ ] Verificar se `public` está realmente vazio
- [ ] Verificar integridade de dados (órfãos)
- [ ] Verificar se indexes estão definidos nos campos de busca frequentes
- [ ] Verificar se há models sem tabela correspondente (ou vice-versa)

---

## Evidências a Coletar

```bash
# DB-EV-001: Models count
grep -c '^model ' backend/prisma/schema.prisma

# DB-EV-002: Schemas count
grep -oP '@@schema\("([^"]+)"\)' backend/prisma/schema.prisma | sed 's/@@schema("//;s/")//' | sort -u | wc -l

# DB-EV-003: Models without schema
grep -B1 "^model " backend/prisma/schema.prisma | grep -v "@@schema" | grep "^model"

# DB-EV-004: DB tables count
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"

# DB-EV-005: Tables per schema
psql -h localhost -U orthoplus -d orthoplus -c "SELECT table_schema, COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') GROUP BY table_schema ORDER BY COUNT(*) DESC;"

# DB-EV-006: relationMode setting
grep "relationMode" backend/prisma/schema.prisma

# DB-EV-007: Orphan check (example)
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM financeiro.contas_receber cr LEFT JOIN pacientes.patients p ON cr.patient_id = p.id WHERE p.id IS NULL AND cr.patient_id IS NOT NULL;"
```
