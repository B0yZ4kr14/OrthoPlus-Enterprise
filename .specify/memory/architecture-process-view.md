# Process View

**Input**: `.specify/memory/architecture-scenario-view.md`, `.specify/memory/architecture-logical-view.md`

**Purpose**: Derive runtime collaboration, handoffs, approvals, receipts, state advancement, and failure closure from scenario paths and logical boundaries.

## Architecture Intent

Preserve the runtime meaning of cross-boundary handoffs: how clinical decisions become financial obligations, how document uploads become searchable patient history, and how tenant isolation is enforced at runtime. The process view must make explicit who initiates, who receives, what is transferred, and how failures are contained.

## Core Tensions

| Tension | Current Tradeoff Direction | Process Consequence |
|---------|----------------------------|---------------------|
| Synchronous user response vs asynchronous processing | User-facing operations return quickly; heavy processing (OCR, reports, AI) is async | Appointment booking is synchronous; document OCR is asynchronous |
| Strong consistency within boundary vs eventual consistency across boundaries | Single-boundary operations are ACID; cross-boundary uses events | Invoice creation within Financial Management is synchronous; treatment-to-invoice handoff is event-driven |
| Tenant isolation at runtime vs query performance | Every runtime link includes clinic context validation; no caching bypasses isolation | clinicGuard validates on every request; no shared cache across clinics |
| AI integration vs human oversight | AI operates asynchronously; human approval gates sensitive outputs | AI suggestions are delivered as events; Dentista approval required for clinical adoption |

## Stable Boundaries

| Boundary | Must Remain Stable Because | Explicitly Does Not Control |
|----------|----------------------------|-----------------------------|
| Auth runtime boundary | All runtime links require authenticated, authorized actor | Auth does not control business logic execution order |
| clinicGuard runtime boundary | Every request must resolve to a valid clinic context | clinicGuard does not own patient data or business rules |
| Event bus boundary | Cross-module communication channel | Event bus does not enforce business invariants; only delivers messages |
| Circuit breaker boundary | Database resilience | Circuit breaker does not retry business logic; only protects connection layer |
| Audit runtime boundary | Every sensitive operation is logged | Audit does not block or alter operations |

## Change Axes

| Expected Change | Isolated By | Process Impact |
|-----------------|-------------|----------------|
| New notification channels | Communication runtime boundary | New delivery adapter; same handoff semantics |
| New payment providers | Financial Management runtime boundary | New payment gateway integration; invoice lifecycle unchanged |
| New AI capabilities | AI Agent runtime boundary | New suggestion types; same approval gate semantics |
| Reporting workload changes | Async processing boundary | Query complexity changes; same projection handoff |
| Compliance audit requirements | Audit runtime boundary | New fields logged; same operation flow |

## Invariants

| Invariant | Source Scenario / Runtime Link | Risk If Violated |
|-----------|--------------------------------|------------------|
| Every runtime link authenticated before execution | All scenario paths start with authentication | Unauthorized access; data breach |
| clinicGuard validates clinic context before business logic | All runtime links include clinic context | Cross-clinic data access |
| Cross-boundary state changes use events, not direct calls | Logical decision: event-driven cross-module updates | Tight coupling; cascade failures |
| Sensitive operations produce audit event before completion | Audit runtime boundary | Non-repudiation failure |
| Document OCR does not block upload completion | Document Upload scenario path | User-facing timeout; poor UX |
| Invoice generation does not block treatment closure | Treatment Planning scenario path | Clinical workflow blocked by financial system |

## Non-goals / Anti-patterns

| Non-goal / Anti-pattern | Why It Is Out of Scope or Harmful |
|-------------------------|-----------------------------------|
| Distributed transactions across boundaries | Eventual consistency with compensation is preferred; 2PC would couple boundaries |
| Synchronous AI processing in critical path | AI latency is unpredictable; must not block clinical workflows |
| Runtime shared state between clinics | Would violate tenant isolation invariant |
| Process orchestration engine | Scenarios are domain-specific; a generic engine would obscure semantics |
| Real-time bidirectional sync between modules | Eventual consistency is sufficient; real-time sync adds complexity |

## Main Runtime Links

| Runtime Link | Trigger | Source | Target | Transferred Content / Fact | Completion Condition |
|--------------|---------|--------|--------|----------------------------|----------------------|
| Authentication | User request | Client | Auth boundary | Credentials | Valid token issued; clinic context resolved |
| Appointment Booking | User request | Client | Clinical Operations | Patient identity; procedure; time preference | Appointment state Scheduled; no conflicts |
| Treatment Approval | Dentista action | Client | Clinical Operations | Treatment identity; approval signal | Treatment state Approved |
| Invoice Generation | Treatment approved or service completed | Clinical Operations (event) | Financial Management (event handler) | Treatment reference; line items | Invoice state Open; linked to Treatment |
| Payment Recording | Staff action | Client | Financial Management | Invoice identity; payment amount | Payment record created; Invoice state updated |
| Document Upload | Staff action | Client | Document Management | File bytes; patient reference | File state Active; upload acknowledged |
| OCR Processing | Document uploaded | Document Management (async) | Document Management (indexer) | File content | Extracted text indexed; non-blocking |
| Notification Dispatch | State change or scheduled trigger | Any capability (event) | Communication (event handler) | Recipient; content; channel | Delivery status recorded |
| Inventory Consumption | Procedure executed | Clinical Operations (event) | Operations (event handler) | Material usage | Stock decremented; threshold checked |
| Audit Logging | Sensitive operation | Any capability | Audit boundary | Operation details; actor; timestamp | Log entry persisted |
| AI Agent Request | Development task | Client / System | AI Agent boundary | Code context; task description | Structured response returned |
| Permission Check | Any request | Auth boundary | System Administration | User identity; requested action | Permission granted or denied |

## Handoffs and Approvals

| Handoff / Approval | From | To | Meaning | Accepted Path | Rejected / Returned Path |
|--------------------|------|----|---------|---------------|--------------------------|
| Treatment to Invoice | Clinical Operations | Financial Management | Treatment is complete and billable | Invoice generated; Open state | Treatment incomplete → invoice blocked; returned to Clinical Operations |
| Appointment to Notification | Clinical Operations | Communication | Appointment state changed | Notification dispatched | Delivery failure → retry queue; no user-visible failure |
| Document to OCR | Document Management (upload) | Document Management (indexer) | File ready for text extraction | Index updated with extracted text | OCR failure → document remains without index; no blocking |
| Procedure to Inventory | Clinical Operations | Operations | Materials consumed during procedure | Stock decremented; alert if low | Stock insufficient → consumption blocked; returned to Clinical Operations |
| Patient Registration to Audit | Patient Management | Audit | New patient record created | Audit log entry persisted | Audit failure → operation still completes; gap logged |
| AI Suggestion to Dentista | AI Agent | Dentista | Development or clinical suggestion generated | Dentista reviews and optionally adopts | Dentista rejects → suggestion discarded; no state change |
| Permission Change to Audit | System Administration | Audit | User permissions modified | Audit log entry persisted | Audit failure → operation still completes; gap logged |
| Payment to Invoice Closure | Financial Management | Financial Management (internal) | Payment brings invoice to full settlement | Invoice state Closed | Partial payment → Invoice state PartiallyPaid; awaits further payment |

## Receipts and User Participation

| Receipt / Participation Point | Sender | Receiver | Content | User Action | Architecture Consequence |
|-------------------------------|--------|----------|---------|-------------|--------------------------|
| Appointment confirmation | Clinical Operations | Staff / Patient | Appointment details; dentist; time | Patient may reschedule or cancel | Confirms booking integrity; triggers notification |
| Invoice issued | Financial Management | Staff / Patient | Line items; total; payment instructions | Patient may pay or dispute | Marks financial obligation; triggers notification |
| Document upload receipt | Document Management | Staff | File name; version; patient link | Staff may upload additional versions | Confirms persistence; triggers OCR async |
| Treatment plan presented | Clinical Operations | Patient | Procedures; estimates; timeline | Patient may approve or decline | Patient approval is informational; Dentista approval is authoritative |
| Permission change confirmation | System Administration | Admin | User; new permissions | Admin may revoke or adjust | User sees changes on next session |
| AI suggestion delivered | AI Agent | Dentista / Developer | Structured suggestion | Human reviews and decides | No automatic state change; human gate enforced |
| Audit log summary | Audit | Admin | Recent sensitive operations | Admin may investigate | Read-only; no operational effect |
| Inventory alert | Operations | Staff | Item; current stock; threshold | Staff may reorder or adjust | Alert is advisory; reorder is manual |

## Failure, Degradation, and Closure

| Failure / Branch | Detection Boundary | Responsible Boundary | Degradation or Compensation | User-Visible Result | Closure Condition |
|------------------|--------------------|----------------------|-----------------------------|---------------------|-------------------|
| clinicGuard rejection | Auth / clinicGuard | System Administration | Request blocked before business logic | Access denied; no data exposed | User retries with valid clinic context |
| Appointment double-booking | Clinical Operations | Clinical Operations | Transaction rollback; slot not reserved | Conflict error; alternative slots suggested | User selects different slot |
| Invoice generation blocked | Financial Management | Financial Management | Invoice not created; treatment record intact | Warning: treatment incomplete or pricing missing | Staff completes treatment or resolves pricing |
| OCR failure | Document Management | Document Management | Document saved without index | Upload success; search may miss this document | User may retry OCR or accept unindexed document |
| Payment exceeds invoice | Financial Management | Financial Management | Payment rejected | Error: payment amount invalid | Staff corrects amount |
| Notification delivery failure | Communication | Communication | Retry queue; escalation if persistent | No immediate user-visible failure (async) | Max retries reached; manual follow-up triggered |
| AI service unavailable | AI Agent | AI Agent | Request queued or failed fast | Feature unavailable message | Service restored; request retried or abandoned |
| Circuit breaker open | Infrastructure | Infrastructure | Request rejected fast; fallback if defined | Service temporarily unavailable | Circuit closes after recovery |
| Database connection failure | Infrastructure | Infrastructure | Request rejected; queued operations may be lost | Error: please retry | Connection restored; health check passes |
| Inventory negative stock | Operations | Operations | Consumption blocked | Error: insufficient stock | Stock replenished or manual override by Admin |

## Process Gaps

| Gap | Affected Runtime Link / Scenario | Why It Matters |
|-----|----------------------------------|----------------|
| Consent revocation runtime link undefined | Patient data access; notification dispatch | LGPD requires that consent revocation immediately affects data processing; no runtime link defined for this |
| Cross-clinic referral handoff undefined | Patient Management | Referral between clinics would require a safe handoff; currently no runtime link exists |
| Disaster recovery runtime behavior undefined | All runtime links | If database is restored from backup, in-flight operations and events may be inconsistent |
| AI clinical suggestion approval runtime link incomplete | AI Agent to Clinical Operations | No explicit runtime link defines how AI clinical suggestions are reviewed, approved, and logged |
| Bulk operation rollback semantics undefined | Inventory; Patient Management | Bulk imports or bulk updates lack defined failure closure behavior |

## Prohibited Content

Do not write call stacks, queue names, retry counts, thread/process details, endpoint sequences, workflow engine configuration, or orchestration code here.
