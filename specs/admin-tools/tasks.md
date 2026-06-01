# Tasks: Ferramentas Administrativas

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/admin_tools/` e mapear gaps vs spec.md
- [ ] T2: Adicionar/verificar modelos Prisma `ADR` e `WikiPage` no schema `core` com campos especificados
- [ ] T3: Criar estrutura de diretórios frontend em `apps/web/src/modules/admin/` (pages, components, hooks)
- [ ] T4: Implementar middleware de role check (ADMIN/ROOT) nos endpoints sensíveis

## Phase 2: Implementation
- [ ] T5: Implementar `ListAdrsUseCase` e `CreateAdrUseCase` com validação Zod
- [ ] T6: Implementar CRUD de Wiki com versionamento (`ListWikiEntriesUseCase`, `CreateWikiEntryUseCase`, `UpdateWikiEntryUseCase`, `DeleteWikiEntryUseCase`)
- [ ] T7: Implementar endpoint `GET /api/admin_tools/analyze-database-health` com métricas de conexão e tamanho de tabelas
- [ ] T8: Implementar proxy GitHub (`ALL /api/admin_tools/github-proxy`) com validação de hostname `api.github.com`
- [ ] T9: Implementar busca global (`GET /api/admin_tools/global-search`) em pacientes e dentistas com filtro por entityType
- [ ] T10: Implementar endpoint `POST /api/admin_tools/create-root-user` protegido por `ENABLE_DANGEROUS_ADMIN_ENDPOINTS` e role `super_admin`

## Phase 3: Polish
- [ ] T11: Criar página de ADRs no frontend com listagem, criação e filtros por tags
- [ ] T12: Criar página de Wiki com editor, listagem, versionamento e categorias
- [ ] T13: Criar dashboard administrativo com cards de health check, busca global e links rápidos
- [ ] T14: Adicionar testes unitários em `backend/tests/unit/` para use cases de admin_tools
- [ ] T15: Executar `pnpm build` no backend e `pnpm type-check` no frontend para validação
