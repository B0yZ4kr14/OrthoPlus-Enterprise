# Pre-Commit Checklist — OrthoPlus Enterprise

## Code Quality
- [ ] `pnpm lint` passes (0 errors)
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes

## Architecture Guard
- [ ] `bash scripts/arch-guard.sh backend` passes
- [ ] No new fat controllers (>300 lines)
- [ ] No direct Prisma access in new controllers
- [ ] clinicGuard applied to new routes

## Security
- [ ] No secrets in code
- [ ] No localStorage token usage added
- [ ] No new `as any` or `@ts-ignore`

## Spec Compliance
- [ ] If modifying spec: update spec.md, plan.md, tasks.md
- [ ] If new feature: create feature in specs/
- [ ] If architecture change: run arch-guard

## Database
- [ ] If schema changed: regenerate database.ts
- [ ] Migration files present and tested
