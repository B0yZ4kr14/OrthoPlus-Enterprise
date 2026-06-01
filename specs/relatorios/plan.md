# Plan: Relatórios e Exportação de Dados

## Overview
Permitir que clínicas exportem e importem dados clínicos de forma estruturada, incluindo pacientes, prontuários, agendamentos, financeiro e módulos ativos.

## Architecture
- Frontend: `apps/web/src/modules/settings/` — interface de seleção de módulos, progresso de importação
- Backend: `backend/src/modules/relatorios/` — serviço `ReportControllerService`
- Database: múltiplos schemas (pacientes, pep, agenda, financeiro, configuracoes)

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/relatorios/`
- [ ] Verificar serviço `ReportControllerService` e seus métodos `exportClinicData` e `importClinicData`
- [ ] Definir formato padrão de exportação (JSON com metadados de version, exportedAt, clinicId)
- [ ] Criar schemas de validação para importação

### Phase 2: Implementation
- [ ] Implementar exportação de dados com opções por módulo (pacientes, prontuários, agenda, financeiro)
- [ ] Implementar importação com validação de formato e version
- [ ] Implementar opções: overwriteExisting, skipConflicts, mergeData
- [ ] Implementar importação de odontogramas vinculada a prontuários
- [ ] Implementar registro em audit log (DATA_EXPORT, DATA_IMPORT)
- [ ] Implementar relatório de resultados (importados, erros, skipped)

### Phase 3: Polish
- [ ] Criar interface de seleção de módulos para exportação
- [ ] Criar interface de importação com upload de arquivo e progresso
- [ ] Adicionar relatório de erros detalhado pós-importação
- [ ] Implementar exportação em múltiplos formatos (JSON, CSV, Excel)
- [ ] Adicionar testes de integração exportação/importação

## Risks
- Importação de dados requer transações atômicas para evitar inconsistências
- Dados de odontogramas são complexos e podem corromper na importação
- Exportação de grandes volumes pode causar timeout — necessário streaming
- Versão incompatível de importação pode causar erros silenciosos
