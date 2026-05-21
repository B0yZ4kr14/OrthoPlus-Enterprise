# Architecture Synthesis: OrthoPlus Enterprise

**Input Views**:
- Scenario: `.specify/memory/architecture-scenario-view.md`
- Logical: `.specify/memory/architecture-logical-view.md`
- Process: `.specify/memory/architecture-process-view.md`
- Development: `.specify/memory/architecture-development-view.md`
- Physical: `.specify/memory/architecture-physical-view.md`

## View Index

| View | File | Purpose | Current Status |
|------|------|---------|----------------|
| Scenario | `.specify/memory/architecture-scenario-view.md` | UC-producing actor, use case, path, branch, and acceptance semantics | Active |
| Logical | `.specify/memory/architecture-logical-view.md` | Capability boundaries, domain objects, states, and invariants | Active |
| Process | `.specify/memory/architecture-process-view.md` | Runtime links, handoffs, approvals, receipts, failure closure | Active |
| Development | `.specify/memory/architecture-development-view.md` | Architecture-level components, package boundaries, contracts, dependencies | Active |
| Physical | `.specify/memory/architecture-physical-view.md` | Deployment, external systems, fact sources, observability, operations | Active |

## Architecture Intent

The five views together stabilize a multi-tenant dental clinic management platform where clinic isolation is invariant, clinical and financial workflows are cross-module but loosely coupled through events, and the development structure mirrors domain capabilities without introducing premature distribution. The architecture makes explicit: who acts, what they achieve, which objects carry authority, how runtime handoffs cross boundaries, how components depend on each other, and where runtime units execute.

## Central Design Forces

1. **Tenant isolation as ground truth**: Every view reinforces that clinicId is not merely a filter but a boundary. The Scenario view requires it for every use case. The Logical view makes it an aggregate invariant. The Process view encodes it in clinicGuard. The Development view isolates it in auth infrastructure. The Physical view segregates it at the database and storage layers.

2. **Event-driven cross-module collaboration**: The Logical view assigns object ownership to capabilities. The Process view translates this into event handoffs rather than direct calls. The Development view enforces this through module isolation and event bus contracts. The Physical view places the event bus inside the backend runtime unit, keeping handoffs local to the application layer.

3. **Human authority over AI**: The Scenario view defines AI as advisory. The Logical view does not grant AI ownership of clinical objects. The Process view places an approval gate between AI suggestions and state changes. The Development view isolates the Agent Service as a separate runtime component with no direct data access. The Physical view places the Agent Service outside the production data boundary.

4. **Monolithic runtime with modular boundaries**: The Development view preserves module-level isolation within a single backend component. The Physical view deploys this as a single runtime unit. This tradeoff favors operational simplicity over independent scalability, with the change axis clearly identified for future extraction.

## Primary Tradeoffs

| Tradeoff | Chosen Direction | Consequence | Revisit When |
|----------|------------------|-------------|--------------|
| Monolith vs microservices | Modular monolith (single backend runtime, 37 internal modules) | Simpler deployment and transaction consistency; scaling requires scaling entire unit | Single module requires independent scaling or deployment cadence |
| Synchronous vs asynchronous cross-module updates | Synchronous within capability; asynchronous events across capabilities | Strong consistency for booking and billing within module; eventual consistency for notifications and analytics | Cross-module transaction requirements emerge (e.g., inventory-treatment-atomic) |
| Single-VPS vs distributed deployment | Single host with Docker Compose | Operational simplicity; single point of failure | Availability requirements exceed single-host tolerance |
| External AI vs self-hosted | External AI provider via gateway | No GPU infrastructure; latency and cost externalized | AI latency or cost becomes unacceptable; data residency requires local inference |
| Colocated database vs external managed database | PostgreSQL in container alongside backend | Full control; backup and recovery are operator responsibility | Operational burden exceeds team capacity |
| SPA vs server-rendered frontend | Single-page application | Rich client interactions; frontend owns presentation state | SEO or initial load time becomes critical |

## Stable Boundaries

| Boundary | Affected Views | Must Remain Stable Because | Forbidden Crossing |
|----------|----------------|----------------------------|--------------------|
| Clinic tenant isolation | All five views | Legal (LGPD) and clinical trust requirement | Any data flow, query, or cache lookup that omits clinic context |
| Patient aggregate ownership | Scenario, Logical, Process, Development | All clinical and financial objects trace to patient identity | Another capability owning patient identity or modifying patient core demographics |
| Invoice immutability after closure | Logical, Process, Physical | Tax and legal compliance | Any update, delete, or silent correction to a closed invoice |
| Document version append-only | Logical, Process, Physical | Legal evidence chain | Overwrite, deletion, or reordering of historical versions |
| Agent Service isolation from production data | Scenario, Process, Development, Physical | AI must not access patient data directly | Direct database connection, file system access, or unauthenticated API calls from Agent Service |
| Frontend-backend contract via shared types | Development | Type safety across stack | Frontend depending on backend internals; backend depending on frontend structure |
| Module internal implementation isolation | Development, Process | Safe refactoring and parallel development | Direct imports between backend modules; shared mutable state |

## Change Axes

| Expected Change | Isolated By | Affected Views | Architecture Consequence |
|-----------------|-------------|----------------|--------------------------|
| New clinical module | Backend module boundary; Frontend module boundary | Development, Logical | New capability added without existing module changes |
| New AI capability | Agent Service boundary; AI provider boundary | Physical, Process | New workflow type; no impact on clinical data or runtime |
| New payment method | Financial Management capability; payment gateway boundary | Scenario, Process, Physical | Invoice lifecycle stable; only payment execution path changes |
| Compliance evolution (LGPD) | Consent object; Audit infrastructure | Scenario, Logical, Physical | New consent checkpoint scenarios; audit retention changes |
| Scale-out requirement | Backend runtime unit; Database runtime unit | Physical, Development | May require decomposition of monolith or database sharding |
| New notification channel | Communication capability; external gateway | Process, Physical | New delivery adapter; same content and trigger semantics |

## Anti-patterns

| Anti-pattern | Why It Violates Intent | Affected Views |
|--------------|------------------------|----------------|
| Cross-clinic data query | Violates clinic tenant isolation invariant | Scenario, Logical, Process, Physical |
| Backend module direct import | Breaks module isolation; creates cascade changes | Development, Process |
| AI autonomous clinical decision | Violates human authority over AI | Scenario, Logical, Process |
| Closed invoice mutation | Violates financial immutability invariant | Logical, Process |
| Agent Service direct database access | Violates Agent Service isolation boundary | Development, Physical |
| Frontend embedding business logic | Breaks frontend-backend contract; causes drift | Development, Scenario |
| Shared mutable state between modules | Violates event-driven cross-module collaboration | Logical, Process, Development |
| Synchronous AI in critical path | Violates AI advisory and latency assumptions | Process, Physical |

## Cross-View Architecture Model

This section normalizes the 4+1 design results into the architecture SSOT. Record how concepts derive, constrain, depend on, or guard each other. This is architecture design synthesis, not tracking or audit. Do not treat view-specific concepts as equivalent or interchangeable.

| Architecture Concept | Scenario Meaning | Logical Interpretation | Runtime Role | Development Boundary | Physical Constraint | Architecture Constraint |
|----------------------|------------------|------------------------|--------------|----------------------|---------------------|---------------------------|
| Clinic (Tenant) | Context for all use cases; actor permissions scoped within it | Aggregate boundary; all objects belong to exactly one clinic | clinicGuard validates on every request; clinic context resolved at auth time | Auth Infrastructure enforces; Backend modules assume valid context | Database and Object Storage segregate by clinic; no cross-clinic query | Invariant: clinicId required everywhere; never bypassed |
| Patient | Actor goal: receive care; Staff goal: manage record | Root aggregate; source of identity for all clinical objects | Patient reference transferred across runtime links; never duplicated | Patient Management module owns; others reference by identity | Database persists as authoritative; cache may hold reference only | Patient aggregate ownership is stable; no other capability may own identity |
| Appointment | Staff/Patient goal: book chair time | Exclusive slot per dentist; state machine (Scheduled/Completed/Cancelled) | Synchronous booking with conflict detection; rollback on failure | Clinical Operations module owns; event published on state change | Backend runtime unit executes; database enforces uniqueness | Double-booking impossible; cancellation does not delete record |
| Treatment | Dentista goal: plan care | Contains procedures; approved by Dentista; immutable after closure | Approval handoff from Dentista to system; triggers invoice generation event | Clinical Operations module owns; Financial Management subscribes to event | Backend runtime unit executes; event bus delivers cross-module | AI suggestions are advisory; only Dentista approval advances state |
| Invoice | Staff goal: bill for services | Immutable after closure; linked to treatment or service | Generated asynchronously from treatment event; payment advances state | Financial Management module owns; accepts events from Clinical Operations | Backend runtime unit executes; audit log records all changes | Closed invoice is final; corrections require new invoice |
| File | Staff goal: attach document | Append-only version chain; linked to patient | Upload synchronous; OCR asynchronous; index updated non-blocking | Document Management module owns; indexer runs async within same runtime | Object Storage persists binaries; database persists metadata | Versions are immutable; deletion is logical (not physical) |
| Event | Cross-module notification of state change | Domain event is immutable fact; publisher owns semantics | Delivered by event bus; consumed by subscribers; no guaranteed ordering | Backend module publishes; Backend module subscribes; contract in shared types | Event bus runs within backend runtime unit | Subscriber handles duplicates; publisher does not wait for consumers |
| Auth Token | Proof of identity and clinic membership | User and Clinic context embedded in token | Validated on every request; refreshed before expiry | Auth Infrastructure produces and validates; Frontend holds | Cache runtime unit stores session; token time-bounded | Compromised token affects single session; clinic context cannot be altered |
| AI Suggestion | Development or clinical advice | No domain object; advisory only | Returned from Agent Service; human gate before any state change | Agent Service produces; human consumer decides | External AI provider executes inference; no patient data sent | Never authoritative; never bypasses human approval |

## Key Architecture Conclusions

| Conclusion | Affected Views | Boundary/Owner | Consequence |
|------------|----------------|----------------|-------------|
| Clinic isolation is invariant across all views | All five views | System-wide | Any future change must validate clinic context preservation |
| Cross-module collaboration is event-driven only | Logical, Process, Development | Backend modules | Direct module coupling is architecturally prohibited |
| AI is isolated from production patient data | Scenario, Process, Development, Physical | Agent Service runtime unit | Patient data must never flow to AI systems; AI operates on development artifacts only |
| Frontend is a pure consumer of backend capabilities | Development, Physical | Frontend SPA | Frontend must not embed business logic or domain invariant enforcement |
| Invoice and Treatment are separate objects with event handoff | Logical, Process | Clinical Operations → Financial Management | Treatment approval triggers invoice generation; invoice does not own treatment |
| Document upload and OCR are decoupled | Process, Development | Document Management module | Upload completes without waiting for OCR; OCR failure is non-blocking |
| Shared types are the only cross-stack contract | Development | Shared Types package | Frontend and backend evolve in lockstep for contract changes |
| All sensitive operations produce audit events | Process, Physical | Audit Infrastructure | Audit is non-blocking but mandatory; gaps must be logged |

## Cross-Cutting Constraints

| Constraint | Source | Affected Views | Scope | Architecture Consequence |
|------------|--------|----------------|-------|--------------------------|
| LGPD patient data protection | External regulation | Scenario, Logical, Physical | All patient-facing capabilities | Consent required for data processing; audit logs mandatory; data residency enforced |
| Multi-tenancy isolation | Architecture intent | All five views | All runtime units and data stores | No cross-clinic query, cache, or event; clinicId is ground truth |
| Financial audit compliance | External regulation | Logical, Process, Physical | Financial Management | Invoice immutability; payment traceability; retention policy |
| Clinical record integrity | Professional standard | Logical, Process | Clinical Operations; Document Management | Treatment plans and documents are append-only; corrections are additive |
| AI advisory limitation | Architecture intent | Scenario, Logical, Process, Development | AI Agent; Clinical Operations | AI output is never authoritative; human approval gate mandatory |
| Type safety across stack | Development quality | Development | Frontend; Backend; Shared Types | Shared Types package is the single contract source; breaking changes require coordination |
| Module internal autonomy | Development quality | Development, Logical | All backend modules | Modules may be refactored internally without affecting other modules |
| Operational simplicity | Team capacity | Physical | Deployment and hosting | Single-host Docker Compose; no orchestrator complexity until required |

## Open Risks and Review Triggers

| Risk or Trigger | Missing Evidence / Change Condition | Affected Views | Required Architecture Review |
|-----------------|-------------------------------------|----------------|------------------------------|
| Consent revocation runtime link undefined | No scenario path defines how consent revocation propagates to data access and notification dispatch | Scenario, Process | Define consent state machine and runtime handoff before LGPD enforcement |
| Contract versioning strategy undefined | No rule for breaking API changes across frontend and backend | Development | Establish versioning policy before next major API change |
| Disaster recovery site undefined | No secondary site for backup restoration | Physical | Define recovery objectives and secondary site before production SLA commitment |
| AI clinical suggestion approval link incomplete | No explicit runtime link for AI clinical suggestion review and logging | Scenario, Process | Define AI clinical advisory governance before deploying AI clinical features |
| Scaling boundary undefined for monolith | No decomposition strategy if single backend unit becomes bottleneck | Development, Physical | Review modular extraction candidates when response time degrades |
| Event schema evolution undefined | No contract for how subscribers handle publisher schema changes | Development, Process | Establish event versioning before introducing breaking event changes |
| Agent Service auth mechanism undefined | No architecture-level contract for how Agent Service authenticates to Backend API | Development, Physical | Define auth contract before expanding Agent Service capabilities |
| Cross-clinic referral handoff undefined | No scenario or runtime link for patient referral between clinics | Scenario, Process | Define referral semantics if business requires multi-clinic collaboration |
| Database migration rollback undefined | No architecture-level rollback contract | Physical | Define rollback strategy before complex migration |
| Observability data residency undefined | Metrics and logs may contain clinic identifiers | Physical | Review LGPD applicability to observability data |
