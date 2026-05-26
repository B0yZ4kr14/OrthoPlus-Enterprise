# Stakeholder Report — OrthoPlus Enterprise

*Source: [domain-model.md](../discovery/domain-model.md) · [l1-capabilities.md](../discovery/l1-capabilities.md) · [blueprint-comparison.md](../discovery/blueprint-comparison.md)*

## What This System Does

OrthoPlus Enterprise is a comprehensive dental clinic management platform. It handles the full lifecycle of patient care — from appointment scheduling and electronic health records (PEP) to treatment planning and odontogram tracking. On the business side, it manages billing, point-of-sale operations, contracts, inventory, and marketing campaigns. The platform also supports advanced capabilities such as AI-assisted radiograph analysis, Bitcoin/crypto payments, telemedicine video consultations, and full fiscal compliance with Brazilian regulations (NFe and TISS).

The system serves multiple personas: dentists, clinic administrators, receptionists, and patients (via a patient portal). It is deployed as a Docker-based stack on a VPS, with PostgreSQL for data, Redis for caching, and Prometheus/Grafana for monitoring.

## Core Business Capabilities

| Capability | Signal | Rationale |
|-----------|--------|-----------|
| Clinical Care | **Strong** | HIGH cohesion, CLEAR boundaries, core domain |
| Financial Management | **Strong** | HIGH cohesion, CLEAR boundaries |
| Inventory & Supply | **Strong** | HIGH cohesion, low coupling, standalone |
| Administration & Identity | **Needs Attention** | MEDIUM cohesion, HIGH coupling — auth is cross-cutting |
| Marketing & CRM | **Strong** | HIGH cohesion, low coupling |
| Crypto Payments | **Needs Attention** | Niche capability; key custody risk |
| Fiscal Compliance | **Strong** | HIGH cohesion, regulatory necessity |
| Medical Imaging & Files | **Needs Attention** | LGPD/health data sensitivity; AI component adds complexity |
| Telemedicine | **Strong** | HIGH cohesion, emerging capability |
| Analytics & Intelligence | **Needs Attention** | Reads all data; broad access risk |
| Reporting | **Strong** | HIGH cohesion, low coupling |

> *Risk signals are preliminary (discovery-only). Run `/assess` for full security and QA composite before strategic commitment.*

## System Health Overview

- **Code ownership**: 95% of packages mapped to clear capabilities (7 de-scoped to infrastructure)
- **Test coverage (proxy)**: Unit ~35% avg · Integration ~10% avg · E2E ~12% avg
- **E2E coverage on payment flows (BC-002, BC-006)**: ~5% → release risk for financial transactions
- **Testability**: 319 smell-level findings (no blockers or impedes)
- **Orphan code**: 0% — all code mapped

## Industry Alignment

**HL7 FHIR (Healthcare)** — 9 capabilities aligned with FHIR resources (Patient, Appointment, Encounter, Procedure, etc.).

**APQC (Cross-Industry)** — 5 capabilities aligned with APQC process categories.

**Missing (out of scope or externally handled)**:
- Medication prescription management (handled via procedure notes)
- Immunization tracking (not applicable to dental)
- Family history (not modeled)

## Key Findings

### Strengths
- **Modular architecture**: 37 backend + 36 frontend modules with Clean Architecture patterns
- **Strong auth model**: JWT + clinicGuard + multi-tenant isolation
- **Regulatory readiness**: Dedicated LGPD module, fiscal compliance (NFe/TISS)
- **AI integration**: AI radiograph analysis with local Ollama/llava
- **Crypto readiness**: Bitcoin payment infrastructure

### Concerns
- **QA coverage below target**: Average proxy coverage ~35% (target 70% unit)
- **No staging environment**: Dev → Prod gap increases release risk
- **Crypto payment test gap**: No testnet integration tests
- **AI agent test gap**: No automated tests for LLM agent workflows
- **Missing contract tests**: Payment gateway, email/SMS, government APIs

## Modernisation Positioning

| Capability | Positioning | Rationale |
|-----------|-------------|-----------|
| Clinical Care | **Retain** | Core business, strong architecture |
| Financial Management | **Extend** | Add contract tests for payment gateway |
| Inventory & Supply | **Retain** | Stable, low coupling |
| Administration & Identity | **Refactor** | HIGH coupling limits velocity; extract auth as service |
| Marketing & CRM | **Extend** | Add marketing automation features |
| Crypto Payments | **Evaluate** | Niche; assess adoption vs maintenance cost |
| Fiscal Compliance | **Retain** | Regulatory necessity |
| Medical Imaging & Files | **Extend** | Expand AI to other image types |
| Telemedicine | **Extend** | Growing market demand |
| Analytics & Intelligence | **Refactor** | Centralize data access patterns |
| Reporting | **Retain** | Stable, well-defined |

## Proposed Team Ownership

| Squad | Capabilities |
|-------|-------------|
| **Clinical Squad** | BC-001 Clinical Care, BC-009 Telemedicine |
| **Financial Squad** | BC-002 Financial Management, BC-006 Crypto Payments, BC-007 Fiscal Compliance |
| **Operations Squad** | BC-003 Inventory & Supply, BC-004 Administration & Identity |
| **Growth Squad** | BC-005 Marketing & CRM, BC-008 Medical Imaging & Files |
| **Platform Squad** | BC-010 Analytics & Intelligence, BC-011 Reporting, Infrastructure |
