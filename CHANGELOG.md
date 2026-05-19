# Changelog — OrthoPlus Enterprise

## [OMK Governance Integration] - 2026-05-19

### Added
- GitNexus CI workflow for automatic code intelligence re-indexing
- SpecKit compliance CI workflow for PR spec validation
- OMK Squad agents (Planner, Implementer, Reviewer, Verifier)
- OMK Quality gates (lint, type-check, test, build)
- VPS health check script with full endpoint validation
- Governance metrics exporter (Prometheus/OpenMetrics format)
- VPS topology and services documentation
- Security, staff, and ripple review reports

### Changed
- AGENTS.md with active feature governance pointer
- WIKI.md with governance tools reference section
- README-orthoplus-deploy.md with current production endpoints

### Fixed
- Nginx symlink configuration for tsiapp-https
- Duplicate credentials section in deploy docs
- GitNexus dependency version pinning
- spec.md status inconsistency (Draft → Completed)

### Technical Notes
- 33.916 GitNexus nodes indexed (100% monorepo coverage)
- Metrics compliant with constitution INF-2 (`orthoplus_governance_*` prefix)
- Zero application code changes (pure infrastructure/tooling)
- Human-in-the-loop gates at plan and implement phases
