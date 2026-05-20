# Logical View

**Input**: Scenario View

## Architecture Intent

Preserve capability boundaries that isolate patient data, clinical authority, financial integrity, and administrative control.

## Core Tensions

| Tension | Direction | Consequence |
|---------|-----------|-------------|
| Domain purity vs pragmatic modules | Clean-ish architecture with module isolation | Domains own their data; shared infra only for cross-cutting |
| Single codebase vs independent deployability | Monorepo with Docker separation | Modules compile together but deploy independently |

## Stable Boundaries

| Boundary | Stable Because | Does Not Own |
|----------|----------------|--------------|
| Patient Management | Core domain entity | Billing, inventory |
| Clinical Documentation | Dentist authority | Scheduling, reporting |
| Financial Operations | Fiscal compliance | Clinical decisions |
| Document Management | Content lifecycle | Clinical interpretation |
| Identity & Access | Security foundation | Business logic |

## Capability Boundaries

| Capability | Responsibility | Input | Output | Does Not Own |
|------------|----------------|-------|--------|--------------|
| Patient Management | CRUD patient data | Registration form | Patient record | Treatment planning |
| Appointment Scheduling | Time-slot allocation | Dentist availability + patient request | Confirmed appointment | Treatment execution |
| Clinical Documentation | Treatment recording | Appointment completion | Treatment record | Billing generation |
| Financial Operations | Invoice and payment | Treatment records | Fiscal documents | Clinical content |
| Document Management | File storage and retrieval | Uploaded files | Stored documents with metadata | Clinical decisions |
| User Administration | Role and permission management | Admin actions | User accounts and roles | Patient data |
| System Automation | Background jobs and AI | Scheduled triggers + events | Notifications, backups, OCR | User interaction |

## Domain Objects

| Object | Meaning | Owning Capability | Key Relationships |
|--------|---------|-------------------|-------------------|
| Patient | Person receiving care | Patient Management | Appointments, treatments, documents |
| Appointment | Scheduled clinical encounter | Appointment Scheduling | Patient, dentist, treatment |
| Treatment | Documented clinical procedure | Clinical Documentation | Patient, appointment, invoice |
| Invoice | Fiscal billing document | Financial Operations | Treatment, patient, payments |
| Document | Stored file with metadata | Document Management | Patient, OCR result, versions |
| User | Authenticated system actor | User Administration | Clinic, roles, permissions |
| Clinic | Tenant boundary | User Administration | All objects scoped by clinic |

## State and Lifecycle

| Object | State | Entered When | Exited When | Forbidden Transition |
|--------|-------|--------------|-------------|----------------------|
| Patient | Active | Registration | Anonymization request | Active → Deleted (must go through Inactive) |
| Patient | Inactive | Deactivation | Reactivation or anonymization | — |
| Appointment | Scheduled | Booking confirmation | Cancellation or completion | Completed → Cancelled |
| Appointment | Completed | Treatment recorded | — | — |
| Appointment | Cancelled | Cancellation by authorized actor | — | Cancelled → Completed |
| Treatment | Draft | Initial recording | Finalization by dentist | Draft → Billed without finalization |
| Treatment | Finalized | Dentist confirmation | Invoice generation | — |
| Invoice | Open | Invoice generation | Payment receipt or write-off | — |
| Invoice | Closed | Full payment | — | Closed → Open |
| Invoice | Cancelled | Fiscal cancellation | — | Cancelled → Any |
| Document | Pending | Upload | Virus scan completion | — |
| Document | Active | Scan clean | Deletion | — |
| Document | Quarantined | Threat detected | Admin review | Quarantined → Active without review |
| OCR | Pending | File uploaded | Processing start | — |
| OCR | Processing | Job queued | Completion or error | — |
| OCR | Completed | Text extracted | — | — |
| OCR | Error | Processing failure | Retry or manual intervention | — |

## Logical Decisions

| Decision | Scope | Owner | Consequence |
|----------|-------|-------|-------------|
| Clinic-scoped data | All objects | Identity & Access | No cross-clinic queries without explicit bridge |
| Immutable financial records | Invoices | Financial Operations | Records cannot be modified after closing; corrections create new records |
| Treatment → Invoice link | Clinical to financial | Clinical + Financial | Invoice requires at least one finalized treatment |
| File visibility inheritance | Document to patient | Document Management | Linked patient file inherits patient privacy level |

## Logical Gaps

| Gap | Affected Object | Why It Matters |
|-----|-----------------|----------------|
| Cross-clinic patient identity | Patient | No global patient identifier for multi-clinic patients |
| Treatment versioning | Treatment | No history of treatment plan changes |
| Document retention policy | Document | No automatic archival or deletion rules defined |
| Invoice reconciliation | Invoice | No external accounting system reconciliation model |

## Prohibited Content

Do not write classes, DTOs, tables, fields, methods, endpoints, or schemas here.
