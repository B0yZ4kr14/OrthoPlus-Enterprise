# Tasks: Configurações e Módulos

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/configuracoes/` e mapear gaps
- [ ] T2: Criar/auditar `MODULE_CATALOG` hardcoded em `backend/src/modules/configuracoes/moduleCatalog.ts` com 39 módulos e dependências
- [ ] T3: Verificar/criar modelos Prisma: `CatalogModule`, `ClinicModule`, `ScheduledBackup` no schema `configuracoes`
- [ ] T4: Criar estrutura frontend em `apps/web/src/modules/settings/` (pages, components, hooks)

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/configuracoes/modulos` retornando catálogo com status ativo/inativo por clínica
- [ ] T6: Implementar `GET /api/configuracoes/modulos/dependencies` retornando grafo de dependências
- [ ] T7: Implementar `POST /api/configuracoes/modulos/toggle` e `POST /api/configuracoes/modulos/:id/toggle` com validação de dependências (erro 412) e dependentes (erro 412)
- [ ] T8: Implementar `POST /api/configuracoes/import-data` com validação de formato e opções (overwriteExisting, skipConflicts, mergeData)
- [ ] T9: Implementar `GET /api/configuracoes/export-data` com seleção de módulos e metadados
- [ ] T10: Implementar CRUD de backups agendados (`GET`, `PATCH`, `DELETE /api/configuracoes/backups/agendados`)
- [ ] T11: Implementar endpoints de sugestão (`POST /api/configuracoes/suggest`) e sequência recomendada (`POST /api/configuracoes/recommend-sequence`)

## Phase 3: Polish
- [ ] T12: Criar página de catálogo de módulos com cards, ícones, status visual e indicadores de dependência
- [ ] T13: Criar wizard de ativação de módulo com verificação de dependências não atendidas
- [ ] T14: Criar interface de importação/exportação com upload de arquivo, progresso e relatório de resultados
- [ ] T15: Adicionar testes unitários em `backend/tests/unit/` para lógica de dependências e toggle
- [ ] T16: Documentar grafo de dependências entre módulos no README do módulo
