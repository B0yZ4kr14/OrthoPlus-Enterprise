# Scenario View

**Purpose**: Produce the UC semantics for the architecture workflow. This view is the source for the logical, process, development, and physical views.

## Architecture Intent

Stabilize the actor-goal-scenario semantics for a multi-tenant dental clinic management platform. This view must make explicit: who interacts with the system, what they are trying to achieve, under what conditions scenarios succeed or fail, and what acceptance means for cross-module clinical and financial workflows. The scenario view is the authority for later decisions about capability boundaries, runtime handoffs, component packaging, and deployment isolation.

## Core Tensions

| Tension | Current Tradeoff Direction | Scenario Consequence |
|---------|----------------------------|----------------------|
| Multi-tenancy isolation vs operational convenience | Every scenario executes within a clinic boundary; no cross-clinic data flow | All use cases require clinic context; patient portal scenarios must never leak data across clinics |
| Real-time scheduling vs eventual consistency | Appointment conflicts detected synchronously; analytics and reporting are eventually consistent | Booking scenarios must fail fast on double-booking; reporting scenarios accept stale data |
| AI assistance vs patient data privacy | AI agents operate on anonymized or consented data only; human approval for sensitive AI outputs | Document OCR and teleodontology scenarios require explicit consent; AI-generated treatment suggestions are advisory only |
| Modular autonomy vs cross-module workflows | Modules own their use cases; cross-module flows use event-driven handoffs | A treatment plan scenario spans clinical, financial, and document modules via defined handoffs |

## Stable Boundaries

| Boundary | Must Remain Stable Because | Explicitly Does Not Cover |
|----------|----------------------------|---------------------------|
| Clinic tenant isolation | Legal (LGPD) and clinical trust requirement; data must never cross clinic boundaries | Cross-clinic benchmarking or analytics aggregation |
| Patient record ownership | Clinical and legal source of truth for treatments, history, and consent | Patient self-diagnosis or unsupervised treatment modification |
| Appointment scheduling authority | Operational reality of chair time and dentist availability | External calendar integrations (patient personal calendars) |
| Financial transaction integrity | Audit, tax, and legal compliance for invoicing and payments | Investment, payroll, or accounting beyond clinic operations |
| Document versioning immutability | Legal evidence chain for clinical records and invoices | Ephemeral chat logs or temporary UI state |

## Change Axes

| Expected Change | Isolated By | Scenario Impact |
|-----------------|-------------|-----------------|
| New clinical modules | Modular use case boundaries; new actor goals do not alter existing scenario paths | New procedures or imaging workflows add use cases without changing patient registration or billing semantics |
| New payment methods | Financial module boundary; payment use cases are substitutable | Invoice generation scenario remains stable; only payment execution sub-scenario changes |
| AI feature expansion | AI agent actor boundary; AI participation is optional and advisory | Core clinical scenarios work without AI; AI augments but does not replace Dentista decisions |
| Compliance evolution (LGPD) | Consent and audit use cases | Patient registration and document access scenarios gain consent checkpoints |
| Patient portal expansion | Patient actor boundary | Self-service use cases grow without affecting staff-facing scenarios |

## Invariants

| Invariant | Scenario Evidence | Risk If Violated |
|-----------|-------------------|------------------|
| clinicId is present in every use case execution | All scenarios require clinic context to scope data and permissions | Cross-clinic data exposure; legal liability under LGPD |
| Audit log recorded for all sensitive operations | Patient data access, financial transactions, and treatment modifications are sensitive | Non-repudiation failure; compliance audit failure |
| Patient data never visible outside owning clinic | Patient portal, teleodontology, and reporting scenarios all filter by clinic | Privacy breach; loss of clinic trust |
| Appointment double-booking is impossible | Scheduling scenario includes availability validation | Operational chaos; patient dissatisfaction |
| Financial records are immutable after closure | Invoice closure scenario marks record as final | Tax and audit inconsistencies; fraud risk |

## Non-goals / Anti-patterns

| Non-goal / Anti-pattern | Why It Is Out of Scope or Harmful |
|-------------------------|-----------------------------------|
| Cross-clinic patient search | Violates tenant isolation invariant; no scenario justifies this |
| Patient-initiated treatment changes | Patient actor may view history and request appointments, but treatment plans are owned by Dentista |
| Real-time collaborative editing | Out of scope for current scenario set; adds complexity without identified clinical need |
| Generic workflow engine | Scenarios are domain-specific; a generic engine would obscure clinical semantics |
| AI autonomous treatment decisions | AI is advisory only; all treatment decisions require Dentista approval |

## Actors and Participants

| Actor / Participant | Goal | Responsibility | Boundary |
|---------------------|------|----------------|----------|
| Dentista | Deliver clinical care, plan treatments, review patient history | Diagnosis, treatment planning, clinical documentation, appointment approval | Full clinical and financial access within clinic |
| Admin | Manage clinic operations, staff, permissions, and configuration | User management, module configuration, clinic settings, billing oversight | Full access within clinic; cross-module coordination |
| Staff / Member | Support clinical operations, schedule appointments, manage inventory | Appointment scheduling, patient registration, inventory updates, billing assistance | Restricted by role and module permissions |
| Paciente | Access personal records, schedule appointments, receive communications | View own history, request appointments, receive notifications, consent management | Self-service portal; own data only |
| Sistema | Execute automated workflows, generate reports, enforce policies | Cron jobs, backup, audit logging, notification dispatch, AI preprocessing | Automated; no direct UI interaction |
| AI Agent | Assist with code generation, document analysis, and development tasks | CRUD scaffolding, bugfix suggestions, code review, database queries | Development-assistance only; no production patient data access |

## Use Cases

| Use Case | Actor | Goal | Preconditions | Scope Boundary |
|----------|-------|------|---------------|----------------|
| Register Patient | Staff / Member | Create patient record with demographics and medical history | Authenticated; clinic context active | Patient Management |
| Schedule Appointment | Staff / Member, Paciente | Book chair time for procedure | Patient exists; dentist available; clinic context active | Clinical Operations |
| Create Treatment Plan | Dentista | Define procedures, materials, and costs for patient care | Patient exists; authenticated as Dentista | Clinical Operations |
| Generate Invoice | Staff / Member | Create billable document from treatment or service | Treatment or service exists; pricing resolved | Financial Management |
| Process Payment | Staff / Member | Record payment against invoice | Invoice exists; authenticated | Financial Management |
| Upload Document | Staff / Member | Attach file to patient record with OCR extraction | Patient exists; file within size limits | Document Management |
| Manage Inventory | Staff / Member | Track stock levels, orders, and consumption | Authenticated; inventory module enabled | Operations |
| Run Analytics Report | Admin, Dentista | Generate operational or financial insights | Data exists; permissions for report type | System Administration |
| Execute Teleodontology Consultation | Dentista, Paciente | Remote consultation with video and chat | Both authenticated; teleodontology enabled | Clinical Operations |
| Manage User Permissions | Admin | Grant or revoke module access for clinic staff | Authenticated as Admin | System Administration |
| Dispatch Notification | Sistema | Send SMS, email, or in-app message to patient | Patient contact info exists; consent given | Communication |
| Audit Sensitive Operation | Sistema | Log access or modification to patient data | Operation triggered; audit system active | System Administration |

## Scenario Paths

| Scenario | Main Path | Successful Outcome | Alternative / Failure Branches |
|----------|-----------|--------------------|--------------------------------|
| Patient Registration | Staff authenticates → enters patient demographics → confirms clinic context → system validates uniqueness → record created | Patient record visible in clinic patient list | A1: Duplicate detected → merge suggestion shown; F1: Missing required field → validation error |
| Appointment Scheduling | Actor selects patient → chooses procedure → system checks dentist availability → reserves slot → confirms appointment | Appointment appears on clinic agenda | A1: No availability → waitlist offered; F1: Double-booking detected → rollback and conflict error |
| Treatment Planning | Dentista selects patient → adds procedures → system calculates estimate → Dentista approves → plan saved | Treatment plan linked to patient record | A1: Patient declines estimate → plan archived as declined; F1: Pricing unresolved → plan saved as draft |
| Invoice Generation | Staff selects completed treatment → system generates line items → Staff reviews → invoice issued → patient notified | Invoice appears in financial records | A1: Partial payment → invoice marked partially paid; F1: Treatment incomplete → invoice blocked |
| Document Upload | Staff selects patient → uploads file → system triggers OCR → extracted text indexed → document version saved | Document accessible in patient file history | A1: OCR fails → document saved without index; F1: File too large → rejection with size guidance |
| Inventory Update | Staff records consumption → system decrements stock → reorder check triggered → alert if below threshold | Stock level updated; reorder alert if applicable | A1: Manual adjustment → audit log entry created; F1: Negative stock → blocked with explanation |
| Teleodontology Session | Dentista initiates session → patient joins → consultation conducted → notes saved → session closed | Consultation notes added to patient PEP | A1: Patient no-show → session marked missed; F1: Connection failure → retry or reschedule offered |
| Permission Change | Admin selects user → modifies module access → system validates role constraints → permissions updated | User sees updated module list on next login | A1: Self-modification attempted → blocked; F1: Last Admin demotion → prevented with warning |

## Acceptance Semantics

| Acceptance Scenario | Observable Result | Must Hold | Not Covered |
|---------------------|-------------------|-----------|-------------|
| Patient registered | Patient appears in clinic-scoped patient list; searchable by name or document | Record contains clinicId; created by authenticated user | Integration with external health registries |
| Appointment booked | Appointment visible on dentist agenda and patient portal; no overlapping appointments for same dentist at same time | Clinic-scoped; conflict-free; notification sent if configured | Automatic calendar sync with external systems |
| Treatment plan approved | Plan visible in patient history; linked procedures and estimates accessible | Approved by Dentista; immutable after approval | Insurance pre-authorization workflows |
| Invoice paid in full | Invoice status closed; financial report reflects payment | Audit log records payment; immutable after closure | Multi-currency or cryptocurrency (out of current scope) |
| Document uploaded | Document version retrievable; OCR text searchable if extraction succeeded | Clinic-scoped; linked to patient; versioned | Handwritten note recognition accuracy |
| Inventory alert | Notification sent to configured recipients when stock below threshold | Based on actual consumption; not speculative | Supplier integration or automatic reordering |
| Audit trail complete | Every sensitive operation has timestamped, user-identified log entry | Tamper-evident; clinic-scoped | Real-time audit dashboard |
| AI agent response | AI returns structured suggestion for development task | Does not access production patient data | AI decision accountability in clinical contexts |

## Scenario Gaps

| Gap | Affected Scenario | Why It Matters |
|-----|-------------------|----------------|
| Consent revocation workflow | Patient registration, document upload, teleodontology | LGPD requires explicit consent tracking and revocation; current scenario paths lack detailed consent lifecycle semantics |
| Cross-module analytics boundaries | Analytics reporting | Reporting scenarios may need to aggregate across modules; unclear whether this violates clinic isolation if done within one clinic |
| AI clinical advisory scenarios | Treatment planning, teleodontology | No explicit scenario defines how AI clinical suggestions are generated, reviewed, and logged |
| Disaster recovery scenario | All scenarios | No scenario defines behavior when clinic data must be restored from backup; affects acceptance semantics for all operations |
| Patient portal registration (self-service) | Patient registration | Current registration is staff-initiated; self-service portal registration scenario is undefined |

## Prohibited Content

Do not write architecture components, class designs, APIs, database tables, implementation tasks, test strategy, deployment scripts, or framework choices here.
