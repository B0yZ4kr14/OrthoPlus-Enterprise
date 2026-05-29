---
document_type: security-review
review_type: branch
assessment_date: 2026-05-29
codebase_analyzed: OrthoPlus-Enterprise
total_files_analyzed: 2
total_findings: 4
overall_risk: MODERATE
critical_count: 0
high_count: 0
medium_count: 1
low_count: 3
informational_count: 0
owasp_categories: [A05, A07]
cwe_ids: [CWE-798, CWE-532, CWE-209]
field_summaries:
  document_type: "Always 'security-review'. Allows indexers to skip non-review documents."
  review_type: "Which command generated this document: audit, branch, staged, plan, tasks, or followup."
  assessment_date: "ISO 8601 date the review was performed (YYYY-MM-DD)."
  overall_risk: "Highest severity tier with active findings (CRITICAL, HIGH, MODERATE, LOW, INFORMATIONAL)."
  critical_count: "Number of Critical findings (CVSS 9.0-10.0)."
  high_count: "Number of High findings (CVSS 7.0-8.9)."
  medium_count: "Number of Medium findings (CVSS 4.0-6.9)."
  low_count: "Number of Low findings (CVSS 0.1-3.9)."
  informational_count: "Number of Informational findings."
  owasp_categories: "OWASP Top 10 2025 categories (A01-A10) that have at least one finding."
  cwe_ids: "CWE identifiers referenced in this document."
  finding_id: "Unique finding identifier (SEC-NNN) for cross-referencing and task linkage."
  location: "File path and line number of the vulnerable code (path/to/file.ext:line)."
  owasp_category: "OWASP Top 10 2025 category for this finding (AXX:2025-Name)."
  cwe: "Common Weakness Enumeration identifier with short name (CWE-NNN: Name)."
  cvss_score: "CVSS v3.1 base score (0.0-10.0). 9.0+=Critical, 7.0-8.9=High, 4.0-6.9=Medium, 0.1-3.9=Low."
  spec_kit_task: "Spec-Kit task ID for backlog tracking and remediation follow-up (TASK-SEC-NNN)."
---

# SECURITY REVIEW REPORT — BRANCH: main vs HEAD~1

## Executive Summary

This branch review covers commit `87be6bb0e` ("ci(e2e): remove debug step and clean up e2e-server logging"). The diff removes 27 lines from `.github/workflows/e2e-tests.yml` (a debug auth-token step) and cleans up logging in `scripts/e2e-server.cjs`.

**Overall Risk: MODERATE** — The branch improves security posture by removing debug code, but leaves an identical hardcoded admin credential pattern in the same workflow file. Four active findings were identified (1 Medium, 3 Low). No critical or high-severity vulnerabilities were introduced by this change.

Key takeaways:
- The removed debug step contained hardcoded test admin credentials; removal is positive but incomplete.
- The same hardcoded credentials (`admin@orthoplus.com`, `user-001`, `ADMIN`, `clinic-001`) still exist in the Playwright auth-state generation step.
- Multiple test secrets remain hardcoded in the CI workflow YAML, violating the Security Constitution §4.1.
- The e2e proxy error handler leaks backend error messages to the client.

## Branch Diff Reviewed

**Target:** `87be6bb0e` (main HEAD)
**Base:** `62f0ce4bd` (HEAD~1)

Files changed:
| File | Lines Changed | Nature |
|------|---------------|--------|
| `.github/workflows/e2e-tests.yml` | -27 | Removed debug auth-token step |
| `scripts/e2e-server.cjs` | -6 / +3 | Removed proxy request/response logging; removed unused `prefix` parameter |

## Vulnerability Findings

### [MEDIUM] Incomplete Cleanup — Hardcoded Admin Credentials Persist in CI Workflow
**Finding ID:** SEC-001  
**Location:** `.github/workflows/e2e-tests.yml:122`  
**OWASP Category:** A05:2025-Security Misconfiguration  
**CWE:** CWE-798: Use of Hard-coded Credentials  
**CVSS Score:** 5.3 (Medium)  
**Spec-Kit Task:** TASK-SEC-001

**Description:**
The diff removes a "Debug auth token" step that generated a JWT using hardcoded admin credentials (`sub:'user-001'`, `email:'admin@orthoplus.com'`, `role:'ADMIN'`, `clinicId:'clinic-001'`). However, the **exact same credential pattern** remains in the "Create Playwright auth state" step at line 122. The removal therefore only cleaned up redundant debug output without addressing the underlying issue.

If this CI workflow were ever misconfigured to target a production database, or if developers copy these credentials for local testing against shared environments, a well-known admin account exists in committed code. The Security Constitution §2.1 requires bcrypt password hashing with cost ≥ 12 and §4.1 prohibits secrets in code.

**Remediation:**
1. Generate unique test credentials at CI runtime using a seeded deterministic generator or UUID.
2. Store the test admin seed as a GitHub Secret (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_SUB`) rather than hardcoding.
3. Rotate any shared test database that may have been seeded with `admin@orthoplus.com` / `admin123!`.
4. Add a CI lint rule (e.g., `detect-secrets`, `truffleHog`, or a custom grep) to block commits containing `@orthoplus.com` user identifiers in workflow files.

---

### [LOW] Hardcoded Test Secrets in CI Environment Variables
**Finding ID:** SEC-002  
**Location:** `.github/workflows/e2e-tests.yml:29-32,108`  
**OWASP Category:** A05:2025-Security Misconfiguration  
**CWE:** CWE-798: Use of Hard-coded Credentials  
**CVSS Score:** 3.7 (Low)  
**Spec-Kit Task:** TASK-SEC-002

**Description:**
The workflow declares multiple test secrets as plaintext environment variables:
- `JWT_SECRET: "test-jwt-secret-for-e2e-tests-minimum-32-characters-long"` (line 29)
- `IA_ENCRYPTION_KEY: "test-encryption-key-for-e2e-tests-32chars-long"` (line 30)
- `LGPD_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"` (line 31)
- `LGPD_ENCRYPTION_SALT: "0123456789abcdef"` (line 32)
- `SEED_ADMIN_PASSWORD: "admin123!"` (line 108)

The Security Constitution §4.1 states: "MUST NOT: Secrets in code, logs, or error messages." While these are labeled as test values, they are committed to version control, discoverable by anyone with repository access, and could be accidentally promoted to non-test environments or reused across projects.

**Remediation:**
1. Migrate all test secrets to GitHub Secrets (`Settings > Secrets and variables > Actions`) using names like `E2E_JWT_SECRET`, `E2E_LGPD_ENCRYPTION_KEY`, etc.
2. Reference them in the workflow as `${{ secrets.E2E_JWT_SECRET }}`.
3. For local E2E runs, provide a `.env.e2e.example` file with dummy placeholders (never real values) and instruct developers to generate their own test keys.

---

### [LOW] Removed Debug Code Retained in Git History
**Finding ID:** SEC-003  
**Location:** Git history of `.github/workflows/e2e-tests.yml` (prior to commit `87be6bb0e`)  
**OWASP Category:** A07:2025-Identification and Authentication Failures  
**CWE:** CWE-532: Insertion of Sensitive Information into Log File  
**CVSS Score:** 3.1 (Low)  
**Spec-Kit Task:** TASK-SEC-003

**Description:**
The removed "Debug auth token" step contained inline Node.js code that signed a JWT with hardcoded admin claims and printed the token to stdout via `console.log`. Because this code was previously committed, it remains in the repository's git history (`git log -p .github/workflows/e2e-tests.yml`). Anyone with read access to the repository can retrieve the exact hardcoded payload structure and test user identifiers.

While the JWT secret itself was loaded from `process.env.JWT_SECRET`, the payload structure reveals internal test account conventions (`user-001`, `clinic-001`) that could aid reconnaissance.

**Remediation:**
1. Rotate the test `JWT_SECRET` and any test database credentials that may have been exposed in CI logs.
2. Consider using `git-filter-repo` or BFG Repo-Cleaner to purge the removed debug code from history if the repository is public or broadly shared. **Warning:** this rewrites history and requires coordination with all contributors.
3. Ensure `actions/upload-artifact` retention does not preserve old workflow logs containing token output beyond 30 days.

---

### [LOW] E2E Proxy Error Handler Leaks Backend Error Messages
**Finding ID:** SEC-004  
**Location:** `scripts/e2e-server.cjs:33`  
**OWASP Category:** A05:2025-Security Misconfiguration  
**CWE:** CWE-209: Generation of Error Message Containing Sensitive Information  
**CVSS Score:** 2.7 (Low)  
**Spec-Kit Task:** TASK-SEC-004

**Description:**
The `e2e-server.cjs` proxy error handler returns the raw backend error message to the client:

```javascript
res.status(502).json({ error: 'Backend unavailable', message: err.message });
```

This was not modified by the current diff, but the file was touched in this branch. If the backend connection fails with an error containing internal paths, hostnames, or stack traces, that information is forwarded to the E2E test client. The Security Constitution §5.3 mandates: "Generic error messages to client (no stack traces in production)." While this is an E2E test utility, the same proxy code could be used in local development or staging previews.

**Remediation:**
1. Remove `message: err.message` from the client-facing JSON response.
2. Log the full error server-side (already partially done via `console.error`) and return only a correlation ID to the client:
   ```javascript
   const errorId = require('crypto').randomUUID();
   console.error(`[e2e-server] Proxy error ${errorId}:`, err);
   res.status(502).json({ error: 'Backend unavailable', errorId });
   ```

## Confirmed Secure Patterns

1. **Removal of debug auth logging** — The deletion of the `Debug auth token` step reduces the attack surface by eliminating an inline JWT generation routine that printed tokens to CI stdout.
2. **Removal of proxy request/response logging** — Stripping the `console.log` calls in `createProxyHandler()` prevents accidental logging of request URLs, HTTP methods, and response status codes, reducing information disclosure during E2E runs.
3. **No new dependencies introduced** — The diff does not add, update, or remove any npm/pnpm packages, eliminating supply-chain risk for this change.
4. **No network or firewall changes** — The diff does not modify `nginx.conf`, Docker Compose network segregation, or CORS configuration.

## Prioritized Action Plan

| Priority | Task | Effort | Finding |
|----------|------|--------|---------|
| P1 | Replace hardcoded test credentials in Playwright auth step with runtime-generated values or GitHub Secrets | Small | SEC-001 |
| P2 | Migrate all hardcoded test secrets (`JWT_SECRET`, `LGPD_ENCRYPTION_KEY`, `SEED_ADMIN_PASSWORD`) to GitHub Secrets | Small | SEC-002 |
| P3 | Sanitize `e2e-server.cjs` error response to remove `err.message` | Trivial | SEC-004 |
| P4 | Purge old CI logs and consider git-history cleanup for removed debug step | Medium | SEC-003 |

## Memory Hub INDEX.md Row

```text
| docs/security-reviews/2026-05-29-branch-e2e-cleanup.md | branch | 2026-05-29 | MODERATE | C:0 H:0 M:1 L:3 | A05,A07 |
```
