
- `lsp_diagnostics` não executou porque o servidor TypeScript não está instalado no ambiente (`typescript-language-server` ausente).
- `pnpm build` não pôde ser executado neste ambiente porque `pnpm` não está instalado no PATH.

- O arquivo `CategoryBackupService.ts` ainda não existe no workspace durante esta etapa; a factory foi criada assumindo a classe base conforme especificação do plano.

- `lsp_diagnostics` não pôde ser usado porque o ambiente não tem `typescript-language-server` instalado.
- A checagem de `tsc` no backend reporta erros pré-existentes fora do escopo (ex.: analytics/auth), então a validação desta entrega ficou restrita aos arquivos alterados.

- `lsp_diagnostics` não pôde validar os arquivos TypeScript porque `typescript-language-server` não está instalado no ambiente.
- Esta entrega também ficou sem build automático porque o ambiente não expõe uma toolchain TypeScript executável para checagem rápida.
## 2026-04-24 — Prisma db push blocked by existing relations
- `npx prisma db push --skip-generate --accept-data-loss` failed because Prisma attempted to drop `marketing_campaigns`, but `campaign_triggers` depends on it via FK.
- This indicates schema drift beyond the new category schemas; resolving it would require broader Prisma/model alignment, not just schema creation.

- `pnpm` is not installed in PATH here; only `corepack pnpm` works for ad-hoc checks.
- TypeScript LSP remains unavailable, so file-level diagnostics could not be produced for the new hook.
- `npx tsc --noEmit` still reports many pre-existing errors outside `database/tabs`; the four edited files themselves were cleared of toast-API type issues.
