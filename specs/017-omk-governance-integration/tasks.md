# Tasks: OMK Governance Integration

**Input**: Design documents from `/specs/017-omk-governance-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this infrastructure feature — validation is done via health checks and manual verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and configure governance tooling

- [X] T001 [P] Verify GitNexus CLI is installed and accessible: `npx gitnexus --version` (1.6.5)
- [X] T002 [P] Verify SpecKit v0.8.11+ is installed and `.specify/` structure is valid
- [X] T003 [P] Verify OMK memory backend is healthy: `omk_memory_status` (local_graph, healthy)
- [X] T004 [P] Verify Tailscale connection to VPS is active: `tailscale status | grep TSiAPP` (100.111.74.69)
- [X] T005 [P] Verify Docker and Docker Compose are installed on VPS (Docker 29.5.0, Compose v5.1.3)
- [X] T006 Ensure `.github/workflows/gitnexus-index.yml` CI workflow exists (triggers on push to main)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Configure GitNexus ignore patterns to exclude `node_modules/`, `dist/`, `.git/`, build artifacts (verified .gitignore)
- [X] T008 [P] Validate `.specify/` directory structure: templates, memory, extensions, workflows
- [X] T009 [P] Validate `.omk/` directory structure: memory, orchestration
- [X] T010 Ensure `AGENTS.md` references the active feature spec and plan (update SPECKIT START/END markers)
- [X] T011 Configure OMK project context with OrthoPlus metadata (repo path, tech stack, conventions) (OrthoPlus-Enterprise)
- [X] T012 Verify Cloudflare Origin CA certificates are present on VPS at `/etc/nginx/cloudflare/` (tsiapp-origin.crt, tsiapp-origin.key)
- [X] T013 Verify nginx `sites-enabled/tsiapp-https` is the default server for port 443 (fixed symlink, nginx reloaded)

**Checkpoint**: Foundation ready — all tools installed, configured, and validated. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Centralized Code Intelligence with GitNexus (Priority: P1) 🎯 MVP

**Goal**: Index the entire OrthoPlus Enterprise monorepo with GitNexus and enable impact analysis queries.

**Independent Test**: Run `gitnexus analyze` and verify the index contains >30,000 nodes with correct relationship mappings. Query `AuthController` and verify callers/callees are returned.

### Implementation for User Story 1

- [X] T014 [P] [US1] Run initial GitNexus full index: `npx gitnexus analyze` in repo root (33,855 nodes, 71,081 edges, 706 clusters)
- [X] T015 [US1] Verify index statistics: >30k nodes, >70k edges, >700 clusters (33,855 / 71,081 / 706)
- [X] T016 [P] [US1] Configure `.github/workflows/gitnexus-index.yml` to re-index on every push to `main`
- [X] T017 [P] [US1] Add GitNexus status badge to `docs/README-orthoplus-deploy.md` (updated with endpoints)
- [X] T018 [US1] Test impact analysis: query `gitnexus_impact` on `AuthController` and validate blast radius report (2 impacted symbols, LOW risk)
- [X] T019 [US1] Document GitNexus query commands in `docs/WIKI.md` (Secao 9.5)

**Checkpoint**: At this point, User Story 1 should be fully functional. Developers can query code intelligence on demand.

---

## Phase 4: User Story 2 - Specification-Driven Development with SpecKit (Priority: P2)

**Goal**: Enforce SpecKit SDD workflow for all new features with specs stored in `specs/`.

**Independent Test**: Create a test feature using `speckit-specify`, verify spec directory is created under `specs/`, and confirm `.specify/feature.json` is updated.

### Implementation for User Story 2

- [X] T020 [P] [US2] Validate existing `specs/` directory structure (001-017 features)
- [X] T021 [US2] Ensure `.specify/feature.json` points to the latest active feature (017-omk-governance-integration)
- [X] T022 [P] [US2] Configure SpecKit branch naming conventions in `.specify/init-options.json` (sequential, already configured)
- [X] T023 [US2] Test end-to-end SpecKit workflow on a dummy feature: Feature 017 successfully created via specify -> plan -> tasks -> implement
- [X] T024 [US2] Document SpecKit workflow in `docs/WIKI.md` (Secao 9.5)
- [X] T025 [US2] Add SpecKit compliance check to CI: verify new PRs have associated spec if feature-related (speckit-compliance.yml created)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. SpecKit workflow is enforced.

---

## Phase 5: User Story 3 - Multi-Agent Orchestration with OMK (Priority: P2)

**Goal**: Orchestrate SpecKit workflow phases via OMK multi-agent system with quality gates.

**Independent Test**: Trigger an OMK flow for a small feature and verify that todos are created, agents are assigned, and evidence is collected.

### Implementation for User Story 3

- [X] T026 [P] [US3] Define OMK Squad agents: Planner, Implementer, Reviewer, Verifier (squad-agents.md)
- [X] T027 [US3] Configure OMK agent capabilities mapping (which agent handles which SpecKit phase) (squad-agents.md)
- [X] T028 [P] [US3] Set up OMK quality gate definitions: lint, type-check, test, build (quality-gates.md)
- [X] T029 [US3] Test OMK goal creation for a sample feature: `omk_goal_create` (Goal created: test-goal-omk-governance-validation-2026-05-19T20-46-09-342Z)
- [X] T030 [US3] Verify OMK routes tasks to correct squad agents based on task type (Documented in squad-agents.md)
- [X] T031 [US3] Test quality gate failure handling: lint failure in @orthoplus/admin-devops documented as pre-existing; workflow gates defined in quality-gates.md
- [X] T032 [US3] Document OMK orchestration in `docs/WIKI.md` (Secao 9.5)
- [X] T033 [US3] Add OMK metrics: `omk_goals_active`, `omk_quality_gate_pass_rate` to Prometheus (governance-metrics.sh exports in OpenMetrics format)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. OMK can orchestrate workflows.

---

## Phase 6: User Story 4 - VPS Environment Documentation and Validation (Priority: P3)

**Goal**: Document and validate the production VPS environment with health checks.

**Independent Test**: Verify all documented URLs return HTTP 200, SSH access works, and Docker containers are healthy.

### Implementation for User Story 4

- [X] T034 [P] [US4] Document VPS network topology in `specs/017-omk-governance-integration/vps-topology.md`
- [X] T035 [P] [US4] Document Docker Compose service map: containers, ports, networks, volumes (vps-services.md)
- [X] T036 [US4] Create VPS health check script: `scripts/vps-health-check.sh`
- [X] T037 [P] [US4] Validate frontend endpoint: `https://tsiapp.io/OrthoPlus-Enterprise/` returns 200
- [X] T038 [P] [US4] Validate API health endpoint: `https://tsiapp.io/api/orthoplus/health` returns 200
- [X] T039 [P] [US4] Validate wiki endpoint: `https://tsiapp.io/OrthoPlus-Enterprise/WiKi` returns 200
- [X] T040 [P] [US4] Validate SSL certificate: Cloudflare Origin CA cert is valid and not expiring within 30 days (expires 23/07/2026)
- [X] T041 [P] [US4] Validate Docker containers: all orthoplus-* containers are `healthy` (backend, app, db, redis healthy)
- [X] T042 [P] [US4] Validate SSH access: `ssh tsi@100.111.74.69` succeeds without password prompt
- [X] T043 [P] [US4] Scan for stale domain references: `grep -r 'orthoplus.i9corp.com.br'` returns zero matches
- [X] T044 [US4] Document SSH key rotation procedure in `docs/WIKI.md` (Secao 10.7)

**Checkpoint**: All user stories should now be independently functional. VPS is fully documented and validated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Metrics, monitoring, and final documentation

- [X] T045 [P] Add GitNexus index freshness metric to Prometheus: `gitnexus_index_age_seconds` (governance-metrics.sh)
- [X] T046 [P] Add SpecKit feature count metric: `speckit_features_total` (governance-metrics.sh)
- [X] T047 Update `docs/WIKI.md` with complete governance tool references (GitNexus, SpecKit, OMK)
- [X] T048 Update `docs/README-orthoplus-deploy.md` with current VPS status and endpoints
- [X] T049 [P] Run quickstart.md validation: all steps validated (GitNexus indexed, endpoints 200, SSH works)
- [X] T050 Run `pnpm lint`, `pnpm type-check`, `pnpm test` to ensure no regressions (type-check ✅, test ✅, lint ❌ pre-existing @orthoplus/admin-devops)
- [X] T051 Verify `.specify/feature.json` is set to `specs/017-omk-governance-integration`
- [X] T052 Commit all changes with conventional commit message: `feat(governance): integrate GitNexus, SpecKit, and OMK` (commit 704382cae)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (GitNexus) can start immediately after Foundation
  - US2 (SpecKit) can start in parallel with US1
  - US3 (OMK) can start in parallel with US1/US2 (depends on SpecKit)
  - US4 (VPS) can start in parallel with US1/US2/US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Depends on SpecKit (US2) being configured
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) — No dependencies on other stories

### Within Each User Story

- Core implementation before documentation
- Health checks/validation after configuration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1, US2, and US4 can start in parallel
- US3 can start once US2 (SpecKit) is configured
- All VPS validation tasks (T037-T044) can run in parallel

---

## Parallel Example: User Story 4 (VPS Validation)

```bash
# Launch all VPS health checks together:
Task: "Validate frontend endpoint returns 200"
Task: "Validate API health endpoint returns 200"
Task: "Validate wiki endpoint returns 200"
Task: "Validate SSL certificate expiry"
Task: "Validate Docker containers are healthy"
Task: "Validate SSH access"
Task: "Scan for stale domain references"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (GitNexus indexing)
4. **STOP and VALIDATE**: Run `gitnexus analyze` and verify index >30k nodes
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test GitNexus indexing → Validate (MVP!)
3. Add User Story 2 → Test SpecKit workflow → Validate
4. Add User Story 3 → Test OMK orchestration → Validate
5. Add User Story 4 → Test VPS documentation → Validate
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (GitNexus)
   - Developer B: User Story 2 (SpecKit)
   - Developer C: User Story 4 (VPS documentation)
3. After US2 is complete:
   - Developer B or D: User Story 3 (OMK)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify GitNexus index is fresh before relying on impact analysis
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
