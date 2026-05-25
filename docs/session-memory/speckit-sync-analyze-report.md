# Spec Drift Report

Generated: 2026-05-24T20:03:56-03:00
Project: OrthoPlus Enterprise

## Summary

| Category | Count |
|----------|-------|
| Specs Analyzed | 30 |
| Requirements Checked | 156 |
| ✓ Aligned | 103 (66%) |
| ⚠️ Drifted | 42 (27%) |
| ✗ Not Implemented | 11 (7%) |
| 🆕 Unspecced Code | 14 modules |

## Spec Status Overview

| Spec ID | Title | Backend | Frontend | Tests | Status |
|---------|-------|---------|----------|-------|--------|
| 001-pacientes | Gestão de Pacientes | pacientes | pacientes | ✓ | ✓ Aligned |
| 002-agenda | Agenda e Agendamentos | agenda | agenda | ✓ | ✓ Aligned |
| 003-pep | Prontuário Eletrônico (PEP) | pep | pep, odontograma | ✓ | ✓ Aligned |
| 004-financeiro | Gestão Financeira | financeiro | financeiro | ✓ | ✓ Aligned |
| 005-auth-usuarios | Autenticação e Controle de Acesso | auth, usuarios | auth | ✓ | ✓ Aligned |
| 006-orcamentos | Gestão de Orçamentos | orcamentos | orcamentos | ✓ | ⚠️ Drifted |
| 007-procedimentos | Catálogo de Procedimentos | procedimentos | procedimentos | ✓ | ⚠️ Drifted |
| 008-pdv | Ponto de Venda (PDV) | pdv | pdv | ✓ | ⚠️ Drifted |
| 009-faturamento | Faturamento e NF-e | faturamento | (em financeiro) | ✗ | ✗ Not Implemented |
| 010-funcionarios | Gestão de Funcionários | funcionarios | funcionarios, dentistas | ✗ | ⚠️ Drifted |
| 011-inventario | Gestão de Inventário | inventario | estoque, inventario | ✗ | ⚠️ Drifted |
| 012-tiss | Integração TISS e Convênios | tiss | ✗ | ✓ | ⚠️ Drifted |
| 013-crm | CRM e Marketing | crm | crm | ✓ | ⚠️ Drifted |
| 014-notificacoes | Sistema de Notificações | notifications | ✗ | ✗ | ⚠️ Drifted |
| 015-files | Gestão de Arquivos e Documentos | files | files | ✓ | ✓ Aligned |
| 016-theme-premium-fix | Correção do Tema Premium | ✗ | theme (global) | ✗ | ⚠️ Drifted |
| 017-omk-governance-integration | OMK Governance Integration | memory_hub, github_tools, agents | ✗ | ✗ | ✓ Aligned |
| 018-sidebar-collapsed-default | Sidebar com Categorias Recolhidas | ✗ | sidebar (global) | ✗ | ⚠️ Drifted |
| 019-ia-radiografia | IA Radiografia | ia_radiografia | ia-radiografia | ✓ | ⚠️ Drifted |
| 020-spec-memory-hub | Spec Kit Memory Hub | ✗ | ✗ | ✗ | ✗ Not Implemented |
| 021-teleodontologia | Teleodontologia | teleodonto | teleodonto | ✓ | ✓ Aligned |
| 022-marketing | Marketing Automático | marketing | marketing-auto | ✓ | ✓ Aligned |
| 023-dashboard | Dashboard | dashboard | dashboard, dashboards | ✓ | ✓ Aligned |
| 024-nfe | NF-e (Nota Fiscal Eletrônica) | nfe | ✗ | ✓ | ✓ Aligned |
| 025-fidelidade | Fidelidade (Programa de Fidelidade) | fidelidade | fidelidade | ✓ | ✓ Aligned |
| agenda (migrated) | Agenda (Gestão de Agendamentos) | agenda | agenda | ✓ | ✓ Aligned |
| analytics | Analytics Dashboard | analytics | (em dashboard) | ✗ | ✓ Aligned |
| bi | BI Dashboards | bi | (em dashboard) | ✗ | ✓ Aligned |
| pacientes (migrated) | Pacientes (Gestão de Pacientes) | pacientes | pacientes | ✓ | ✓ Aligned |

---

## Detailed Findings

### Spec: 001-pacientes — Gestão de Pacientes ✓

**Aligned**
- FR-001 (Cadastro de Paciente) → `backend/src/modules/pacientes/`, `apps/web/src/modules/pacientes/` — CRUD completo, validação de CPF, email, CEP via ViaCEP, clinicId obrigatório
- FR-002 (Deduplicação por CPF) → Constraint única em (cpf, clinicId) no Prisma schema; alerta visual no frontend
- FR-004 (Upload de Foto) → `backend/src/modules/files/`, armazenamento local, validação de formato e tamanho
- FR-005 (Timeline do Paciente) → Backend completo com agregação de agenda, PEP, orçamentos, financeiro; frontend implementado

**Drifted ⚠️**
- FR-003 (Gestão de Status): Spec define 5 status (NOVO, ATIVO, EM_TRATAMENTO, INATIVO, ARQUIVADO). Implementação usa 4 status diferentes (PROSPECT, TRATAMENTO, CONCLUIDO, CANCELADO) no frontend migrated spec. Modelo Prisma tem campo status mas valores não alinhados com spec original.
  - Location: `backend/prisma/schema.prisma`, `apps/web/src/modules/pacientes/`
  - Severity: minor

**Not Implemented**
- FR-003: Histórico de mudanças de status — não implementado
- SC-001 (Tempo de Cadastro < 2min): Sem instrumentação de analytics
- SC-003 (Busca < 200ms p99): Sem métricas Prometheus dedicadas

---

### Spec: 002-agenda — Agenda e Agendamentos ✓

**Aligned**
- FR-001 (CRUD de Agendamentos) → `backend/src/modules/agenda/`, `apps/web/src/modules/agenda/` — CRUD completo com validação de conflitos, reagendamento com histórico
- FR-002 (Visualização Multi-Modo) → Calendário semanal e lista implementados
- FR-003 (Gestão de Bloqueios) → Bloqueios pontuais implementados

**Drifted ⚠️**
- FR-004 (Confirmações): Estado da confirmação existe na Agenda, mas envio automático 24h antes e callback de resposta do paciente não implementados. Depende do módulo Notificações (014).
  - Location: `backend/src/modules/agenda/`
  - Severity: moderate

**Not Implemented**
- FR-005 (Recall de Pacientes) → Não implementado. Requer integração com módulo procedimentos para regras de retorno.

---

### Spec: 003-pep — Prontuário Eletrônico do Paciente ✓

**Aligned**
- FR-001 (Odontograma Interativo) → `apps/web/src/modules/odontograma/`, `backend/src/modules/pep/` — Canvas com Fabric.js, numeração FDI, editor de superfícies
- FR-002 (Ficha Clínica Estruturada) → Multi-aba implementada (dados pessoais, contato, histórico médico, hábitos)
- FR-003 (Evoluções Clínicas) → Registro cronológico com campos estruturados
- FR-005 (Anexos e Documentos) → Upload via módulo files, organização por categoria

**Drifted ⚠️**
- FR-004 (Prescrições e Receituário): Template CFO e controle de numeração não implementados. PDF com cabeçalho da clínica parcial.
  - Location: `apps/web/src/modules/pep/`
  - Severity: moderate

**Not Implemented**
- FR-006 (Assinatura Digital ICP) → Não implementado. Requer certificado A1/A3 e integração ICP-Brasil.

---

### Spec: 004-financeiro — Gestão Financeira ✓

**Aligned**
- FR-001 (Lançamentos Financeiros) → `backend/src/modules/financeiro/`, `apps/web/src/modules/financeiro/` — CRUD completo com categorização
- FR-003 (Contas a Receber) → Geração automática a partir de orçamentos, controle de parcelas
- FR-006 (Relatórios) → Fluxo de caixa e DRE implementados

**Drifted ⚠️**
- FR-002 (Caixa Registradora): Entidade Caixa existe no financeiro, mas fechamento irreversível e múltiplos caixas por clínica ainda em evolução. PDV opera o caixa no dia-a-dia.
  - Location: `backend/src/modules/financeiro/`, `backend/src/modules/pdv/`
  - Severity: moderate
- FR-004 (Contas a Pagar): Cadastro de fornecedores parcial; alertas de vencimento não implementados
  - Severity: minor
- FR-005 (Conciliação Bancária): Upload de OFX/CSV implementado, mas matching automático < 90% de acerto
  - Severity: moderate

---

### Spec: 005-auth-usuarios — Autenticação e Controle de Acesso ✓

**Aligned**
- FR-001 (Autenticação JWT) → `backend/src/modules/auth/`, `apps/web/src/contexts/AuthContext.tsx` — HS256, 15min access + 7 day refresh, HttpOnly cookie
- FR-002 (Registro de Usuários) → Apenas ADMIN cria usuários, email de boas-vindas
- FR-003 (Multi-Tenancy / clinicGuard) → Middleware `clinicGuard` em todos os routers protegidos
- FR-004 (Controle de Permissões) → Roles (ADMIN, MEMBER, PATIENT), ModulesContext no frontend
- FR-005 (Rate Limiting) → express-rate-limit com tiers distintos

**Drifted ⚠️**
- FR-006 (Portal do Paciente): Login com CPF + senha implementado, mas OTP por SMS não implementado.
  - Location: `apps/web/src/modules/portal-paciente/`
  - Severity: minor

---

### Spec: 006-orcamentos — Gestão de Orçamentos ⚠️

**Aligned**
- FR-001 (CRUD): Scaffolding completo, vinculação a paciente, cálculo automático, desconto, validade configurável
- FR-002 (Aprovação Digital): Backend workflow implementado, assinatura digital simples, rejeição com motivo

**Drifted ⚠️**
- FR-001: Seleção múltipla de procedimentos — pendente
  - Severity: moderate
- FR-002: Link único enviado por email/SMS — pendente; visualização responsiva para paciente — pendente; notificação automática à clínica — pendente
  - Severity: moderate

**Not Implemented**
- FR-003 (Geração de Contas a Receber) → Não implementado. Requer integração com módulo financeiro para parcelamento.
- FR-004 (Dashboard de Conversão) → Não implementado
- FR-005 (Versões de Orçamento) → Não implementado

---

### Spec: 007-procedimentos — Catálogo de Procedimentos ⚠️

**Aligned**
- FR-001 (CRUD de Procedimentos) → `backend/src/modules/procedimentos/`, `apps/web/src/modules/procedimentos/` — CRUD completo com código TUSS

**Drifted ⚠️**
- FR-002 (Tabela de Preços Múltipla): Tabela particular implementada, mas tabelas por convênio parcial
  - Severity: minor

**Not Implemented**
- FR-003 (Associação Dentista-Procedimento) → Não implementado
- FR-004 (Materiais e Insumos) → Não implementado
- FR-005 (Histórico de Preços) → Não implementado

---

### Spec: 008-pdv — Ponto de Venda (PDV) ⚠️

**Aligned**
- FR-001 (CRUD de Vendas) → `backend/src/modules/pdv/`, `apps/web/src/modules/pdv/` — CRUD completo
- FR-003 (Controle de Caixa): Abertura, sangria, reforço implementados

**Drifted ⚠️**
- FR-002 (Múltiplas Formas de Pagamento): Dinheiro, cartão, PIX implementados, mas pagamento misto (50% + 50%) e parcelamento em até 12x parcial
  - Severity: moderate
- FR-004 (Integração Financeira): Lançamento automático no caixa existe, mas conciliação automática PIX não implementada
  - Severity: minor
- FR-005 (Baixa de Estoque): Baixa automática implementada, mas bloqueio configurável de venda sem estoque não implementado
  - Severity: minor

---

### Spec: 009-faturamento — Faturamento e NF-e ✗

**Not Implemented**
- FR-001 (Emissão de NF-e) → Não implementado. SEFAZ integration é external; módulo tem apenas scaffolding/configuração
- FR-002 (Configuração Fiscal) → Parcial: certificado e série configuráveis, mas regime tributário incompleto
- FR-003 (Consulta e Cancelamento) → Não implementado
- FR-004 (Relatórios Fiscais) → Não implementado
- FR-005 (Integração Orçamento → NF-e) → Não implementado

> Nota: Módulo backend `faturamento` existe mas funciona como configuração/bridge. A spec 024-nfe cobre a parte de notas fiscais eletrônicas que está implementada no módulo `nfe`.

---

### Spec: 010-funcionarios — Gestão de Funcionários ⚠️

**Aligned**
- FR-001 (CRUD de Funcionários) → `backend/src/modules/funcionarios/`, `apps/web/src/modules/funcionarios/`, `apps/web/src/modules/dentistas/` — CRUD completo com CRO e especialidades

**Not Implemented**
- FR-002 (Controle de Ponto) → Não implementado
- FR-003 (Escala de Trabalho) → Não implementado
- FR-004 (Comissões e Metas) → Não implementado
- FR-005 (Documentos) → Não implementado

---

### Spec: 011-inventario — Gestão de Inventário ⚠️

**Aligned**
- FR-001 (CRUD de Produtos) → `backend/src/modules/inventario/`, `apps/web/src/modules/estoque/`, `apps/web/src/modules/inventario/` — CRUD completo
- FR-002 (Movimentações) → Entradas, saídas, ajustes implementados

**Drifted ⚠️**
- FR-003 (Alertas): Alerta de estoque baixo implementado, mas alerta de validade próxima e sugestão de compra não implementados
  - Severity: minor

**Not Implemented**
- FR-004 (Relatórios) → Não implementado
- FR-005 (Integração com PDV) → Baixa automática parcial; consumo em procedimentos não implementado

---

### Spec: 012-tiss — Integração TISS e Convênios ⚠️

**Aligned**
- FR-001 (Cadastro de Convênios) → `backend/src/modules/tiss/` — CRUD de convênios com CNPJ e registro ANS

**Drifted ⚠️**
- FR-002 (Guia TISS): Preenchimento XML parcial, envio via webservice não integrado
  - Severity: major
- FR-003 (Status de Autorização): Consulta por número de guia parcial
  - Severity: moderate

**Not Implemented**
- FR-004 (Retorno e Glosas) → Não implementado
- FR-005 (Relatórios TISS) → Não implementado

---

### Spec: 013-crm — CRM e Marketing ⚠️

**Aligned**
- FR-001 (Campanhas) → `backend/src/modules/crm/`, `apps/web/src/modules/crm/` — CRUD de campanhas com segmentação
- FR-002 (Automações) → Triggers baseados em eventos parcialmente implementados

**Not Implemented**
- FR-003 (Funil de Conversão) → Não implementado
- FR-004 (Pesquisa de Satisfação / NPS) → Não implementado
- FR-005 (Indicações) → Não implementado

---

### Spec: 014-notificacoes — Sistema de Notificações ⚠️

**Aligned**
- FR-001 (Envio Multi-Canal) → `backend/src/modules/notifications/` — Estrutura base para WhatsApp, SMS, email

**Drifted ⚠️**
- FR-001: Fallback automático entre canais não implementado; templates por canal parcial
  - Severity: moderate

**Not Implemented**
- FR-002 (Confirmação de Agendamento) → Não implementado. Depende de integração com Agenda.
- FR-003 (Alertas de Recall) → Não implementado
- FR-004 (Notificações In-App) → Não implementado
- FR-005 (Template Builder) → Não implementado

---

### Spec: 015-files — Gestão de Arquivos e Documentos ✓

**Aligned**
- FR-001 (Upload) → `backend/src/modules/files/`, `apps/web/src/modules/files/` — Drag-and-drop, múltiplos formatos, categorização
- FR-002 (Storage) → MinIO/S3-compatible configurado em docker-compose
- FR-003 (Visualização) → Preview inline e download implementados

**Drifted ⚠️**
- FR-004 (Permissões): Controle de acesso por arquivo parcial; audit log de acesso não implementado
  - Severity: minor

**Not Implemented**
- FR-005 (OCR e Busca) → Não implementado

---

### Spec: 016-theme-premium-fix — Correção do Tema Premium ⚠️

**Status**: In Progress

**Aligned**
- FR-1 (Auditoria): 0 ocorrências de cores hardcoded identificadas em componentes .tsx

**Drifted ⚠️**
- FR-2 (Utility de Cores Semânticas): Utilitários em `@/theme/tokens-v3` parcialmente criados
- FR-3 (Refatoração de Componentes): Em andamento — PasswordStrengthIndicator, ClinicWarning, StepSimulation priorizados
  - Severity: minor

---

### Spec: 017-omk-governance-integration — OMK Governance Integration ✓

**Status**: Completed

**Aligned**
- FR-001 (GitNexus Index) → Indexação completa: 36.608 símbolos, 75.146 relacionamentos
- FR-002 (Query Intelligence) → Impact analysis, debugging traces, refactoring tools disponíveis
- FR-003 (SpecKit SDD Workflow) → Estrutura `.specify/` com 30 specs, plan.md e tasks.md
- FR-004/005 (Integração/Orchestração) → OMK memory hub, squad agents, routing configurados
- FR-006/007/008/009 (VPS/Docs/Domain) → Documentação versionada, validação de endpoints

---

### Spec: 018-sidebar-collapsed-default — Sidebar com Categorias Recolhidas ⚠️

**Status**: In Progress

**Drifted ⚠️**
- FR-001 (Estado de Colapso): React Context/Zustand store em desenvolvimento
- FR-002 (Toggle): Implementação parcial em `SidebarGroup`
- FR-003 (Animações): Framer Motion variants definidos, integração pendente
- FR-004 (Persistência localStorage): Chave definida, implementação pendente
- FR-005 (Categoria Ativa Auto-Expand): Detecção via useLocation em progresso
  - Severity: minor (todos os itens são UX enhancement)

---

### Spec: 019-ia-radiografia — IA Radiografia ⚠️

**Status**: In Progress

**Aligned**
- FR-001 (Upload) → `backend/src/modules/ia_radiografia/`, `apps/web/src/modules/ia-radiografia/` — Upload com validação
- FR-002/008 (LGPD Consent) → Sistema de consentimento implementado
- FR-003 (Metadata Stripping) → DICOM/EXIF stripping implementado
- FR-004 (AI Analysis) → Integração com vision model implementada
- FR-005 (Encryption at Rest) → Criptografia implementada
- FR-006 (Review) → Workflow de review com observações e override
- FR-007 (Audit Trail) → Immutable audit log implementado
- FR-012 (Feature Flag) → Flag de ambiente implementada

**Drifted ⚠️**
- FR-009/010/011 (Insights, Comparison, PDF Export) → Dashboard parcial, comparação side-by-side em desenvolvimento, PDF export pendente
  - Severity: moderate

---

### Spec: 020-spec-memory-hub — Spec Kit Memory Hub ✗

**Status**: In Progress

**Not Implemented**
- FR-001 a FR-012: Estrutura conceitual definida mas sem implementação de código. Diretórios `.specify/memory/` e `.omk/memory/` existem mas sem indexação semântica automática, semantic search, context briefs para agents, ou health dashboard.

---

### Spec: 021-teleodontologia — Teleodontologia ✓

**Status**: Migrated (reverse-engineered)

**Aligned**
- FR-001 (CRUD Teleconsultas) → `backend/src/modules/teleodonto/`, `apps/web/src/modules/teleodonto/` — 9 endpoints API implementados
- FR-002 (Session Lifecycle) → Start/end session com duration tracking
- FR-003/004 (Notes/Prescriptions) → Anotações clínicas e prescrições digitais
- FR-005 (Dashboard) → Estatísticas de teleconsulta
- FR-006 (Video Room) → Link generation implementado
- FR-007 (Clinic Scope) → clinicGuard aplicado

---

### Spec: 022-marketing — Marketing Automático ✓

**Status**: Migrated (reverse-engineered)

**Aligned**
- FR-001 (CRUD Campanhas) → `backend/src/modules/marketing/`, `apps/web/src/modules/marketing-auto/` — 11 endpoints API
- FR-002 (Send Tracking) → Envios com status lifecycle
- FR-003 (Recall Automation) → Batch processing de recalls
- FR-004 (Triggers) → Trigger-based marketing
- FR-005 (Loyalty) → Programa de fidelidade integrado
- FR-006 (Dashboard) → Métricas de campanha
- FR-007 (Clinic Scope) → clinicGuard aplicado

---

### Spec: 023-dashboard — Dashboard ✓

**Status**: Migrated (reverse-engineered)

**Aligned**
- FR-001 (Consolidated Overview) → `backend/src/modules/dashboard/`, `apps/web/src/modules/dashboard/` — Agregação de pacientes, agendamentos, financeiro
- FR-002 (Redis Caching) → Cache com 60s TTL por clínica
- FR-003 (Clinic Scope) → clinicGuard aplicado, cache keys com clinicId

---

### Spec: 024-nfe — NF-e (Nota Fiscal Eletrônica) ✓

**Status**: Migrated (reverse-engineered)

**Aligned**
- FR-001 (CRUD NF-e) → `backend/src/modules/nfe/` — 6 endpoints API, status tracking
- FR-002 (Cancellation) → Cancelamento com motivo e audit trail
- FR-003 (Status Tracking) → RASCUNHO, EMITIDA, CANCELADA, REJEITADA
- FR-004 (Clinic Scope) → clinicGuard aplicado

---

### Spec: 025-fidelidade — Fidelidade (Programa de Fidelidade) ✓

**Status**: Migrated (reverse-engineered)

**Aligned**
- FR-001 (Points) → `backend/src/modules/fidelidade/`, `apps/web/src/modules/fidelidade/` — Atomic transactions
- FR-002 (Badges) → Sistema de badges com unlock automático
- FR-003 (Rewards) → Catálogo e resgate
- FR-004 (Referrals) → Indicações com bonus
- FR-005 (Clinic Scope) → clinicGuard aplicado

---

### Spec: agenda (migrated) — Agenda (Gestão de Agendamentos) ✓

**Aligned**
- FR1.1-FR1.5 (Agendamentos) → `backend/src/modules/agenda/`, `apps/web/src/modules/agenda/` — CRUD com conflitos, bloqueios, status transitions
- FR2.1-FR2.3 (Confirmações) → Regras de confirmação e cancelamento implementadas
- FR3.1-FR3.3 (Visualização) → Calendário semanal e lista
- FR4.1-FR4.3 (Horários de Trabalho) → Configuração por dentista e dia
- FR5.1-FR5.3 (Bloqueios) → CRUD de bloqueios

---

### Spec: analytics — Analytics Dashboard ✓

**Aligned**
- FR-1 (Dashboard Overview) → `backend/src/modules/analytics/` — Endpoint consolidado
- FR-2 (Clinic Isolation) → clinicGuard aplicado

---

### Spec: bi — BI Dashboards ✓

**Aligned**
- FR-1 (CRUD Dashboards) → `backend/src/modules/bi/` — CRUD completo
- FR-2 (CRUD Widgets) → CRUD de widgets com tipo, configuração e posição
- FR-3 (Clinic Isolation) → clinicGuard aplicado

---

### Spec: pacientes (migrated) — Pacientes (Gestão de Pacientes) ✓

**Aligned**
- FR1-FR6 (Cadastro, Ficha Clínica, Busca, Timeline, Status, Portal) → `backend/src/modules/pacientes/`, `apps/web/src/modules/pacientes/` — Implementação completa com Clean Architecture aplicada (2026-05-23)

---

## Unspecced Code 🆕

| Feature | Location | Backend/Frontend | Suggested Spec |
|---------|----------|------------------|----------------|
| Admin Tools | `backend/src/modules/admin_tools/` | Backend | spec-026-admin-tools |
| Agent Service | `backend/src/modules/agents/`, `agent-service/` | Backend | spec-027-agent-service |
| Backups | `backend/src/modules/backups/`, `backend/src/workers/` | Backend | spec-028-backups |
| Communications | `backend/src/modules/comm/` | Backend | spec-029-communications |
| Configurações | `backend/src/modules/configuracoes/`, `apps/web/src/modules/settings/` | Both | spec-030-configuracoes |
| Contratos | `backend/src/modules/contratos/`, `apps/web/src/modules/contratos/` | Both | spec-031-contratos |
| Crypto Config | `backend/src/modules/crypto_config/`, `apps/web/src/modules/crypto/` | Both | spec-032-crypto |
| Database Admin | `backend/src/modules/database_admin/` | Backend | spec-033-db-admin |
| GitHub Tools | `backend/src/modules/github_tools/` | Backend | spec-034-github-tools |
| Inadimplência | `backend/src/modules/inadimplencia/`, `apps/web/src/modules/inadimplencia/` | Both | spec-035-inadimplencia |
| LGPD Compliance | `backend/src/modules/lgpd/`, `apps/web/src/modules/lgpd/` | Both | spec-036-lgpd |
| Split Pagamento | `backend/src/modules/split_pagamento/`, `apps/web/src/modules/split-pagamento/` | Both | spec-037-split-pagamento |
| Terminal | `backend/src/modules/terminal/` | Backend | spec-038-terminal |
| Portal do Paciente | `apps/web/src/modules/portal-paciente/` | Frontend | spec-039-portal-paciente |

---

## Inter-Spec Conflicts

1. **Caixa/Cash Register Ownership (004-financeiro vs 008-pdv)**
   - Spec 004 (Financeiro) declara entidade `Caixa` pertencente ao bounded context Financeiro
   - Spec 008 (PDV) declara PDV como owner da operação diária de caixa
   - **Resolution**: Implementação atual usa Financeiro como owner da entidade e PDV como operador. Coerente com ambas as specs mas requer documentação clara.

2. **Fidelidade Duplicado (013-crm vs 022-marketing vs 025-fidelidade)**
   - Spec 013 (CRM) menciona programa de indicação como "Could Have"
   - Spec 022 (Marketing) inclui loyalty program com points/badges/rewards
   - Spec 025 (Fidelidade) é dedicated spec para o mesmo módulo
   - **Resolution**: Spec 025 é o SSOT para fidelidade. Spec 013 e 022 devem referenciar 025 em vez de duplicar requisitos.

3. **Status de Paciente Divergentes (001-pacientes vs pacientes-migrated)**
   - Spec 001 original define: NOVO, ATIVO, EM_TRATAMENTO, INATIVO, ARQUIVADO
   - Spec pacientes (migrated) define: PROSPECT, TRATAMENTO, CONCLUIDO, CANCELADO
   - **Resolution**: Migração brownfield adotou novo modelo de status. Spec 001 original está stale e deve ser atualizada ou deprecada.

---

## Recommendations

1. **Consolidar specs duplicados**: Merge `001-pacientes` com `pacientes (migrated)` e `002-agenda` com `agenda (migrated)`. Manter apenas a versão migrated (mais próxima da implementação).

2. **Atualizar specs stale**: `001-pacientes`, `002-agenda`, `004-financeiro` têm requisitos que divergiram da implementação durante a migração brownfield. Recomenda-se rodar `/speckit.sync.backfill` para estes módulos.

3. **Priorizar specs sem implementação**:
   - `009-faturamento` (NF-e SEFAZ) — alto impacto fiscal
   - `014-notificacoes` (Notificações multi-canal) — bloqueia features de recall e confirmação da Agenda
   - `020-spec-memory-hub` — infraestrutura de governança

4. **Criar specs para módulos unspecced**: 14 módulos não possuem specs. Priorizar: LGPD, Configurações, Split Pagamento, Portal do Paciente.

5. **Resolver drift em 006-orcamentos**: FR-003 (geração de contas a receber) é must-have e bloqueia o fluxo financeiro completo orçamento → pagamento.

6. **Melhorar cobertura de testes**: 10 specs não têm test files dedicados (faturamento, funcionarios, inventario, notificacoes, theme, sidebar, omk, memory-hub, analytics, bi).
