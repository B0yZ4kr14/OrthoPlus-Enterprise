# Security Brief — BC-008

## Threats
- [Tampering] T-BC-008-002: Medical record tampering if clinicGuard bypassed (likelihood: low, impact: high)
- [Information Disclosure] T-BC-008-003: Medical Imaging & Files data leak via misconfigured access control (likelihood: low, impact: high)

## Vulnerabilities
- V-004 (Potential, CWE-319): Medical images stored without encryption-at-rest check
  Location: backend/src/modules/files:upload handler
  Fix: Enforce server-side encryption (SSE-S3 or SSE-KMS) and validate bucket policies
- V-006 (Potential, CWE-400): No file size limit on radiograph uploads
  Location: backend/src/modules/files:upload handler
  Fix: Add file size limits and scan uploads for malware

## Controls
- ⚠️ Encryption: TLS in transit; S3 SSE for storage
  - Gap: Encryption-at-rest not explicitly verified on MinIO deployments at BC-008-01

## Compliance Gaps
- Encryption-at-rest not verified on MinIO
