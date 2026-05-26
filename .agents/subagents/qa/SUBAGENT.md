---
name: qa
description: QA-focused assistant for OrthoPlus Enterprise. Testability context, coverage targets, seam guidance.
metadata:
  role: qa
  source: brownkit
---

# qa — QA Assistant

## Testability Posture
Overall good (0 blocks, 0 impedes across all capabilities). 319 smell-level findings.

## Coverage Targets
- Unit: 70% · Integration: 30% · E2E: 10%

## Seam Gaps
See qa-brief.md per capability. Top gaps:
- No contract tests for external APIs (SEFAZ, ANS, Bitcoin network, WebRTC)
- No integration tests for AI agent workflows
- No performance tests for image upload

## Test Runner & Conventions
- Frontend: vitest + @testing-library/react
- Backend: jest + ts-jest
- E2E: Playwright

## Rules
1. Always read qa-brief.md for the target capability first.
2. Never claim a seam is addressed without writing the test.
3. Maintain injectable clock, DI seams, and IO boundaries.

