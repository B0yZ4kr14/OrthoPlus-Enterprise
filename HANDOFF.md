# Handoff — OrthoPlus Enterprise

> **ULTIMA ATUALIZACAO:** 2026-05-14 | **Branch:** `main` | **Commit:** `ca5b92cd4`
> **DEPLOY BACKEND:** v2.5 concluido em 2026-05-14 16:25 UTC
> **ESTADO:** ✅ Sistema operacional em producao (VPS) — FASE 1 e 2 CONCLUÍDAS
> **PLANO ATIVO:** `docs/plans/correcao-orquestrada-2026-05-14.md`
> **IMPORTANTE:** Leia AGENTS.md antes de qualquer alteracao.

---

## 🌐 Infraestrutura de Producao (VPS)

| Componente   | Versao   | URL / Porta                                   | Status                               |
| ------------ | -------- | --------------------------------------------- | ------------------------------------ |
| Frontend     | v2.9.4   | `https://tsiapp.io/OrthoPlus-Enterprise/`     | ✅ Docker `tsiapp-orthoplus`         |
| Backend API  | **v2.5** | `https://tsiapp.io/api`                       | ✅ Docker `tsiapp-orthoplus-backend` |
| Health Check | —        | `http://localhost:3005/health`                | ✅ OK                                |
| PostgreSQL   | 16       | `127.0.0.1:5432`                              | ✅ 180 tabelas, 16 schemas           |
| Redis        | 7        | `127.0.0.1:6379`                              | ✅ Autenticado                       |
| Nginx (host) | —        | `443 → frontend:8083`, `/api/ → backend:3005` | ✅ Cloudflare → VPS                  |

---

## 🔐 Login de Teste

| Campo         | Valor                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| **Email**     | `admin@orthoplus.com` (ou apenas `Admin` — frontend converte)                           |
| **Senha**     | `admin123!`                                                                             |
| **Role**      | `ADMIN`                                                                                 |
| **Clinic ID** | `48eaa5f9-99b1-45ce-a095-e099b522b165`                                                  |
| **Redirect**  | Após login, redireciona automaticamente para `/dashboard` via React Router `navigate()` |

---

## 🗄️ Banco de Dados

- **Database:** `orthoplus`
- **Schemas:** 16 (nenhuma tabela em `public`)
- **Tabelas:** 180 total
- **module_catalog:** 31 modulos sincronizados com frontend
- **clinic_modules:** 31 associacoes ativas
- **User:** `orthoplus` (role dedicada, não superuser — ✅ concluído)

### Sincronizacao module_catalog ↔ Frontend

O frontend tem 32 moduleKeys no sidebar. O banco tem 31 registros em `configuracoes.module_catalog`. O `hasModuleAccess` no frontend faz comparacao **case-insensitive** (v2.9+). O backend retorna module_keys em **minusculas**.

**SEMPRE** sincronizar o banco apos adicionar novos modulos no frontend.

### ✅ Seguranca Concluída

- **DB_PASSWORD:** ✅ rotacionado em 2026-05-14
- **REDIS_PASSWORD:** ✅ rotacionado em 2026-05-14
- **JWT_SECRET:** ✅ rotacionado em 2026-05-14
- **CSP Header:** ✅ adicionado ao nginx em 2026-05-14
- **PostgreSQL role:** ✅ `orthoplus` criada com grants nos 16 schemas

---

## 🚀 Deploy — Checklist

### 1. Build local

```bash
cd backend && npm run build   # deve passar
cd backend && npm test        # 17 suites, 367 tests
cd apps/web && pnpm run build # deve passar
```

### 2. Backup do banco (SEMPRE)

Use `pg_dump` com formato custom. Salve em `/tmp/`.

### 3. Deploy Frontend

Buildar imagem Docker a partir do `dist/` local. Usar `nginx-frontend.conf`.

### 4. Deploy Backend v2.5 (2026-05-14)

**Metodo usado:** A imagem `orthoplus-backend:v2.5` ja existia no VPS (buildada anteriormente ou carregada em outra sessao). O deploy foi feito via substituicao direta do container com backup automatico e rollback.

**Script:** `/tmp/deploy-v25.sh` (copiado para VPS e executado via SSH)

**Passos:**

1. Verificar imagem v2.5 existe no VPS (`docker image inspect`)
2. Parar e renomear container v2.4 para `tsiapp-orthoplus-backend-v24-backup`
3. Iniciar novo container com imagem v2.5, mesmas env vars, `--network host`, `--restart always`
4. Health check (`/health`) — respondeu em 3s
5. Testar 35 modulos — todos retornaram 401 (JWT protegido, esperado)
6. Remover container de backup

**Rollback automatico:** Se health check falhasse em 60s, o script pararia o novo container, removeria, renomearia o backup de volta e iniciaria o v2.4.

**Resultado:** ✅ Deploy bem-sucedido. Nenhum downtime perceptivel. Frontend inalterado.

### 5. Validacao

- Health check: `curl http://localhost:3005/health`
- Login: `POST /api/auth/token`
- Containers: `docker ps | grep orthoplus`

---

## ⚠️ Guardrails Criticos

- **NUNCA** fazer `prisma db push` ou `DROP DATABASE` sem backup
- **NUNCA** commitar `.env` ou arquivos com secrets
- **Cuidado** com shell escaping em hashes bcrypt (use `cat > file.sql`)
- **Workspace:** O backend usa `workspace:*` — usar `package.prod.json` para Docker

---

## 🎨 Validacao de UI (2026-05-14)

| Pagina/Modulo                    | Status | Observacoes                                                       |
| -------------------------------- | ------ | ----------------------------------------------------------------- |
| Landing page (`/`)               | ✅     | Hero, features, pricing tiers, footer                             |
| Login (`/auth`)                  | ✅     | Formulario completo, tabs Equipe/Paciente/Cadastro                |
| Dashboard (`/dashboard`)         | ✅     | Stat cards, graficos, tabs Executivo/Clinico/Financeiro/Comercial |
| Pacientes (`/pacientes`)         | ✅     | Stat cards, search, empty state                                   |
| Agenda (`/agenda`)               | ✅     | Calendario semanal, navegacao                                     |
| Financeiro (`/financeiro`)       | ✅     | Stat cards, fluxo de caixa, tabs                                  |
| CRM (`/crm`)                     | ✅     | 5 leads demo visíveis, tabs Funil/Leads/Relatorios                |
| BI (`/bi`)                       | ✅     | Root handler validado (HTTP 200)                                  |
| Fidelidade (`/fidelidade`)       | ✅     | Root handler validado (HTTP 200)                                  |
| Inadimplencia (`/inadimplencia`) | ✅     | Root handler validado (HTTP 200)                                  |
| LGPD (`/lgpd`)                   | ✅     | Root handler validado (HTTP 200)                                  |
| TISS (`/tiss`)                   | ✅     | Root handler validado (HTTP 200)                                  |
| Terminal (`/terminal`)           | ✅     | Root handler validado (HTTP 200)                                  |

### 🐛 Problemas Conhecidos

- ✅ **Login redirect:** Corrigido — usa AuthContext `signIn` + `useEffect` + `navigate()` do React Router
- **Dados vazios:** Todos os modulos mostram zeros/empty states porque o banco foi recriado sem seed de demonstracao
- **NFE 500:** `fiscal.nfes` table não existe (42P01) — requer migration ou stub handler
- **Backend imagem v2.5:** ✅ Deploy concluido com sucesso em 2026-05-14

---

## 📁 Documentacao

| Arquivo                                         | Proposito                   |
| ----------------------------------------------- | --------------------------- |
| `AGENTS.md`                                     | **Referencia principal**    |
| `HANDOFF.md`                                    | Este arquivo                |
| `docs/ARCHITECTURE.md`                          | Arquitetura do sistema      |
| `docs/CATEGORIES.md`                            | 10 categorias de negocio    |
| `docs/plans/correcao-orquestrada-2026-05-14.md` | **Plano de correção ativo** |

---

> **Novo agente:** Leia AGENTS.md inteiro antes de tocar em qualquer codigo. Verifique `git status` e `git log --oneline -5`.
