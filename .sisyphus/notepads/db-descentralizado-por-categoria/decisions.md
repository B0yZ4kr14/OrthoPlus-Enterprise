## 2026-04-24
- Kept CRM database/backup logic isolated in infrastructure classes and exposed only through a dedicated db subrouter.
- Used `process.env.DATABASE_URL ?? ""` in the backup service to match the base category service contract.

- Mounted teleodonto database administration under `router.use("/db", dbRouter)` to keep existing teleodonto routes untouched.
- For category backups, scheduled orchestration stays in a dedicated worker file with no changes to existing cron workers or schedules.
## 2026-04-24 — Keep migration script idempotent and schema-only
- Created a schema-only SQL migration with `CREATE SCHEMA IF NOT EXISTS` for the new category schemas plus existing required schemas.
- Avoided destructive operations and left Prisma schema untouched, per task guardrails.
