# Security Brief — BC-006

## Threats
- [Spoofing] T-BC-006-001: JWT token replay if refresh token compromised (likelihood: low, impact: high)
- [Tampering] T-BC-006-002: Financial transaction tampering (likelihood: low, impact: high)
- [Information Disclosure] T-BC-006-003: Crypto Payments data leak via misconfigured access control (likelihood: low, impact: high)
- [Denial of Service] T-BC-006-004: Rate-limit bypass on high-frequency endpoints (likelihood: low, impact: medium)

## Vulnerabilities
- V-002 (Potential, CWE-522): Private key storage in environment variables
  Location: .env.production.example:crypto config
  Fix: Use hardware security module (HSM) or secret manager (HashiCorp Vault, AWS Secrets Manager)

## Controls
- ⚠️ Encryption: Private keys in environment variables
  - Gap: No HSM or secret manager for key custody at BC-006-01

## Compliance Gaps
- No HSM for private key custody
