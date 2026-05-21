# Development View

**Input**: `.specify/memory/architecture-logical-view.md`, `.specify/memory/architecture-process-view.md`

**Purpose**: Derive architecture-level components, package boundary intent, contract/artifact semantics, and dependency rules from logical and process views.

## Architecture Intent

Preserve component boundaries that mirror logical capabilities while enforcing unidirectional dependencies. The frontend presents capabilities to users; the backend implements capabilities with module-level isolation; the agent service provides development assistance; infrastructure services provide cross-cutting concerns. No component may depend on a component that depends back on it.

## Core Tensions

| Tension | Current Tradeoff Direction | Development Consequence |
|---------|----------------------------|-------------------------|
| Monorepo cohesion vs build independence | Single repository; separate buildable units per workspace | Shared types package enables contract stability; individual workspaces build independently |
| Frontend module count vs bundle granularity | 37 frontend modules mapped to backend capabilities | Lazy loading isolates modules; shared core package provides common UI |
| Backend module autonomy vs shared infrastructure | Each module owns its domain logic; shared database, auth, and event infrastructure | Modules depend on infrastructure, not on each other directly |
| Agent service independence vs backend coupling | Agent service is separate runtime component | Agent service communicates via API only; no direct database access |
| Self-hosted medical AI vs external AI service | Self-hosted vision model for medical images to ensure data residency | Local AI runtime processes images within clinic boundary; no external data transfer; LGPD compliant |
| Type sharing across stack vs backend independence | Shared types package used by frontend and backend | Type changes require coordinated update; but prevents contract drift |

## Stable Boundaries

| Boundary | Must Remain Stable Because | Explicitly Must Not Own |
|----------|----------------------------|-------------------------|
| Frontend SPA | Single user-facing runtime; all capability presentations route through it | Business logic execution; database access; cross-tenant state |
| Backend API | All business logic and data persistence authority | UI rendering; user session management (delegated to auth infrastructure) |
| Agent Service | Development-assistance only; isolated from production patient data | Direct database access; production business logic execution |
| Shared Types | Cross-stack contract stability | Business logic; UI components; runtime behavior |
| Core UI Package | Reusable presentation primitives | Domain logic; backend communication |
| Infrastructure Layer | Cross-cutting technical concerns (database, cache, events, audit) | Business rules; domain object definitions |

## Change Axes

| Expected Change | Isolated By | Development Impact |
|-----------------|-------------|--------------------|
| New backend module | Backend module boundary | New workspace or directory; no existing module changes |
| New frontend module | Frontend module boundary | New lazy-loaded module; imports from core UI only |
| New AI capability | Agent service boundary | New workflow or agent; no backend module changes |
| Database schema evolution | Backend module and shared types | Shared types update; backend migration; frontend adapts |
| New shared UI component | Core UI package | New export; consumers update independently |
| Compliance requirement (LGPD) | Audit and consent infrastructure | New middleware or interceptor; modules opt-in |

## Invariants

| Invariant | Source Boundary / Contract / Dependency Rule | Risk If Violated |
|-----------|----------------------------------------------|------------------|
| Frontend depends only on backend via shared types and API contracts | Dependency rule: frontend → backend (via API) | Frontend embeds business logic; backend becomes thin CRUD |
| Backend modules must not import each other's internal implementation | Dependency rule: module → infrastructure only | Tight coupling; cascade changes; loss of modularity |
| Agent service must not depend on backend internals | Dependency rule: agent service → backend API only | Circular dependency; agent service bypasses API |
| Shared types must not depend on framework-specific types | Dependency rule: shared types are framework-agnostic | Frontend or backend constrained by other's framework |
| Core UI package must not depend on backend or domain logic | Dependency rule: core UI is presentational only | UI components become coupled to specific capabilities |
| Event bus contracts are owned by the publishing module | Contract rule: publisher defines event shape | Consumer-driven events create breaking changes for publisher |

## Non-goals / Anti-patterns

| Non-goal / Anti-pattern | Why It Is Out of Scope or Harmful |
|-------------------------|-----------------------------------|
| Microservices split at current scale | Adds operational complexity without solving a development boundary problem |
| Frontend-backend code sharing beyond types | Business logic would diverge or create hidden coupling |
| Agent service direct database access | Would bypass API boundaries, auth, and audit |
| Circular dependencies between modules | Breaks build order, understanding, and safe refactoring |
| Generic CRUD framework replacing module-specific logic | Would erase domain semantics embedded in module boundaries |

## Architecture-Level Components

| Component / Capability Package | Responsibility | Input / Output Boundary | Collaborators | Explicitly Must Not Own | Source View Evidence |
|--------------------------------|----------------|-------------------------|---------------|--------------------------|----------------------|
| Frontend SPA | Present capabilities to users; capture user input; display data from backend | User interactions in; rendered UI out | Backend API (via HTTP); Shared Types (for contracts); Core UI Package | Business logic; database persistence; direct agent service calls | Scenario view: all user-facing scenarios; Process view: auth and clinicGuard runtime links |
| Backend API | Execute business logic; enforce invariants; persist data; produce events | HTTP requests in; JSON responses and events out | Database; Redis; Event Bus; External systems (email, SMS, S3); Local AI runtime | UI rendering; frontend state management | Logical view: all capability boundaries; Process view: all runtime links |
| Agent Service | Generate development artifacts; analyze code; assist with database queries | Development task requests in; suggestions and analysis out | Backend API (read-only); AI providers | Production patient data; business logic mutation | Scenario view: AI Agent actor; Process view: AI Agent request runtime link |
| Local AI Runtime | Process medical images and produce advisory findings | Image bytes in; structured findings out | None (self-contained) | Patient metadata; direct database access; clinical decision authority | Scenario view: AI Médica actor; Process view: Medical Image Analysis runtime link |
| Shared Types Package | Define cross-stack type contracts for API payloads and responses | Type definitions exported | Frontend SPA; Backend API | Runtime logic; framework bindings | Development view invariant: shared types are framework-agnostic |
| Core UI Package | Provide reusable, accessible UI primitives and common interaction patterns | Component props in; rendered elements out | Frontend SPA modules | Domain logic; backend communication | Scenario view: user interaction scenarios |
| Database | Persist authoritative state for all domain objects | SQL queries in; data out | Backend API only | Business logic; direct access from frontend or agent service | Logical view: all domain objects; Process view: all persistence runtime links |
| Redis | Cache sessions, rate limiting counters, and transient state | Key-value operations | Backend API only | Permanent business data; direct access from frontend | Process view: auth session runtime link |
| Event Bus | Deliver cross-module domain events asynchronously | Events published in; events delivered to handlers | Backend API modules | Event semantics (owned by publisher); guaranteed ordering | Process view: cross-boundary event runtime links |
| External Notification Gateway | Deliver SMS and email messages | API requests in; delivery status out | Backend API (Communication module) | Message content generation; recipient management | Process view: notification dispatch runtime link |
| External Object Storage | Store file binaries and versions | Upload/Download operations | Backend API (Document Management module) | File metadata; indexing logic | Process view: document upload runtime link |
| Auth Infrastructure | Validate tokens; resolve user identity and clinic context | Token in; user and clinic context out | Backend API; Frontend SPA | Permission decisions (delegated to System Administration module) | Process view: authentication runtime link |
| Audit Infrastructure | Record sensitive operations | Operation details in; log entry out | Backend API (all modules) | Blocking or altering operations | Process view: audit logging runtime link |

## Package Boundary Intent

| Package / Boundary | Abstraction Level | Owned Concepts | May Depend On | Must Not Depend On | Evolution Rule |
|--------------------|-------------------|----------------|---------------|--------------------|----------------|
| Frontend Module (per capability) | Feature module | Pages, components, hooks for one capability | Core UI Package; Shared Types; Frontend infrastructure (router, state) | Other frontend modules directly; Backend internals | Add features independently; route changes do not affect other modules |
| Core UI Package | Shared presentational | Buttons, inputs, cards, tables, modals | None (framework only) | Domain logic; Backend API | Add primitives without breaking consumers; versioned |
| Backend Module (per capability) | Domain module | Domain objects, use cases, events for one capability | Infrastructure packages; Shared Types | Other backend modules' internals | Add domain behavior independently; schema changes may require shared types update |
| Shared Types | Cross-stack contract | API payload types; shared enums | None (pure types) | Framework types; Domain logic | Evolve with API contract changes; versioned |
| Backend Infrastructure | Technical foundation | Database access; caching; event bus; auth middleware; audit | Shared Types; External libraries | Business logic; Module internals | Evolve independently; modules adapt via abstractions |
| Agent Service | External assistant | Workflows; agents; tools | Backend API (read); AI provider SDKs | Backend internals; Database directly | Evolve independently; no coupling to backend release cycle |

## Contracts and Artifacts

| Contract / Artifact | Semantics | Producer | Consumer | Lifecycle | Architecture Consequence |
|---------------------|-----------|----------|----------|-----------|--------------------------|
| API Contract (REST) | Request/response shape for capability operations | Backend module | Frontend SPA; External consumers | Versioned; breaking changes require shared types update | Frontend and backend evolve in lockstep for contract changes |
| Shared Type Definition | TypeScript types mirroring API contract | Shared Types Package | Frontend SPA; Backend API | Versioned with API contract | Compile-time safety; runtime behavior not guaranteed |
| Domain Event | Immutable notification of state change within a capability | Backend module (publisher) | Backend module (subscriber) | Published once; consumed zero or more times | Decouples modules; consumers must handle duplicates and ordering |
| UI Component Interface | Props, events, and accessibility contract for UI primitive | Core UI Package | Frontend modules | Semantic versioning | UI changes may require consumer updates |
| Auth Token | Signed claim of identity and clinic context | Auth Infrastructure | Frontend SPA (holder); Backend API (validator) | Time-bounded; refreshable | Token compromise affects single session; clinic context embedded |
| Agent Service Request | Structured development task description | Client (Developer tool) | Agent Service | Synchronous request/response | No persistent state; no patient data |
| Database Schema | Persistent structure for domain objects | Backend module (via migration) | Backend module (runtime) | Migrated forward; rollback requires restore | Schema changes require coordinated code deployment |
| Audit Log Entry | Immutable record of sensitive operation | Audit Infrastructure | Compliance consumers; Admin views | Append-only; retention policy governed by LGPD | Tamper evidence; not used for operational logic |

## Dependency Rules

| Rule | Allowed Direction | Forbidden Direction | Reason | Risk If Violated |
|------|-------------------|---------------------|--------|------------------|
| Frontend to Backend | Frontend SPA → Backend API (via HTTP) | Backend API → Frontend SPA | Frontend is a consumer; backend must not know presentation | Backend logic leaks into frontend; circular deployment dependency |
| Frontend Modules Isolation | Frontend Module → Core UI; Frontend Module → Shared Types | Frontend Module A → Frontend Module B internals | Modules are independent features | Feature coupling; bundle bloat; unintended side effects |
| Backend Modules Isolation | Backend Module → Infrastructure; Backend Module → Shared Types | Backend Module A → Backend Module B internals | Modules are independent domains | Domain coupling; cascade changes; loss of modularity |
| Cross-Module Communication | Backend Module A → Event Bus → Backend Module B (via events only) | Backend Module A → Backend Module B direct import | Events decouple modules | Hidden coupling; breaking changes propagate |
| Agent Service Boundary | Agent Service → Backend API (read) | Agent Service → Database; Agent Service → Backend internals | Agent service is external consumer | Security boundary breach; data access bypasses auth |
| Shared Types Purity | Shared Types → none (pure definitions) | Shared Types → Framework libraries | Types must be stack-agnostic | Frontend or backend locked to shared framework |
| Core UI Purity | Core UI → Framework (React) only | Core UI → Backend API; Core UI → Domain logic | UI primitives are presentational only | UI components become coupled to specific features |
| Infrastructure to Modules | Infrastructure provides abstractions used by modules | Modules → Infrastructure internals | Modules depend on interfaces, not implementations | Module tests require real infrastructure; tight coupling |

## Development View Gaps

| Gap | Affected Component / Boundary | Why It Matters |
|-----|-------------------------------|----------------|
| Contract versioning strategy undefined | API Contract; Shared Types | No explicit rule for how breaking API changes are managed across frontend and backend |
| Frontend module lazy-loading boundary not fully defined | Frontend Module | Unclear whether all 37 modules are independently loadable or grouped |
| Agent service authentication contract undefined | Agent Service; Backend API | Agent service calls backend API but auth mechanism is not specified as architecture contract |
| Event schema ownership and evolution undefined | Domain Event; Backend modules | No contract defines who owns event schemas and how subscribers handle schema changes |
| Cross-platform mobile component boundary undefined | Frontend SPA | No architecture-level component exists for native mobile if planned |

## Prohibited Content

Do not write source file paths, concrete package trees, classes, functions, implementation tasks, framework-specific wiring, or code generation notes here.
