# Domain Model — OrthoPlus Enterprise

## BC-001: Clinical Care                           4 L2s
─────────────────────────────────────────────────────────────────
Core patient care operations including registration, appointments, procedures, electronic health records (PEP), odontogram, and treatment planning.

### L2 Operations:
- **BC-001-01: Patient Management**
  - Code: backend/src/modules/pacientes/**
  - Entities: OWNS Patient, CREATES PatientAddress, MANAGES PatientStatus
  - Operations: POST /api/pacientes, GET /api/pacientes/:id, PUT /api/pacientes/:id
  - External: None

- **BC-001-02: Scheduling**
  - Code: backend/src/modules/agenda/**
  - Entities: OWNS Appointment, CREATES AppointmentSlot, READS Patient
  - Operations: POST /api/agenda, GET /api/agenda, Job: appointment-reminders
  - External: None

- **BC-001-03: Electronic Health Records (PEP)**
  - Code: backend/src/modules/pep/**
  - Entities: OWNS HealthRecord, CREATES Anamnese, CREATES Exam, OWNS Odontogram
  - Operations: POST /api/pep, GET /api/pep/:id, PUT /api/pep/:id
  - External: None

- **BC-001-04: Procedures & Treatments**
  - Code: backend/src/modules/procedimentos/**
  - Entities: OWNS Procedure, MANAGES TreatmentPlan, TRACKS TreatmentStatus
  - Operations: POST /api/procedimentos, GET /api/procedimentos
  - External: None

**Security Context:**
- Data Sensitivity: PII, health
- Auth Required: Yes (JWT + clinicGuard)
- Exposure: Internal
- Criticality: High (health data)

**QA Context:**
- Coverage: unit ~45% · integration ~15% · e2e ~20% [source: proxy]
- Automation: regression partial · smoke partial · contract absent
- Testability: good (0 blocks, 0 impedes)
- Defect Profile: not-collected
- Environments: covers dev, prod · missing staging
- Strategy Gaps: no contract tests for FHIR compatibility

**Cross-Capability Dependencies:**
→ BC-002 Financial Management (billing from appointments)
→ BC-004 Administration & Identity (user/clinic context)
→ BC-005 Marketing & CRM (patient recalls)

---

## BC-002: Financial Management                    5 L2s
─────────────────────────────────────────────────────────────────
Billing, accounts receivable/payable, payment processing, contracts, budgets, and delinquency tracking.

### L2 Operations:
- **BC-002-01: Accounts & Transactions**
  - Code: backend/src/modules/financeiro/**
  - Entities: OWNS Transaction, CREATES AccountReceivable, MANAGES AccountPayable
  - Operations: POST /api/financeiro/transactions, GET /api/financeiro/resumo
  - External: None

- **BC-002-02: Point of Sale (PDV)**
  - Code: backend/src/modules/pdv/**
  - Entities: CREATES Sale, OWNS SaleItem, READS Product
  - Operations: POST /api/pdv/venda, GET /api/pdv/caixa
  - External: None

- **BC-002-03: Contracts & Budgets**
  - Code: backend/src/modules/contratos, backend/src/modules/orcamentos
  - Entities: OWNS Contract, CREATES Budget, TRACKS ContractStatus
  - Operations: POST /api/contratos, POST /api/orcamentos
  - External: None

- **BC-002-04: Payment Splitting**
  - Code: backend/src/modules/split_pagamento
  - Entities: OWNS SplitPayment, TRACKS SplitStatus
  - Operations: POST /api/split-pagamento
  - External: payment gateway

- **BC-002-05: Delinquency**
  - Code: backend/src/modules/inadimplencia
  - Entities: TRACKS DelinquentAccount, CREATES CollectionAction
  - Operations: GET /api/inadimplencia, POST /api/inadimplencia/notify
  - External: None

**Security Context:**
- Data Sensitivity: PII, financial
- Auth Required: Yes (JWT + clinicGuard)
- Exposure: Internal
- Criticality: High (financial data)

**QA Context:**
- Coverage: unit ~40% · integration ~10% · e2e ~15% [source: proxy]
- Automation: regression partial · smoke partial · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no contract tests for payment gateway integration

**Cross-Capability Dependencies:**
→ BC-001 Clinical Care (patient link for billing)
→ BC-003 Inventory & Supply (products for PDV)
→ BC-006 Crypto Payments (alternative payment method)

---

## BC-003: Inventory & Supply                      2 L2s
─────────────────────────────────────────────────────────────────
Product catalog, stock control, movements, suppliers, categories, and inventory alerts.

### L2 Operations:
- **BC-003-01: Product Catalog**
  - Code: backend/src/modules/inventario/**
  - Entities: OWNS Product, MANAGES Category, READS Supplier
  - Operations: CRUD /api/inventario/produtos, GET /api/inventario/estoque
  - External: None

- **BC-003-02: Stock Movement**
  - Code: backend/src/modules/inventario/**
  - Entities: CREATES StockMovement, TRACKS StockAlert
  - Operations: POST /api/inventario/movimentacao, GET /api/inventario/movimentacoes
  - External: None

**Security Context:**
- Data Sensitivity: None
- Auth Required: Yes
- Exposure: Internal
- Criticality: Low

**QA Context:**
- Coverage: unit ~35% · integration ~8% · e2e ~10% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no integration tests for stock alerts

**Cross-Capability Dependencies:**
→ BC-002 Financial Management (PDV uses products)

---

## BC-004: Administration & Identity               3 L2s
─────────────────────────────────────────────────────────────────
User and clinic management, role-based access control, system settings, and staff records.

### L2 Operations:
- **BC-004-01: Authentication & Authorization**
  - Code: backend/src/modules/auth/**
  - Entities: OWNS UserSession, MANAGES Role, READS Clinic
  - Operations: POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh
  - External: None

- **BC-004-02: Clinic Management**
  - Code: backend/src/modules/configuracoes/**
  - Entities: OWNS ClinicConfig, MANAGES ClinicSetting
  - Operations: GET /api/configuracoes, PUT /api/configuracoes
  - External: None

- **BC-004-03: Staff Management**
  - Code: backend/src/modules/funcionarios/**
  - Entities: OWNS Employee, MANAGES EmployeeRole, TRACKS WorkSchedule
  - Operations: CRUD /api/funcionarios, GET /api/funcionarios/dentistas
  - External: None

**Security Context:**
- Data Sensitivity: PII, authentication
- Auth Required: Yes (self-governing)
- Exposure: Internal
- Criticality: High (auth gateway)

**QA Context:**
- Coverage: unit ~55% · integration ~20% · e2e ~25% [source: proxy]
- Automation: regression partial · smoke partial · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no penetration tests for auth endpoints

**Cross-Capability Dependencies:**
→ All capabilities (provides auth context)

---

## BC-005: Marketing & CRM                         3 L2s
─────────────────────────────────────────────────────────────────
Campaign management, patient recalls, loyalty programs, lead tracking, and conversion analytics.

### L2 Operations:
- **BC-005-01: Campaigns & Recalls**
  - Code: backend/src/modules/marketing/**
  - Entities: OWNS Campaign, CREATES Recall, TRACKS CampaignMetric
  - Operations: POST /api/marketing/campanhas, POST /api/marketing/recall
  - External: email/SMS provider

- **BC-005-02: CRM & Leads**
  - Code: backend/src/modules/crm/**
  - Entities: OWNS Lead, MANAGES LeadStatus, TRACKS Conversion
  - Operations: CRUD /api/crm/leads, POST /api/crm/leads/:id/convert
  - External: None

- **BC-005-03: Loyalty Program**
  - Code: backend/src/modules/fidelidade/**
  - Entities: OWNS LoyaltyPoint, TRACKS LoyaltyRedemption
  - Operations: GET /api/fidelidade/pontos, POST /api/fidelidade/resgatar
  - External: None

**Security Context:**
- Data Sensitivity: PII
- Auth Required: Yes
- Exposure: Internal
- Criticality: Medium

**QA Context:**
- Coverage: unit ~30% · integration ~5% · e2e ~8% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no contract tests for email/SMS provider

**Cross-Capability Dependencies:**
→ BC-001 Clinical Care (patient data for recalls)

---

## BC-006: Crypto Payments                         2 L2s
─────────────────────────────────────────────────────────────────
Bitcoin payment acceptance, wallet management, xPub derivation, PSBT creation, and exchange integration.

### L2 Operations:
- **BC-006-01: Wallet Management**
  - Code: backend/src/modules/crypto/**
  - Entities: OWNS Wallet, MANAGES xPub, TRACKS Balance
  - Operations: POST /api/crypto/wallet, GET /api/crypto/wallet/:id/balance
  - External: Bitcoin network

- **BC-006-02: Payment Processing**
  - Code: backend/src/modules/crypto/**
  - Entities: CREATES PSBT, TRACKS PaymentStatus
  - Operations: POST /api/crypto/pagamento, GET /api/crypto/transacao/:id
  - External: Bitcoin network, exchange API

**Security Context:**
- Data Sensitivity: financial, authentication (private keys)
- Auth Required: Yes
- Exposure: Internal (key management internal)
- Criticality: High (financial + key custody)

**QA Context:**
- Coverage: unit ~25% · integration ~5% · e2e ~5% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no integration tests against testnet

**Cross-Capability Dependencies:**
→ BC-002 Financial Management (alternative payment)

---

## BC-007: Fiscal Compliance                       2 L2s
─────────────────────────────────────────────────────────────────
Electronic invoicing (NFe), dental billing standard (TISS), and tax document generation.

### L2 Operations:
- **BC-007-01: Electronic Invoicing (NFe)**
  - Code: backend/src/modules/nfe/**
  - Entities: OWNS NFeDocument, TRACKS NFeStatus
  - Operations: POST /api/nfe/emitir, GET /api/nfe/:id/status
  - External: SEFAZ / government tax API

- **BC-007-02: Dental Billing Standard (TISS)**
  - Code: backend/src/modules/tiss/**
  - Entities: OWNS TISSDocument, MANAGES TISSGuideline
  - Operations: POST /api/tiss/gerar, GET /api/tiss/:id
  - External: ANS / dental insurance API

**Security Context:**
- Data Sensitivity: PII, financial
- Auth Required: Yes
- Exposure: Internal (calls external gov APIs)
- Criticality: High (regulatory compliance)

**QA Context:**
- Coverage: unit ~30% · integration ~5% · e2e ~5% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no mock tests for SEFAZ/ANS APIs

**Cross-Capability Dependencies:**
→ BC-002 Financial Management (invoices generate NFe/TISS)

---

## BC-008: Medical Imaging & Files                 2 L2s
─────────────────────────────────────────────────────────────────
File uploads, medical image storage (radiographs), document management, and AI-assisted radiograph analysis.

### L2 Operations:
- **BC-008-01: File Storage**
  - Code: backend/src/modules/files/**
  - Entities: OWNS FileRecord, MANAGES FilePermission
  - Operations: POST /api/files/upload, GET /api/files/:id, DELETE /api/files/:id
  - External: S3 / MinIO

- **BC-008-02: AI Radiograph Analysis**
  - Code: backend/src/modules/ia_radiografia/**
  - Entities: CREATES RadiographAnalysis, TRACKS AIObservation
  - Operations: POST /api/ia-radiografia/analisar, GET /api/ia-radiografia/:id/resultado
  - External: Ollama / llava vision model

**Security Context:**
- Data Sensitivity: PII, health (medical images)
- Auth Required: Yes
- Exposure: Internal
- Criticality: High (health data + LGPD)

**QA Context:**
- Coverage: unit ~35% · integration ~10% · e2e ~10% [source: proxy]
- Automation: regression partial · smoke partial · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no performance tests for image upload

**Cross-Capability Dependencies:**
→ BC-001 Clinical Care (radiographs linked to patient PEP)

---

## BC-009: Telemedicine                            1 L2
─────────────────────────────────────────────────────────────────
Video consultations, teleodontology sessions, and virtual care delivery.

### L2 Operations:
- **BC-009-01: Video Consultations**
  - Code: backend/src/modules/teleodonto/**
  - Entities: OWNS TeleSession, MANAGES VideoRoom
  - Operations: POST /api/teleodonto/sessao, GET /api/teleodonto/sessao/:id/join
  - External: WebRTC / video provider

**Security Context:**
- Data Sensitivity: PII, health
- Auth Required: Yes
- Exposure: Internal
- Criticality: High (health data in video)

**QA Context:**
- Coverage: unit ~20% · integration ~5% · e2e ~5% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no E2E tests for video flow

**Cross-Capability Dependencies:**
→ BC-001 Clinical Care (sessions linked to appointments)

---

## BC-010: Analytics & Intelligence                2 L2s
─────────────────────────────────────────────────────────────────
Business intelligence dashboards, KPIs, data analytics, and AI agent orchestration.

### L2 Operations:
- **BC-010-01: Business Intelligence**
  - Code: backend/src/modules/dashboard, backend/src/modules/bi, backend/src/modules/analytics
  - Entities: READS all domain entities, CREATES DashboardWidget
  - Operations: GET /api/analytics/dashboard-overview, GET /api/bi/relatorios
  - External: None

- **BC-010-02: AI Agent Orchestration**
  - Code: backend/src/modules/agents, backend/src/modules/ai, agent-service/**
  - Entities: OWNS AgentTask, TRACKS AgentExecution
  - Operations: POST /api/agents/task, GET /api/agents/task/:id
  - External: OpenRouter, Google GenAI, Agno framework

**Security Context:**
- Data Sensitivity: PII, health, financial (reads all)
- Auth Required: Yes
- Exposure: Internal
- Criticality: High (broad data access)

**QA Context:**
- Coverage: unit ~25% · integration ~5% · e2e ~5% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no tests for AI agent workflows

**Cross-Capability Dependencies:**
→ All capabilities (reads data from all)

---

## BC-011: Reporting                               1 L2
─────────────────────────────────────────────────────────────────
Report generation, export (PDF, Excel, CSV), and scheduled report delivery.

### L2 Operations:
- **BC-011-01: Report Generation**
  - Code: backend/src/modules/relatorios/**
  - Entities: CREATES Report, TRACKS ReportSchedule
  - Operations: POST /api/relatorios/gerar, GET /api/relatorios/:id/download
  - External: None

**Security Context:**
- Data Sensitivity: PII, health, financial (reads all)
- Auth Required: Yes
- Exposure: Internal
- Criticality: Medium

**QA Context:**
- Coverage: unit ~20% · integration ~5% · e2e ~5% [source: proxy]
- Automation: regression partial · smoke none · contract absent
- Testability: good
- Defect Profile: not-collected
- Environments: covers dev, prod
- Strategy Gaps: no visual regression tests for PDF output

**Cross-Capability Dependencies:**
→ All capabilities (reads data from all)

---

# Entity Catalog

| Entity | Owner (BC) | Readers | Writers |
|--------|-----------|---------|---------|
| Patient | BC-001-01 | BC-001-02, BC-001-03, BC-001-04, BC-002, BC-005, BC-008, BC-009, BC-010, BC-011 | BC-001-01 |
| Appointment | BC-001-02 | BC-001-01, BC-009, BC-010, BC-011 | BC-001-02 |
| HealthRecord | BC-001-03 | BC-001-01, BC-010, BC-011 | BC-001-03 |
| Procedure | BC-001-04 | BC-001-01, BC-010, BC-011 | BC-001-04 |
| Transaction | BC-002-01 | BC-002-02, BC-010, BC-011 | BC-002-01 |
| Sale | BC-002-02 | BC-010, BC-011 | BC-002-02 |
| Contract | BC-002-03 | BC-010, BC-011 | BC-002-03 |
| SplitPayment | BC-002-04 | BC-010, BC-011 | BC-002-04 |
| Product | BC-003-01 | BC-002-02, BC-003-02, BC-010, BC-011 | BC-003-01 |
| StockMovement | BC-003-02 | BC-010, BC-011 | BC-003-02 |
| UserSession | BC-004-01 | — | BC-004-01 |
| ClinicConfig | BC-004-02 | BC-004-01, BC-010 | BC-004-02 |
| Employee | BC-004-03 | BC-010, BC-011 | BC-004-03 |
| Campaign | BC-005-01 | BC-010, BC-011 | BC-005-01 |
| Lead | BC-005-02 | BC-010, BC-011 | BC-005-02 |
| Wallet | BC-006-01 | BC-010, BC-011 | BC-006-01 |
| PSBT | BC-006-02 | BC-010, BC-011 | BC-006-02 |
| NFeDocument | BC-007-01 | BC-010, BC-011 | BC-007-01 |
| TISSDocument | BC-007-02 | BC-010, BC-011 | BC-007-02 |
| FileRecord | BC-008-01 | BC-001-03, BC-008-02, BC-010, BC-011 | BC-008-01 |
| RadiographAnalysis | BC-008-02 | BC-010, BC-011 | BC-008-02 |
| TeleSession | BC-009-01 | BC-010, BC-011 | BC-009-01 |
| AgentTask | BC-010-02 | BC-010-01, BC-011 | BC-010-02 |
| Report | BC-011-01 | BC-010 | BC-011-01 |

# Infrastructure Classification

| Item | Type | Classification |
|------|------|---------------|
| Notifications | messaging | infrastructure.messaging |
| Backups | operations | infrastructure.operations |
| Terminal | operations | infrastructure.operations |
| GitHub Tools | devops | infrastructure.devops |
| Memory Hub | ai-platform | infrastructure.ai-platform |
| Database Admin | data | infrastructure.data |
| Comm | messaging | infrastructure.messaging |
