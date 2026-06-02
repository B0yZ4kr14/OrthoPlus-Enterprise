# Tasks: Relatórios e Exportação de Dados

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/relatorios/` e mapear gaps vs spec.md
- [x] T2: Verificar serviço `ReportControllerService` em `backend/src/modules/relatorios/`
- [x] T3: Definir formato padrão de exportação JSON com metadados (`version`, `exportedAt`, `clinicId`)
- [x] T4: Criar schema Zod de validação para dados de importação

## Phase 2: Implementation
- [x] T5: Implementar `exportClinicData` com opções: `includeModules`, `includePatients`, `includeHistory`, `includeProntuarios`, `includeAppointments`, `includeFinanceiro`, `format`
- [x] T6: Implementar `importClinicData` com validação de `version` e formato de dados
- [x] T7: Implementar opções de importação: `overwriteExisting` (padrão: false), `skipConflicts` (padrão: true), `mergeData` (padrão: false)
- [x] T8: Implementar importação de módulos ativos via `module_catalog`
- [x] T9: Implementar importação de prontuários com odontogramas vinculados
- [x] T10: Implementar registro em audit log (`DATA_EXPORT`, `DATA_IMPORT`) com detalhes da operação
- [x] T11: Implementar retorno de relatório de resultados (`imported`, `errors`, `skipped`)

## Phase 3: Polish
- [x] T12: Criar interface de exportação em `apps/web/src/modules/settings/` com seleção de módulos e formato
- [x] T13: Criar interface de importação com upload de arquivo, barra de progresso e preview
- [x] T14: Adicionar relatório de erros detalhado pós-importação com linhas afetadas
- [x] T15: Implementar suporte a múltiplos formatos (JSON, CSV, Excel) na exportação
- [x] T16: Adicionar testes de integração para ciclo completo exportação → importação
