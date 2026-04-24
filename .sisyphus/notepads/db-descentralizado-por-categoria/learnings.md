
- Confirmado o uso do singleton `prisma` em `backend/src/infrastructure/database/prismaClient.ts`; não criar instância nova em managers de infraestrutura.
- Para consultas em schema múltiplo, `prisma.$queryRaw` com template literal tagged foi suficiente para health/stats.
- O arquivo criado espelhou o conteúdo solicitado; quando o LSP TypeScript não está disponível, a validação precisa cair para leitura direta do arquivo.
- `CategoryBackupService` deve usar `spawn("pg_dump", ...)` com `fs.mkdirSync(..., { recursive: true })` no construtor para garantir o diretório por categoria.
- Para o subrouter de configuracoes, basta montar `dbRouter` em `/db`; as rotas existentes de módulos e backups agendados permanecem intactas.

## [2026-04-24] T1: Prisma Schema Audit
- Total models re-anotados: 115
- Schemas adicionados ao datasource: core, comercial, clinico, operacional, administrativo
- Modelos que não estavam na lista e foram classificados manualmente: github_events→github_tools, historico_clinico→pep, patient_accounts→pacientes, patient_messages→pacientes, patient_preferences→pacientes, patient_sessions→pacientes, pep_assinaturas→pep, pep_tooth_surfaces→pep, procedimento_templates→administrativo, crypto_offline_wallets→crypto_config, crypto_transactions→financeiro, crypto_wallets→crypto_config, pdv_dashboard→pdv, pdv_metas_gamificacao→pdv
- prisma validate: PASS

- T4 criado como factory pura por categoria com cache em Map; validação por arquivo foi suficiente porque o servidor TypeScript não estava disponível.
## 2026-04-24
- CRM db subrouter follows the shared category pattern: thin subclasses over `CategoryDatabaseManager` and `CategoryBackupService` with `clinicGuard` on the router.
- `dbRouter` can be mounted under `/db` without changing existing CRM lead routes.

- Teleodonto followed the same thin-wrapper pattern: category-specific manager/backup subclasses plus a dedicated db subrouter mounted under `/db`.
- When TypeScript LSP is unavailable, quick validation still works by inspecting the generated diff and fixing any TS-unsafe `_req`/unused parameter issues.
- Category backup schedulers can be added as thin wrappers that only orchestrate `getCategoryBackupService(category).runBackup({ compress: true })` and log success/failure per category.
## 2026-04-24 — T13 schema migration
- `backend/scripts/migrate-category-schemas.sh` must receive a cleaned `DATABASE_URL` without the `?search_path=...` query string; `psql` rejected the URI with that parameter.
- `psql "$DATABASE_URL" -c "\dn"` is sufficient to verify the new schemas once the connection string is sanitized.

- For frontend category DB hooks, `apiClient.get/post` with TanStack Query v5 is enough; keep the hook local and expose plain action methods.
- Para os tabs de database no frontend, `useToast()` de `@orthoplus/core-hooks` retorna `showSuccess/showError/showInfo` (não `toast`); mensagens curtas de uma linha são suficientes.
