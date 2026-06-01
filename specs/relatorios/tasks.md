# Tasks: Relatórios e Exportação de Dados

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/relatorios/` e mapear gaps vs spec.md
- [ ] T2: Verificar serviço `ReportControllerService` em `backend/src/modules/relatorios/`
- [ ] T3: Definir formato padrão de exportação JSON com metadados (`version`, `exportedAt`, `clinicId`)
- [ ] T4: Criar schema Zod de validação para dados de importação

## Phase 2: Implementation
- [ ] T5: Implementar `exportClinicData` com opções: `includeModules`, `includePatients`, `includeHistory`, `includeProntuarios`, `includeAppointments`, `includeFinanceiro`, `format`
- [ ] T6: Implementar `importClinicData` com validação de `version` e formato de dados
- [ ] T7: Implementar opções de importação: `overwriteExisting` (padrão: false), `skipConflicts` (padrão: true), `mergeData` (padrão: false)
- [ ] T8: Implementar importação de módulos ativos via `module_catalog`
- [ ] T9: Implementar importação de prontuários com odontogramas vinculados
- [ ] T10: Implementar registro em audit log (`DATA_EXPORT`, `DATA_IMPORT`) com detalhes da operação
- [ ] T11: Implementar retorno de relatório de resultados (`imported`, `errors`, `skipped`)

## Phase 3: Polish
- [ ] T12: Criar interface de exportação em `apps/web/src/modules/settings/` com seleção de módulos e formato
- [ ] T13: Criar interface de importação com upload de arquivo, barra de progresso e preview
- [ ] T14: Adicionar relatório de erros detalhado pós-importação com linhas afetadas
- [ ] T15: Implementar suporte a múltiplos formatos (JSON, CSV, Excel) na exportação
- [ ] T16: Adicionar testes de integração para ciclo completo exportação → importação
