# Architecture Decision Record: Zero Cloud Lock-in Migration

**Date:** 2026-03-17
**Status:** Implemented
**Classification:** Constitutional Layer - Inviolable

---

## Context

The OrthoPlus system was initially designed with Supabase (BaaS) references and lacked comprehensive self-hosted infrastructure support. The constitutional requirement mandates:

1. **Zero Cloud Lock-in:** 100% independence from managed services (Supabase, Firebase, etc.)
2. **Clinical Data Sovereignty:** All PII must reside in Docker volumes controlled by infrastructure owner
3. **Resilience Axiom:** Self-hosted environments require automated backups, monitoring, and health checks

---

## Decision

We have completed a comprehensive migration to achieve full self-hosted independence:

### 1. Removed BaaS Dependencies

**Actions Taken:**
- Removed deprecated Supabase Edge Functions migration script (`scripts/migrate-edge-functions-logs.sh`)
- Cleaned up `src/types/database.ts` to remove `DatabaseWithoutInternals` and `__InternalSupabase` references
- Simplified helper types to use native PostgreSQL schema types only

**Code Changes:**
```typescript
// Before: Supabase-specific type helpers
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

// After: Clean PostgreSQL-native type helpers
type DefaultSchema = Database["public"]
```

**Impact:**
- ✅ No imports of `@supabase/*` packages in codebase
- ✅ Database types are now 100% PostgreSQL-native
- ✅ Type-check passes without errors

### 2. Enhanced Self-Hosted Infrastructure

**docker-compose.onprem.yml Enhancements:**

#### Added Services:
1. **PostgreSQL 16** with production-tuned configuration
   - 2GB shared_buffers
   - Optimized query planner settings
   - Full query logging enabled
   - Health checks with proper start delays

2. **MinIO S3-Compatible Storage**
   - Self-hosted object storage for DICOM, X-Rays, PDFs
   - No dependency on AWS S3 or cloud storage
   - Web console on port 9001

3. **Automated Backup Services**
   - `postgres-backup`: Daily at 2:00 AM (30-day retention)
   - `minio-backup`: Daily at 3:00 AM (30-day retention)
   - Configurable retention policies
   - Comprehensive logging

4. **Health Monitoring**
   - Prometheus-compatible node-exporter
   - System metrics on port 9100
   - Per-service health checks

#### Network Isolation:
- `frontend_net` (172.20.0.0/16): Frontend-only
- `backend_net` (172.21.0.0/16): Backend + Cache + Storage
- `db_net` (172.22.0.0/16): Database isolation

#### Resource Limits:
```yaml
postgres:
  resources:
    limits:
      cpus: '4'
      memory: 8G
    reservations:
      cpus: '2'
      memory: 4G
```

### 3. Security Hardening

**Nginx Configuration (`nginx.conf`):**
- TLS 1.2/1.3 only with strong cipher suites
- OCSP stapling
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Multi-level rate limiting:
  - Global: 100 req/s per IP
  - API: 30 req/s per IP
  - Auth endpoints: 5 req/min per IP
  - Upload endpoints: 10 req/min per IP
- Connection limiting: 10 concurrent per IP
- 50MB file upload limit (clinical images)

**Deployment Guide (`docs/SELF_HOSTED_DEPLOYMENT_GUIDE.md`):**
- Complete Ubuntu 22.04/24.04 installation steps
- UFW firewall configuration
- Fail2ban setup for intrusion prevention
- SSL/TLS with Certbot (Let's Encrypt)
- DH parameter generation (4096-bit)
- Automated backup verification
- Disaster recovery procedures

### 4. Backup Automation

**PostgreSQL Backup Script (`scripts/postgres-backup.sh`):**
- Compressed SQL dumps with gzip
- Retention policy enforcement
- Detailed logging
- Health monitoring
- Secure password handling

**MinIO Backup Script (`scripts/minio-backup.sh`):**
- Bucket mirroring with `mc`
- Compressed tar archives
- Retention policy enforcement
- Per-bucket backup verification

---

## Consequences

### Positive

1. **Data Sovereignty:** All clinical data now resides in self-controlled Docker volumes
   - PostgreSQL data: `/var/lib/docker/volumes/orthoplus_postgres_data`
   - MinIO data: `/var/lib/docker/volumes/orthoplus_minio_data`
   - Backups: `/var/lib/docker/volumes/orthoplus_*_backups`

2. **Zero Vendor Lock-in:** Complete independence from BaaS providers
   - Can deploy to any Ubuntu 22.04/24.04 server
   - No external API dependencies
   - No cloud provider-specific code

3. **Cost Control:** Fixed infrastructure costs
   - No per-request pricing
   - No bandwidth charges from cloud providers
   - Predictable resource usage

4. **Compliance Ready:** GDPR/HIPAA alignment
   - Full control over data location
   - Audit logs in-house
   - No third-party data processors

5. **Resilience:** Self-healing capabilities
   - Automated daily backups
   - 30-day retention policy
   - Health monitoring built-in
   - Disaster recovery procedures

### Negative

1. **Operational Responsibility:** Infrastructure management required
   - System administrators need PostgreSQL, Docker, Nginx expertise
   - Backup verification is manual responsibility
   - Security patching required

2. **Initial Setup Complexity:** More setup steps than BaaS
   - Docker installation required
   - SSL/TLS certificate management
   - Firewall configuration
   - UFW/Fail2ban setup

3. **Scaling Considerations:** Vertical scaling only (initially)
   - Horizontal PostgreSQL scaling requires additional setup (e.g., Patroni, Citus)
   - MinIO distributed mode requires 4+ nodes

### Mitigations

1. **Documentation:** Comprehensive deployment guide provided
   - Step-by-step Ubuntu installation
   - Automated scripts for backups
   - Troubleshooting section

2. **Automation:** Docker Compose handles service orchestration
   - Health checks automatic
   - Restart policies configured
   - Resource limits enforced

3. **Monitoring:** Built-in health checks
   - Prometheus metrics exporter
   - Nginx access/error logs
   - Service-level health endpoints

---

## Implementation Status

### ✅ Completed

- [x] Remove deprecated Supabase migration script
- [x] Clean up database.ts Supabase type references
- [x] Enhance docker-compose.onprem.yml with MinIO
- [x] Add automated PostgreSQL backup service
- [x] Add automated MinIO backup service
- [x] Create postgres-backup.sh script
- [x] Create minio-backup.sh script
- [x] Create comprehensive Nginx configuration with rate limiting
- [x] Create Ubuntu deployment guide
- [x] Add health monitoring service
- [x] Configure network isolation
- [x] Set resource limits on all services
- [x] Type-check verification passed

### 📝 Recommendations for Production

1. **Before Deployment:**
   - Generate strong JWT_SECRET (256-bit)
   - Generate strong POSTGRES_PASSWORD
   - Generate strong MINIO credentials
   - Set AUTH_ALLOW_MOCK=false
   - Set ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false
   - Set DB_SSL=true

2. **After Deployment:**
   - Configure UFW firewall
   - Install and configure Fail2ban
   - Generate SSL certificates with Certbot
   - Generate DH parameters (4096-bit)
   - Verify automated backups are running
   - Set up off-site backup sync
   - Configure monitoring alerts

3. **Regular Maintenance:**
   - Weekly: Check service health, verify backups
   - Monthly: Rotate logs, review fail2ban blocks, update packages
   - Quarterly: Review security analysis, penetration testing

---

## References

- **Problem Statement:** Layer 1 - Zero Cloud Lock-in Constitution
- **Security Analysis:** `docs/SECURITY_ANALYSIS_2026-03-17.md`
- **Deployment Guide:** `docs/SELF_HOSTED_DEPLOYMENT_GUIDE.md`
- **Technical Baseline:** `docs/BASELINE_TECNICA_E_FONTE_DE_VERDADE.md`

---

## Validation

```bash
# Verify no Supabase imports
grep -r "supabase" src/**/*.{ts,tsx} --exclude-dir=node_modules
# Expected: No matches

# Verify type-check passes
npm run type-check
# Expected: No errors

# Verify Docker Compose syntax
docker compose -f docker-compose.onprem.yml config
# Expected: Valid YAML

# Verify backup scripts are executable
ls -lh scripts/*.sh
# Expected: -rwxr-xr-x permissions
```

---

**Signed:** Principal Fullstack Engineer & SRE
**Date:** 2026-03-17
**Version:** 1.0.0
