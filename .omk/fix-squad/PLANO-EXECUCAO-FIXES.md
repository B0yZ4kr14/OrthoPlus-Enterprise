# PLANO-EXECUCAO-FIXES.md
# Plano de Execucao de Correcoes — Baseado em findings-2026-05-15

> Data: 2026-05-15 | Commit Base: cc8e21a0e
> Delacoes: findings-2026-05-15.json + issues conhecidos do projeto

---

## 1. Delacoes Recebidas do Esquadrao Forense

| ID | Dominio | Hipotese Falsificada | Severidade | Causa Raiz | Fix Minimo |
|----|---------|---------------------|------------|------------|------------|
| BE-001 | backend | "Nao ha queryRaw em backend/src/" | HIGH | queryRaw usado em 6+ arquivos | Atualizar AGENTS.md para refletir realidade OU migrar para Prisma Client |
| BE-002 | backend | TS6133 em 5 routers (req nao usado) | LOW | Parametros declarados mas nao lidos | Prefixar com underscore `_req` |
| FE-001 | frontend | TS2322 em ApiProdutoRepository.ts | LOW | Envelope unwrapping com `as any` | Tipar corretamente a resposta da API |
| DEV-001 | devops | Backend container sem healthcheck | MEDIUM | Dockerfile sem HEALTHCHECK | Adicionar HEALTHCHECK ao Dockerfile backend |
| DOC-001 | docs | Commit hash desatualizado | LOW | Docs referenciam commit anterior | Documentar politica de hash (nao fixar por commit de doc) |

---

## 2. Dependencias entre Fixes

```
BE-002 (TS6133) -> independente
FE-001 (TS2322) -> independente
DEV-001 (healthcheck) -> independente
DOC-001 (hash) -> independente
BE-001 (queryRaw) -> depende de decisao arquitetural
```

**Ordem de execucao recomendada:**
1. BE-002, FE-001 (fixes simples de codigo) -> paralelo
2. DEV-001 (Docker) -> sequencial apos build passar
3. BE-001 (queryRaw) -> demanda decisao
4. DOC-001 (docs) -> por ultimo

---

## 3. Analise 5 Whys por Delacao

### BE-001: queryRaw existente

1. **Por que** AGENTS.md diz "zero queryRaw" mas existe no codigo?
   -> A afirmacao foi feita em um momento onde queryRaw foi removido, mas voltou.

2. **Por que** queryRaw voltou ao codigo?
   -> Desenvolvedores usaram queryRaw para queries complexas que Prisma Client nao suporta facilmente.

3. **Por que** nao usaram Prisma Client?
   -> Queries cross-schema, pg_stat_activity, e agregacoes complexas sao dificeis com Prisma Client.

4. **Por que** nao documentaram a excecao?
   -> Falta de processo de atualizacao de docs quando queryRaw e usado.

5. **Por que** falta esse processo?
   -> Nao ha CI que valide "queryRaw count == 0" antes de merge.

**Fix Minimo**: Atualizar AGENTS.md para refletir o estado real + adicionar comentario sobre queryRaw permitido em casos especificos.
**Fix Longo prazo**: Criar CI gate que falha se queryRaw e adicionado sem justificativa.

### BE-002: TS6133 (req nao usado)

1. **Por que** os routers declaram `req` mas nao usam?
   -> Routers stub/API-only que ainda nao foram implementados completamente.

2. **Por que** nao foram implementados?
   -> 20 modulos retornam 404 (stubs intencionais).

3. **Por que** stubs declaram parametros?
   -> Template padrao de router inclui `(req, res)`.

**Fix Minimo**: Renomear `req` para `_req` em arquivos onde nao e usado.

### FE-001: TS2322 em ApiProdutoRepository

1. **Por que** `as any` quebra type safety?
   -> O envelope `{success, data, meta}` nao e tipado corretamente.

2. **Por que** nao foi tipado?
   -> Falta de tipo `ApiResponse<T>` padronizado.

**Fix Minimo**: Usar type guard ou type assertion mais segura.

### DEV-001: Sem healthcheck Docker

1. **Por que** backend nao tem HEALTHCHECK?
   -> Dockerfile nao incluiu a diretiva.

2. **Por que** nao incluiu?
   -> Dockerfile focado em build, nao em runtime monitoring.

**Fix Minimo**: Adicionar `HEALTHCHECK` ao Dockerfile backend com `curl /health`.

---

## 4. Comandos de Execucao

### BE-002: Corrigir TS6133
```bash
# Identificar arquivos
npx tsc --noEmit 2>&1 | grep "TS6133" | grep "req'" | cut -d"'" -f2

# Para cada arquivo, renomear req -> _req
sed -i 's/(req, res)/(_req, res)/g' arquivo.ts
sed -i 's/(req: Request, res: Response)/(_req: Request, res: Response)/g' arquivo.ts
```

### FE-001: Corrigir TS2322
```bash
# Verificar o tipo exato da resposta
cd apps/web && npx tsc --noEmit 2>&1 | grep "ApiProdutoRepository"

# Ajustar o unwrap do envelope
```

### DEV-001: Adicionar HEALTHCHECK
```bash
# Adicionar ao Dockerfile backend
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1
```

### BE-001: Documentar queryRaw
```bash
# Atualizar AGENTS.md para refletir estado real
grep -c "queryRaw" backend/src/  # contar ocorrencias
# Adicionar nota: queryRaw permitido em admin_tools, analytics, inventario, marketing, notifications
```

---

## 5. Critérios de Aceite

- [ ] BE-002: `npx tsc --noEmit` sem TS6133 nos 5 arquivos
- [ ] FE-001: `npx tsc --noEmit` sem TS2322 em ApiProdutoRepository
- [ ] DEV-001: `docker inspect` mostra HEALTHCHECK configurado
- [ ] BE-001: AGENTS.md menciona queryRaw e justifica
- [ ] Todos: Build passa, lint passa, testes passam
