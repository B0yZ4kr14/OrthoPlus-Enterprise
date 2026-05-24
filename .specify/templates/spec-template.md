# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: In Progress

**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

### Multi-Tenancy Requirements *(OrthoPlus-specific)*

<!--
  All data access MUST be scoped by clinicId (Constitution GP-1).
  Every feature involving data MUST explicitly declare how clinic isolation works.
-->

- **MT-001**: All database queries MUST filter by `clinicId`
- **MT-002**: Backend routes MUST use `clinicGuard` middleware
- **MT-003**: Frontend localStorage keys MUST be scoped by `userId + clinicId`
- **MT-004**: Cross-clinic data access MUST be blocked at API level

### Database Requirements *(Prisma/PostgreSQL)*

<!--
  If feature involves schema changes:
  - Document models and relationships
  - Note cross-schema constraints (6 categories: CORE, FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO)
  - Plan for database.ts regeneration after schema changes
  - Use @@schema("pep") for clinical/operational tables
-->

- **DB-001**: [Model changes or N/A]
- **DB-002**: [Cross-category reads/writes or N/A]
- **DB-003**: [Migration strategy or N/A]
- **DB-004**: [Enum additions/changes or N/A]
- **DB-005**: [database.ts regeneration needed? Yes/No]

### Async Processing Requirements *(BullMQ/Redis)*

<!--
  Only include if feature requires background jobs.
  Reference Constitution WP-1 through WP-4 for conventions.
-->

- **ASYNC-001**: [Does this feature need async processing? Yes/No]
- **ASYNC-002**: [Queue name: `{module}-{action}`]
- **ASYNC-003**: [Worker file location: `backend/src/workers/{name}Worker.ts`]
- **ASYNC-004**: [Frontend polling strategy or webhook callback]
- **ASYNC-005**: [Job retry policy: attempts, backoff type]

### Frontend/Backend Split *(full-stack features)*

<!--
  For features touching both frontend and backend:
  - Define API contract (endpoints, request/response shape)
  - Specify which frontend modules are affected
  - Note shared-types changes needed
-->

- **API-001**: [Endpoint definition or N/A]
- **FE-001**: [Affected frontend modules or N/A]
- **ST-001**: [Shared-types changes or N/A]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes (Buildable — verifiable during implementation)

- **SC-001**: [Measurable metric verifiable in code/tests, e.g., "Endpoint responds in <200ms p95"]
- **SC-002**: [Measurable metric verifiable in code/tests, e.g., "All routes protected by clinicGuard"]
- **SC-003**: [Measurable metric verifiable in code/tests, e.g., "Zero new `as any` or `@ts-ignore` added"]

### Post-Launch KPIs (Business — tracked after deployment)

- **KPI-001**: [Business outcome metric, e.g., "Reduce support tickets related to [X] by 50% within 3 months"]
- **KPI-002**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]

## Agent Service Requirements *(if applicable)*

<!--
  Only include this section if the feature requires changes to the Python Agent Service.
  Most features only touch frontend + backend.
-->

### When to Include
- Feature requires a new AI agent or workflow
- Feature modifies existing agent behavior (backend, frontend, or database agents)
- Feature needs new tools in `agent-service/src/tools/`

### Requirements
- [ ] Pydantic v2 schema for all agent inputs/outputs
- [ ] FastAPI endpoint registered in `agent-service/src/main.py`
- [ ] Agno 2.5+ agent definition with explicit tool registry
- [ ] Independent env var configuration in `agent-service/src/config.py`
- [ ] Python logging (not print statements)
- [ ] No shared secrets with Node.js backend
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
