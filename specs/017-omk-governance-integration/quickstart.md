# Quickstart: OMK Governance Integration

**Feature**: 017-omk-governance-integration

## Prerequisites

- GitNexus CLI installed: `npx gitnexus --version`
- SpecKit configured: `.specify/` directory exists
- OMK memory backend running: `omk_memory_status` returns healthy
- VPS TSiAPP accessible via Tailscale

## 1. Index the Codebase with GitNexus

```bash
cd /path/to/OrthoPlus-Enterprise
npx gitnexus analyze
```

Verify index freshness:
```bash
npx gitnexus status
```

## 2. Create a New Feature with SpecKit

```bash
# Specify
/speckit-specify "Add patient insurance verification workflow"

# Plan (after clarify if needed)
/speckit-plan

# Generate tasks
/speckit-tasks

# Implement
/speckit-implement

# Verify
/speckit-verify
```

## 3. Orchestrate with OMK

```bash
# Create goal
omk_goal_create "Implement insurance verification"

# Check next recommended action
omk_goal_next <goalId>

# Add evidence
omk_evidence_add <goalId> <criterionId> true "Tests pass, 95% coverage"

# Verify and close
omk_goal_verify <goalId>
omk_goal_close <goalId>
```

## 4. Validate Production Environment

```bash
# SSH to VPS (Tailscale)
ssh -i ~/.ssh/id_ed25519_b0yz4kr14 tsi@100.111.74.69

# Check container health
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Health checks
curl -s http://127.0.0.1:3005/health
curl -s http://127.0.0.1:8083/
```

## 5. Verify External Endpoints

```bash
# Frontend
curl -sI https://tsiapp.io/OrthoPlus-Enterprise/

# API Health
curl -sI https://tsiapp.io/api/orthoplus/health
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| GitNexus index stale | Re-run `npx gitnexus analyze` |
| SpecKit gate failure | Check `pnpm lint`, `pnpm type-check`, `pnpm test` |
| OMK workflow paused | Check quality gate logs, fix issues, resume |
| VPS deploy failed | Verify Docker image tags, check `docker compose logs` |
| SSL certificate error | Verify Cloudflare Origin CA cert on VPS nginx |
