# Physical View

**Input**: `.specify/memory/architecture-process-view.md`, `.specify/memory/architecture-development-view.md`

**Purpose**: Derive deployment, hosting, external system, fact-source, observability, and operational boundaries from process and development views.

## Architecture Intent

Preserve the physical meaning of tenant isolation: each deployment unit carries a single responsibility, external systems are clearly bounded, and operational concerns (backup, observability, audit) do not compromise runtime boundaries. The physical view must make explicit which runtime units host which components, where authoritative facts live, and how failure of one unit affects others.

## Core Tensions

| Tension | Current Tradeoff Direction | Physical Consequence |
|---------|----------------------------|----------------------|
| Single-VPS simplicity vs horizontal scalability | Single host deployment with Docker Compose; no orchestrator | All containers share host resources; scaling requires host upgrade |
| Database colocation with application vs external DB | PostgreSQL runs in container alongside backend | Backup and recovery are host-local; external DB would require network security |
| AI service external vs self-hosted | External AI for development assistance; self-hosted local vision model for medical images to ensure data residency | Medical images never leave clinic boundary; development AI uses external provider; medical AI runs locally |
| File storage local vs external S3 | MinIO S3 available for on-premise; external S3 for cloud | On-premise keeps data local; external offloads storage management |
| Session state in Redis vs database | Redis for transient session and cache data | Redis loss means re-authentication required; no permanent data loss |

## Stable Boundaries

| Boundary | Must Remain Stable Because | Explicitly Does Not Carry |
|----------|----------------------------|---------------------------|
| Reverse Proxy runtime unit | Entry point for all external traffic; TLS termination; rate limiting | Business logic; session state; database connections |
| Frontend runtime unit | Static SPA assets served to browsers | Dynamic data; API execution |
| Backend runtime unit | All business logic execution; API request handling | Frontend assets; AI model inference |
| Agent Service runtime unit | Development-assistance workloads | Production patient data; business logic mutation |
| Local AI Runtime unit | Medical image inference; advisory findings generation | Patient metadata; direct database access; clinical decision authority |
| Database runtime unit | Authoritative persistent state for all domain objects | Business logic; session cache |
| Cache runtime unit | Transient session and rate-limiting state | Permanent business data |
| Object Storage runtime unit | File binaries and versions | File metadata; indexing state |
| Observability runtime unit | Metrics and log aggregation | Business logic; request handling |

## Change Axes

| Expected Change | Isolated By | Physical Impact |
|-----------------|-------------|-----------------|
| Increased user load | Backend and frontend runtime units | Horizontal scaling would require load balancer and stateless backend |
| New external AI provider | Agent Service runtime unit | API endpoint change; no impact on backend or frontend |
| New medical imaging AI model | Local AI Runtime unit | Model binary update; no data boundary change; no external impact |
| New compliance region | Deployment environment boundary | New VPS or region; data residency requirement |
| New notification provider | External notification gateway boundary | New integration endpoint; no runtime unit changes |
| Storage growth | Object Storage runtime unit | Volume expansion or migration; no application changes |
| Monitoring requirements | Observability runtime unit | New dashboards or alerts; no application logic changes |

## Invariants

| Invariant | Source Deployment / External / Fact Boundary | Risk If Violated |
|-----------|----------------------------------------------|------------------|
| Patient data never leaves clinic boundary at rest | Database runtime unit; Object Storage runtime unit | Data residency violation; LGPD breach |
| All external traffic enters through reverse proxy | Reverse Proxy runtime unit | Direct container access; TLS bypass; attack surface expansion |
| Backend runtime unit is the only unit accessing database | Database runtime unit boundary | Unauthorized data access; audit bypass |
| Agent Service has no direct database access | Agent Service runtime unit boundary | Patient data exposure to AI systems; compliance breach |
| Cache data is reconstructable from database | Cache runtime unit boundary | Session loss acceptable; no permanent data loss |
| Audit logs are persisted separately from operational database | Audit fact source boundary | Tampering with audit trail; compliance failure |
| Object Storage encryption at rest | Object Storage runtime unit | File content exposure if storage volume compromised |

## Non-goals / Anti-patterns

| Non-goal / Anti-pattern | Why It Is Out of Scope or Harmful |
|-------------------------|-----------------------------------|
| Kubernetes or orchestrator deployment | Current scale and team size do not justify orchestrator complexity |
| Multi-region active-active deployment | Single-tenant clinic use case does not require geographic distribution |
| Self-hosted general-purpose LLM inference | GPU infrastructure and model management for general LLMs are out of scope; scoped exception for medical imaging vision model |
| Database sharding by clinic | Current data volume does not justify sharding complexity |
| CDN for static assets | Single-region deployment; CDN adds unnecessary complexity |
| Real-time backup to external cloud | Backup strategy is operational, not architecture; local and offsite backup are sufficient |

## Deployment and Hosting Boundaries

| Runtime / Hosting Unit | Carries | Boundary | Depends On | Release / Migration Impact |
|------------------------|---------|----------|------------|----------------------------|
| Reverse Proxy | TLS termination; rate limiting; request routing; static asset caching | Network edge | Backend; Frontend; Agent Service; Object Storage | Configuration reload only; no downtime for SPA or backend updates |
| Frontend SPA | Compiled SPA assets; static HTML/CSS/JS | Presentation layer | Reverse Proxy only | Blue-green or rolling; cache invalidation required |
| Backend API | Business logic execution; API endpoints; event publishing | Application layer | Database; Cache; Object Storage; External notifications | Requires health check pass; database migrations precede code deployment |
| Agent Service | AI workflows; code analysis; development tools | Development assistance layer | Backend API (read); External AI provider | Independent release cycle; no impact on production data |
| Database | All domain object persistent state; audit log | Data layer | Host storage volumes | Migrations require downtime window or online migration strategy |
| Cache | Session tokens; rate limit counters; transient query results | Session and cache layer | Host memory/volume | Loss requires re-authentication; no data migration needed |
| Object Storage | File binaries; document versions; backups | Storage layer | Host storage volumes or external S3 | Files are portable; metadata remains in Database |
| Observability Stack | Metrics; logs; dashboards | Monitoring layer | Backend logs and metrics endpoints | Independent lifecycle; read-only from application perspective |
| External AI Provider | LLM inference; code generation; analysis | External AI layer | Internet connectivity | No operational control; fallback to degraded mode if unavailable |
| Local AI Runtime (Medical Imaging) | Vision model inference for dental radiographs | Clinic-internal AI layer | Host GPU or CPU resources | Analysis unavailable; Dentista proceeds without AI assistance |
| External Notification Gateway | SMS delivery; email delivery | External communication layer | Internet connectivity | No operational control; retry and queue managed by Backend |

## External System Collaboration

| External System | Purpose | Exchanged Content | Authoritative Fact | Failure Impact | Isolation / Substitute Boundary |
|-----------------|---------|-------------------|--------------------|----------------|---------------------------------|
| AI Provider Gateway | Generate code suggestions; analyze documents; development assistance | Development context in; suggestions out | None (advisory only) | Agent Service unavailable; no production impact | Agent Service runtime unit caches or queues requests |
| SMS Gateway | Deliver transactional SMS to patients | Phone number; message content | Delivery status (non-authoritative; logged) | Notification delayed or lost; retry by Communication module | Multiple provider fallback possible |
| Email Gateway | Deliver transactional and marketing email | Email address; message content | Delivery status (non-authoritative; logged) | Notification delayed or lost; retry by Communication module | Multiple provider fallback possible |
| Object Storage (MinIO or External S3) | Store file binaries and versions | File bytes in; file bytes out | File content is authoritative only within clinic boundary | Document upload blocked; retrieval fails | Local volume or alternative S3-compatible store |
| Payment Gateway (future) | Process online payments | Invoice reference; payment details | Payment confirmation is authoritative for invoice closure | Payment cannot be completed; invoice remains open | Manual payment recording as fallback |

## Fact Sources and Observability

| Fact / Event | Authoritative Source | Observable Location | Consumers | Traceability Requirement |
|--------------|----------------------|---------------------|-----------|--------------------------|
| Domain object state | Database runtime unit | Backend API responses; Frontend displays | Frontend; Backend modules; External integrations | Change must trace to user or system actor |
| Session validity | Cache runtime unit | Auth middleware decision | Backend API; Frontend | Token issuance traceable to login event |
| Audit log entry | Database runtime unit (audit schema) | Admin audit view; compliance export | Compliance officers; System | Immutable; append-only; retention per LGPD |
| File content | Object Storage runtime unit | Document download; OCR index | Frontend; Backend (Document Management) | Version chain traceable to upload event |
| Application metric | Backend / Frontend runtime units | Observability Stack dashboards | Operations team; System | Metric source traceable to runtime unit |
| Error / Exception | Backend / Frontend runtime units | Observability Stack logs; alerts | Operations team; Developers | Error traceable to request and user context |
| Event bus message | Event Bus (within Backend runtime unit) | Backend logs; metrics | Subscribing backend modules | Message traceable to publisher and original request |
| AI suggestion | External AI Provider | Agent Service response | Developer; Dentista (advisory) | Not authoritative; human decision overrides |
| Delivery status (SMS/Email) | External Notification Gateway | Backend logs; Communication module | Staff; Patient | Delivery attempt traceable to notification request |

## Operations and Release Boundaries

| Operational Concern | Responsible Boundary | Trigger | Affected Views | Architecture Consequence |
|---------------------|----------------------|---------|----------------|--------------------------|
| Database migration | Backend API runtime unit | Release deployment | Development; Physical | Schema must be forward-compatible; rollback requires restore |
| Backup and recovery | Database and Object Storage runtime units | Scheduled (automated) or manual | Physical | Recovery point objective defined by schedule; recovery time objective by operational procedure |
| Certificate rotation | Reverse Proxy runtime unit | Expiry schedule or security event | Physical | TLS must not lapse; automation preferred |
| Cache eviction | Cache runtime unit | TTL expiry; manual flush | Process; Physical | Session loss acceptable; no data loss |
| Log retention | Observability Stack | Scheduled policy enforcement | Physical | LGPD requires configurable retention; audit logs retained longer than operational logs |
| Rate limit adjustment | Reverse Proxy runtime unit | Operational decision or attack response | Process; Physical | Must not block legitimate clinic operations |
| Agent Service update | Agent Service runtime unit | Development cycle; model update | Development; Physical | Independent release; no production data impact |
| Module enablement/disablement | System Administration module (Backend API) | Admin action | Scenario; Logical | Affects which scenarios are available; does not remove data |
| Health check failure response | Each runtime unit | Health endpoint failure | Physical | Failed unit should not receive traffic; depends on reverse proxy or orchestrator |

## Physical View Gaps

| Gap | Affected Deployment / External Boundary | Why It Matters |
|-----|-----------------------------------------|----------------|
| Disaster recovery site undefined | Database; Object Storage | No secondary site specified for backup restoration; affects recovery time objective |
| Database migration rollback strategy undefined | Database; Backend API | Forward-only migrations assumed; no architecture-level rollback contract |
| Agent service scaling boundary undefined | Agent Service | AI workload may be bursty; no physical boundary defined for horizontal scaling |
| Object storage encryption key management undefined | Object Storage | Files contain clinical and financial data; encryption key lifecycle not specified |
| Multi-tenant network isolation undefined | All runtime units | Containers share host network; no network-level segregation between clinic data flows |
| Observability data residency undefined | Observability Stack | Metrics and logs may contain clinic identifiers; LGPD may require residency controls |

## Prohibited Content

Do not write Kubernetes YAML, cloud resource manifests, machine sizes, service SKUs, deployment scripts, runbooks, or concrete infrastructure configuration here.
