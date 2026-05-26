# SDET Report — OrthoPlus Enterprise

*Source: [qa-context.json](../qa/qa-context.json) · [test-inventory.json](../qa/test-inventory.json) · [coverage-map.json](../qa/coverage/coverage-map.json) · [testability-findings.json](../qa/testability/testability-findings.json) · [ci-map.json](../qa/environments/ci-map.json)*

## Test Strategy Snapshot

| Level | Target | Actual (proxy avg) | Gap |
|-------|--------|-------------------|-----|
| Unit | 70% | ~35% | -35pp |
| Integration | 30% | ~10% | -20pp |
| E2E | 10% | ~12% | +2pp |

**Pyramid shape**: Inverted — E2E coverage exceeds integration. Classic target is unit-heavy.

## Capability Test Coverage Map

| Capability | LOC (est.) | Unit% | Int% | E2E% | Source | Automation |
|-----------|-----------|-------|------|------|--------|-----------|
| BC-001 | 120K | 45 | 15 | 20 | proxy | partial/partial/absent |
| BC-002 | 80K | 40 | 10 | 15 | proxy | partial/partial/absent |
| BC-003 | 30K | 35 | 8 | 10 | proxy | partial/none/absent |
| BC-004 | 60K | 55 | 20 | 25 | proxy | partial/partial/absent |
| BC-005 | 40K | 30 | 5 | 8 | proxy | partial/none/absent |
| BC-006 | 15K | 25 | 5 | 5 | proxy | partial/none/absent |
| BC-007 | 20K | 30 | 5 | 5 | proxy | partial/none/absent |
| BC-008 | 25K | 35 | 10 | 10 | proxy | partial/partial/absent |
| BC-009 | 10K | 20 | 5 | 5 | proxy | partial/none/absent |
| BC-010 | 35K | 25 | 5 | 5 | proxy | partial/none/absent |
| BC-011 | 15K | 20 | 5 | 5 | proxy | partial/none/absent |

## Automation Status Matrix

| Capability | Regression | Smoke | Contract | Performance |
|-----------|-----------|-------|----------|-------------|
| All | partial | partial (CI) | absent | absent |

## Testability Hotspots

| Pattern | Count | Top Files |
|---------|-------|-----------|
| static-clock-access (Date.now) | ~45 | backend/src/modules/agenda, financeiro, pdv |
| hidden-http-dependency (axios) | ~38 | backend/src/modules/financeiro, crypto, nfe |
| unseeded-randomness | ~12 | backend/src/modules/marketing, crypto |
| direct-file-io | ~8 | backend/src/modules/files, ia_radiografia |

Full list: [testability-findings.json](../qa/testability/testability-findings.json)

## Defect & Flakiness Profile

- **Open defects**: not-collected (no defect tracker export provided)
- **Flaky tests**: not-collected (no flaky test history export provided)
- **Change velocity**: not-collected (no git churn analysis run)

## Environment Readiness

| Environment | Declared | Covered in CI | Parity Issues |
|-------------|----------|---------------|---------------|
| dev | Yes | Yes | None |
| staging | Yes | No | Missing staging deployment |
| prod | Yes | Yes (deploy workflow) | None |

## CI Quality Gates

| Stage | Test Level | Blocking | Coverage Threshold |
|-------|-----------|----------|-------------------|
| build | type-check, lint | Yes | None |
| test | unit (Jest + Vitest) | Yes | 20% (backend only) |
| e2e | Playwright | Yes | None |
| security | npm audit, ESLint security | No (continue-on-error) | None |

## QA Risk Ranking

*Pending `/assess` — no QA composite or unified ranking available.*

## Test Strategy Recommendations per Capability

| Capability | Recommendation |
|-----------|---------------|
| BC-001 | Add integration tests for appointment scheduling conflicts |
| BC-002 | Add contract tests for payment gateway; mock SEFAZ/ANS for BC-007 |
| BC-003 | Add stock alert integration tests |
| BC-004 | Add auth endpoint penetration tests |
| BC-005 | Add email/SMS provider contract tests |
| BC-006 | Add Bitcoin testnet integration tests |
| BC-007 | Add mock tests for SEFAZ/ANS APIs |
| BC-008 | Add image upload performance tests |
| BC-009 | Add E2E video flow tests |
| BC-010 | Add AI agent workflow tests |
| BC-011 | Add PDF output visual regression tests |

## Sprint-Ready QA Backlog

1. **Add contract tests for BC-002-01 payment gateway integration** (est. 2d)
   - Files: backend/src/modules/split_pagamento/**
   - AC: Mock payment gateway responses validated with 5 scenarios

2. **Introduce clock seam in BC-001-02 Appointment scheduling** (est. 2d)
   - Files: backend/src/modules/agenda/**
   - AC: All Date.now() usages injectable; unit tests pass without time mocking hacks

3. **Add E2E test for BC-009-01 video consultation flow** (est. 3d)
   - Files: tests/e2e/telemedicine.spec.ts
   - AC: Session creation, join, and end flow pass in Playwright

4. **Add Bitcoin testnet integration test for BC-006-02** (est. 3d)
   - Files: backend/src/modules/crypto/**
   - AC: End-to-end payment creation and confirmation on testnet

5. **Add mock SEFAZ API test for BC-007-01 NFe generation** (est. 2d)
   - Files: backend/src/modules/nfe/**
   - AC: NFe generation passes with mocked SEFAZ response

6. **Add stock alert integration test for BC-003-02** (est. 1d)
   - Files: backend/src/modules/inventario/**
   - AC: Alert triggers when stock below minimum threshold

7. **Add auth endpoint rate-limiting test for BC-004-01** (est. 1d)
   - Files: backend/src/modules/auth/**
   - AC: Rate limit enforced after N consecutive login attempts

8. **Add email provider contract test for BC-005-01** (est. 2d)
   - Files: backend/src/modules/marketing/**
   - AC: Campaign email send validated with mocked provider

## Not-Collected Summary

| Capability | Signal | Reason | How to Unblock |
|-----------|--------|--------|---------------|
| All | coverage_report | No coverage artifact found | Run `jest --coverage` / `vitest --coverage` and archive reports |
| All | flaky_test_history | No flaky test export provided | Export from CI (GitHub Actions) or test runner |
| All | defect_export | No defect tracker export provided | Export from Jira/GitHub Issues |
| All | change_velocity | No git churn analysis run | Run `.specify/scripts/bash/git-churn.sh` |
| BC-006 | testnet_tests | No testnet integration | Configure Bitcoin testnet node in CI |
| BC-007 | mock_gov_api | No mock government API tests | Add WireMock/mockserver for SEFAZ/ANS |
