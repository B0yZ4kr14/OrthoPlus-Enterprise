# Handoff — OrthoPlus Enterprise

> **ULTIMA ATUALIZACAO:** 2026-05-14 | **Branch:** `main`
> **ESTADO:** ✅ Sistema operacional em producao (VPS)
> **IMPORTANTE:** Leia AGENTS.md antes de qualquer alteracao.

---

## 🌐 Infraestrutura de Producao (VPS)

| Componente | Versao | URL / Porta | Status |
|------------|--------|-------------|--------|
| Frontend | v2.9 | `https://tsiapp.io/OrthoPlus-Enterprise/` | ✅ Docker `tsiapp-orthoplus` |
| Backend API | v2.4 | `https://tsiapp.io/api` | ✅ Docker `tsiapp-orthoplus-backend` |
| Health Check | — | `http://localhost:3005/health` | ✅ OK |
| PostgreSQL | 16 | `127.0.0.1:5432` | ✅ 180 tabelas, 16 schemas |
| Redis | 7 | `127.0.0.1:6379` | ✅ Autenticado |
| Nginx (host) | — | `443 → frontend:8083`, `/api/ → backend:3005` | ✅ Cloudflare → VPS |

---

## 🔐 Login de Teste

| Campo | Valor |
|-------|-------|
| **Email** | `admin@orthoplus.com` (ou apenas `Admin` — frontend converte) |
| **Senha** | Ver `.env` local ou perguntar ao usuario |
| **Role** | `ADMIN` |
| **Clinic ID** | `48eaa5f9-99b1-45ce-a095-e099b522b165` |

---

## 🗄️ Banco de Dados

- **Database:** `orthoplus`
- **Schemas:** 16 (nenhuma tabela em `public`)
- **Tabelas:** 180 total
- **module_catalog:** 31 modulos sincronizados com frontend
- **clinic_modules:** 31 associacoes ativas

### Sincronizacao module_catalog ↔ Frontend
O frontend tem 31 moduleKeys no sidebar. O banco deve ter 31 registros correspondentes em `configuracoes.module_catalog`. O `hasModuleAccess` no frontend faz comparacao **case-insensitive** (v2.9+). O backend retorna module_keys em **minusculas**.

**SEMPRE** sincronizar o banco apos adicionar novos modulos no frontend.

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

### 4. Deploy Backend
Buildar imagem Docker com `package.prod.json` (sem `workspace:*`).

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

## 📁 Documentacao

| Arquivo | Proposito |
|---------|-----------|
| `AGENTS.md` | **Referencia principal** |
| `HANDOFF.md` | Este arquivo |
| `docs/ARCHITECTURE.md` | Arquitetura do sistema |
| `docs/CATEGORIES.md` | 10 categorias de negocio |

---

> **Novo agente:** Leia AGENTS.md inteiro antes de tocar em qualquer codigo. Verifique `git status` e `git log --oneline -5`.
