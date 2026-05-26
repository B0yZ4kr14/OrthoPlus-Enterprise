# L1 Capabilities (Locked)

## BC-001: Clinical Care
- **Cohesion**: HIGH
- **Coupling**: MEDIUM
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-01)
- **Description**: Core patient care operations including registration, appointments, procedures, electronic health records (PEP), odontogram, and treatment planning.
- **Evidence**: backend/src/modules/pacientes, backend/src/modules/agenda, backend/src/modules/procedimentos, backend/src/modules/pep

## BC-002: Financial Management
- **Cohesion**: HIGH
- **Coupling**: MEDIUM
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-02)
- **Description**: Billing, accounts receivable/payable, payment processing (including split payments), contracts, budgets, and delinquency tracking.
- **Evidence**: backend/src/modules/financeiro, backend/src/modules/pdv, backend/src/modules/orcamentos, backend/src/modules/contratos, backend/src/modules/inadimplencia, backend/src/modules/split_pagamento

## BC-003: Inventory & Supply
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-03)
- **Description**: Product catalog, stock control, movements, suppliers, categories, and inventory alerts.
- **Evidence**: backend/src/modules/inventario

## BC-004: Administration & Identity
- **Cohesion**: MEDIUM
- **Coupling**: HIGH
- **Boundary**: PARTIAL
- **Source action**: CONFIRM (from C-04)
- **Description**: User and clinic management, role-based access control, system settings, and staff records.
- **Evidence**: backend/src/modules/auth, backend/src/modules/funcionarios, backend/src/modules/configuracoes, backend/src/modules/admin_tools

## BC-005: Marketing & CRM
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-05)
- **Description**: Campaign management, patient recalls, loyalty programs, lead tracking, and conversion analytics.
- **Evidence**: backend/src/modules/marketing, backend/src/modules/crm, backend/src/modules/fidelidade

## BC-006: Crypto Payments
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-06)
- **Description**: Bitcoin payment acceptance, wallet management, xPub derivation, PSBT creation, and exchange integration.
- **Evidence**: backend/src/modules/crypto, backend/src/modules/crypto_config

## BC-007: Fiscal Compliance
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-07)
- **Description**: Electronic invoicing (NFe), dental billing standard (TISS), and tax document generation.
- **Evidence**: backend/src/modules/nfe, backend/src/modules/tiss

## BC-008: Medical Imaging & Files
- **Cohesion**: MEDIUM
- **Coupling**: MEDIUM
- **Boundary**: PARTIAL
- **Source action**: CONFIRM (from C-08)
- **Description**: File uploads, medical image storage (radiographs), document management, and AI-assisted radiograph analysis.
- **Evidence**: backend/src/modules/files, backend/src/modules/ia_radiografia

## BC-009: Telemedicine
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: CONFIRM (from C-09)
- **Description**: Video consultations, teleodontology sessions, and virtual care delivery.
- **Evidence**: backend/src/modules/teleodonto

## BC-010: Analytics & Intelligence
- **Cohesion**: MEDIUM
- **Coupling**: HIGH
- **Boundary**: PARTIAL
- **Source action**: SPLIT (from C-10)
- **Description**: Business intelligence dashboards, KPIs, data analytics, and AI agent orchestration.
- **Evidence**: backend/src/modules/dashboard, backend/src/modules/bi, backend/src/modules/analytics, backend/src/modules/agents, backend/src/modules/ai

## BC-011: Reporting
- **Cohesion**: HIGH
- **Coupling**: LOW
- **Boundary**: CLEAR
- **Source action**: SPLIT (from C-10)
- **Description**: Report generation, export (PDF, Excel, CSV), and scheduled report delivery.
- **Evidence**: backend/src/modules/relatorios

---

## De-scoped (Infrastructure)
- **Notifications** (backend/src/modules/notifications) → infrastructure.messaging
- **Backups** (backend/src/modules/backups) → infrastructure.operations
- **Terminal** (backend/src/modules/terminal) → infrastructure.operations
- **GitHub Tools** (backend/src/modules/github_tools) → infrastructure.devops
- **Memory Hub** (backend/src/modules/memory_hub) → infrastructure.ai-platform
- **Database Admin** (backend/src/modules/database_admin) → infrastructure.data
- **Comm** (backend/src/modules/comm) → infrastructure.messaging

## Flagged
- None — all candidates resolved without ambiguity.
