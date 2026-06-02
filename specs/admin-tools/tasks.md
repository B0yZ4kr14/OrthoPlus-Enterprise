# Tasks: Ferramentas Administrativas

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/admin_tools/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelos Prisma `ADR` e `WikiPage` no schema `core` com campos especificados
- [x] T3: Criar estrutura de diretórios frontend em `apps/web/src/modules/admin/` (pages, components, hooks)
- [x] T4: Implementar middleware de role check (ADMIN/ROOT) nos endpoints sensíveis

## Phase 2: Implementation
- [x] T5: Implementar `ListAdrsUseCase` e `CreateAdrUseCase` com validação Zod
- [x] T6: Implementar CRUD de Wiki com versionamento (`ListWikiEntriesUseCase`, `CreateWikiEntryUseCase`, `UpdateWikiEntryUseCase`, `DeleteWikiEntryUseCase`)
- [x] T7: Implementar endpoint `GET /api/admin_tools/analyze-database-health` com métricas de conexão e tamanho de tabelas
- [x] T8: Implementar proxy GitHub (`ALL /api/admin_tools/github-proxy`) com validação de hostname `api.github.com`
- [x] T9: Implementar busca global (`GET /api/admin_tools/global-search`) em pacientes e dentistas com filtro por entityType
- [x] T10: Implementar endpoint `POST /api/admin_tools/create-root-user` protegido por `ENABLE_DANGEROUS_ADMIN_ENDPOINTS` e role `super_admin`

## Phase 3: Polish
- [x] T11: Criar página de ADRs no frontend com listagem, criação e filtros por tags
- [x] T12: Criar página de Wiki com editor, listagem, versionamento e categorias
- [x] T13: Criar dashboard administrativo com cards de health check, busca global e links rápidos
- [x] T14: Adicionar testes unitários em `backend/tests/unit/` para use cases de admin_tools
- [x] T15: Executar `pnpm build` no backend e `pnpm type-check` no frontend para validação
