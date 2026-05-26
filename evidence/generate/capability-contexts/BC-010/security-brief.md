# Security Brief — BC-010

## Threats
- [Tampering] T-BC-010-002: Medical record tampering if clinicGuard bypassed (likelihood: low, impact: high)
- [Information Disclosure] T-BC-010-003: Analytics & Intelligence data leak via misconfigured access control (likelihood: medium, impact: high)
- [Denial of Service] T-BC-010-004: Rate-limit bypass on high-frequency endpoints (likelihood: low, impact: medium)

## Vulnerabilities
- V-003 (Probable, CWE-200): Analytics reads all sensitive data without field-level masking
  Location: backend/src/modules/analytics:dashboard queries
  Fix: Implement field-level masking in analytics queries based on user role

## Controls
- ⚠️ Validation: Zod schemas
  - Gap: No field-level access control on aggregated queries at BC-010-01

## Compliance Gaps
- No field-level access control on analytics queries
