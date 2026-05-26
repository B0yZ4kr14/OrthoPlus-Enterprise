# Dev Report — OrthoPlus Enterprise

*Source: [domain-model.md](../discovery/domain-model.md) · [l2-capabilities.md](../discovery/l2-capabilities.md) · [qa-context.json](../qa/qa-context.json) · [testability-findings.json](../qa/testability/testability-findings.json)*

## Capability Map

### BC-001: Clinical Care
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-001-01 Patient Mgmt | POST/GET/PUT /api/pacientes | None |
| BC-001-02 Scheduling | POST/GET /api/agenda, Job: reminders | None |
| BC-001-03 PEP | POST/GET/PUT /api/pep | None |
| BC-001-04 Procedures | POST/GET /api/procedimentos | None |

### BC-002: Financial Management
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-002-01 Accounts | POST/GET /api/financeiro/transactions | None |
| BC-002-02 PDV | POST /api/pdv/venda, GET /api/pdv/caixa | None |
| BC-002-03 Contracts | POST /api/contratos, POST /api/orcamentos | None |
| BC-002-04 Split Pay | POST /api/split-pagamento | Payment gateway |
| BC-002-05 Delinquency | GET/POST /api/inadimplencia | None |

### BC-003: Inventory & Supply
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-003-01 Product Catalog | CRUD /api/inventario/produtos | None |
| BC-003-02 Stock Movement | POST /api/inventario/movimentacao | None |

### BC-004: Administration & Identity
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-004-01 Auth | POST /api/auth/login, /register, /refresh | None |
| BC-004-02 Clinic Mgmt | GET/PUT /api/configuracoes | None |
| BC-004-03 Staff | CRUD /api/funcionarios | None |

### BC-005: Marketing & CRM
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-005-01 Campaigns | POST /api/marketing/campanhas, /recall | Email/SMS provider |
| BC-005-02 CRM | CRUD /api/crm/leads | None |
| BC-005-03 Loyalty | GET/POST /api/fidelidade/pontos | None |

### BC-006: Crypto Payments
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-006-01 Wallet | POST/GET /api/crypto/wallet | Bitcoin network |
| BC-006-02 Payments | POST/GET /api/crypto/pagamento | Bitcoin network, exchange |

### BC-007: Fiscal Compliance
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-007-01 NFe | POST /api/nfe/emitir, GET /api/nfe/:id/status | SEFAZ |
| BC-007-02 TISS | POST /api/tiss/gerar, GET /api/tiss/:id | ANS |

### BC-008: Medical Imaging & Files
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-008-01 File Storage | POST/GET/DELETE /api/files | S3/MinIO |
| BC-008-02 AI Radiograph | POST/GET /api/ia-radiografia/analisar | Ollama/llava |

### BC-009: Telemedicine
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-009-01 Video | POST/GET /api/teleodonto/sessao | WebRTC |

### BC-010: Analytics & Intelligence
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-010-01 BI | GET /api/analytics/dashboard-overview | None |
| BC-010-02 AI Agents | POST/GET /api/agents/task | OpenRouter, Google GenAI |

### BC-011: Reporting
| L2 | Key Operations | External Deps |
|----|---------------|---------------|
| BC-011-01 Reports | POST/GET /api/relatorios/gerar | None |

## Ownership Assignments

| Squad | Capabilities |
|-------|-------------|
| Clinical Squad | BC-001, BC-009 |
| Financial Squad | BC-002, BC-006, BC-007 |
| Operations Squad | BC-003, BC-004 |
| Growth Squad | BC-005, BC-008 |
| Platform Squad | BC-010, BC-011 |

## Health Dashboard

| Capability | Cohesion | Coupling | LOC (est.) | Coverage (proxy) |
|-----------|----------|----------|-----------|-----------------|
| BC-001 | HIGH | MEDIUM | 120K | 45/15/20 |
| BC-002 | HIGH | MEDIUM | 80K | 40/10/15 |
| BC-003 | HIGH | LOW | 30K | 35/8/10 |
| BC-004 | MEDIUM | HIGH | 60K | 55/20/25 |
| BC-005 | HIGH | LOW | 40K | 30/5/8 |
| BC-006 | HIGH | LOW | 15K | 25/5/5 |
| BC-007 | HIGH | LOW | 20K | 30/5/5 |
| BC-008 | MEDIUM | MEDIUM | 25K | 35/10/10 |
| BC-009 | HIGH | LOW | 10K | 20/5/5 |
| BC-010 | MEDIUM | HIGH | 35K | 25/5/5 |
| BC-011 | HIGH | LOW | 15K | 20/5/5 |

## Refactor Targets

1. **BC-004 Administration & Identity** (HIGH coupling)
   - Technique: Extract auth middleware to shared package
   - Scope: M (~2 sprints)
   - Evidence: [l1-capabilities.md](../discovery/l1-capabilities.md)

2. **BC-010 Analytics & Intelligence** (HIGH coupling, reads all entities)
   - Technique: Event-driven analytics (CDC from PostgreSQL)
   - Scope: L (~4 sprints)
   - Evidence: [domain-model.md](../discovery/domain-model.md)

## Orphan Code

None. All packages mapped.

## Coverage Breakdown

All capabilities below unit target (70%). Highest coverage: BC-004 (55%). Lowest: BC-009 (20%).

## Security Findings for Developers

*Pending `/assess` — no security composite available.*

## QA Findings for Developers

- 319 testability smells detected (all `smell` severity, no blockers)
- Top patterns: `Date.now()` usage, inline `axios` calls
- See: [testability-findings.json](../qa/testability/testability-findings.json)

## Sprint Recommendations

1. **Add testnet integration tests for BC-006 Crypto Payments** (est. 3d)
   - AC: BTC testnet transactions pass end-to-end
   - Files: backend/src/modules/crypto/**

2. **Add contract tests for BC-002 payment gateway** (est. 2d)
   - AC: Mock payment gateway responses validated
   - Files: backend/src/modules/split_pagamento/**

3. **Add E2E video flow tests for BC-009 Telemedicine** (est. 3d)
   - AC: Video session creation and join flow pass in Playwright
   - Files: tests/e2e/telemedicine.spec.ts

4. **Extract auth middleware to shared package** (est. 5d)
   - AC: Auth middleware imported from shared package, zero regression
   - Files: backend/src/middleware/authMiddleware.ts

5. **Add mock tests for BC-007 SEFAZ/ANS APIs** (est. 2d)
   - AC: NFe and TISS generation tested with mocked external APIs
   - Files: backend/src/modules/nfe/**, backend/src/modules/tiss/**

6. **Add clock seam in time-dependent modules** (est. 2d)
   - AC: All `Date.now()` usages injectable via IClock seam
   - Files: See [testability-findings.json](../qa/testability/testability-findings.json)
