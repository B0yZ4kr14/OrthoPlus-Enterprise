# Architecture Synthesis: OrthoPlus Enterprise

## Architecture Intent

OrthoPlus Enterprise is a multi-tenant clinic management system where data isolation, audit compliance, and clinical authority are non-negotiable. The architecture prioritizes:
1. **Tenant isolation** as the foundational invariant
2. **Domain module boundaries** that prevent responsibility collision
3. **Async, event-driven collaboration** between modules to maintain loose coupling
4. **Human-in-the-loop for AI** to preserve clinical liability boundaries

## View Summary

### Scenario View
- **Actors**: Dentist, Admin, Staff, Patient, System
- **10 core use cases** spanning patient care, scheduling, documentation, billing, and administration
- **Key invariant**: Every operation requires clinic context; audit logs are mandatory for sensitive actions

### Logical View
- **5 stable capability boundaries**: Patient Management, Appointment Scheduling, Clinical Documentation, Financial Operations, Document Management
- **Domain objects** with explicit state machines (Patient: Active/Inactive; Appointment: Scheduled/Completed/Cancelled; Invoice: Open/Closed/Cancelled; Document: Pending/Active/Quarantined)
- **Logical decision**: Financial records are immutable after closing; corrections create new records

### Process View
- **Runtime links** enforce auth validation before any business operation
- **Handoffs** require explicit authority transfer (Appointment → Treatment → Invoice)
- **Failure handling** includes circuit breaker for DB timeouts, quarantine for security threats, retry queues for OCR

### Development View
- **7 architecture-level components**: Frontend SPA, Backend API, Agent Service, Database, Cache, File Store, Reverse Proxy
- **Package boundaries** enforce that Identity has no upstream dependencies and business modules communicate via events/API
- **Gap**: No published API contract or event schema registry

### Physical View
- **Docker-based deployment** on Ubuntu VPS with nginx reverse proxy
- **External integrations**: Email/SMS, AI Gateway, Payment Processor, Fiscal Authority
- **Observability**: Prometheus + Grafana + structured logs
- **Gap**: No blue/green deployment, no read replicas, no CDN

## Cross-View Decisions

| Decision | Scenario | Logical | Process | Development | Physical |
|----------|----------|---------|---------|-------------|----------|
| clinicId required everywhere | All actors operate within clinic | Clinic scopes all objects | Auth middleware validates | Identity package is foundation | Reverse proxy routes by host |
| Immutable financial records | Invoice acceptance | Invoice state machine | Treatment → Invoice handoff | Financial Operations owns | Database transactions |
| AI advisory only | AI suggests, human approves | AI not in critical path | Agent Service async callback | Agent Service isolated | Independent container |
| File visibility inheritance | Patient portal access | Patient privacy level | Upload → Active handoff | Document Management owns | Storage + metadata separate |
| Audit logging mandatory | Sensitive operations | All capabilities log | Async audit event | Audit as cross-cutting | Persistent audit store |

## Invariants (Cross-View)

| Invariant | Scenario Evidence | Logical Enforcement | Process Validation | Development Guard | Physical Constraint |
|-----------|-------------------|---------------------|-------------------|-------------------|---------------------|
| No cross-clinic data | All UC preconditions | Clinic scopes all objects | Auth middleware | Identity boundary | Network segmentation |
| Immutable invoices | Invoice acceptance | State machine | Handoff authority | Financial package owns | DB transaction + backup |
| AI never decides | AI advisory only | Not in critical path | Async callback | Agent Service isolation | Separate container |
| Audit for sensitive ops | Upload, view, financial | All capabilities log | Event bus | Audit cross-cutting | Persistent store |

## Unresolved Gaps

| Gap | Views Affected | Impact | Recommended Resolution |
|-----|----------------|--------|------------------------|
| Cross-clinic referral | Scenario, Logical | Patient care fragmentation | Define explicit patient consent bridge architecture |
| No API contract | Development, Process | Type drift, integration bugs | Adopt OpenAPI / GraphQL schema as contract |
| No blue/green deploy | Physical | Downtime on backend deploy | Add load balancer + health-check-based routing |
| No event schema registry | Development, Process | Consumer breakage on changes | Add Avro/JSON Schema registry |
| AI decision audit | Scenario, Process | Clinical liability | Add explainability log to Agent Service output |
| Untested backups | Physical | Disaster recovery uncertainty | Schedule quarterly restore drills |

## Anti-Patterns Avoided

| Anti-Pattern | Why Avoided |
|--------------|-------------|
| Shared database across modules | Each domain owns its schema; shared only for audit and auth |
| Frontend calling multiple backends | All business logic flows through Backend API |
| Synchronous AI processing | Agent Service is async to prevent blocking user flows |
| Direct module-to-module DB access | Modules communicate via API or events |
| Storing secrets in code | GitHub Secrets + environment variables |

## Architecture Evolution

| Current State | Next Evolution | Trigger |
|---------------|----------------|---------|
| Monorepo + Docker Compose | Kubernetes / managed containers | Scale beyond single VPS |
| Single-region | Multi-region with read replicas | International expansion |
| Sync AI | Streaming AI responses | Real-time assistant features |
| Manual backup testing | Automated restore validation | Compliance audit requirement |
| No CDN | CloudFront / Cloudflare | Global user base |
