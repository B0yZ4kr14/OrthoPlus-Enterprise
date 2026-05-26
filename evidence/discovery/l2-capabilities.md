# L2 Sub-Capabilities

## BC-001: Clinical Care

### BC-001-01: Patient Management
- **Code**: backend/src/modules/pacientes/**, apps/web/src/modules/pacientes/**
- **Entities**: OWNS Patient, CREATES PatientAddress, MANAGES PatientStatus
- **Operations**:
  - POST /api/pacientes (create patient)
  - GET /api/pacientes/:id (patient detail)
  - PUT /api/pacientes/:id (update patient)
  - PATCH /api/pacientes/:id/status (status change)
- **External**: None

### BC-001-02: Scheduling
- **Code**: backend/src/modules/agenda/**, apps/web/src/modules/agenda/**
- **Entities**: OWNS Appointment, CREATES AppointmentSlot, READS Patient
- **Operations**:
  - POST /api/agenda (create appointment)
  - GET /api/agenda (list appointments)
  - PUT /api/agenda/:id (update appointment)
  - Job: appointment-reminders (cron)
- **External**: None

### BC-001-03: Electronic Health Records (PEP)
- **Code**: backend/src/modules/pep/**, apps/web/src/modules/pep/**
- **Entities**: OWNS HealthRecord, CREATES Anamnese, CREATES Exam, OWNS Odontogram
- **Operations**:
  - POST /api/pep (create record)
  - GET /api/pep/:id (view record)
  - PUT /api/pep/:id (update record)
- **External**: None

### BC-001-04: Procedures & Treatments
- **Code**: backend/src/modules/procedimentos/**, apps/web/src/modules/procedimentos/**
- **Entities**: OWNS Procedure, MANAGES TreatmentPlan, TRACKS TreatmentStatus
- **Operations**:
  - POST /api/procedimentos (create procedure)
  - GET /api/procedimentos (list)
  - PUT /api/procedimentos/:id (update)
- **External**: None

## BC-002: Financial Management

### BC-002-01: Accounts & Transactions
- **Code**: backend/src/modules/financeiro/**, apps/web/src/modules/financeiro/**
- **Entities**: OWNS Transaction, CREATES AccountReceivable, MANAGES AccountPayable
- **Operations**:
  - POST /api/financeiro/transactions
  - GET /api/financeiro/resumo
  - GET /api/financeiro/fluxo-caixa
- **External**: None

### BC-002-02: Point of Sale (PDV)
- **Code**: backend/src/modules/pdv/**, apps/web/src/modules/pdv/**
- **Entities**: CREATES Sale, OWNS SaleItem, READS Product
- **Operations**:
  - POST /api/pdv/venda (create sale)
  - GET /api/pdv/caixa (cash register status)
- **External**: None

### BC-002-03: Contracts & Budgets
- **Code**: backend/src/modules/contratos/**, backend/src/modules/orcamentos/**
- **Entities**: OWNS Contract, CREATES Budget, TRACKS ContractStatus
- **Operations**:
  - POST /api/contratos
  - POST /api/orcamentos
  - PUT /api/contratos/:id/approve
- **External**: None

### BC-002-04: Payment Splitting
- **Code**: backend/src/modules/split_pagamento/**
- **Entities**: OWNS SplitPayment, TRACKS SplitStatus
- **Operations**:
  - POST /api/split-pagamento
  - GET /api/split-pagamento/:id
- **External**: payment gateway

### BC-002-05: Delinquency
- **Code**: backend/src/modules/inadimplencia/**
- **Entities**: TRACKS DelinquentAccount, CREATES CollectionAction
- **Operations**:
  - GET /api/inadimplencia
  - POST /api/inadimplencia/notify
- **External**: None

## BC-003: Inventory & Supply

### BC-003-01: Product Catalog
- **Code**: backend/src/modules/inventario/**, apps/web/src/modules/estoque/**
- **Entities**: OWNS Product, MANAGES Category, READS Supplier
- **Operations**:
  - CRUD /api/inventario/produtos
  - GET /api/inventario/estoque (stock levels)
- **External**: None

### BC-003-02: Stock Movement
- **Code**: backend/src/modules/inventario/**
- **Entities**: CREATES StockMovement, TRACKS StockAlert
- **Operations**:
  - POST /api/inventario/movimentacao (entry/exit)
  - GET /api/inventario/movimentacoes
- **External**: None

## BC-004: Administration & Identity

### BC-004-01: Authentication & Authorization
- **Code**: backend/src/modules/auth/**, apps/web/src/modules/auth/**
- **Entities**: OWNS UserSession, MANAGES Role, READS Clinic
- **Operations**:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/refresh
- **External**: None

### BC-004-02: Clinic Management
- **Code**: backend/src/modules/configuracoes/**, apps/web/src/modules/settings/**
- **Entities**: OWNS ClinicConfig, MANAGES ClinicSetting
- **Operations**:
  - GET /api/configuracoes
  - PUT /api/configuracoes
- **External**: None

### BC-004-03: Staff Management
- **Code**: backend/src/modules/funcionarios/**, apps/web/src/modules/funcionarios/**
- **Entities**: OWNS Employee, MANAGES EmployeeRole, TRACKS WorkSchedule
- **Operations**:
  - CRUD /api/funcionarios
  - GET /api/funcionarios/dentistas
- **External**: None

## BC-005: Marketing & CRM

### BC-005-01: Campaigns & Recalls
- **Code**: backend/src/modules/marketing/**, apps/web/src/modules/marketing-auto/**
- **Entities**: OWNS Campaign, CREATES Recall, TRACKS CampaignMetric
- **Operations**:
  - POST /api/marketing/campanhas
  - POST /api/marketing/recall
  - GET /api/marketing/metricas
- **External**: email/SMS provider

### BC-005-02: CRM & Leads
- **Code**: backend/src/modules/crm/**, apps/web/src/modules/crm/**
- **Entities**: OWNS Lead, MANAGES LeadStatus, TRACKS Conversion
- **Operations**:
  - CRUD /api/crm/leads
  - POST /api/crm/leads/:id/convert
- **External**: None

### BC-005-03: Loyalty Program
- **Code**: backend/src/modules/fidelidade/**, apps/web/src/modules/fidelidade/**
- **Entities**: OWNS LoyaltyPoint, TRACKS LoyaltyRedemption
- **Operations**:
  - GET /api/fidelidade/pontos
  - POST /api/fidelidade/resgatar
- **External**: None

## BC-006: Crypto Payments

### BC-006-01: Wallet Management
- **Code**: backend/src/modules/crypto/**, apps/web/src/modules/crypto/**
- **Entities**: OWNS Wallet, MANAGES xPub, TRACKS Balance
- **Operations**:
  - POST /api/crypto/wallet
  - GET /api/crypto/wallet/:id/balance
- **External**: Bitcoin network

### BC-006-02: Payment Processing
- **Code**: backend/src/modules/crypto/**
- **Entities**: CREATES PSBT, TRACKS PaymentStatus
- **Operations**:
  - POST /api/crypto/pagamento
  - GET /api/crypto/transacao/:id
- **External**: Bitcoin network, exchange API

## BC-007: Fiscal Compliance

### BC-007-01: Electronic Invoicing (NFe)
- **Code**: backend/src/modules/nfe/**
- **Entities**: OWNS NFeDocument, TRACKS NFeStatus
- **Operations**:
  - POST /api/nfe/emitir
  - GET /api/nfe/:id/status
- **External**: SEFAZ / government tax API

### BC-007-02: Dental Billing Standard (TISS)
- **Code**: backend/src/modules/tiss/**, apps/web/src/modules/tiss/**
- **Entities**: OWNS TISSDocument, MANAGES TISSGuideline
- **Operations**:
  - POST /api/tiss/gerar
  - GET /api/tiss/:id
- **External**: ANS / dental insurance API

## BC-008: Medical Imaging & Files

### BC-008-01: File Storage
- **Code**: backend/src/modules/files/**, apps/web/src/modules/files/**
- **Entities**: OWNS FileRecord, MANAGES FilePermission
- **Operations**:
  - POST /api/files/upload
  - GET /api/files/:id
  - DELETE /api/files/:id
- **External**: S3 / MinIO

### BC-008-02: AI Radiograph Analysis
- **Code**: backend/src/modules/ia_radiografia/**, apps/web/src/modules/ia-radiografia/**
- **Entities**: CREATES RadiographAnalysis, TRACKS AIObservation
- **Operations**:
  - POST /api/ia-radiografia/analisar
  - GET /api/ia-radiografia/:id/resultado
- **External**: Ollama / llava vision model

## BC-009: Telemedicine

### BC-009-01: Video Consultations
- **Code**: backend/src/modules/teleodonto/**, apps/web/src/modules/teleodonto/**
- **Entities**: OWNS TeleSession, MANAGES VideoRoom
- **Operations**:
  - POST /api/teleodonto/sessao
  - GET /api/teleodonto/sessao/:id/join
- **External**: WebRTC / video provider

## BC-010: Analytics & Intelligence

### BC-010-01: Business Intelligence
- **Code**: backend/src/modules/dashboard, backend/src/modules/bi, backend/src/modules/analytics
- **Entities**: READS all domain entities, CREATES DashboardWidget
- **Operations**:
  - GET /api/analytics/dashboard-overview
  - GET /api/bi/relatorios
- **External**: None

### BC-010-02: AI Agent Orchestration
- **Code**: backend/src/modules/agents, backend/src/modules/ai, agent-service/**
- **Entities**: OWNS AgentTask, TRACKS AgentExecution
- **Operations**:
  - POST /api/agents/task
  - GET /api/agents/task/:id
- **External**: OpenRouter, Google GenAI, Agno framework

## BC-011: Reporting

### BC-011-01: Report Generation
- **Code**: backend/src/modules/relatorios/**
- **Entities**: CREATES Report, TRACKS ReportSchedule
- **Operations**:
  - POST /api/relatorios/gerar
  - GET /api/relatorios/:id/download
- **External**: None
