# Security Brief — BC-004

## Threats
- [Spoofing] T-BC-004-001: JWT token replay if refresh token compromised (likelihood: low, impact: high)
- [Information Disclosure] T-BC-004-003: Administration & Identity data leak via misconfigured access control (likelihood: low, impact: high)
- [Elevation of Privilege] T-BC-004-005: Role escalation via admin_tools module (likelihood: low, impact: high)

## Vulnerabilities
- V-001 (Potential, CWE-287): JWT secret rotation not enforced
  Location: backend/src/middleware/authMiddleware.ts:1-50
  Fix: Implement automatic JWT secret rotation with grace period

## Controls
- ✅ Authentication: JWT with bcrypt hashing, refresh tokens
- ✅ Authorization: RBAC with clinicGuard multi-tenant isolation

## Compliance Gaps
- None
