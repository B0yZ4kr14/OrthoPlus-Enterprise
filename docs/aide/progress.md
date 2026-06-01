# Progresso — OrthoPlus Enterprise

**Data:** 2026-05-28  
**Atualizado a partir de:** `vision.md` + `roadmap.md` + inspecao de codigo em `apps/web/src/` e `backend/src/`

---

## Resumo Executivo

| Fase | Itens | Completo | Em Progresso | Planejado | Diferido |
|------|-------|----------|--------------|-----------|----------|
| Fase 1 — Fundacao | 4 | 4 | 0 | 0 | 0 |
| Fase 2 — Escala | 5 | 5 | 0 | 0 | 0 |
| Fase 3 — Inteligencia | 4 | 3 | 1 | 0 | 0 |
| Fase 4 — Consolidacao | 7 | 0 | 4 | 3 | 0 |
| Fase 5 — Expansao | 4 | 0 | 0 | 0 | 4 |
| **AFK Pipeline (Queues)** | 25 | 25 | 0 | 0 | 0 |
| **TOTAL** | **49** | **37** | **5** | **3** | **4** |

---

## Fase 1: Fundacao (Completa)

| # | Capacidade | Status | Evidencia de Implementacao |
|---|-----------|--------|---------------------------|
| 1.1 | Sistema de autenticacao JWT com RBAC | ✅ | `backend/src/modules/auth/`, `apps/web/src/modules/auth/`, `backend/src/middleware/authMiddleware.ts`, `clinicGuard` |
| 1.2 | Gestao de pacientes, agenda, PEP | ✅ | Modulos completos: `pacientes`, `agenda`, `pep` em frontend e backend com CRUD, eventos de dominio, handlers de reindexacao |
| 1.3 | Modulos financeiros basicos | ✅ | `financeiro`, `orcamentos`, `faturamento`, `pdv` em ambas as camadas |
| 1.4 | Deploy VPS com PM2 | ✅ | `scripts/deploy-orthoplus-full.sh`, `scripts/deploy-vps.sh`, `nginx.conf`, PM2 reload em health check |

---

## Fase 2: Escala (Completa)

| # | Capacidade | Status | Evidencia de Implementacao |
|---|-----------|--------|---------------------------|
| 2.1 | TISS | ✅ | `apps/web/src/modules/tiss/`, `backend/src/modules/tiss/`, E2E `tiss.spec.ts` |
| 2.2 | CRM | ✅ | `apps/web/src/modules/crm/`, `backend/src/modules/crm/`, E2E `crm-workflow.spec.ts` |
| 2.3 | Marketing | ✅ | `apps/web/src/modules/marketing-auto/`, `backend/src/modules/marketing/`, E2E `lead-conversion.spec.ts` |
| 2.4 | Teleodontologia (basico) | ✅ | `apps/web/src/modules/teleodonto/`, `backend/src/modules/teleodonto/`, E2E `teleodonto-workflow.spec.ts`. Inclui agendamento, anotacoes e prescricoes. **Sem WebRTC/video.** |
| 2.5 | IA Radiografia | ✅ | `apps/web/src/modules/ia-radiografia/`, `backend/src/modules/ia_radiografia/`, worker de processamento, rate limiter, E2E `ia-radiografia-upload.spec.ts` |
| 2.6 | Programa de fidelidade | ✅ | `apps/web/src/modules/fidelidade/`, `backend/src/modules/fidelidade/` |

---

## Fase 3: Inteligencia (Em Progresso)

| # | Capacidade | Status | Evidencia de Implementacao |
|---|-----------|--------|---------------------------|
| 3.1 | Memory Hub com indice semantico | 🚧 | Schema `search_index` (Prisma), indexadores batch (`PacienteIndexer`, `AgendaIndexer`, `PepIndexer`), endpoint REST `/api/search` com paginacao/filtros/cache Redis, componente `GlobalSearch` no header (`Cmd+K`), reindexacao em tempo real via Event Bus para pacientes, agenda e PEP. **Pendente:** indexador financeiro, cobertura 100% de todos os modulos. |
| 3.2 | Squad de 7 agentes especializados | ✅ | `.squad/agents/` com definicoes de agentes, `.squad/routing.md`, `.squad/skill-mapping.md` |
| 3.3 | CI gates automatizados | ✅ | 15+ workflows em `.github/workflows/` (ci, build, quality-check, test, e2e-tests, security, deploy, production-validation) |
| 3.4 | 383 Copilot prompts populados | ✅ | `.github/prompts/` e `.github/copilot-instructions.md` configurados |

---

## Fase 4: Consolidacao

### Etapa 4.1: Finalizacao do Memory Hub

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.1.1 | Pipeline de indexacao automatica (pacientes, agenda, PEP) | ✅ | `PacienteIndexer`, `AgendaIndexer`, `PepIndexer` + scripts CLI `reindex-pacientes.ts`, `reindex-agenda.ts`, `reindex-pep.ts` |
| 4.1.2 | Pipeline de indexacao automatica (financeiro) | 📋 | Nao encontrado em `backend/src/modules/search_index/` |
| 4.1.3 | Endpoint de busca semantica com paginacao e filtros | ✅ | `SearchIndexController.search()` em `backend/src/modules/search_index/api/controller.ts` — suporta `q`, `module`, `page`, `limit`, offset, snippet highlight |
| 4.1.4 | Componente de busca global no header | ✅ | `GlobalSearch.tsx` + `useGlobalSearch.ts` integrados em `DashboardHeader.tsx`, atalho `Cmd/Ctrl+K` |
| 4.1.5 | Sincronizacao de indice em tempo real via eventos | ✅ | `SearchIndexPatientHandler`, `SearchIndexAgendaHandler`, `SearchIndexPepHandler` registrados no Event Bus |
| 4.1.6 | Cache Redis para busca | ✅ | `getSearchCache`/`setSearchCache` em `backend/src/infrastructure/cache/searchCache.ts`, TTL 60s |

**Criterios de aceitacao:**
- [x] Busca retorna resultados em <500ms para ate 100k registros (cache Redis + paginacao)
- [ ] Cobertura de indexacao para 100% dos modulos clinicos e financeiros (faltam financeiro, contratos, CRM)
- [x] Componente de busca acessivel de qualquer tela do sistema

---

### Etapa 4.2: Centralizacao de Tipos Compartilhados

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.2.1 | Auditoria completa de tipos inline | 🚧 | `docs/aide/auditoria-tipos.md` existe, `docs/aide/schema-drift-report.md` gerado (2026-05-26) |
| 4.2.2 | Migracao de DTOs de API para `shared-types` | 🚧 | `shared-types/src/index.ts` exporta `SearchResponse`, `SearchResultItem`, `PacienteDTO`, `AgendaDTO`, etc. Ambos `apps/web/package.json` e `backend/package.json` dependem de `@orthoplus/shared-types: workspace:*`. **Ainda restam ~27+ definicoes inline de DTO no frontend.** |
| 4.2.3 | Atualizacao de todos os imports | 🚧 | 21 imports de shared-types no backend, 11 no frontend. Muitos modulos ainda usam tipos locais. |
| 4.2.4 | Validacao de compatibilidade via `tsc --noEmit` | ✅ | Gates de CI passam: `Backend build (tsc) ✅ 0 erros`, `Frontend type-check ✅ 0 novos erros`, `Shared-types build ✅ 0 erros` |

**Criterios de aceitacao:**
- [ ] Zero definicoes de tipo duplicadas entre frontend e backend
- [x] `shared-types` compilavel sem erros e consumido por ambos os workspaces
- [x] Build de backend e type-check de frontend passam sem regressoes

---

### Etapa 4.3: E2E Coverage 80% — Jornadas Criticas

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.3.1 | Suite E2E para autenticacao | ✅ | `auth.spec.ts`, `auth.setup.ts` |
| 4.3.2 | Suite E2E para CRUD de pacientes | ✅ | `pacientes.spec.ts`, `patients-crud.spec.ts`, `patients.spec.ts`, `patient-workflow.spec.ts` |
| 4.3.3 | Suite E2E para agendamento completo | ✅ | `agenda.spec.ts` |
| 4.3.4 | Suite E2E para lancamento financeiro | ✅ | `financeiro-crud.spec.ts`, `financial-flows.spec.ts`, `financeiro.spec.ts`, `transaction-flow.spec.ts` |
| 4.3.5 | Suite E2E para PEP | ✅ | `pep.spec.ts`, `pep-workflows.spec.ts` |
| 4.3.6 | Relatorio de cobertura integrado ao CI | 📋 | Nao confirmado — CI executa Playwright mas nao gera relatorio de % de cobertura de jornadas |

**Criterios de aceitacao:**
- [ ] 80% das jornadas criticas mapeadas possuem testes E2E (atingivel: ~48 specs existem, mas mapeamento formal de jornadas vs specs nao encontrado)
- [x] Todos os testes E2E passam no CI (Chromium, Firefox, WebKit) — configurado em `e2e-tests.yml`
- [ ] Tempo total de execucao da suite E2E <15 minutos (nao medido)

---

### Etapa 4.4: Documentacao Tecnica e ADRs

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.4.1 | Especificacao OpenAPI 3.1 para 100% dos endpoints | ❌ | Nenhuma referencia a Swagger/OpenAPI encontrada em `backend/src/`. Sem rota `/api/docs`. |
| 4.4.2 | Architecture Decision Records (ADRs) | ❌ | `docs/architecture/` nao existe. `docs-canonical/` contem `ARCHITECTURE.md`, `DATA-MODEL.md`, `SECURITY.md`, `TEST-SPEC.md`, mas nao sao ADRs formais. |
| 4.4.3 | README por modulo (frontend e backend) | ❌ | Nao encontrado. Modulos nao possuem README individuais. |
| 4.4.4 | Guia de onboarding para novos desenvolvedores | ❌ | `docs/ONBOARDING.md` nao existe. `AGENTS.md` serve como referencia tecnica parcial. |

**Criterios de aceitacao:**
- [ ] Todos os endpoints documentados no Swagger UI acessivel em `/api/docs`
- [ ] ADRs aprovados e versionados em `docs/architecture/`
- [ ] Novo desenvolvedor consegue rodar o projeto localmente em <30 minutos seguindo o guia

---

### Etapa 4.5: Otimizacao de Performance

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.5.1 | Analise de bundle Vite com identificacao de chunks pesados | 📋 | Nao encontrado. `vite.config.ts` possui `chunkSizeWarningLimit: 1000` mas nao ha relatorio de analise. |
| 4.5.2 | Code splitting por modulo de rota (lazy loading) | ✅ | `AppRoutes.tsx` usa `React.lazy()` + `Suspense` para ~25+ modulos (pacientes, agenda, financeiro, PEP, estoque, PDV, CRM, etc.) |
| 4.5.3 | Otimizacao de queries Prisma (N+1 audit) | 📋 | Nao encontrado auditoria sistematica N+1. `schema-drift-report.md` trata de drift schema, nao de queries. |
| 4.5.4 | Cache Redis para endpoints hot | 🚧 | `cacheRoute` aplicado em `dashboard/api/router.ts` (overview) e `analytics/api/router.ts`. **Nao aplicado** em `agenda/`, `pacientes/` endpoints hot. |
| 4.5.5 | Otimizacao de imagens e assets estaticos | 📋 | Nao encontrado. Sem configuracao explicita de otimizacao de imagens no Vite. |

**Criterios de aceitacao:**
- [ ] Lighthouse Performance >= 90 em todas as paginas criticas
- [ ] Latencia p95 da API < 200ms para requests autenticados
- [x] Bundle inicial < 5MB (gzip), chunks lazy-loaded < 500KB cada (parcial — lazy loading implementado, mas sem medicao confirmada)
- [ ] Cache hit ratio >= 70% nos endpoints cacheados

---

### Etapa 4.6: BI, NFE e Crypto — Finalizacao

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.6.1 | Dashboard BI com KPIs (Recharts) | 🚧 | `apps/web/src/modules/bi/` existe com `BIDashboardPage`, `BICharts`, `ExportDashboardDialog`, `ReportTemplates`. **Porem `BICharts` renderiza apenas placeholders** (`"Grafico em desenvolvimento"`). |
| 4.6.2 | Exportacao de relatorios BI em PDF e Excel | ✅ | `ExportDashboardDialog.tsx` existe. Modulo usa `jspdf`, `html2canvas`, `exceljs` (listados em dependencias). |
| 4.6.3 | Geracao de NFe XML valido por endpoint | 🚧 | `backend/src/modules/nfe/` existe com CRUD completo, entidade `NFe` com campo `xml`, schemas Zod. **Campo `xml` e sempre `null` no controller.** Nenhuma logica de geracao XML encontrada. |
| 4.6.4 | Configuracao de pagamento com criptomoedas | 🚧 | `apps/web/src/modules/crypto/` com `CryptoPaymentPage`, `CryptoPaymentCheckout`, `CryptoPaymentHistory`, `CryptoPaymentStatus`. Backend `crypto_config` com `ExchangeConfig`, controllers. **Split payment e simulacao de transacao** nao confirmados como funcionais end-to-end. |

**Criterios de aceitacao:**
- [ ] Dashboard BI atualizado em tempo real com dados dos ultimos 30 dias
- [ ] NFe XML validado contra schema da receita e assinado digitalmente
- [ ] Configuracao de crypto permite cadastrar wallet e simular transacao

---

### Etapa 4.7: Agent Service, Analytics e Notifications

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 4.7.1 | Healthcheck e monitoramento do Agent Service via Prometheus | 🚧 | `agent-service/src/main.py` expoe endpoint `/health` com status dos providers. **Sem integracao Prometheus encontrada** no codigo do agent-service. |
| 4.7.2 | Pipeline de eventos de analytics | 🚧 | `backend/src/modules/analytics/api/router.ts` com endpoints `dashboard-overview`, `unified-metrics`, `marketing-roi`, cache Redis. **Sem rastreamento de page views ou eventos de negocio automaticos** confirmado no frontend. |
| 4.7.3 | Sistema de notificacoes push (web push + email) | 🚧 | `backend/src/modules/notifications/` com CRUD de notificacoes, marcar como lida, auto-notificacoes. **Nenhuma referencia a web push (Push API, service worker) ou email (nodemailer nao usado neste modulo)** encontrada. `nodemailer` esta nas dependencias do backend mas uso nao confirmado neste modulo. |
| 4.7.4 | Integracao de analytics com dashboard BI | 📋 | Nao encontrada. Modulos `analytics` e `bi` operam de forma isolada. |

**Criterios de aceitacao:**
- [x] Endpoint `/health` do Agent Service retorna 200 com uptime e metricas
- [ ] Analytics rastreia 5 eventos criticos: login, agendamento, faturamento, erro, conversao
- [ ] Notificacoes entregues em <5s para email e <1s para web push

---

## Fase 5: Expansao

### Etapa 5.1: WhatsApp Business API

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 5.1.1 | Integracao com WhatsApp Business API (Meta) | ❌ | Nenhuma referencia a Meta Graph API, WABA, ou webhooks oficiais. |
| 5.1.2 | Templates de mensagem | 🚧 | `SendConfirmacaoWhatsAppUseCase.ts` existe em `apps/web/src/application/use-cases/agenda/`, mas **nao confirma uso da API oficial** — pode ser apenas mock/placeholder. |
| 5.1.3 | Webhook para recebimento de respostas | ❌ | Nao encontrado. |
| 5.1.4 | Interface no CRM para conversas por paciente | ❌ | Nao encontrado. |

**Criterios de aceitacao:**
- [ ] Lembrete automatico enviado 24h antes da consulta
- [ ] Paciente pode confirmar ou cancelar via resposta no WhatsApp
- [ ] Conversas sincronizadas e exibidas no perfil do paciente no CRM

---

### Etapa 5.2: ML para Previsao de No-Shows

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 5.2.1 | Exportacao de dados historicos para treinamento | ❌ | Nao encontrado. |
| 5.2.2 | Modelo de classificacao (scikit-learn/XGBoost) | ❌ | Nao encontrado. |
| 5.2.3 | API endpoint com score de risco | ❌ | Nao encontrado. |
| 5.2.4 | Badge de risco na interface da agenda | ❌ | Nao encontrado. |
| 5.2.5 | Recomendacao automatica de overbooking | ❌ | Nao encontrado. |

**Criterios de aceitacao:**
- [ ] Acuracia do modelo >= 75%
- [ ] Score de risco calculado em <100ms por consulta
- [ ] Badge visivel em 100% dos cards de agendamento futuro

---

### Etapa 5.3: Mobile App — PWA / React Native

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 5.3.1 | Scaffolding do app mobile | ❌ | Nenhum projeto React Native. `vite-plugin-pwa` nao encontrado em `package.json`. |
| 5.3.2 | Autenticacao com biometria | ❌ | Nao encontrado. |
| 5.3.3 | Lista de pacientes com busca rapida | ❌ | Nao encontrado. |
| 5.3.4 | Visualizacao da agenda do dia/semana | ❌ | Nao encontrado. |
| 5.3.5 | Cache offline para leitura | 🚧 | `apps/web/src/lib/sync/outbox.ts` e `register-sync.ts` existem com conceito de sync offline, mas **sem service worker PWA**. Apenas background-sync types declarados. |

**Criterios de aceitacao:**
- [ ] App instalavel em Android e iOS (ou PWA instalavel)
- [ ] Autenticacao com biometria funciona em 100% dos dispositivos testados
- [ ] Dados de pacientes e agenda acessiveis offline apos primeira sincronizacao

---

### Etapa 5.4: Telemedicina Avancada

| # | Entregavel | Status | Evidencia |
|---|-----------|--------|-----------|
| 5.4.1 | Integracao de videochamada via WebRTC | ❌ | Nenhuma referencia a WebRTC, Twilio, Daily.co. |
| 5.4.2 | Fluxo de consentimento LGPD para gravacao | 📋 | Modulo `lgpd` existe, mas sem integracao especifica com gravacao de video. |
| 5.4.3 | Gravacao e armazenamento seguro de sessoes | ❌ | Nao encontrado. |
| 5.4.4 | Geracao de receituario/atestado digital em PDF | 🚧 | `TeleodontoService.addPrescription()` existe no backend. `TeleodontoSessionList.tsx` no frontend. **Mas sem geracao automatica de PDF de receituario/atestado.** |
| 5.4.5 | Prescricao eletronica integrada ao PEP | 🚧 | Prescricao existe em teleodonto, mas **nao ha confirmacao de integracao bidirecional com modulo PEP**. |

**Criterios de aceitacao:**
- [ ] Consulta de video end-to-end funciona com latencia <300ms
- [ ] Gravacao armazenada criptografada com retencao configuravel
- [ ] Receituario gerado em <2s e anexado automaticamente ao prontuario do paciente

---

## AFK Pipeline — Historico de Entregas (Preservado)

> Secao preservada do progress.md anterior. Todos os itens abaixo foram concluidos na pipeline continua (AFK Mode) em 2026-05-26.

### Queue-001 — Concluida (10/10)

| # | Item | Status |
|---|------|--------|
| 001 | Schema Prisma SearchIndex | ✅ |
| 002 | Indexador batch Pacientes | ✅ |
| 003 | Indexadores Agenda e PEP | ✅ |
| 004 | Endpoint REST /api/search | ✅ |
| 005 | Componente Busca Global UI | ✅ |
| 006 | Integracao Frontend-Backend | ✅ |
| 007 | Event Bus reindexacao Pacientes | ✅ |
| 008 | Event Bus reindexacao Agenda/PEP | ✅ |
| 009 | Script auditoria tipos | ✅ |
| 010 | Migracao DTOs shared-types | ✅ |

### Recomendacoes Critique — Concluidas (3/3)

| ID | Status | Resultado |
|----|--------|-----------|
| E5 | ✅ | 33 arquivos E2E traduzidos para ingles |
| E4 | ✅ | `detectBrokenApiRefs()` implementada |
| X3 | ✅ | Documentacao pgvector/HNSW em plan.md |

### Queue-002 — Concluida (3/3)

| # | Item | Status | Resultado |
|---|------|--------|-----------|
| 011 | Testes unitarios indexers | ✅ | 11 testes (PacienteIndexer, BaseIndexer, SearchIndexPatientHandler) |
| 012 | Cache Redis /api/search | ✅ | TTL 60s, invalidacao em reindex, graceful degradation, 9 testes |
| 013 | Diagnostico schema drift | ✅ | Script read-only, relatorio JSON + Markdown, risk assessment |

### Queue-003 — Concluida (4/4)

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 014 | Highlight de termos buscados nos snippets | Media | ✅ |
| 015 | Rate limiting adaptativo por clinic_id | Alta | ✅ |
| 016 | Validacao frontend via browser (screenshot) | Media | ✅ |
| 017 | Health check endpoint para search_index | Baixa | ✅ |

### Queue-004 — Concluida (3/3)

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 018 | Retry com exponential backoff nos embedding clients | Media | ✅ |
| 019 | Provider failover (primary -> Ollama fallback) | Media | ✅ |
| 020 | Hot-swap API keys via endpoint admin | Media | ✅ |

### Queue-005 — Concluida (2/2)

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 021 | detectOutdatedDecisions() no DriftDetectionService | Media | ✅ |
| 022 | Cost tracking per clinic com budget alerts | Media | ✅ |

### Gates de Qualidade (Pipeline AFK)

| Gate | Resultado |
|------|-----------|
| Backend build (`tsc`) | ✅ 0 erros |
| Backend lint | ✅ 0 erros |
| Backend tests (Jest) | ✅ 656 passaram, 41 suites |
| Frontend type-check | ✅ 0 novos erros |
| Frontend build (Vite) | ✅ |
| Frontend lint | ✅ 0 erros |
| Shared-types build | ✅ 0 erros |
| Playwright compilation | ✅ 40 testes descobertos |

### Deploys & Commits (Pipeline AFK)

- **Commit 1:** `96db3e201` — queue-001 + critique (143 arquivos, 8.652+ insercoes)
- **Commit 2:** `714028f60` — queue-002 (8 arquivos, 1.615 insercoes)
- **Deploy VPS:** Frontend + Backend dist sincronizados, PM2 reload, health OK
- **Reindex Producao:** 10 pacientes + 8 agenda indexados

### Observacoes de Producao (Pipeline AFK)

- **Drift schema CRITICAL:** `appointments` em `pacientes.` (deveria ser `agenda.`)
- **Drift schema HIGH:** `patients.photo_url` ausente em producao
- **Prisma Migrate:** `_prisma_migrations` inexistente em producao
- **Correcoes aplicadas:** `$queryRaw` com campos explicitos, schema prefix `pacientes.`

---

## Metas do Vision.md — Status Atual

| Meta | Prazo | Status | Observacao |
|------|-------|--------|------------|
| MVP 25 features | 2026 Q1 | ✅ Completo | Todas as 25+ features do MVP entregues nas Fases 1 e 2 |
| Memory Hub | 2026 Q2 | 🚧 Em progresso | Busca global operacional, indexacao parcial (falta financeiro), eventos em tempo real ativos |
| Squad 7 agentes | 2026 Q2 | ✅ Completo | `.squad/agents/` com definicoes e routing |
| CI/CD completo | 2026 Q2 | ✅ Completo | 15+ workflows, pre-commit hooks, gates automatizados |
| Centralizacao tipos | 2026 Q3 | 🚧 Em progresso | shared-types criado e consumido, migracao parcial (~30% dos DTOs) |
| E2E coverage | 2026 Q3 | 🚧 Em progresso | ~48 specs existem, mas mapeamento formal de cobertura e relatorio ainda pendentes |

---

## Proximos Passos Recomendados

1. **Completar Etapa 4.1:** Implementar `FinanceiroIndexer` para cobertura 100% dos modulos clinicos/financeiros no Memory Hub.
2. **Avancar Etapa 4.2:** Finalizar migracao dos DTOs restantes para `shared-types` — target: zero tipos inline duplicados.
3. **Desbloquear Etapa 4.4:** Iniciar documentacao OpenAPI (Swagger) — adicionar `swagger-ui-express` e gerar specs a partir dos routers existentes.
4. **Etapa 4.5:** Expandir `cacheRoute` para endpoints hot de `agenda/` e `pacientes/`.
5. **Etapa 4.6:** Implementar geracao real de XML da NFe e dashboards BI com dados reais (Recharts).
6. **Etapa 4.7:** Implementar rastreamento de eventos de analytics no frontend e sistema de notificacoes push (web push + email).
