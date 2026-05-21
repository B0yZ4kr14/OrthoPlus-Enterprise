# Logical View

**Input**: `.specify/memory/architecture-scenario-view.md`

**Purpose**: Derive capability boundaries, domain objects, states, relationships, and invariants from the scenario view.

## Architecture Intent

Preserve logical separation between clinical, financial, operational, and administrative concerns while enabling safe cross-boundary collaboration through events. The logical view must make explicit which capabilities own which domain objects, which states are authoritative, and where lifecycle authority resides.

## Core Tensions

| Tension | Current Tradeoff Direction | Logical Consequence |
|---------|----------------------------|---------------------|
| Module autonomy vs cross-module consistency | Each capability boundary owns its objects; cross-module consistency achieved through events, not shared ownership | Treatment plan and invoice are separate objects; invoice references treatment but does not own it |
| Rich domain model vs query performance | Domain objects capture full clinical semantics; read-optimized projections are secondary and non-authoritative | Patient aggregate is authoritative; patient list projection is derived |
| Flexible permissions vs invariant enforcement | Permissions are configurable per clinic; invariants are hard-coded and non-configurable | clinicId invariant is enforced at capability boundary, not at permission layer |
| Eventual consistency for analytics vs strong consistency for clinical operations | Clinical operations use synchronous validation; reporting uses asynchronous projections | Appointment booking is strongly consistent; dashboard metrics are eventually consistent |

## Stable Boundaries

| Boundary | Must Remain Stable Because | Explicitly Does Not Own |
|----------|----------------------------|-------------------------|
| Patient Management | Patient is the root aggregate for all clinical scenarios; all other capabilities reference Patient | Financial ledgers, appointment scheduling logic, inventory transactions |
| Clinical Operations | Treatment plans, appointments, and procedures are clinically authoritative | Invoice generation, payment processing, user permissions |
| Financial Management | Invoices and payments are legally binding; must be auditable and immutable | Clinical decisions, treatment content, patient demographics |
| Document Management | Documents are legal evidence; versioning and audit trail are invariant | Clinical interpretation of document content, patient identity |
| System Administration | User accounts, permissions, and clinic configuration are cross-cutting enablers | Clinical data, financial transactions, patient records |
| Communication | Notifications are delivery mechanism, not source of truth | Message content generation (content owned by triggering capability) |

## Change Axes

| Expected Change | Isolated By | Logical Impact |
|-----------------|-------------|----------------|
| New procedure types | Clinical Operations boundary | Adds domain object variants without affecting Patient or Financial boundaries |
| New notification channels | Communication boundary | New delivery mechanisms; no change to notification content semantics |
| New report types | Read projections outside capability boundaries | New queries; no change to authoritative objects |
| New AI features | AI Agent boundary (development-assistance only) | No impact on clinical or financial domain objects |
| Compliance changes (LGPD) | Consent object within Patient Management | Consent lifecycle evolves; patient aggregate gains consent state |

## Invariants

| Invariant | Source Scenario / Object / State | Risk If Violated |
|-----------|----------------------------------|------------------|
| Every domain object belongs to exactly one clinic | Patient, Appointment, Treatment, Invoice, File aggregates | Data leakage; unauthorized cross-clinic access |
| Patient aggregate is the sole source of patient identity | Patient Management capability | Duplicate identities; fragmented medical history |
| Appointment slot is exclusive per dentist per time range | Appointment state and Clinical Operations boundary | Double-booking; operational conflict |
| Invoice is immutable after closure | Invoice state and Financial Management boundary | Audit failure; financial inconsistency |
| Document version chain is append-only | File state and Document Management boundary | Evidence tampering; legal invalidity |
| User permissions are clinic-scoped | System Administration boundary; User object | Privilege escalation; cross-clinic admin access |
| Treatment plan must reference at least one procedure | Treatment object and Clinical Operations boundary | Empty plans; meaningless clinical records |
| Inventory consumption cannot drive stock negative | InventoryItem state and Operations boundary | Impossible fulfillment; accounting errors |

## Non-goals / Anti-patterns

| Non-goal / Anti-pattern | Why It Is Out of Scope or Harmful |
|-------------------------|-----------------------------------|
| Shared mutable state across capabilities | Capabilities communicate via events; shared mutable state would break boundary isolation |
| Generic entity-relationship model | Domain objects are clinically meaningful; a generic model would lose semantics |
| Capability depending on another capability's internal objects | External references use identity only; no foreign-key-like coupling across boundaries |
| Bi-directional aggregate references | Aggregates reference others by identity only; bidirectional navigation creates coupling |
| Storing AI-generated content as authoritative clinical record | AI output is advisory; only Dentista-approved content becomes part of the clinical record |

## Capability Boundaries

| Capability / Boundary | Responsibility | Input | Output | Explicitly Does Not Own | Scenario Source |
|-----------------------|----------------|-------|--------|--------------------------|-----------------|
| Patient Management | Maintain patient identity, demographics, medical history, and consent | Registration requests; consent updates | Patient aggregate; consent state | Appointments; treatments; invoices | Patient Registration scenario |
| Clinical Operations | Manage appointments, treatment plans, procedures, and clinical documentation | Patient reference; dentist availability; procedure catalog | Appointment; Treatment; Procedure | Invoice generation; payment processing | Appointment Scheduling; Treatment Planning scenarios |
| Financial Management | Generate invoices, record payments, manage pricing, and financial reporting | Completed treatment or service; payment details | Invoice; Payment record | Clinical content; patient demographics | Invoice Generation; Process Payment scenarios |
| Document Management | Store, version, index, and retrieve files with audit trail | File bytes; patient reference; OCR trigger | Versioned document; extracted text index | Clinical interpretation | Document Upload scenario |
| Operations | Track inventory, suppliers, and material consumption | Consumption records; purchase orders | Inventory state; reorder alerts | Clinical decisions; patient data | Inventory Update scenario |
| Communication | Deliver notifications via SMS, email, or in-app | Notification request with content and recipient | Delivery status | Message content generation | Dispatch Notification scenario |
| System Administration | Manage users, roles, permissions, clinic configuration, and module enablement | User creation; role assignment; config change | User account; Permission set; Clinic config | Clinical data; financial data | Manage User Permissions scenario |
| AI Assistance | Generate development artifacts, analyze code, assist with database queries | Code snippets; entity descriptions; bug reports | Suggestions; scaffolding; analysis | No access to production patient data | AI Agent response scenario |

## Domain Objects and Relationships

| Object | Meaning | Owning Capability | Key Relationships | Fact Source | Invariants |
|--------|---------|-------------------|-------------------|-------------|------------|
| Patient | Identity and medical history of a person under care | Patient Management | Has many Appointments, Treatments, Files, Invoices | Registration scenario | clinicId mandatory; unique within clinic |
| Appointment | Scheduled chair time for a patient with a dentist | Clinical Operations | Belongs to Patient; assigned to Dentista; has Procedures | Appointment Scheduling scenario | Exclusive slot per dentist; clinic-scoped |
| Treatment | Plan of procedures with estimated costs for a patient | Clinical Operations | Belongs to Patient; contains Procedures; linked to Invoice | Treatment Planning scenario | Approved by Dentista; immutable after closure |
| Procedure | Single clinical service with defined duration and cost | Clinical Operations | Contained in Treatment; may be billed on Invoice | Treatment Planning scenario | Defined in procedure catalog; clinic-scoped |
| Invoice | Billable document for services rendered | Financial Management | Linked to Patient; references Treatment; has Payments | Invoice Generation scenario | Immutable after closure; clinic-scoped |
| Payment | Record of financial transaction against an invoice | Financial Management | Belongs to Invoice; linked to Patient | Process Payment scenario | Cannot exceed invoice total when closed |
| File | Stored document with version history and extracted content | Document Management | Belongs to Patient; has version chain | Document Upload scenario | Append-only versions; clinic-scoped |
| User | Account with credentials and role within a clinic | System Administration | Belongs to Clinic; has Permissions | Manage User Permissions scenario | Role constraints enforced; clinic-scoped |
| Clinic | Tenant boundary containing all other objects | System Administration | Has Users, Patients, Configurations | System initialization | Isolation boundary; no cross-clinic references |
| InventoryItem | Trackable material or product in clinic stock | Operations | Linked to consumption records; has reorder threshold | Inventory Update scenario | Quantity non-negative |
| Consent | Patient authorization for data use or communication | Patient Management | Belongs to Patient; has purpose and expiry | LGPD compliance gap | Revocable; logged |

## State and Lifecycle

| Object / Flow | State | Entered When | Exited When | Forbidden Transition | Responsible Boundary |
|---------------|-------|--------------|-------------|----------------------|----------------------|
| Patient | Active | Registration completed | Clinic deletion requested | Active → Deleted without audit log | Patient Management |
| Patient | Archived | Patient no longer under active care | Reactivation requested | Archived → Active without Staff action | Patient Management |
| Appointment | Scheduled | Slot reserved and confirmed | Check-in or cancellation | Scheduled → Completed without check-in | Clinical Operations |
| Appointment | Completed | Patient seen; notes recorded | — | Completed → Cancelled | Clinical Operations |
| Appointment | Cancelled | Cancellation by staff or patient | — | Cancelled → Completed | Clinical Operations |
| Appointment | No-show | Patient did not attend | — | No-show → Completed | Clinical Operations |
| Treatment | Draft | Created by Dentista | Dentista approves or discards | Draft → Closed without approval | Clinical Operations |
| Treatment | Approved | Dentista explicitly approved | All procedures completed or invoice generated | Approved → Draft | Clinical Operations |
| Treatment | Closed | All work completed and billed | — | Closed → any other state | Clinical Operations |
| Invoice | Open | Generated from treatment or service | Partial payment received or closed | Open → Cancelled after payment | Financial Management |
| Invoice | PartiallyPaid | Partial payment recorded | Full payment received or write-off | PartiallyPaid → Cancelled | Financial Management |
| Invoice | Paid | Full payment recorded | — | Paid → Open or Cancelled | Financial Management |
| Invoice | Closed | Finalized; no further changes | — | Closed → any other state | Financial Management |
| File | Active | Upload completed and indexed | Version superseded or deleted | Active → Deleted without audit | Document Management |
| InventoryItem | InStock | Quantity above reorder threshold | Quantity drops below threshold | InStock → Discontinued without Admin action | Operations |
| InventoryItem | LowStock | Quantity below reorder threshold | Restocked above threshold or Admin marks OK | LowStock → OutOfStock without alert | Operations |
| InventoryItem | OutOfStock | Quantity reaches zero | Restocked | OutOfStock → Negative | Operations |
| User | Active | Account created and activated | Deactivation or clinic removal | Active → Deleted without audit | System Administration |
| User | Inactive | Deactivated by Admin | Reactivation by Admin | Inactive → Active without Admin | System Administration |

## Logical Decisions

| Decision | Scope | Owner / Boundary | Affected Objects or Flows | Consequence |
|----------|-------|------------------|---------------------------|-------------|
| Patient as root aggregate | All capabilities reference Patient by identity | Patient Management | Appointment, Treatment, Invoice, File | All clinical and financial objects trace to a single patient identity |
| Invoice immutability after closure | Financial compliance | Financial Management | Invoice; Payment | Closed invoices cannot be altered; corrections require new invoice |
| Event-driven cross-module updates | Capabilities communicate via domain events | System-wide (enforced by infrastructure) | Treatment → Invoice; Appointment → Notification | Modules are decoupled; eventual consistency acceptable |
| Clinic-scoped permission model | Access control | System Administration | User; Permission; all domain objects | Permissions are meaningless without clinic context |
| Document versioning as append-only chain | Legal evidence preservation | Document Management | File | Historical versions are permanently retrievable |
| Inventory quantity enforced non-negative | Operational integrity | Operations | InventoryItem | Consumption blocked if insufficient stock |

## Logical Gaps

| Gap | Affected Capability / Object | Why It Matters |
|-----|------------------------------|----------------|
| Consent state machine undefined | Patient Management / Consent | LGPD requires granular consent tracking; current lifecycle is noted but not fully specified |
| AI clinical suggestion object missing | Clinical Operations | No domain object represents AI-generated advice; unclear how it relates to Treatment |
| Cross-clinic referral object undefined | Patient Management | Dental referrals between clinics may require a shared object; currently out of scope |
| Audit log object not mapped to capability | System Administration | Audit trail is cross-cutting; unclear which capability owns the audit aggregate |
| Notification template object undefined | Communication | Notification content generation lacks a defined template/domain object |

## Prohibited Content

Do not write classes, DTOs, database tables, fields, method names, endpoints, schemas, or implementation data structures here.
