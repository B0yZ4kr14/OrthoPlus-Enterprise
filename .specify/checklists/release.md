# Release Checklist — OrthoPlus Enterprise

## Pre-Release
- [ ] All tests pass (unit + e2e)
- [ ] arch-guard.sh passes with 0 violations
- [ ] Security audit passes
- [ ] Performance benchmarks acceptable
- [ ] CHANGELOG.md updated

## Deployment
- [ ] Build frontend: `cd apps/web && pnpm build`
- [ ] Build backend: `cd backend && pnpm build`
- [ ] Docker images build successfully
- [ ] Environment variables validated
- [ ] Database migrations ready

## Post-Deploy
- [ ] Health checks pass
- [ ] Smoke tests on production
- [ ] Monitoring dashboards green
- [ ] Rollback plan documented
