# Plano de Correção Orquestrado — OrthoPlus Enterprise

> **Criado:** 2026-05-14 | **Versão:** 1.0 | **Status:** Rascunho para aprovação
> **Baseado em:** Validação completa de UI, acesso, segurança e deploy

---

## 🎯 Objetivo

Eliminar todos os bugs críticos, rotacionar secrets remanescentes, corrigir o root cause do redirecionamento pós-login, e estabilizar os stubs 404 — mantendo documentação 100% sincronizada com cada entrega.

---

## 📊 Matriz de Risco e Prioridade

| # | Problema | Risco | Impacto | Esforço | Prioridade |
|---|----------|-------|---------|---------|------------|
| 1 | **Secrets no histórico git** (DB/Redis) | 🔴 Crítico | Segurança | Médio | P0 |
| 2 | **PostgreSQL superuser** (`postgres`) | 🔴 Crítico | Segurança | Alto | P0 |
| 3 | **Root cause login redirect** | 🔴 Crítico | UX/Funcional | Baixo | P0 |
| 4 | **CSP Header ausente** | 🟡 Alto | Segurança | Baixo | P1 |
| 5 | **~156 endpoints stubs 404** | 🟡 Alto | Funcionalidade | Alto | P1 |
| 6 | **Frontend TS errors** (5 módulos) | 🟡 Alto | Build/Qualidade | Médio | P1 |
| 7 | **Dados de demonstração ausentes** | 🟡 Alto | UX/Onboarding | Médio | P2 |
| 8 | **Container build complexity** | 🟢 Médio | DevOps | Médio | P2 |
| 9 | **CI misto** (npm vs pnpm) | 🟢 Médio | DevOps | Baixo | P3 |
| 10 | **SSL expira Jul/2026** | 🟢 Baixo | Infra | Baixo | P3 |

---

## 🗓️ Fases de Execução

### FASE 1: Segurança e Estabilidade (P0) — Dias 1-2

#### 1.1 Rotacionar DB_PASSWORD e REDIS_PASSWORD
- [ ] Gerar novos secrets (`openssl rand`)
- [ ] Alterar senha PostgreSQL: `ALTER USER postgres WITH PASSWORD '...'`
- [ ] Alterar senha Redis: `CONFIG SET requirepass ...` + `CONFIG REWRITE`
- [ ] Atualizar `.env.production` no VPS
- [ ] Recriar container backend com novas env vars
- [ ] Testar login e health check
- [ ] Atualizar `AGENTS.md` e `HANDOFF.md`

#### 1.2 Criar role dedicada `orthoplus` no PostgreSQL
- [ ] Criar role: `CREATE ROLE orthoplus WITH LOGIN PASSWORD '...'`
- [ ] Grant permissions nos 16 schemas
- [ ] Atualizar `DB_USER=orthoplus` no `.env.production`
- [ ] Testar conexão backend
- [ ] Atualizar documentação

#### 1.3 Corrigir root cause do login redirect
- [ ] Investigar por que `navigate("/dashboard")` não funciona no React Router
- [ ] Verificar se o problema é o `basename` do BrowserRouter combinado com `navigate`
- [ ] Implementar correção definitiva (possivelmente `useNavigate` com path relativo)
- [ ] Testar redirecionamento automático pós-login
- [ ] Remover workaround `window.location.replace`
- [ ] Atualizar documentação

### FASE 2: Funcionalidade e Qualidade (P1) — Dias 3-5

#### 2.1 CSP Header no nginx
- [ ] Adicionar `Content-Security-Policy` ao `nginx-frontend.conf`
- [ ] Permitir `script-src 'self'` e recursos do mesmo domínio
- [ ] Testar em produção
- [ ] Atualizar documentação

#### 2.2 Reduzir stubs 404
- [ ] Auditar endpoints stubs por módulo
- [ ] Implementar handlers mínimos (status + mensagem) para stubs críticos
- [ ] Adicionar tabelas Prisma faltantes (se necessário)
- [ ] Documentar stubs remanescentes

#### 2.3 Corrigir Frontend TS errors
- [ ] `crypto-pagamentos`: Verificar tipos e imports
- [ ] `marketing-auto`: Verificar tipos e imports
- [ ] `dentistas`: Verificar tipos e imports
- [ ] `usuarios`: Verificar tipos e imports
- [ ] `tour`: Verificar tipos e imports
- [ ] Rodar `pnpm type-check` e confirmar zero erros
- [ ] Atualizar documentação

### FASE 3: UX e DevOps (P2-P3) — Dias 6-8

#### 3.1 Seed de dados de demonstração
- [ ] Criar script SQL com dados demo (pacientes, consultas, receitas)
- [ ] Incluir demo data no deploy inicial
- [ ] Marcar demo data com flag `is_demo=true`
- [ ] Atualizar documentação

#### 3.2 Simplificar container build
- [ ] Avaliar uso de `pnpm deploy` ou `turbo prune` para backend
- [ ] Eliminar necessidade de `package.prod.json`
- [ ] Testar build Docker do backend sem workarounds

#### 3.3 CI unificado
- [ ] Padronizar todos os workflows para `pnpm`
- [ ] Atualizar `package.json` workspaces para incluir `backend` e `shared-types`

#### 3.4 SSL Renewal
- [ ] Verificar data de expiração do certificado
- [ ] Agendar renovação automática (certbot)

---

## 🔄 Orquestração e Dependências

```
FASE 1
├── 1.1 Rotacionar secrets
│   └── 1.2 Criar role orthoplus (pode paralelizar)
└── 1.3 Fix login redirect (independente)

FASE 2
├── 2.1 CSP (independente)
├── 2.2 Stubs 404 (depende de backend build OK)
└── 2.3 TS errors (independente)

FASE 3
├── 3.1 Seed demo (depende de DB schema estável)
├── 3.2 Container build (independente)
├── 3.3 CI (independente)
└── 3.4 SSL (independente)
```

---

## 📋 Checklist de Documentação

Após **cada tarefa**:
- [ ] Atualizar `AGENTS.md` (estado atual, versões, pendências)
- [ ] Atualizar `HANDOFF.md` (infra, URLs, versões, checklist)
- [ ] Adicionar changelog entry se aplicável
- [ ] Atualizar este plano (marcar como done + evidências)

---

## 🎫 Decisões Pendentes

| # | Decisão | Opções | Recomendação |
|---|---------|--------|--------------|
| 1 | Rotacionar secrets agora? | Sim / Depois do P1 | **Sim** — segurança primeiro |
| 2 | Manter `window.location.replace`? | Sim / Corrigir navigate | **Corrigir** — workaround técnico |
| 3 | Prioridade stubs 404? | P1 / P2 | **P1** — 156 endpoints afetam UX |
| 4 | Dados demo no DB de produção? | Sim / Não | **Sim** — melhora demonstração |

---

> **Próxima ação recomendada:** Aprovar FASE 1 e iniciar rotação de secrets + investigação do root cause do login redirect.
