# Security Brief — BC-007

## Threats
- [Tampering] T-BC-007-002: Financial transaction tampering (likelihood: low, impact: high)
- [Information Disclosure] T-BC-007-003: Fiscal Compliance data leak via misconfigured access control (likelihood: low, impact: high)

## Vulnerabilities
- V-005 (Probable, CWE-703): Government API errors may leak sensitive data in logs
  Location: backend/src/modules/nfe:error handling
  Fix: Mask CNPJ/CPF in logs; use structured logging with PII redaction

## Controls
- No controls mapped

## Compliance Gaps
- None
