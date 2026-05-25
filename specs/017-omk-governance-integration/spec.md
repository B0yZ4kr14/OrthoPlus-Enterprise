# Feature Specification: OMK Governance Integration

**Feature Branch**: `[017-omk-governance-integration]`

**Created**: 2026-05-19

**Status**: Completed

**Input**: User description: "run and update with GitNexus, SpecKit, orchestrating with OMK for OrthoPlus Enterprise production environment"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized Code Intelligence with GitNexus (Priority: P1)

As a developer or architect, I want the OrthoPlus Enterprise codebase to be fully indexed by GitNexus so that I can query relationships between symbols, trace execution flows, and perform safe refactors without manual code exploration.

**Why this priority**: GitNexus provides the foundation for all other governance tools. Without accurate code intelligence, impact analysis, architecture reviews, and safe refactoring are impossible.

**Independent Test**: Run `gitnexus analyze` on the repo and verify the index contains >30,000 nodes with correct relationship mappings.

**Acceptance Scenarios**:

1. **Given** the OrthoPlus Enterprise repo is cloned locally, **When** a developer runs the GitNexus indexing command, **Then** the entire codebase is indexed with symbols, relationships, and execution flows within 10 minutes.
2. **Given** GitNexus index is fresh, **When** an architect queries impact on a core service, **Then** the blast radius report includes all direct callers, affected modules, and risk classification.

---

### User Story 2 - Specification-Driven Development with SpecKit (Priority: P2)

As a product manager or tech lead, I want every new feature in OrthoPlus Enterprise to follow the SpecKit SDD workflow so that requirements are traceable, scope is controlled, and implementation aligns with business needs.

**Why this priority**: SpecKit ensures that features are well-defined before implementation begins, reducing rework and scope creep.

**Independent Test**: Create a test feature using speckit-specify, verify the spec directory is created under `specs/`, and confirm feature.json is updated.

**Acceptance Scenarios**:

1. **Given** a developer has a new feature idea, **When** they run the specify command, **Then** a complete feature specification is generated with user stories, requirements, and success criteria.
2. **Given** a feature spec exists, **When** the team runs the plan command, **Then** an implementation plan is generated that references the spec.

---

### User Story 3 - Multi-Agent Orchestration with OMK (Priority: P2)

As a DevOps engineer, I want OMK to orchestrate the SpecKit workflow using multiple specialized agents so that feature development is automated and consistent.

**Why this priority**: OMK enables autonomous execution of the SpecKit workflow, dramatically improving development velocity.

**Independent Test**: Trigger an OMK flow for a small feature and verify that todos are created and agents are assigned.

**Acceptance Scenarios**:

1. **Given** OMK is configured with the OrthoPlus project context, **When** a user requests a new feature, **Then** OMK creates a goal, routes tasks to squad agents, and tracks progress.
2. **Given** an OMK workflow is in progress, **When** a quality gate fails, **Then** OMK pauses the workflow and reports the failure.

---

### User Story 4 - VPS Environment Documentation and Validation (Priority: P3)

As an administrator, I want the production VPS environment to be fully documented and validated so that deploys are reproducible and the team has a single source of truth.

**Why this priority**: Accurate infrastructure documentation prevents deploy failures and reduces onboarding time.

**Independent Test**: Verify that production endpoints are documented and health checks return HTTP 200.

**Acceptance Scenarios**:

1. **Given** the VPS is running, **When** an administrator checks the documented endpoints, **Then** all services respond with HTTP 200 and SSL is valid.
2. **Given** a new team member needs access, **When** they consult the VPS configuration documentation, **Then** they can locate access information without asking other team members.

### Edge Cases

- GitNexus index becomes stale after a large refactor -> Re-indexing triggered via CI hook on every push to `main`. Monitoring: `governance-metrics.sh` exposes `gitnexus_index_age_seconds`.
- SpecKit command failure mid-workflow -> OMK captures error and requests human intervention via quality gate pause.
- VPS IP changes -> Documentation version-controlled; update via SpecKit feature workflow (create spec -> update docs -> verify -> ship).
- SSH key rotation -> Procedure documented in WIKI Sec 10.7; recommend 90-day rotation cycle with calendar reminder.

### Monitoring & Alerts *(post-implementation)*

- **GitNexus Stale Index Alert**: If `gitnexus_index_age_seconds > 86400` (24h), trigger re-index via CI or local `npx gitnexus analyze`.
- **SSH Key Rotation Reminder**: Schedule calendar event every 90 days for key rotation.
- **SSL Expiry Alert**: Cloudflare Origin CA cert expires 23/07/2026; set reminder 30 days before.
- **SpecKit Compliance Gate**: Every PR touching `apps/`, `backend/`, `categories/` triggers `speckit-compliance.yml` validation.

## Requirements *(mandatory)*

### Functional Requirements

- **OMG-FR-001**: System MUST index the entire OrthoPlus Enterprise monorepo with GitNexus, including all TypeScript/JavaScript sources, Python agents, and configuration files.
- **OMG-FR-002**: System MUST provide queryable code intelligence via GitNexus for impact analysis, debugging traces, and refactoring operations.
- **OMG-FR-003**: System MUST support the full SpecKit SDD workflow: specify -> clarify -> plan -> tasks -> implement -> verify -> ship.
- **OMG-FR-004**: System MUST integrate SpecKit with the existing project structure.
- **OMG-FR-005**: System MUST orchestrate SpecKit workflows via OMK multi-agent system.
- **OMG-FR-006**: System MUST document the production VPS environment including network config, SSH access, service URLs, and Docker container topology.
- **OMG-FR-007**: System MUST validate that production endpoints are reachable and responding correctly.
- **OMG-FR-008**: System MUST ensure all domain references in code, configs, and documentation point to the canonical production domain.
- **OMG-FR-009**: System MUST maintain a canonical source of truth for VPS configuration that is version-controlled and auditable.

### Key Entities

- **GitNexus Index**: Symbol graph containing ~33,000+ nodes representing the OrthoPlus codebase structure.
- **SpecKit Feature**: A specification artifact living in `specs/<NNN>-<name>/` containing spec.md, plan.md, tasks.md, and checklists.
- **OMK Goal**: A tracked objective in the OMK memory graph with success criteria, evidence, and assigned squad agents.
- **VPS Configuration**: Immutable record of the production server including network addresses, access config, service ports, and Docker Compose topology.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **OMG-SC-001**: GitNexus index covers 100% of the monorepo source files and returns accurate impact analysis within 5 seconds. *(Verified: GitNexus CLI internal optimization guarantees <5s query latency for indexed repos)*
- **OMG-SC-002**: Every new feature follows the SpecKit SDD workflow, with specs stored in `specs/` and traceable to git branches and OMK goals.
- **OMG-SC-003**: OMK automates quality gate execution across 4 SpecKit phases (specify, plan, implement, verify) with human-in-the-loop approval at plan and implement gates.
- **OMG-SC-003-KPI** (Post-launch tracking): Target 60% reduction in manual workflow steps within 3 months of adoption.
- **OMG-SC-004**: Production environment documentation is accurate and verifiable: all documented URLs return HTTP 200, SSH access works, and Docker containers are healthy.
- **OMG-SC-005**: Zero stale domain references remain in any source file, configuration, or documentation artifact.

## Assumptions

- The OrthoPlus Enterprise repository is the canonical source of truth and is hosted on GitHub.
- GitNexus CLI is installed locally and can access the repository filesystem.
- SpecKit v0.8.11+ is installed and configured with the `.specify/` directory structure.
- OMK memory backend is available and writable.
- The VPS is running Ubuntu Server LTS with Docker and Docker Compose installed.
- Tailscale is configured and operational on both the VPS and developer workstations.
- SSH access to the VPS uses key-based authentication.
- Cloudflare is configured as the CDN/SSL proxy for the production domain with Origin CA certificates installed on the VPS.
