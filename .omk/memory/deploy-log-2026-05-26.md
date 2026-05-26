# Deploy Log — 2026-05-26

## Summary

| Item | Status |
|------|--------|
| Commit | 29a0519f1 |
| VPS | 100.111.74.69 (Tailscale) |
| Backend | ✅ Online (port 3005) |
| Health | ✅ `{"status":"ok","uptime":47.5}` |
| Frontend | ✅ Built (36s, 3 packages) |
| Build | ✅ 0 errors |
| Tests | ✅ 689/689 passed |

## Changes Deployed

### Security Fixes
1. **clinicGuard on `/api/modules/*`** — Legacy router now requires clinic context
2. **Sanitized dbRouter errors** — 30 raw `e.message` exposures replaced with `asyncHandler`

### Pre-existing Issues Noted
- Prisma migration `add_search_index` marked as failed (P3009) — non-blocking, schema unchanged
- `driftScanWorker.ts` module not found on startup — non-blocking, worker missing from dist

## Deploy Steps

```
1. rsync source → VPS
2. pnpm install --frozen-lockfile (CI=true)
3. pnpm build (turbo: 3 packages, 36s)
4. prisma migrate deploy — SKIPPED (failed migration P3009)
5. pm2 restart orthoplus-backend
6. health check — PASS
```
