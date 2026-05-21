# Feature Specification: IA Radiografia

**Feature Branch**: `019-ia-radiografia`

**Created**: 2026-05-21

**Status**: In Progress

**Input**: Reverse-engineered from existing codebase. Module provides AI-powered automated analysis of dental radiographs with LGPD compliance, audit trails, and dentist review workflow.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Upload Radiograph and Receive AI Analysis (Priority: P1)

A dentist uploads a dental X-ray image (panoramic, periapical, bite-wing, occlusal, or lateral) through the clinic system. The system verifies patient consent, sanitizes the image by stripping metadata, and sends it to an AI vision model for analysis. Within seconds, the dentist receives a structured report showing detected problems (cavities, fractures, periodontal issues, periapical lesions), confidence scores, and treatment recommendations using FDI dental notation.

**Why this priority**: This is the core value proposition of the module — automated AI assistance for dental diagnosis. Without it, the module has no purpose.

**Independent Test**: A dentist can upload a radiograph and see AI results without using any other feature (review, comparison, etc.).

**Acceptance Scenarios**:

1. **Given** a patient has provided LGPD consent for AI radiography, **When** the dentist uploads a panoramic X-ray, **Then** the system processes the image and displays detected problems with confidence scores within 30 seconds.
2. **Given** a patient has NOT provided consent, **When** the dentist attempts to upload, **Then** the system blocks the upload and prompts for consent registration.
3. **Given** a dentist has already uploaded 10 images in the past hour, **When** they attempt an 11th upload, **Then** the system returns a rate limit error with retry time.

---

### User Story 2 — Review AI Findings and Add Observations (Priority: P2)

After receiving AI analysis, the dentist reviews the findings in detail. They can view the original radiograph alongside the AI-detected problems, each marked with severity (low, medium, high, critical). The dentist can add their own observations, override AI conclusions, and digitally sign the review to establish clinical accountability.

**Why this priority**: Human-in-the-loop review is legally and clinically essential. AI suggestions must never replace professional judgment.

**Independent Test**: A dentist can review any completed analysis and add observations without needing to upload new images or use comparison features.

**Acceptance Scenarios**:

1. **Given** an analysis with status "Concluída", **When** the dentist opens the analysis details and adds observations, **Then** the analysis is marked as reviewed and the observations are persisted with the dentist's digital signature.
2. **Given** the AI detected a cavity with 85 percent confidence, **When** the dentist disagrees and marks it as a false positive, **Then** the system records the override in the audit trail for quality improvement.
3. **Given** an analysis is still processing, **When** the dentist attempts to review it, **Then** the system shows a loading state and prevents review submission.

---

### User Story 3 — Manage Patient LGPD Consent for AI Processing (Priority: P2)

Before any AI analysis can be performed, the clinic must obtain explicit patient consent for using AI on their radiographs. The consent management system allows registering consent (with IP and timestamp), checking current consent status, viewing consent history, and revoking consent at any time.

**Why this priority**: LGPD compliance is legally mandatory in Brazil. Processing patient data without consent exposes the clinic to fines and liability.

**Independent Test**: A clinic administrator can register, check, and revoke consent for any patient without needing to upload or analyze radiographs.

**Acceptance Scenarios**:

1. **Given** a new patient, **When** the clinic registers their consent for AI radiography, **Then** the system stores the consent with timestamp, IP, and a hash of the terms.
2. **Given** a patient who previously consented, **When** they revoke consent, **Then** the system marks consent as revoked and prevents future AI analysis for that patient.
3. **Given** a patient with revoked consent, **When** a dentist tries to upload their radiograph, **Then** the system blocks the upload and shows the consent status.

---

### User Story 4 — View Insights and Compare Radiographs Over Time (Priority: P3)

Dentists can view aggregated insights across all analyses in their clinic — problem type distribution, average confidence scores, processing statistics. They can also compare multiple radiograph analyses side-by-side and view a patient's radiography timeline to track changes over time. Comparative analyses can be exported to PDF.

**Why this priority**: These are analytical and reporting features that enhance clinical decision-making but are not required for the core diagnosis workflow.

**Independent Test**: A dentist can view insights and export a comparison without uploading new images.

**Acceptance Scenarios**:

1. **Given** multiple analyses exist in the clinic, **When** the dentist opens the insights dashboard, **Then** they see KPI cards and charts showing aggregated data.
2. **Given** a patient has multiple radiographs over time, **When** the dentist views the patient timeline, **Then** they see chronological progression of detected problems.
3. **Given** two analyses are selected, **When** the dentist clicks export, **Then** a PDF is generated with both analyses side-by-side.

---

### Edge Cases

- **What happens when the AI model is unavailable?** The system should return a processing error status and allow retry. The audit log records the failure.
- **What happens when the uploaded image is corrupted or not a radiograph?** The system should reject invalid images before AI processing and log the rejection.
- **How does the system handle a dentist who leaves the clinic?** Their past reviews remain attributed to them. Future reviews must be done by active clinic dentists.
- **What if the AI returns inconsistent or nonsensical results?** The dentist can override any finding. The system logs low-confidence results for model improvement.
- **How is data handled when a clinic closes or changes software?** Patient consent records and audit logs must be exportable for data portability requirements.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dentists MUST be able to upload radiograph images (PNG, JPEG, DICOM) via a web interface, with automatic validation of file type and size.
- **FR-002**: The system MUST verify active LGPD patient consent before initiating any AI analysis.
- **FR-003**: Uploaded images MUST have DICOM/EXIF metadata stripped to remove patient-identifying information before AI processing.
- **FR-004**: The system MUST call an AI vision model to analyze radiographs and return structured results including detected problems, affected teeth (FDI notation), severity levels, confidence scores, and treatment recommendations.
- **FR-005**: AI analysis results MUST be encrypted at rest before storage in the database.
- **FR-006**: Dentists MUST be able to review AI findings, add observations, override conclusions, and digitally sign their review.
- **FR-007**: The system MUST maintain an immutable audit trail logging every action: upload, analysis, review, export, consent registration, and consent revocation.
- **FR-008**: Clinics MUST be able to register, check, and revoke patient consent for AI radiography processing.
- **FR-009**: Dentists MUST be able to view aggregated insights (KPIs, charts, problem distributions) across all clinic analyses.
- **FR-010**: Dentists MUST be able to compare multiple radiograph analyses side-by-side and view patient radiography timelines.
- **FR-011**: The system MUST support exporting comparative analyses to PDF format.
- **FR-012**: The entire feature MUST be gated by an environment-level feature flag that can disable AI radiography globally.

### Key Entities

- **Análise de Radiografia (ia_radiografia_analise)**: Represents one AI analysis session. Links to patient, dentist, clinic, image hash, storage path, radiograph type, analysis status, encrypted AI result, confidence score, processing time, review status, and reviewer observations.
- **Paciente Consentimento (paciente_consentimento_ia)**: Tracks LGPD consent status per patient per clinic. Includes consent type, consent flag, timestamp, IP, terms hash, revocation status, and revocation reason.
- **Audit Log (ia_radiografia_audit_log)**: Immutable record of every action. Links to analysis, patient, dentist, clinic. Stores action type, timestamp, IP, user agent, and structured details.

### Multi-Tenancy Requirements *(OrthoPlus-specific)*

- **MT-001**: All database queries MUST filter by `clinic_id` — analyses, consent records, and audit logs are strictly clinic-scoped.
- **MT-002**: Backend routes MUST use `clinicGuard` middleware to enforce clinic isolation.
- **MT-003**: Frontend localStorage keys for this module MUST be scoped by `userId + clinicId` if any client-side state is persisted.
- **MT-004**: Cross-clinic data access MUST be blocked at API level — a dentist from Clinic A cannot view analyses from Clinic B even if they know the analysis ID.

### Database Requirements *(Prisma/PostgreSQL)*

- **DB-001**: `ia_radiografia_analise` model with fields for patient, dentist, clinic, image hash, storage path, radiograph type enum, status enum, encrypted AI result (JSON), confidence score, processing time, review flag, reviewer ID, observations, digital signature, and AI model version. Indexed by `[clinic_id, status]`, `[paciente_id]`, `[dentista_id]`.
- **DB-002**: `ia_radiografia_audit_log` model with fields for analysis ID, clinic, patient, dentist, action enum, timestamp, IP, user agent, and details JSON. Indexed by `[analise_id]`, `[paciente_id]`, `[clinic_id, timestamp]`.
- **DB-003**: `paciente_consentimento_ia` model with fields for patient, clinic, consent type enum, consent flag, timestamp, IP, terms hash, revocation flag, revocation date, and revocation reason.
- **DB-004**: All models live in the `pep` schema (Constitution DB-3: federated categories).

### Frontend/Backend Split *(full-stack feature)*

- **API-001**: Backend endpoints under `/api/ia-radiografia/`: POST `/consentimento` (register consent), GET `/consentimento/:pacienteId` (get consent), DELETE `/consentimento/:pacienteId` (revoke consent), POST `/upload-e-analisar` (upload + analyze), GET `/analises` (list analyses), GET `/analises/:id` (get single analysis with decryption), PATCH `/analises/:id/revisar` (review analysis). All endpoints require auth + clinicGuard + feature flag + rate limiting.
- **FE-001**: Frontend module at `apps/web/src/modules/ia-radiografia/` with main page (`IARadiografia`), upload dialog, analysis list, detail dialog, insights dashboard, comparison tool, patient timeline, and PDF export. Route: `/ia-radiografia`.
- **ST-001**: Shared Zod schemas and TypeScript types for analysis, problems, consent, and audit actions in `apps/web/src/modules/ia-radiografia/types/radiografia.types.ts`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes (Buildable — verifiable during implementation)

- **SC-001**: AI analysis completes end-to-end (upload → processing → result display) in under 30 seconds for 95 percent of images under 5MB.
- **SC-002**: 100 percent of AI analyses require explicit patient consent verification before processing — zero analyses process without consent.
- **SC-003**: 100 percent of actions (upload, analyze, review, export, consent changes) produce an immutable audit log entry within 100ms of action completion.
- **SC-004**: AI results are encrypted at rest — verified by attempting to read raw database values and confirming they are not plaintext.
- **SC-005**: Rate limiting prevents more than 10 uploads per hour per dentist and 100 per day per clinic — verified by automated load testing.
- **SC-006**: Zero unauthorized cross-clinic data access — verified by penetration testing attempting to access analysis IDs from other clinics.
- **SC-007**: Metadata stripping removes all DICOM/EXIF patient-identifying fields — verified by inspecting uploaded image buffers before and after processing.

### Post-Launch KPIs (Business — tracked after deployment)

- **KPI-001**: 80 percent of uploaded radiographs receive dentist review within 24 hours, establishing human-in-the-loop accountability.
- **KPI-002**: Dentist satisfaction score for AI suggestions averages 4.0/5.0 or higher within 3 months of deployment.
- **KPI-003**: AI false positive rate for critical findings (cavities, fractures) is below 15 percent as measured by dentist overrides.
- **KPI-004**: Zero LGPD compliance violations or patient complaints related to AI radiography processing within 6 months.

---

## Assumptions

- The clinic has obtained explicit patient consent before uploading radiographs, or the consent registration flow is used as part of the upload process.
- The AI model (local vision LLM instance) is available and responsive. If unavailable, the system degrades gracefully with clear error messages.
- Dentists using this feature have the "IA" module enabled in their clinic's module configuration.
- The system operates in a Brazilian legal context where LGPD (Lei Geral de Protecao de Dados) applies.
- Image storage uses the clinic's configured file storage backend (local or S3-compatible via MinIO).
- The AI model is running locally or on a trusted network — images are not sent to third-party cloud AI services.
