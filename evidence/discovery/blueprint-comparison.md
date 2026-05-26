# Industry Blueprint Comparison

## Framework: HL7 FHIR (Healthcare)

The OrthoPlus Enterprise is a dental clinic management system. HL7 FHIR is the most relevant healthcare reference framework.

### Aligned

| Capability | FHIR Resource Mapping |
|-----------|----------------------|
| BC-001 Clinical Care | Patient, Appointment, Encounter, Procedure, Condition, Observation, DiagnosticReport |
| BC-001-03 PEP | Composition (clinical document), Condition, Observation |
| BC-001-04 Procedures | Procedure, CarePlan |
| BC-002 Financial Management | Coverage, Claim, Invoice, PaymentReconciliation |
| BC-003 Inventory | SupplyDelivery, SupplyRequest, Device |
| BC-004 Administration & Identity | Practitioner, Organization, PractitionerRole |
| BC-005 Marketing & CRM | Patient (for recalls), Schedule (for campaigns) |
| BC-008 Medical Imaging | ImagingStudy, DiagnosticReport, Media |
| BC-009 Telemedicine | Encounter (virtual), VideoCommunications |

### Org-Specific

| Capability | Note |
|-----------|------|
| BC-006 Crypto Payments | No FHIR equivalent; Bitcoin payments are a business differentiator |
| BC-007 Fiscal Compliance | NFe/TISS are Brazil-specific regulatory requirements; no direct FHIR mapping |
| BC-010-02 AI Agent Orchestration | No FHIR equivalent; operational AI tooling |
| BC-011 Reporting | No direct FHIR equivalent; business reporting is org-specific |

### Missing (FHIR resources not explicitly modeled)

| FHIR Resource | Status | Clarification |
|--------------|--------|---------------|
| MedicationRequest / Medication | Not present | Dental prescriptions handled via Procedure notes |
| Immunization | Not present | Out of scope for dental practice |
| AllergyIntolerance | Partial | Embedded in Anamnese (PEP) as free text |
| FamilyMemberHistory | Not present | Out of scope |
| DocumentReference | Partial | File storage (BC-008) handles documents generically |
| Subscription / SubscriptionStatus | Not present | Notifications are infrastructure-de-scoped |

## Framework: APQC (Cross-Industry)

For non-clinical capabilities, APQC provides a secondary reference.

### Aligned
- BC-002 Financial Management → APQC 9.0 Manage Financial Resources
- BC-003 Inventory & Supply → APQC 8.0 Manage Supply Chain
- BC-004 Administration & Identity → APQC 7.0 Manage Human Capital
- BC-005 Marketing & CRM → APQC 4.0 Market and Sell Products/Services
- BC-010 Analytics & Intelligence → APQC 13.0 Manage Business Processes

### Org-Specific
- BC-006 Crypto Payments → No APQC equivalent
- BC-007 Fiscal Compliance → Brazil-specific; no direct APQC mapping
- BC-009 Telemedicine → Emerging category; not fully covered by APQC
