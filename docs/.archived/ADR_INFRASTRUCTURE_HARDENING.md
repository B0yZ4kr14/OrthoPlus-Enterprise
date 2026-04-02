# Architecture Decision Record: Infrastructure Dependency Completeness & Hardening

**Date:** 2026-03-17  
**Status:** Implemented  
**Classification:** DevOps Blueprinting — Layer 5 Operational Trigger  

---

## Context

The OrthoPlus self-hosted stack was audited against the constitutional requirements (Layer 1–3) with the following findings:

1. **Cloud Leakage Scan (Layer 3.1):** A deep scan of all TypeScript/JavaScript source files confirmed **zero Supabase/Firebase imports** in the runtime codebase. The `src/types/database.ts` file retains PostgreSQL-native schema types only (`DatabaseWithoutInternals` and `__InternalSupabase` references were removed in a prior commit).

2. **Dependency Gap (Layer 3.3):** `docker-compose.yml` (development/local stack) and `install.sh` (Ubuntu bare-metal installer) were **missing the Redis 7 service**, despite the backend explicitly depending on `REDIS_URL=redis://localhost:6379` for session caching and job queuing.

3. **Multi-tenant Impact Analysis (Layer 3.2):** Redis is used only as a volatile ephemeral cache (`allkeys-lru` eviction). All persistent clinical data remains exclusively in PostgreSQL with Row-Level Security (RLS). No multi-tenant schema changes were required.

---

## Decision

### 1. Add Redis 7 to `docker-compose.yml`

Added a `redis` service with:
- Image: `redis:7-alpine` (minimal attack surface)
- `maxmemory 256mb` with `allkeys-lru` eviction policy
- `appendonly yes` for AOF persistence
- Health check via `redis-cli ping`
- Attached to `orthoplus-network`
- Named volume `redis-data` for data persistence

### 2. Add Redis 7 to `install.sh` (Ubuntu bare-metal)

Inserted a Redis installation block immediately after the PostgreSQL setup and before Nginx, performing:
- `apt install -y redis-server`
- Hardens `/etc/redis/redis.conf`: `bind 127.0.0.1` (localhost-only), `maxmemory 256mb`, `maxmemory-policy allkeys-lru`, `appendonly yes`
- Enables and restarts `redis-server` via systemd

### 3. No Changes to Multi-tenant Schema or Encryption

The PostgreSQL RLS schema, `pgcrypto` encryption for PII fields, and JWT authentication logic are unaffected. Redis stores only non-sensitive session tokens and ephemeral job payloads.

---

## Consequences

| Aspect | Before | After |
|--------|--------|-------|
| `docker-compose.yml` Redis | ❌ Missing | ✅ `redis:7-alpine` with health check |
| `install.sh` Redis | ❌ Missing | ✅ Installed & hardened (localhost-only bind) |
| Cloud dependencies | ✅ Zero | ✅ Zero (unchanged) |
| Multi-tenant RLS | ✅ Intact | ✅ Intact (unchanged) |
| PII encryption | ✅ Intact | ✅ Intact (unchanged) |
| Build / type-check | ✅ Passing | ✅ Passing (no code changes) |

---

## Git Log Note

```
feat(infra): add Redis 7 to docker-compose and install.sh; audit confirms zero cloud leakage

- Add redis:7-alpine service to docker-compose.yml (dev stack) with maxmemory,
  AOF persistence, and health check
- Add Redis 7 installation block to install.sh with localhost-only bind hardening
- Deep scan confirmed: no @supabase/* imports in TS/JS source tree
- Multi-tenant RLS schema and PII encryption are unaffected

ADR: docs/ADR_INFRASTRUCTURE_HARDENING.md
```

---

## References

- `docker-compose.yml` — Development stack
- `docker-compose.onprem.yml` — Production on-premise stack (Redis was already present)
- `install.sh` — Ubuntu 24.04 LTS bare-metal installer
- `backend/src/index.ts` — Backend startup requiring `REDIS_URL`
- `docs/ADR_ZERO_CLOUD_LOCKIN.md` — Prior ADR confirming zero BaaS dependencies
