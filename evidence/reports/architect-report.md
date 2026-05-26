# Architect Report — OrthoPlus Enterprise

*Source: [context.json](../context.json) · [domain-model.md](../discovery/domain-model.md) · [l1-capabilities.md](../discovery/l1-capabilities.md) · [blueprint-comparison.md](../discovery/blueprint-comparison.md) · [qa-context.json](../qa/qa-context.json)*

## System Overview

| Attribute | Value |
|-----------|-------|
| **Architecture** | Monorepo (pnpm workspaces + Turbo) |
| **Frontend** | React 18 SPA (Vite, Tailwind, 1,116 components) |
| **Backend** | Express 4 modular monolith (37 modules, CQRS event bus) |
| **Agent Service** | FastAPI + Agno 2.5 (Python) |
| **Database** | PostgreSQL 16 (18 schemas, 180 models via Prisma) |
| **Cache** | Redis (ioredis) |
| **Container** | Docker Compose (4 variants: local, prod, ubuntu, onprem) |
| **Proxy** | nginx (SSL, rate limiting, CSP) |
| **Monitoring** | Prometheus + Grafana |
| **CI/CD** | GitHub Actions (17 workflows) |
| **Code volume** | ~3,709 TS files + ~504 Python files |

## Capability Topology

| ID | Capability | Cohesion | Coupling | Boundary | LOC (est.) |
|----|-----------|----------|----------|----------|-----------|
| BC-001 | Clinical Care | HIGH | MEDIUM | CLEAR | ~120K |
| BC-002 | Financial Management | HIGH | MEDIUM | CLEAR | ~80K |
| BC-003 | Inventory & Supply | HIGH | LOW | CLEAR | ~30K |
| BC-004 | Administration & Identity | MEDIUM | HIGH | PARTIAL | ~60K |
| BC-005 | Marketing & CRM | HIGH | LOW | CLEAR | ~40K |
| BC-006 | Crypto Payments | HIGH | LOW | CLEAR | ~15K |
| BC-007 | Fiscal Compliance | HIGH | LOW | CLEAR | ~20K |
| BC-008 | Medical Imaging & Files | MEDIUM | MEDIUM | PARTIAL | ~25K |
| BC-009 | Telemedicine | HIGH | LOW | CLEAR | ~10K |
| BC-010 | Analytics & Intelligence | MEDIUM | HIGH | PARTIAL | ~35K |
| BC-011 | Reporting | HIGH | LOW | CLEAR | ~15K |

## Coupling Analysis

**HIGH coupling capabilities:**

1. **BC-004 Administration & Identity** (HIGH coupling)
   - Shared by all capabilities (auth context)
   - **Suggestion**: Keep as-is; auth is inherently cross-cutting. Consider extracting session management to a dedicated auth service if scale demands.

2. **BC-010 Analytics & Intelligence** (HIGH coupling)
   - Reads from all domain entities
   - **Suggestion**: Use event-driven analytics (CDC or event bus) to decouple reads from operational DB

## Bounded Context Analysis

| Context | Capabilities | Shared Entities |
|---------|-------------|----------------|
| Clinical | BC-001, BC-009 | Patient, Appointment, HealthRecord |
| Financial | BC-002, BC-006, BC-007 | Transaction, Contract, Wallet |
| Operations | BC-003, BC-004 | Product, Employee, ClinicConfig |
| Growth | BC-005, BC-008 | Campaign, FileRecord, Lead |
| Intelligence | BC-010, BC-011 | DashboardWidget, Report |

## Decomposition Options

1. **Extract BC-003 (Inventory)** first — lowest shared entity count, easiest to extract
2. **Extract BC-006 (Crypto)** second — already loosely coupled, clear boundary
3. **Extract BC-009 (Telemedicine)** third — standalone with minimal deps

## Modernisation Positioning

Same as stakeholder report, with metric rationale:
- BC-004 Refactor: HIGH coupling (4+ outward deps) limits parallel development
- BC-010 Refactor: MEDIUM cohesion + HIGH coupling + reads all entities

## Industry Blueprint Gaps

- **HL7 FHIR MedicationRequest** → not modeled (dental prescriptions via Procedure)
- **HL7 FHIR Immunization** → not applicable
- **HL7 FHIR Subscription** → notifications are infrastructure-de-scoped

## Code Coverage & Orphan Zones

- Coverage: 95% (78/82 packages mapped)
- Orphans: 7 infrastructure items (resolved)
- No dead code detected

## Security Risk Overlay

*Pending `/assess` — no security composite or unified ranking available.*

## QA Risk Overlay

| Capability | Coverage | Testability | Posture |
|-----------|----------|-------------|---------|
| BC-001 | 45/15/20 | good | needs-work |
| BC-002 | 40/10/15 | good | needs-work |
| BC-003 | 35/8/10 | good | needs-work |
| BC-004 | 55/20/25 | good | needs-work |
| BC-005 | 30/5/8 | good | needs-work |
| BC-006 | 25/5/5 | good | needs-work |
| BC-007 | 30/5/5 | good | needs-work |
| BC-008 | 35/10/10 | good | needs-work |
| BC-009 | 20/5/5 | good | needs-work |
| BC-010 | 25/5/5 | good | needs-work |
| BC-011 | 20/5/5 | good | needs-work |

All capabilities below unit coverage target (70%).

## Unified Risk Map

*Pending `/assess` — no security composite or unified ranking available.*
