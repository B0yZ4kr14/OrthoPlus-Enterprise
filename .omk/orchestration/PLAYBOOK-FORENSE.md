# PLAYBOOK-FORENSE.md
# Revisao Forense — Cadeia de Custodia de Evidencias

---

## 1. Objetivo

Garantir que toda evidencia seja:
- REPRODUTIVEL: qualquer pessoa pode executar o mesmo comando e obter o mesmo resultado
- RASTREAVEL: sabe-se exatamente quando, onde, e como foi coletada
- INTEGRA: nao foi alterada desde a coleta
- ADMISSIVEL: pode ser usada para tomar decisoes

## 2. Chain of Custody

### Formato de Evidencia

```
EVIDENCIA-ID: [DOMINIO]-[NUMERO]-[TIMESTAMP]
ORIGEM: [arquivo, linha, comando]
COLETOR: [nome do agente]
TIMESTAMP: [ISO 8601]
COMANDO: [comando exato executado]
OUTPUT: [output completo]
HASH: [hash do output para integridade]
INTERPRETACAO: [o que o output significa]
```

### Exemplo

```
EVIDENCIA-ID: BE-001-2026-05-15T20:15:00Z
ORIGEM: backend/src/index.ts, linha 45
COLETOR: AGENTE-POPPER-BE
TIMESTAMP: 2026-05-15T20:15:00Z
COMANDO: grep -rn "clinicGuard" backend/src/modules/*/api/router.ts | wc -l
OUTPUT:
  45: app.use(clinicGuard);
  67: app.use(clinicGuard);
  89: // clinicGuard removido para teste
HASH: sha256:a1b2c3d4...
INTERPRETACAO: clinicGuard esta presente nas linhas 45 e 67,
  mas comentado na linha 89 (potencial falsificacao).
```

## 3. Ferramentas Forenses

### 3.1 Codigo-Fonte
- grep / ripgrep: busca de padroes
- wc: contagem de linhas/arquivos
- find: localizacao de arquivos
- git log/blame: historico de alteracoes
- diff: comparacao de versoes

### 3.2 HTTP/API
- curl: requisicoes HTTP com headers
- httpie: alternativa amigavel
- jq: parsing de JSON

### 3.3 Banco de Dados
- psql: queries PostgreSQL
- prisma studio: visualizacao (quando disponivel)
- pg_dump: backup para analise

### 3.4 Docker
- docker ps: containers em execucao
- docker inspect: configuracao detalhada
- docker logs: logs de container
- docker exec: execucao dentro do container

### 3.5 TypeScript/Build
- npx tsc --noEmit: type checking
- pnpm build: build completo
- eslint: linting

## 4. Procedimentos de Coleta

### 4.1 Coleta de Evidencia de Codigo

```bash
# 1. Identificar arquivo e linha
grep -rn "PADRAO" backend/src/

# 2. Capturar contexto
grep -n -B2 -A2 "PADRAO" arquivo.ts

# 3. Verificar ultima alteracao
git log -1 --format="%h %an %ad %s" -- arquivo.ts

# 4. Verificar se ha testes
find . -name "*.test.ts" -o -name "*.spec.ts" | xargs grep -l "PADRAO"
```

### 4.2 Coleta de Evidencia de API

```bash
# 1. Headers de seguranca
curl -s -I http://localhost:3005/health

# 2. Body de resposta
curl -s http://localhost:3005/health | jq .

# 3. Teste de autenticacao
curl -s -X POST http://localhost:3005/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 4. Teste de autorizacao (sem token)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/api/pacientes
```

### 4.3 Coleta de Evidencia de Banco

```bash
# 1. Contar tabelas
psql -h localhost -U orthoplus -d orthoplus -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"

# 2. Listar schemas
psql -h localhost -U orthoplus -d orthoplus -c \
  "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');"

# 3. Verificar relacao
psql -h localhost -U orthoplus -d orthoplus -c \
  "SELECT * FROM configuracoes.module_catalog LIMIT 5;"
```

## 5. Preservacao de Evidencia

Toda evidencia deve ser:
1. Salva em arquivo com timestamp
2. Hash SHA-256 calculado
3. Referenciada no relatorio final
4. Armazenada em .omk/orchestration/evidencias/

```bash
mkdir -p .omk/orchestration/evidencias/$(date +%Y-%m-%d)
comando > .omk/orchestration/evidencias/2026-05-15/BE-001.txt
sha256sum .omk/orchestration/evidencias/2026-05-15/BE-001.txt
```

## 6. Checklist de Execucao

- [ ] Criar diretorio de evidencias
- [ ] Para cada hipotese, coletar evidencia com comando reprodutivel
- [ ] Documentar evidencia no formato padrao
- [ ] Calcular hash de integridade
- [ ] Referenciar evidencia no relatorio
- [ ] Garantir que evidencias sao acessiveis para re-verificacao
