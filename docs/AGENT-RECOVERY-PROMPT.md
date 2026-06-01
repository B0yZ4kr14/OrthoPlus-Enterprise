# ORTHOPLUS ENTERPRISE — AGENT RECOVERY PROMPT v2.0.0
## Método Socrático-Popperiano de Documentação e Recuperação de Memória

> **Versão:** 2.0.0
> **Data:** 2026-06-01
> **Método:** Socrático (elenchus) + Popperiano (falsificabilidade)
> **Documentação Canônica:** `vault:tsi-vault/orthoplus/canonical/OrthoPlus-Enterprise-Canonical-2026-05-15.md`
> **Checkpoint:** `vault:tsi-vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-15.md`
> **Estado OMK:** `.omk/memory/state-2026-05-15.json`
> **Commit Referência:** `3faa759a0`

---

## PRINCÍPIO FUNDAMENTAL (POPPER)

> **"Toda documentação é uma conjectura até ser falsificada pelo sistema real."**

**REGRA DE OURO:** NUNCA confie cegamente na documentação. SEMPRE verifique o sistema real.

---

## FASE 0: ESTADO ATUAL DO PROJETO (Resumo Executivo)

O projeto foi **validado forensemente em 3 rodadas** com **zero discrepâncias** no estado final.

| Sistema | Estado | Commit/Versão |
|---------|--------|--------------|
| **Local** | ✅ Sincronizado | `3faa759a0` |
| **GitHub** | ✅ Sincronizado | `3faa759a0` |
| **VPS** | ⚠️ Nginx fix pendente deploy | Frontend `v2.9.9` / Backend `v2.5.4` |
| **TSi-Vault** | ✅ Atualizado | Canonical 2026-05-15 |
| **OMK Memory** | ✅ Atualizada | `state-2026-05-15.json` |

**Infraestrutura Local:**
- `tsiapp-orthoplus` → `orthoplus-frontend:v2.9.9` → porta 8083 → **healthy**
- `tsiapp-orthoplus-backend` → `orthoplus-backend:v2.5.4` → porta 3005 → **running**
- `orthoplus-redis` → `redis:7-alpine` → porta 6379 → **running**
- PostgreSQL → `localhost:5432` → `orthoplus` database → 196 models, 18 schemas

**Login:** `admin@orthoplus.com` / `admin123!`

---

## FASE 1: RECUPERAÇÃO DE MEMÓRIA (Obrigatória)

### 1.1 Leitura Obrigatória (Sequencial)

ANTES de qualquer ação, leia NA ORDEM:

1. **Estado OMK:** `.omk/memory/state-2026-05-15.json`
2. **Checkpoint:** `vault:tsi-vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-15.md`
3. **Documentação Canônica:** `vault:tsi-vault/orthoplus/canonical/OrthoPlus-Enterprise-Canonical-2026-05-15.md`
4. **AGENTS.md local:** `~/Projects/OrthoPlus-Enterprise/AGENTS.md`

### 1.2 Diálogo Socrático

Após ler, responda:

1. *"O que você LEU?"* — Resuma em 3 parágrafos.
2. *"O que você NÃO ENTENDEU?"* — Liste ambiguidades.
3. *"O que parece CONTRADITÓRIO?"* — Doc vs. doc.
4. *"O que é INVEROSSÍMIL?"* — Afirmações desatualizadas.

**Se não consegue responder, RELEIA.**

---

## FASE 2: FALSIFICAÇÃO POPPERIANA (Obrigatória)

| Afirmação da Doc | Teste de Falsificação | Comando |
|---|---|---|
| "Backend v2.5.3 rodando" | `docker ps` + `curl /health` | `docker ps \| grep backend && curl -s http://localhost:3005/health` |
| "Frontend v2.9.9 rodando" | `docker ps` + acesso HTTP | `docker ps \| grep frontend && curl -sI http://localhost:8083/` |
| "741 testes passando" | Rodar testes | `cd backend && pnpm test` |
| "180 tabelas" | Verificar banco | `psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"` |
| "17 schemas" | Verificar banco | `psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');"` |
| "Login funcional" | Testar auth | `curl -X POST http://localhost:3005/api/auth/token -d '{"email":"admin@orthoplus.com","password":"admin123!"}'` |
| "Commit 3faa759a0" | Verificar git | `git rev-parse --short HEAD` |

### 2.2 Checklist de Recuperação Rápida

```bash
# 1. Git
cd ~/Projects/OrthoPlus-Enterprise && git log --oneline -3 && git status

# 2. Docker
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep orthoplus

# 3. Health
curl -s http://localhost:3005/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/

# 4. Banco
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.module_catalog;"
psql -h localhost -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM configuracoes.clinic_modules;"

# 5. Testes e Builds
cd backend && pnpm test && pnpm build
cd apps/web && pnpm build
```

---

## FASE 3: DECISÃO ARQUITETURAL

- **A (Tudo OK):** Prossiga com a tarefa.
- **B (Discrepâncias menores):** Corrija docs ANTES de prosseguir.
- **C (Discrepâncias maiores):** PARE. Informe o usuário.

---

## FASE 4: ATUALIZAÇÃO DOCUMENTAL (Se necessário)

1. Atualizar `docs/CANONICAL-2026-05-14.md`
2. Atualizar `AGENTS.md`
3. Copiar para `vault:tsi-vault/orthoplus/canonical/`
4. Criar checkpoint em `vault:tsi-vault/orthoplus/checkpoints/`
5. Atualizar `.omk/memory/state-YYYY-MM-DD.json`
6. Commit e push

---

## FASE 5: HANDOFF

Crie checkpoint em `vault:tsi-vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-YYYY-MM-DD.md`

---

## ANEXO: Referências Rápidas

| Recurso | Caminho |
|---------|---------|
| Repo local | `~/Projects/OrthoPlus-Enterprise` |
| GitHub | `https://github.com/B0yZ4kr14/OrthoPlus-Enterprise` |
| VPS | `root@100.111.74.69` |
| VPS URL | `https://tsiapp.io/OrthoPlus-Enterprise/` |
| TSi-Vault | `~/Projects/TSi-Vault/orthoplus/` |
| OMK Memory | `.omk/memory/` |
| Login | `admin@orthoplus.com` / `admin123!` |

---

> **NOTA FINAL:** Este prompt foi validado forensemente em 3 rodadas (2026-05-15) com **zero discrepâncias**. A fonte de verdade unificada é o commit `12862627e`.
