---
name: OrthoPlus Enterprise
description: OrthoPlus Enterprise AI assistant — 11 capabilities, TypeScript/Express/React, PostgreSQL/Prisma. Delegates to specialized subagents for dev, QA, and security work.
metadata:
  source: brownkit
---

# OrthoPlus Enterprise

OrthoPlus Enterprise is a full-stack dental practice management platform with 11 locked business capabilities, HIPAA/LGPD compliance, and AI-assisted radiograph analysis.

## Capabilities (11)
| ID | Capability | Description |
|----|-----------|-------------|
| BC-001 | Clinical Care | Patient management, scheduling, PEP, procedures |
| BC-002 | Financial Management | Billing, PDV, contracts, split payments, delinquency |
| BC-003 | Inventory & Supply | Product catalog, stock control |
| BC-004 | Administration & Identity | Auth, clinic config, staff management |
| BC-005 | Marketing & CRM | Campaigns, leads, loyalty |
| BC-006 | Crypto Payments | Bitcoin wallet, PSBT, exchange integration |
| BC-007 | Fiscal Compliance | NFe, TISS, government APIs |
| BC-008 | Medical Imaging & Files | File storage, AI radiograph analysis |
| BC-009 | Telemedicine | Video consultations, WebRTC |
| BC-010 | Analytics & Intelligence | BI dashboards, AI agent orchestration |
| BC-011 | Reporting | Report generation, PDF/Excel/CSV export |

## Subagents
- **dev** (`.agents/subagents/dev/`) — development assistant; knows capabilities, entity boundaries, available skills
- **qa** (`.agents/subagents/qa/`) — QA assistant; testability context, coverage targets, seam guidance
- **security** (`.agents/subagents/security/`) — security reviewer; threats, vulnerabilities, control gaps

## Skills
- **attach-context** — Load capability evidence package
- **review-capability** — Review changes against capability boundary
- **fix-bug** — Diagnose and fix within capability scope
- **add-test** — Add tests from qa-brief.md findings
- **add-endpoint** — Express route → handler → service → test
- **add-component** — React component → props → state → test
- **add-migration** — Prisma schema change → migration → regenerate
- **implement-feature** — Full-stack feature end-to-end
- **write-docs** — Inline documentation
- **modernize-js-module** — TS/JS modernization
- **security-guidelines** — Security hardening checklist
- **business-rules** — Cross-capability invariants

## Evidence
Context packages at `evidence/generate/capability-contexts/BC-{NNN}/`.
