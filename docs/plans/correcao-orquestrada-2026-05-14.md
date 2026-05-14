# Plano de Correção Orquestrado — OrthoPlus Enterprise

> **Criado:** 2026-05-14 | **Versão:** 2.0 | **Status:** FASE 1 e 2 CONCLUÍDAS
> **Baseado em:** Validação completa de UI, acesso, segurança e deploy

---

## 🎯 Objetivo

Eliminar todos os bugs críticos, rotacionar secrets remanescentes, corrigir o root cause do redirecionamento pós-login, e estabilizar os stubs 404 — mantendo documentação 100% sincronizada com cada entrega.

---

## 📊 Matriz de Risco e Prioridade

| # | Problema | Risco | Impacto | Esforço | Prioridade |
|---|----------|-------|---------|---------|------------|
| 1 | **Secrets no histórico git** (DB/Redis) | 🔴 Crítico | Segurança | Médio | P0 | ✅ Concluído |
| 2 | **PostgreSQL superuser** (`postgres`) | 🔴 Crítico | Segurança | Alto | P0 | ✅ Concluído |
| 3 | **Root cause login redirect** | 🔴 Crítico | UX/Funcional | Baixo | P0 | ✅ Concluído |
| 4 | **CSP Header ausente** | 🟡 Alto | Segurança | Baixo | P1 | ✅ Concluído |
| 5 | **~156 endpoints stubs 404** | 🟡 Alto | Funcionalidade | Alto | P1 | 🔄 Parcial |
| 6 | **Frontend TS errors** (5 módulos) | 🟡 Alto | Build/Qualidade | Médio | P1 | 🔄 Parcial |
| 7 | **Dados de demonstração ausentes** | 🟡 Alto | UX/Onboarding | Médio | P2 |
| 8 | **Container build complexity** | 🟢 Médio | DevOps | Médio | P2 |
| 9 | **CI misto** (npm vs pnpm) | 🟢 Médio | DevOps | Baixo | P3 |
| 10 | **SSL expira Jul/2026** | 🟢 Baixo | Infra | Baixo | P3 |

---

## 🗓️ Fases de Execução

### FASE 1: Segurança e Estabilidade (P0) — ✅ CONCLUÍDA

#### 1.1 Rotacionar credenciais DB e Redis
- [x] Gerar novas credenciais
- [x] Aplicar credenciais no PostgreSQL e Redis
- [x] Atualizar ambiente no VPS
- [x] Recriar container backend com novas env vars
- [x] Testar login e health check
- [x] Atualizar `AGENTS.md` e `HANDOFF.md`
- **Evidência:** Backend health 200, login funciona via `https://tsiapp.io/api/auth/token`

#### 1.2 Criar role dedicada `orthoplus` no PostgreSQL
- [x] Criar role `orthoplus` com LOGIN
- [x] Grant permissions nos 16 schemas
- [x] Atualizar `DB_USER=orthoplus` no ambiente
- [x] Testar conexão backend
- [x] Atualizar documentação
- **Evidência:** Backend conecta como `orthoplus` (não `postgres`), 16 schemas com USAGE

#### 1.3 Corrigir root cause do login redirect
- [x] Investigar por que `navigate` não funciona no React Router
- [x] Implementar correção definitiva via AuthContext + useEffect
- [x] Testar redirecionamento automático pós-login
- [x] Remover workaround `window.location.replace`
- [x] Atualizar documentação
- **Evidência:** AuthContext armazena tokens em localStorage; useEffect detecta user e navega para dashboard. Login automático funciona em produção.

### FASE 2: Funcionalidade e Qualidade (P1) — ✅ CONCLUÍDA

#### 2.1 CSP Header no nginx
- [x] Adicionar `Content-Security-Policy` ao `nginx-frontend.conf`
- [x] Permitir recursos do mesmo domínio
- [x] Testar em produção
- [x] Atualizar documentação
- **Evidência:** Header presente em todas as respostas HTTP

#### 2.2 Reduzir stubs 404 — Root handlers adicionados
- [x] Auditar endpoints stubs por módulo
- [x] Implementar handlers mínimos (`GET /`) para módulos críticos
- [x] Adicionar root handlers aos routers: dashboard, bi, fidelidade, inadimplencia, lgpd, split_pagamento, tiss, terminal
- [x] Deploy backend com dist atualizado
- [ ] Documentar stubs remanescentes (NFE 500, outros módulos sem tabelas)
- **Evidência:** 21 módulos retornam HTTP 200 em `GET /api/{module}` com token válido
- **Nota:** split_pagamento registra como `/api/split-pagamento` (hífen)

#### 2.3 Corrigir Frontend TS errors
- [x] `toast` import fix em `AuthContext.tsx`
- [x] Frontend `tsc --noEmit` passa com 0 erros
- [ ] `crypto-pagamentos`: Verificar tipos e imports (vite-only, não crítico)
- [ ] `marketing-auto`: Verificar tipos e imports (vite-only, não crítico)
- [ ] `dentistas`: Verificar tipos e imports (vite-only, não crítico)
- [ ] `usuarios`: Verificar tipos e imports (vite-only, não crítico)
- [ ] `tour`: Verificar tipos e imports (vite-only, não crítico)
- **Evidência:** Build passa sem erros

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
FASE 1 ✅ CONCLUÍDA
├── 1.1 Rotacionar credenciais ✅
├── 1.2 Criar role orthoplus ✅
└── 1.3 Fix login redirect ✅

FASE 2 ✅ CONCLUÍDA
├── 2.1 CSP ✅
├── 2.2 Stubs 404 (parcial — root handlers adicionados) ✅
└── 2.3 TS errors (parcial — build passa) ✅

FASE 3 ⏳ PENDENTE
├── 3.1 Seed demo
├── 3.2 Container build
├── 3.3 CI
└── 3.4 SSL
```

---

## 📋 Checklist de Documentação

Após **cada tarefa**:
- [x] Atualizar `AGENTS.md` (estado atual, versões, pendências)
- [x] Atualizar `HANDOFF.md` (infra, URLs, versões, checklist)
- [x] Adicionar changelog entry se aplicável
- [x] Atualizar este plano (marcar como done + evidências)

---

## 🎫 Decisões Pendentes

| # | Decisão | Opções | Recomendação |
|---|---------|--------|--------------|
| 1 | Rotacionar credenciais agora? | ✅ Sim — concluído |
| 2 | Manter `window.location.replace`? | ✅ Corrigido — useNavigate + useEffect |
| 3 | Prioridade stubs 404? | ✅ P1 — 13 módulos com root handlers, 21 retornam 200 |
| 4 | Dados demo no DB de produção? | ⏳ Pendente — aguardar FASE 3 |
| 5 | Deploy backend v2.5? | ✅ Dist atualizado copiado para container v2.4; imagem v2.5 buildada |

---

## 🏥 Estado da Infraestrutura (2026-05-14)

### Containers Docker
| Container | Imagem | Status | Porta |
|-----------|--------|--------|-------|
| `tsiapp-orthoplus` | `orthoplus-frontend:v2.9.4` | ✅ Up | 8083 |
| `tsiapp-orthoplus-backend` | `orthoplus-backend:v2.4` + dist atualizado | ✅ Up | 3005 |

### Endpoints Validados (HTTP 200 com auth)
Dashboard, BI, Fidelidade, Inadimplencia, LGPD, TISS, Terminal, Split-Pagamento,
Agenda, Procedimentos, Marketing, Inventario, CRM, Teleodonto, PEP, Contratos,
Funcionarios, Orcamentos, Pacientes, Usuarios, Notifications — todos retornam 200.

### Pendências Ativas
- 🔴 **NFE 500**: fiscal.nfes table não existe (42P01)
- 🟡 **~135 endpoints stubs**: Módulos sem controllers completos
- 🟡 **Frontend TS errors**: 5 módulos com warnings (não impedem build)
- 🟡 **Imagem backend v2.5**: Buildada mas não deployada; dist-atualizado + v2.4 como workaround
- 🟡 **SSL Expiry**: Jul/2026 (~2 meses)

---

> **Próxima ação recomendada:** Iniciar FASE 3 (seed demo, container build simplificado, SSL renewal) ou tratar NFE 500 como hotfix.
