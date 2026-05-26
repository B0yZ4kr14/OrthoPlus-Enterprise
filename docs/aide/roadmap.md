# Roadmap — OrthoPlus Enterprise

## Fase 1: Fundacao (Completa)

- Sistema de autenticacao JWT com RBAC
- Gestao de pacientes, agenda, PEP
- Modulos financeiros basicos
- Deploy VPS com PM2

## Fase 2: Escala (Completa)

- TISS, CRM, Marketing
- Teleodontologia
- IA Radiografia
- Programa de fidelidade

## Fase 3: Inteligencia (Em Progresso)

- Memory Hub com indice semantico
- Squad de 7 agentes especializados
- CI gates automatizados
- 383 Copilot prompts populados

---

## Fase 4: Consolidacao

### Etapa 4.1: Finalizacao do Memory Hub

**Objetivo:** Completar o indice semantico do Memory Hub e expor busca full-text no frontend.

**Entregaveis:**
- Pipeline de indexacao automatica para todas as entidades (pacientes, agenda, PEP, financeiro)
- Endpoint de busca semantica com paginacao e filtros
- Componente de busca global no header do frontend
- Sincronizacao de indice em tempo real via eventos

**Dependencias:** Conclusao dos itens da Fase 3.

**Criterios de aceitacao:**
- Busca retorna resultados em <500ms para ate 100k registros
- Cobertura de indexacao para 100% dos modulos clinicos e financeiros
- Componente de busca acessivel de qualquer tela do sistema

---

### Etapa 4.2: Centralizacao de Tipos Compartilhados

**Objetivo:** Eliminar duplicacao de tipos entre frontend e backend, estabelecendo `shared-types` como fonte unica da verdade.

**Entregaveis:**
- Auditoria completa de tipos inline em `apps/web/src/` e `backend/src/`
- Migracao de todos os DTOs de API para `shared-types/src/`
- Atualizacao de todos os imports no frontend e backend
- Validacao de compatibilidade via `tsc --noEmit` em ambos os lados

**Dependencias:** Etapa 4.1.

**Criterios de aceitacao:**
- Zero definicoes de tipo duplicadas entre frontend e backend
- `shared-types` compilavel sem erros e consumido por ambos os workspaces
- Build de backend e type-check de frontend passam sem regressoes

---

### Etapa 4.3: E2E Coverage 80% — Jornadas Criticas

**Objetivo:** Atingir 80% de cobertura de testes end-to-end (Playwright) nas jornadas criticas do usuario.

**Entregaveis:**
- Suite E2E para fluxo de autenticacao (login, logout, refresh, RBAC)
- Suite E2E para CRUD de pacientes
- Suite E2E para agendamento completo (criar, editar, cancelar, lembrete)
- Suite E2E para lancamento financeiro (orcamento, faturamento, conciliacao)
- Suite E2E para PEP (criar prontuario, anexar documento, assinar)
- Relatorio de cobertura integrado ao CI

**Dependencias:** Etapa 4.2 (tipos estaveis reduzem flaky tests).

**Criterios de aceitacao:**
- 80% das jornadas criticas mapeadas possuem testes E2E
- Todos os testes E2E passam no CI (Chromium, Firefox, WebKit)
- Tempo total de execucao da suite E2E <15 minutos

---

### Etapa 4.4: Documentacao Tecnica e ADRs

**Objetivo:** Produzir documentacao completa do sistema para onboarding e manutencao.

**Entregaveis:**
- Especificacao OpenAPI 3.1 para 100% dos endpoints `/api/*`
- Architecture Decision Records (ADRs) para: autenticacao multi-clinica, arquitetura de modulos, escolha de Prisma multi-schema, estrategia de CI/CD
- README por modulo (frontend e backend) com diagrama de dependencias
- Guia de onboarding para novos desenvolvedores (`docs/ONBOARDING.md`)

**Dependencias:** Etapa 4.3.

**Criterios de aceitacao:**
- Todos os endpoints documentados no Swagger UI acessivel em `/api/docs`
- ADRs aprovados e versionados em `docs/architecture/`
- Novo desenvolvedor consegue rodar o projeto localmente em <30 minutos seguindo o guia

---

### Etapa 4.5: Otimizacao de Performance

**Objetivo:** Garantir performance de producao alinhada a padroes enterprise.

**Entregaveis:**
- Analise de bundle Vite com identificacao de chunks pesados
- Code splitting por modulo de rota (lazy loading)
- Otimizacao de queries Prisma (N+1 audit, indices recomendados)
- Cache Redis para endpoints hot (dashboard, lista de pacientes, agenda do dia)
- Otimizacao de imagens e assets estaticos

**Dependencias:** Etapa 4.4.

**Criterios de aceitacao:**
- Lighthouse Performance >= 90 em todas as paginas criticas
- Latencia p95 da API < 200ms para requests autenticados
- Bundle inicial < 5MB (gzip), chunks lazy-loaded < 500KB cada
- Cache hit ratio >= 70% nos endpoints cacheados

---

### Etapa 4.6: BI, NFE e Crypto — Finalizacao

**Objetivo:** Completar os modulos avancados pendentes da visao do produto.

**Entregaveis:**
- Dashboard BI com KPIs de receita, agendamentos, inadimplencia e produtividade (Recharts)
- Exportacao de relatorios BI em PDF e Excel
- Geracao de Nota Fiscal Eletronica (NFE) em XML valido por endpoint
- Configuracao de pagamento com criptomoedas (wallet, conversao, split)

**Dependencias:** Etapa 4.5.

**Criterios de aceitacao:**
- Dashboard BI atualizado em tempo real com dados dos ultimos 30 dias
- NFE XML validado contra schema da receita e assinado digitalmente
- Configuracao de crypto permite cadastrar wallet e simular transacao

---

### Etapa 4.7: Agent Service, Analytics e Notifications

**Objetivo:** Finalizar a infraestrutura inteligente da plataforma.

**Entregaveis:**
- Healthcheck e monitoramento do Agent Service (FastAPI) via Prometheus
- Pipeline de eventos de analytics (page views, acoes de negocio, errors)
- Sistema de notificacoes push (web push + email) para lembretes e alertas
- Integracao de analytics com dashboard BI

**Dependencias:** Etapa 4.6.

**Criterios de aceitacao:**
- Endpoint `/health` do Agent Service retorna 200 com uptime e metricas
- Analytics rastreia 5 eventos criticos: login, agendamento, faturamento, erro, conversao
- Notificacoes entregues em <5s para email e <1s para web push

---

## Fase 5: Expansao

### Etapa 5.1: WhatsApp Business API

**Objetivo:** Habilitar comunicacao bidirecional com pacientes via WhatsApp.

**Entregaveis:**
- Integracao com WhatsApp Business API (Meta)
- Templates de mensagem: lembrete de consulta, confirmacao, recall, pos-consulta
- Webhook para recebimento de respostas dos pacientes
- Interface no CRM para visualizar conversas por paciente

**Dependencias:** Fase 4 completa.

**Criterios de aceitacao:**
- Lembrete automatico enviado 24h antes da consulta
- Paciente pode confirmar ou cancelar via resposta no WhatsApp
- Conversas sincronizadas e exibidas no perfil do paciente no CRM

---

### Etapa 5.2: ML para Previsao de No-Shows

**Objetivo:** Reduzir faltas em consultas via predicao de risco por machine learning.

**Entregaveis:**
- Exportacao de dados historicos de agendamentos para treinamento
- Modelo de classificacao (Python/scikit-learn ou XGBoost) para previsao de no-show
- API endpoint que retorna score de risco (0-100) por agendamento
- Badge de risco na interface da agenda (baixo, medio, alto)
- Recomendacao automatica de overbooking para slots de alto risco

**Dependencias:** Etapa 5.1.

**Criterios de aceitacao:**
- Acuracia do modelo >= 75% no conjunto de teste
- Score de risco calculado em <100ms por consulta
- Badge visivel em 100% dos cards de agendamento futuro

---

### Etapa 5.3: Mobile App — PWA / React Native

**Objetivo:** Oferecer acesso mobile aos dados clinicos e agenda.

**Entregaveis:**
- Scaffolding do app mobile (React Native ou PWA com Vite PWA plugin)
- Modulo de autenticacao com biometria (Face ID / Touch ID)
- Lista de pacientes com busca rapida
- Visualizacao da agenda do dia/semana
- Cache offline para leitura de pacientes e agenda (SQLite / IndexedDB)

**Dependencias:** Etapa 5.2.

**Criterios de aceitacao:**
- App instalavel em Android e iOS (ou PWA instalavel)
- Autenticacao com biometria funciona em 100% dos dispositivos testados
- Dados de pacientes e agenda acessiveis offline apos primeira sincronizacao

---

### Etapa 5.4: Telemedicina Avancada

**Objetivo:** Expandir o modulo de teleodontologia para consultas de video completas.

**Entregaveis:**
- Integracao de videochamada via WebRTC (ou Twilio / Daily.co)
- Fluxo de consentimento LGPD para gravacao da consulta
- Gravacao e armazenamento seguro de sessoes de video
- Geracao de receituario / atestado digital em PDF
- Prescricao eletronica integrada ao PEP

**Dependencias:** Etapa 5.3.

**Criterios de aceitacao:**
- Consulta de video end-to-end funciona com latencia <300ms
- Gravacao armazenada criptografada com retencao configuravel
- Receituario gerado em <2s e anexado automaticamente ao prontuario do paciente
