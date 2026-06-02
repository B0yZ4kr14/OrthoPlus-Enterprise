# Project Specification — OrthoPlus Enterprise

**Version**: 1.1.0
**Last Updated**: 2026-06-02
**Source**: Merged feature specifications + Remediation Session

---

## Merged User Stories

### US-017.1 - Centralized Code Intelligence with GitNexus (Priority: P1)

As a developer or architect, I want the OrthoPlus Enterprise codebase to be fully indexed by GitNexus so that I can query relationships between symbols, trace execution flows, and perform safe refactors without manual code exploration.

**Independent Test**: Run `gitnexus analyze` on the repo and verify the index contains >30,000 nodes with correct relationship mappings.

**Acceptance Scenarios**:
1. Given the repo is cloned locally, When a developer runs the GitNexus indexing command, Then the entire codebase is indexed with symbols, relationships, and execution flows within 10 minutes.
2. Given GitNexus index is fresh, When an architect queries impact on a core service, Then the blast radius report includes all direct callers, affected modules, and risk classification.

*[Source: specs/017-omk-governance-integration]*

### US-017.2 - Specification-Driven Development with SpecKit (Priority: P2)

As a product manager or tech lead, I want every new feature in OrthoPlus Enterprise to follow the SpecKit SDD workflow so that requirements are traceable, scope is controlled, and implementation aligns with business needs.

**Independent Test**: Create a test feature using speckit-specify, verify the spec directory is created under `specs/`, and confirm feature.json is updated.

*[Source: specs/017-omk-governance-integration]*

### US-017.3 - Multi-Agent Orchestration with OMK (Priority: P2)

As a DevOps engineer, I want OMK to orchestrate the SpecKit workflow using multiple specialized agents so that feature development is automated and consistent.

**Independent Test**: Trigger an OMK flow for a small feature and verify that todos are created and agents are assigned.

*[Source: specs/017-omk-governance-integration]*

### US-017.4 - VPS Environment Documentation and Validation (Priority: P3)

As an administrator, I want the production VPS environment to be fully documented and validated so that deploys are reproducible and the team has a single source of truth.

**Independent Test**: Verify that production endpoints are documented and health checks return HTTP 200.

*[Source: specs/017-omk-governance-integration]*

---

## Functional Requirements

### Governance & Tooling

- **FR-017-001**: System MUST index the entire OrthoPlus Enterprise monorepo with GitNexus, including all TypeScript/JavaScript sources, Python agents, and configuration files.
- **FR-017-002**: System MUST provide queryable code intelligence via GitNexus for impact analysis, debugging traces, and refactoring operations.
- **FR-017-003**: System MUST support the full SpecKit SDD workflow: specify -> clarify -> plan -> tasks -> implement -> verify -> ship.
- **FR-017-004**: System MUST integrate SpecKit with the existing project structure.
- **FR-017-005**: System MUST orchestrate SpecKit workflows via OMK multi-agent system.
- **FR-017-006**: System MUST document the production VPS environment including network config, SSH access, service URLs, and Docker container topology.
- **FR-017-007**: System MUST validate that production endpoints are reachable and responding correctly.
- **FR-017-008**: System MUST ensure all domain references in code, configs, and documentation point to the canonical production domain.
- **FR-017-009**: System MUST maintain a canonical source of truth for VPS configuration that is version-controlled and auditable.

*[Source: specs/017-omk-governance-integration]*

---

## Key Entities

- **GitNexus Index**: Symbol graph containing 31,885 nodes, 66,404 edges, 883 clusters, 266 flows representing the OrthoPlus codebase structure.
- **SpecKit Feature**: A specification artifact living in `specs/<NNN>-<name>/` containing spec.md, plan.md, tasks.md, and checklists.
- **OMK Goal**: A tracked objective in the OMK memory graph with success criteria, evidence, and assigned squad agents.
- **VPS Configuration**: Immutable record of the production server including network addresses, access config, service ports, and Docker Compose topology.

*[Source: specs/017-omk-governance-integration]*

---

## Success Criteria

- **SC-017-001**: GitNexus index covers 100% of the monorepo source files and returns accurate impact analysis within 5 seconds.
- **SC-017-002**: Every new feature follows the SpecKit SDD workflow, with specs stored in `specs/` and traceable to git branches and OMK goals.
- **SC-017-003**: OMK automates quality gate execution across 4 SpecKit phases (specify, plan, implement, verify) with human-in-the-loop approval at plan and implement gates.
- **SC-017-004**: Production environment documentation is accurate and verifiable: all documented URLs return HTTP 200, SSH access works, and Docker containers are healthy.
- **SC-017-005**: Zero stale domain references remain in any source file, configuration, or documentation artifact.

*[Source: specs/017-omk-governance-integration]*

---

## Monitoring & Alerts

- **GitNexus Stale Index Alert**: If `gitnexus_index_age_seconds > 86400` (24h), trigger re-index via CI or local `npx gitnexus analyze`.
- **SSH Key Rotation Reminder**: Schedule calendar event every 90 days for key rotation.
- **SSL Expiry Alert**: Cloudflare Origin CA cert expires 23/07/2026; set reminder 30 days before.
- **SpecKit Compliance Gate**: Every PR touching `apps/`, `backend/`, `categories/` triggers `speckit-compliance.yml` validation.

*[Source: specs/017-omk-governance-integration]*
