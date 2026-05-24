# Verification Report: 019-ia-radiografia

> **Non-Feature-Branch Verification** from `main` against `specs/019-ia-radiografia/`. Some checks may be affected by cross-feature interference.

**Date**: 2026-05-18
**Feature**: IA Radiografia
**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Tasks**: [tasks.md](../tasks.md)
**Verifier**: speckit-verify-run
**max_findings**: 50

---

## Verification Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Task Completion | MEDIUM | tasks.md | 35/45 tasks complete (77.8%). 10 pending. | Complete T027, T028 (tests), T034-T036 (FE real-data), T042 (quickstart) before merge. T043-T045 are deferred post-MVP. |
| B1 | File Existence | LOW | tasks.md:T016 | `tests/e2e/ia-radiografia-upload.spec.ts` referenced but does not exist | Create E2E test file or update task reference. |
| B2 | File Existence | LOW | tasks.md:T027,T028 | `backend/tests/unit/ia-radiografia/consentimento.test.ts` and `backend/tests/unit/ia-radiografia/audit.test.ts` referenced but do not exist | Tests are consolidated in `backend/tests/unit/iaRadiografiaController.test.ts`. Update task references. |
| C1 | Requirement Coverage | HIGH | spec.md:FR-005 | AI analysis results MUST be encrypted at rest. Encryption service exists but `resultado_ia` is stored as Json with `as any` cast — encryption is applied but type safety is bypassed. | Fix `as any` cast at controller.ts:144. Use proper Prisma Json typing. |
| C2 | Requirement Coverage | MEDIUM | spec.md:FR-012 | Feature flag guard exists (`aiFeatureFlagGuard.ts`) but uses env var check on every request instead of cached config. | Acceptable for MVP. Consider caching for high-throughput scenarios. |
| C3 | Requirement Coverage | MEDIUM | spec.md:SC-005 | Rate limiter implemented with Redis (`iaRateLimiter.ts`) but T007 was marked deferred. Implementation now exists but was not part of original task tracking. | Update tasks.md to mark T007 as complete. |
| D1 | Scenario & Test Coverage | HIGH | spec.md:US3-AS2,US3-AS3 | Consent revocation acceptance scenarios have no automated test coverage. T027 and T028 are pending. | Implement T027 and T028 unit tests before merge. |
| D2 | Scenario & Test Coverage | MEDIUM | spec.md:US1-AS3 | Rate limit acceptance scenario has no dedicated automated test. | Add rate limit test to `iaRadiografiaController.test.ts` or create separate test file. |
| D3 | Scenario & Test Coverage | LOW | spec.md:US4 | E2E test for insights/comparison (T016) is pending. | Create E2E test after T034-T036 frontend fixes. |
| E1 | Spec Intent Alignment | MEDIUM | spec.md:US2-AS2 | "Dentist disagrees and marks as false positive" — no explicit false-positive tracking field exists. Override is recorded as generic `observacoes_dentista` text. | Add structured override tracking (e.g., `overrides` JSON field) or accept text-based override for MVP. |
| E2 | Spec Intent Alignment | LOW | spec.md:US4-AS3 | PDF export exists but uses `@ts-expect-error` suppressions and lacks CORS fallback for local filesystem images. | Fix image loading CORS fallback per T036 in blueprint. |
| F1 | Constitution Alignment | LOW | constitution.md:CQ-2 | 3 pre-existing `as any` in backend module (controller.ts:87,144; IAAuditService.ts:15). No NEW ones added. | These are pre-existing debt. Do not increase count. |
| F2 | Constitution Alignment | LOW | constitution.md:FE-2 | Frontend module imports `new Date()` directly instead of `date.utils.ts` in multiple components. | Refactor to use `lib/utils/date.utils.ts` for date formatting. |
| G1 | Design Consistency | LOW | plan.md | Planned directory layout has `backend/src/modules/ia_radiografia/domain/entities/` but entity files are minimal stubs. | Entities are defined but primarily used as DTO types. Acceptable for brownfield. |
| G2 | Design Consistency | MEDIUM | plan.md | Storage path is local filesystem placeholder (`uploads/ia-radiografia/...`). Plan noted this as PLACEHOLDER. | Implement real storage backend (MinIO/S3) or document as known gap. |

---

## Task Summary Table

| Task ID | Status | Referenced Files | Notes |
|---------|--------|-----------------|-------|
| T001-T005 | [x] | backend/, apps/web/ | Setup phase complete |
| T006 | [x] | IAEncryptionService.ts | No hardcoded fallback |
| T007 | [x] | iaRateLimiter.ts | Redis-backed rate limiter implemented (was deferred, now done) |
| T008 | [x] | controller.ts, router.ts | Audit GET endpoint exists |
| T009-T012 | [x] | radiografia.types.ts | Enum sync complete, no migration needed |
| T013-T015 | [x] | iaRadiografiaController.test.ts | 3 test suites passing |
| T016 | [ ] | tests/e2e/ia-radiografia-upload.spec.ts | E2E test not created |
| T017-T021 | [x] | controller.ts, LocalAIService.ts, useRadiografia.ts | Upload + AI flow functional |
| T022-T023 | [x] | iaRadiografiaController.test.ts | Review validation + audit tests passing |
| T024-T026 | [x] | useRadiografia.ts, AnaliseDetailsDialog.tsx, AnaliseList.tsx | Review workflow complete |
| T027-T028 | [ ] | iaRadiografiaController.test.ts | Consent revocation + audit GET tests pending |
| T029-T031 | [x] | UploadDialog.tsx, useRadiografia.ts | Consent UI complete |
| T032-T033 | [x] | controller.ts, IAInsightsDashboard.tsx | Insights endpoint + dashboard wired |
| T034-T036 | [ ] | RadiografiaComparison.tsx, PatientRadiographyTimeline.tsx, ComparativoPDFExport.tsx | Frontend real-data integration pending |
| T037 | [x] | controller.ts, MetricsCollector | Prometheus metrics emitted |
| T038-T041 | [x] | docs/ia-radiografia.md | Quality gates + docs complete |
| T042 | [ ] | quickstart.md | Quickstart validation deferred |
| T043-T045 | [ ] | (future) | Background worker, problem table, model versioning — post-MVP |

---

## Constitution Alignment Issues

None critical. Pre-existing `as any` instances are debt, not new violations.

---

## Metrics

- **Total Tasks**: 35 / 45 completed (77.8%)
- **Requirement Coverage**: ~83% (10/12 FRs fully implemented; FR-005 partially typed; FR-011 has known CORS issue)
- **Files Verified**: 15 source files + 1 test file
- **Critical Issues Count**: 0
- **High Issues Count**: 3 (C1, D1, D2)
- **Medium Issues Count**: 5
- **Low Issues Count**: 5

---

## Next Actions

1. **Address HIGH issues before merge**:
   - Implement T027 + T028 (consent revocation + audit GET tests)
   - Fix `as any` cast at controller.ts:144 for `resultado_ia` encryption
   - Add rate limit test coverage

2. **Address MEDIUM issues**:
   - Fix T034-T036 frontend real-data integration (endpoint path mismatch in PatientRadiographyTimeline.tsx)
   - Add CORS fallback to ComparativoPDFExport.tsx
   - Create T016 E2E test

3. **After fixes**: Re-run `/speckit.verify` to confirm resolution.

4. **No blockers for MVP** — US1-US3 are functional. US4 (insights/comparison) has minor frontend gaps.
