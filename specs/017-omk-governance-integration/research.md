# Research: OMK Governance Integration

**Date**: 2026-05-19
**Feature**: 017-omk-governance-integration

## Decisions

### GitNexus Integration Pattern

**Decision**: Use GitNexus as a read-only code intelligence layer. The index is refreshed via CI hook on every push to `main`.

**Rationale**: GitNexus provides symbol-level impact analysis that is critical for safe refactoring in a 33k+ symbol monorepo. Running it in CI ensures the index never becomes stale.

**Alternatives considered**:
- Manual re-indexing: Rejected — developers forget to run it, leading to stale data.
- Pre-commit hook: Rejected — adds ~5min to every commit, too slow.

### SpecKit Workflow Enforcement

**Decision**: SpecKit SDD workflow is mandatory for all new features but optional for hotfixes and documentation-only changes.

**Rationale**: Full SDD for every change creates too much friction for urgent fixes. The compromise ensures features are well-specified while allowing rapid response to production issues.

**Alternatives considered**:
- Mandatory for all changes: Rejected — too heavy for README updates and emergency patches.
- Optional for everything: Rejected — leads to specification drift and untraceable features.

### OMK Orchestration Scope

**Decision**: OMK orchestrates the SpecKit workflow phases (specify → plan → tasks → implement → verify) but does NOT write application code directly. Human approval is required at plan and implement gates.

**Rationale**: Fully autonomous code generation is too risky for a production healthcare system. OMK should assist and automate the workflow, but critical decisions (architecture, security, patient data handling) remain human-driven.

**Alternatives considered**:
- Full auto-pilot: Rejected — LGPD and healthcare compliance require human oversight.
- Manual only: Rejected — misses the velocity benefits of agent orchestration.

### VPS Documentation Strategy

**Decision**: VPS configuration is documented in THREE places for redundancy:
1. This spec (`spec.md`) — human-readable, version-controlled
2. `.env.production.example` — canonical template for new environments
3. VPS actual `.env` file — source of truth for the running system

**Rationale**: Multiple sources prevent single points of failure. If the VPS is rebuilt, the `.env.production.example` can regenerate the config. If the repo is lost, the VPS `.env` preserves the current state.

## Unknowns Resolved

None. All technical decisions have reasonable defaults based on the existing project structure.
