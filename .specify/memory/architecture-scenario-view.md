# Scenario View

**Purpose**: Produce the UC semantics for the architecture workflow.

## Architecture Intent

Stabilize clinic management domain boundaries: patient care, clinical documentation, financial operations, administrative governance.

## Core Tensions

| Tension | Direction | Consequence |
|---------|-----------|-------------|
| Multi-tenancy vs simplicity | Strict clinic isolation | Every scenario validates clinic context |
| Real-time vs audit | Async with audit trail | Actions produce observable receipts |
| AI automation vs oversight | AI suggests, human approves | AI never bypasses approval |
| Self-service vs privacy | Patient portal with compliance | Minimum necessary data exposure |

## Stable Boundaries

| Boundary | Stable Because | Does Not Cover |
|----------|----------------|----------------|
| Clinic tenant isolation | Core invariant | Cross-clinic analytics |
| Patient record authority | Legal requirement | Third-party aggregation |
| Financial integrity | Fiscal compliance | External accounting sync |
| Appointment authority | Clinical workflow | External calendar sync |

## Change Axes

| Expected Change | Isolated By |
|-----------------|-------------|
| New payment methods | Financeiro module |
| AI expansion | Agent Service boundary |
| Regulatory changes | Audit log + consent |
| New roles | Auth + RBAC |
| Document processing | Files module |

## Invariants

| Invariant | Evidence | Risk If Violated |
|-----------|----------|------------------|
| Clinic context in every operation | All scenarios require auth | Data leakage |
| Audit log for sensitive ops | Upload, view, financial | Non-compliance |
| Patient consent before sharing | Portal scenarios | Legal liability |
| Appointment conflicts prevented | Scheduling scenarios | Double-booking |
| Financial records immutable | Invoice finalization | Audit failure |

## Actors

| Actor | Goal | Responsibility |
|-------|------|----------------|
| Dentist | Manage care, treatments | Full clinical authority |
| Admin | Configuration, reporting | Operational authority |
| Staff | Scheduling, patient flow | Operational execution |
| Patient | Access own records | Self-service consumer |
| System | Background workflows | Automated execution |

## Use Cases

| UC | Actor | Goal | Preconditions |
|----|-------|------|---------------|
| UC-01 Register Patient | Staff/Dentist | Add patient | Auth, clinic active |
| UC-02 Schedule Appointment | Staff/Patient | Book appointment | Patient exists |
| UC-03 Record Treatment | Dentist | Document procedure | Patient registered |
| UC-04 Generate Invoice | Dentist/Admin | Create billing | Treatment recorded |
| UC-05 Upload Document | Staff/Dentist | Attach file | Patient registered |
| UC-06 Process OCR | System | Extract text | File uploaded |
| UC-07 Manage Inventory | Staff/Admin | Track stock | Products configured |
| UC-08 Generate Report | Admin | Export analytics | Data accumulated |
| UC-09 Patient Portal | Patient | View own data | Patient registered |
| UC-10 Manage Users | Admin | Staff management | Admin auth |

## Scenario Gaps

| Gap | Affected UC | Why It Matters |
|-----|-------------|----------------|
| Cross-clinic referral | UC-01, UC-03 | Isolation prevents coordinated care |
| Insurance pre-auth | UC-02, UC-04 | Insurance portal integration undefined |
| AI decision audit | UC-06 | Explainability needed for liability |
| Offline capability | UC-09 | No offline sync defined |

## Prohibited Content

Do not write components, classes, APIs, tables, tasks, tests, or deployment scripts here.
