# Tasks: Configurações e Módulos

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/configuracoes/` e mapear gaps
- [x] T2: Criar/auditar `MODULE_CATALOG` hardcoded em `backend/src/modules/configuracoes/moduleCatalog.ts` com 39 módulos e dependências
- [x] T3: Verificar/criar modelos Prisma: `CatalogModule`, `ClinicModule`, `ScheduledBackup` no schema `configuracoes`
- [x] T4: Criar estrutura frontend em `apps/web/src/modules/settings/` (pages, components, hooks)

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/configuracoes/modulos` retornando catálogo com status ativo/inativo por clínica
- [x] T6: Implementar `GET /api/configuracoes/modulos/dependencies` retornando grafo de dependências
- [x] T7: Implementar `POST /api/configuracoes/modulos/toggle` e `POST /api/configuracoes/modulos/:id/toggle` com validação de dependências (erro 412) e dependentes (erro 412)
- [x] T8: Implementar `POST /api/configuracoes/import-data` com validação de formato e opções (overwriteExisting, skipConflicts, mergeData)
- [x] T9: Implementar `GET /api/configuracoes/export-data` com seleção de módulos e metadados
- [x] T10: Implementar CRUD de backups agendados (`GET`, `PATCH`, `DELETE /api/configuracoes/backups/agendados`)
- [x] T11: Implementar endpoints de sugestão (`POST /api/configuracoes/suggest`) e sequência recomendada (`POST /api/configuracoes/recommend-sequence`)

## Phase 3: Polish
- [x] T12: Criar página de catálogo de módulos com cards, ícones, status visual e indicadores de dependência
- [x] T13: Criar wizard de ativação de módulo com verificação de dependências não atendidas
- [x] T14: Criar interface de importação/exportação com upload de arquivo, progresso e relatório de resultados
- [x] T15: Adicionar testes unitários em `backend/tests/unit/` para lógica de dependências e toggle
- [x] T16: Documentar grafo de dependências entre módulos no README do módulo
