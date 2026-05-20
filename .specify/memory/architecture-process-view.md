# Process View

**Input**: Scenario View + Logical View

## Architecture Intent

Preserve runtime collaboration, handoff authority, and failure closure across module boundaries.

## Runtime Links

| Link | Trigger | Source | Target | Content | Completion |
|------|---------|--------|--------|---------|------------|
| Auth validation | Any request | Client | Identity | Token + clinic context | Valid token returned |
| Patient registration | Form submission | Patient Management | Audit Log | Patient data | Record created + audit entry |
| Appointment booking | Slot selection | Appointment Scheduling | Patient Management | Patient + dentist + time | Conflict check + record + notification |
| Treatment recording | Appointment completion | Clinical Documentation | Financial Operations | Procedure codes + costs | Treatment finalized |
| Invoice generation | Treatment finalization | Financial Operations | Clinical Documentation | Treatment reference | Invoice created with fiscal ID |
| Document upload | File selection | Document Management | Security Scan | File bytes + metadata | Scan result + storage path |
| OCR processing | Upload completion | Document Management | Agent Service | File reference | Extracted text stored |
| Report generation | Admin request | Analytics | All modules | Query parameters | Aggregated data exported |
| Notification dispatch | Event occurrence | System Automation | External provider | Recipient + message | Delivery status logged |

## Handoffs and Approvals

| Handoff | From | To | Meaning | Accepted | Rejected |
|---------|------|----|---------|----------|----------|
| Appointment → Treatment | Scheduling | Clinical | Clinical authority transfers | Dentist records treatment | No treatment, appointment cancelled |
| Treatment → Invoice | Clinical | Financial | Billing authority activates | Invoice generated | Treatments not billable |
| Upload → Active | User | System | Content approved for use | File visible | File quarantined or rejected |
| OCR → Searchable | Agent | System | Content indexed for retrieval | Text indexed | Error logged, retry queued |

## Receipts and Participation

| Receipt | Sender | Receiver | Content | User Action |
|---------|--------|----------|---------|-------------|
| Appointment confirmation | Scheduling | Patient/Staff | Time, dentist, location | Confirm or reschedule |
| Invoice notification | Financial | Patient/Admin | Amount, due date, payment link | Pay or dispute |
| Upload receipt | Document | Uploader | File ID, category, visibility | Verify or delete |
| OCR completion | Agent | System | Extracted text, confidence | Search available |
| Audit log entry | System | Audit store | Actor, action, timestamp, context | Reviewable by admin |

## Failure, Degradation, Closure

| Failure | Detected By | Response | Closure |
|---------|-------------|----------|---------|
| Clinic context missing | Auth middleware | Reject with auth error | Client re-authenticates |
| Appointment conflict | Scheduling module | Return conflict error | User selects alternative |
| Invalid file type/size | Document module | Reject upload | User selects valid file |
| Security threat detected | Scan service | Quarantine file | Admin review required |
| OCR processing failure | Agent Service | Mark ERROR, queue retry | Manual intervention or retry |
| Database timeout | Circuit breaker | Return service unavailable | Automatic retry or degraded mode |
| External notification failure | System Automation | Log failure, queue retry | Manual review if persistent |
| Invoice fiscal rejection | Financial module | Return configuration error | Admin fixes fiscal config |

## Process Gaps

| Gap | Affected Link | Why It Matters |
|-----|---------------|----------------|
| No dead-letter queue for OCR | Agent → Document | Failed OCR jobs accumulate without admin visibility |
| No circuit breaker for Agent Service | Document → Agent | Agent failures cascade to document upload completion |
| No distributed transaction for Treatment→Invoice | Clinical → Financial | Partial state possible if invoice generation fails after treatment finalization |

## Prohibited Content

Do not write classes, methods, endpoints, queues, or infrastructure manifests here.
