# Tasks: Gestão de Arquivos e Documentos

**Input**: Design documents from `/specs/015-files//`

**Prerequisites**: plan.md (required), spec.md (required)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project verification and module audit

- [x] T001 Audit existing `files` backend module (Prisma models, controllers, routes)
- [x] T002 Audit existing `files` frontend module (components, hooks, pages)
- [x] T003 Identify gaps between spec and current implementation
- [x] T004 Document API contract changes (if any)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T101 [P] Backend: Upload — Armazenamento de arquivos com metadados.
- [x] T102 [P] Backend: Storage — Armazenamento seguro e escalável.
- [x] T103 [P] Backend: Visualização — Preview e download.
- [x] T104 [P] Prisma schema update + migration generation
- [x] T105 [P] Extend `filesService.ts` with new operations
- [x] T106 [P] Extend `filesController.ts` with new endpoints
- [x] T107 [P] Add clinicGuard to all new routes
- [x] T107a [P] Add rate limiting to upload endpoint (CQ-3: 50/hour)
  - **Status**: IMPLEMENTED — `uploadLimiter` already applied to `/api/files` in `backend/src/index.ts`
- [ ] T107b [P] Add CategoryCircuitBreaker for file DB operations (INF-1)
- [x] T107c [P] Add Prometheus metrics `orthoplus_files_upload_total`, `orthoplus_files_download_total` (INF-2)
  - **Status**: IMPLEMENTED — `FilesMetrics` class added; instrumented upload/download/delete in controller
- [x] T108 [P] Backend unit tests for new service methods
- [x] T109 Run `cd backend && pnpm type-check` (0 errors)
- [x] T110 Run `cd backend && pnpm test` (all pass)

**Checkpoint**: Backend API ready — all new endpoints tested

---

## Phase 3: Frontend Foundation

**Purpose**: Data access layer and shared UI components

- [x] T201 [P] Update/add React Query hooks for `files` endpoints
- [x] T202 [P] Create/update reusable components in `files/ui/components/`
- [x] T203 [P] Add form validation (Zod schema matching backend DTOs)
- [x] T204 [P] Add routes to `AppRoutes.tsx` (if new pages)
- [x] T205 [P] Run `cd apps/web && pnpm type-check` (0 errors)

**Checkpoint**: Frontend can fetch and display data from new backend endpoints

---

## Phase 4: User Story Implementation

#### US1: Upload de Documento (Priority: P1) 🎯 MVP

**Goal**: Implement upload de documento per spec Story 1

**Independent Test**: Verify via UI + API integration

- [x] T300 [P] [US1] UI: Create main page/component for Upload de Documento
- [x] T301 [P] [US1] UI: Form handlers and state management
- [x] T302 [US1] UI: Validation and error states
- [x] T303 [US1] UI: Success feedback (toast/redirect)
- [x] T304 [P] [US1] API: Connect frontend to backend endpoints
- [x] T305 [P] [US1] Test: Component + integration tests

#### US2: Visualização e Download (Priority: P1) 🎯 MVP

**Goal**: Implement visualização e download per spec Story 2

**Independent Test**: Verify via UI + API integration

- [x] T310 [P] [US2] UI: Create main page/component for Visualização e Download
- [x] T311 [P] [US2] UI: Form handlers and state management
- [x] T312 [US2] UI: Validation and error states
- [x] T313 [US2] UI: Success feedback (toast/redirect)
- [x] T314 [P] [US2] API: Connect frontend to backend endpoints
- [x] T315 [P] [US2] Test: Component + integration tests

#### US3: OCR e Indexação (Priority: P2) 🎯 MVP

**Goal**: Implement ocr e indexação per spec Story 3

**Independent Test**: Verify via UI + API integration

- [ ] T320 [P] [US3] UI: OCR e Indexação
  - **Status**: NOT IMPLEMENTED — requires OCR engine integration (Tesseract/Cloud Vision)
- [ ] T321 [P] [US3] UI: Form handlers
  - **Status**: NOT IMPLEMENTED — blocked by T320
- [ ] T322 [US3] UI: Validation
  - **Status**: NOT IMPLEMENTED — blocked by T320
- [ ] T323 [US3] UI: Success feedback
  - **Status**: NOT IMPLEMENTED — blocked by T320
- [ ] T324 [P] [US3] API: Connect frontend to backend
  - **Status**: NOT IMPLEMENTED — blocked by T320
- [ ] T325 [P] [US3] Test: Component + integration tests
  - **Status**: NOT IMPLEMENTED — blocked by T320

#### US4: Versionamento (Priority: P3) 🎯 MVP

**Goal**: Implement versionamento per spec Story 4

**Independent Test**: Verify via UI + API integration

- [ ] T330 [P] [US4] UI: Versionamento
  - **Status**: NOT IMPLEMENTED — requires document versioning system
- [ ] T331 [P] [US4] UI: Form handlers
  - **Status**: NOT IMPLEMENTED — blocked by T330
- [ ] T332 [US4] UI: Validation
  - **Status**: NOT IMPLEMENTED — blocked by T330
- [ ] T333 [US4] UI: Success feedback
  - **Status**: NOT IMPLEMENTED — blocked by T330
- [ ] T334 [P] [US4] API: Connect frontend to backend
  - **Status**: NOT IMPLEMENTED — blocked by T330
- [ ] T335 [P] [US4] Test: Component + integration tests
  - **Status**: NOT IMPLEMENTED — blocked by T330

---

## Phase 5: Edge Cases & Polish

- [x] T401 Handle edge case: Dados Inválidos — Validação retorna erro 400 com mensagem específica. Nenhum dado é persistido.
- [x] T402 Handle edge case: Acesso Não Autorizado — Resposta 403 com mensagem "Acesso negado"
- [x] T403 Handle edge case: clinicId Inválido — clinicGuard rejeita com 403

---

---

## Phase 6: Quality Gates

- [x] T501 `pnpm type-check` passes (0 errors) — backend
- [x] T502 `pnpm type-check` passes (0 errors) — frontend
- [x] T503 `pnpm lint` passes (0 errors)
- [x] T504 `pnpm build` succeeds
- [x] T505 Backend tests pass
- [x] T506 clinicGuard applied to all new routes
- [x] T507 No new `as any` or `@ts-ignore`
- [x] T508 `@orthoplus/core-ui` used for generic UI components
- [x] T509 `date.utils.ts` used for date formatting (not date-fns directly)
- [x] T510 AGENTS.md updated if architecture changed

---

## Dependencies & Execution Order

| Phase | Depends On | Parallelizable |
|-------|-----------|----------------|
| Phase 1 (Audit) | — | — |
| Phase 2 (Backend) | Phase 1 | Backend tasks marked [P] |
| Phase 3 (Frontend Foundation) | Phase 2 | — |
| Phase 4 (User Stories) | Phase 3 | Different stories if staffed |
| Phase 5 (Edge Cases) | Phase 4 | — |
| Phase 6 (Quality Gates) | All above | — |

### Critical Path

```
T001-T004 (Audit) → T101-T110 (Backend) → T201-T205 (Frontend Foundation)
→ US1 → US2 → US3 → US4 → Edge Cases → Quality Gates
```

---

## Phase 7: Post-Implementation Security Hardening

Executed via `/speckit-security-review` + `/speckit-checkpoint` + `/speckit-verify` + `/speckit-ripple`.

- [x] SEC-001 Auto-create `uploads/` directory on server bootstrap (`backend/src/index.ts`)
- [x] SEC-002 Multer `fileFilter` whitelist: PDF, JPG, PNG, DOCX, XLSX, DICOM (`backend/src/modules/files/api/router.ts`)
- [x] SEC-003 Enforce 50MB file size limit via multer `limits`
- [x] SEC-004 Sanitize `originalname` to prevent path traversal (`../`, `/`, `\\`, `:`)
- [x] SEC-005 Enforce visibility ACL by user role (PUBLICO/RESTRITO/CONFIDENCIAL)
  - **Status**: IMPLEMENTED — commit `04f980d56`
- [ ] SEC-006 Virus/malware scan on upload
  - **Status**: NOT IMPLEMENTED — requires ClamAV/CloudScan integration
- [x] SEC-007 Audit log for file access (download/view)
  - **Status**: IMPLEMENTED — `prisma.audit_logs.create()` on download; records fileId, fileName, userId, clinicId, IP, userAgent
- [ ] SEC-008 Permission inheritance from patient record
  - **Status**: NOT IMPLEMENTED — requires patient-permission cascade logic

**Commits:**
- `9e9c3889c` — feat(files): MVP implementation
- `32faf40d8` — security(files): SEC-001 to SEC-004 upload hardening

---

## Notes

- **[P]** = Parallelizable (different files, no dependencies)
- Each user story independently testable
- Brownfield: extend existing `files` module, don't rebuild
- Use `apiClient` from `lib/api/apiClient.ts` for all HTTP calls
- Use `useAuth()` from `contexts/AuthContext.tsx` for auth state
