# Security Constitution — OrthoPlus Enterprise

**Version**: 1.0.0
**Derived from**: constitution.md v1.1.0
**Scope**: Security rules, standards, and requirements

---

## 1. Trust Boundaries

### 1.1 Network Boundaries
| Boundary | Trust Level | Controls |
|----------|-------------|----------|
| Internet → Nginx | Untrusted | TLS 1.3, rate limiting, WAF rules |
| Nginx → Frontend | Trusted (localhost) | None needed |
| Nginx → Backend API | Trusted (internal) | Internal network only |
| Backend → Database | Trusted (internal) | PostgreSQL auth, network isolation |
| Backend → Redis | Trusted (internal) | Redis AUTH, network isolation |
| Backend → Agent Service | Trusted (internal) | Internal network, circuit breaker |
| Backend → External APIs | Untrusted | TLS, timeout, retry limits |

### 1.2 Data Boundaries
| Boundary | Sensitivity | Controls |
|----------|-------------|----------|
| Patient PII | High | Encryption at rest, access logs, LGPD compliance |
| Financial records | High | Immutable after closing, audit trail |
| Clinical notes | High | Dentist-only access, no patient self-edit |
| Authentication tokens | High | Short TTL, refresh rotation, HttpOnly cookies |
| File uploads | Medium | Virus scan, MIME whitelist, size limits |
| Public clinic info | Low | None |

---

## 2. Authentication & Authorization Standards

### 2.1 Authentication
- **MUST**: JWT with RS256 or HS256 (min 256-bit secret)
- **MUST**: Access token TTL ≤ 15 minutes
- **MUST**: Refresh token TTL ≤ 7 days
- **MUST**: HttpOnly, Secure, SameSite=Strict cookies for refresh
- **MUST**: Password hashing with bcrypt (cost ≥ 12)
- **MUST NOT**: Store plaintext passwords

### 2.2 Authorization
- **MUST**: Role-based access control (RBAC)
- **Roles**: ADMIN, MEMBER, PATIENT
- **MUST**: clinicGuard validates clinicId on every request
- **MUST**: Visibility levels enforced (PUBLICO, RESTRITO, CONFIDENCIAL)
- **SHOULD**: Permission inheritance from patient record (files linked to patient)

### 2.3 Session Management
- **MUST**: Server-side session invalidation capability
- **MUST**: Logout invalidates refresh token
- **SHOULD**: Concurrent session limits per user

---

## 3. Data Isolation & Privacy Rules

### 3.1 Multi-Tenancy
- **MUST**: clinicId in every query/filter
- **MUST**: No cross-clinic data access (even for ADMIN)
- **MUST**: Database indexes include clinicId
- **MUST**: Audit logs include clinicId

### 3.2 LGPD Compliance
- **MUST**: Patient consent before data sharing
- **MUST**: Right to deletion (anonymization, not hard delete)
- **MUST**: Data portability (export patient record)
- **MUST**: Audit trail for all access to patient data
- **SHOULD**: Privacy level per patient (PUBLICO, RESTRITO, CONFIDENCIAL, ANONIMIZADO)

### 3.3 File Security
- **MUST**: MIME type whitelist (PDF, images, DOCX, XLSX, DICOM)
- **MUST**: File size limit (50MB)
- **MUST**: Virus/malware scan on upload (hash-based + pattern detection)
- **MUST**: Filename sanitization (prevent path traversal)
- **MUST**: Visibility ACL enforced on download/view

---

## 4. Secrets Management Policy

### 4.1 Storage
- **MUST**: GitHub Secrets for CI/CD
- **MUST**: Environment variables for runtime (Docker, .env on VPS)
- **MUST**: .env files in .gitignore
- **MUST NOT**: Secrets in code, logs, or error messages

### 4.2 Rotation
- **SHOULD**: JWT secret rotation every 90 days
- **SHOULD**: Database password rotation every 180 days
- **SHOULD**: API key rotation every 90 days

### 4.3 Validation
- **MUST**: validate-production.sh checks for placeholders and mock flags
- **MUST**: CI blocks merge if secrets detected in diff

---

## 5. Secure-by-Design Patterns

### 5.1 Input Validation
- **MUST**: Whitelist validation (reject unknown fields)
- **MUST**: Parameterized queries (Prisma ORM)
- **MUST NOT**: String concatenation for SQL

### 5.2 Output Encoding
- **MUST**: XSS protection via React automatic escaping
- **MUST**: Content-Type headers on all responses
- **SHOULD**: CSP headers (configured in nginx)

### 5.3 Error Handling
- **MUST**: Generic error messages to client (no stack traces in production)
- **MUST**: Detailed error logs server-side (Winston JSON)
- **MUST**: Error IDs for correlation (client sees ID, logs have details)

---

## 6. API & Integration Security

### 6.1 Rate Limiting
| Endpoint | Limit |
|----------|-------|
| Auth (login/register) | 10 req / 15 min |
| File upload | 50 req / hour |
| General API | 500 req / 15 min |

### 6.2 CSRF Protection
- **MUST**: Origin header validation
- **MUST**: CSRF token for cookie-based auth
- **MUST**: SameSite=Strict cookies

### 6.3 CORS
- **MUST**: Whitelist origins (not wildcard in production)
- **MUST**: Credentials only for same-origin

---

## 7. Audit, Logging & Monitoring Requirements

### 7.1 Audit Logs
- **MUST**: Every sensitive operation logged (CRUD on patient, financial, file)
- **MUST**: Log fields: action, actor, clinic, timestamp, IP, user agent
- **MUST**: Immutable audit store (append-only)
- **SHOULD**: Tamper detection (hash chain or digital signature)

### 7.2 Security Monitoring
- **MUST**: Failed auth attempts logged and alerted
- **MUST**: Unusual access patterns detected (same user, multiple clinics)
- **SHOULD**: DLP alerts for bulk patient data export

### 7.3 Metrics
- **MUST**: Security-related Prometheus metrics (auth failures, rate limit hits)
- **SHOULD**: SIEM integration for security events

---

## 8. Security Incident Response Triggers

| Severity | Trigger | Response |
|----------|---------|----------|
| Critical | Confirmed data breach | Immediate containment, legal notification, forensic analysis |
| High | Suspicious bulk access | Disable affected account, audit review, admin notification |
| Medium | Rate limit exceeded | Temp block IP, review pattern, CAPTCHA if persistent |
| Low | Failed auth spike | Monitor, alert if sustained |

---

## 9. Compliance & Regulatory Mapping

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| LGPD | Consent, deletion, portability | Patient consent flags, anonymization API, export feature |
| LGPD | Data minimization | Visibility levels, role-based access |
| Fiscal (SPED, NF-e) | Immutable records | Invoice state machine, audit trail |
| ANS (health insurance) | TISS protocol compliance | TISS module, guia generation |
| PCI DSS (if applicable) | Card data protection | Payment processor integration (no local storage) |

---

## Gaps

| Gap | Risk | Resolution |
|-----|------|------------|
| No formal penetration testing schedule | Undiscovered vulnerabilities | Quarterly pen tests |
| No automated dependency vulnerability scanning | Supply chain attacks | Add Dependabot + Snyk |
| No WAF rules tuned | Web attacks | Tune ModSecurity / Cloudflare rules |
| No encryption at rest for file store | Data leak if storage compromised | Enable MinIO encryption |
| No MFA for admin accounts | Account takeover | Add TOTP / SMS MFA |
