# Feature Specification: Relatórios e Exportação de Dados

**Short Name**: `relatorios`
**Feature Branch**: `[036-relatorios]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Reporting

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Relatórios e Exportação de Dados** permite que clínicas exportem e importem dados clinicos de forma estruturada, incluindo pacientes, prontuários, agendamentos, financeiro e módulos ativos.

### Motivation
Permitir que clínicas façam backup completo de seus dados, migrem entre instâncias ou integrem com sistemas externos através de exportação/importação padronizada.

### Scope
**Inclui:**
- Exportação de dados da clínica (JSON/CSV/Excel)
- Importação de dados de outra clínica
- Exportação por módulo (pacientes, prontuários, agenda, financeiro)
- Registro de operações em audit log

**Exclui:**
- Geração de PDFs
- Dashboards e gráficos (módulo BI)
- Relatórios fiscais
- Relatórios contábeis

---

## 2. User Stories

### Story 1 — Exportar Dados da Clínica (P1)
**As a** administrador
**I want** exportar todos os dados da minha clínica
**So that** eu tenha um backup completo

**Acceptance Criteria:**
- Seleção de módulos a exportar
- Formatos: JSON, CSV, Excel
- Inclusão de metadados (versão, data, clinicId)
- Registro em audit log

### Story 2 — Importar Dados (P1)
**As a** administrador
**I want** importar dados de outra clínica
**So that** eu migre para o OrthoPlus

**Acceptance Criteria:**
- Validação de formato
- Opções: overwriteExisting, skipConflicts, mergeData
- Importação de módulos e prontuários
- Relatório de resultados (importados, erros, skipped)
- Registro em audit log

### Story 3 — Exportar por Módulo (P2)
**As a** administrador
**I want** exportar apenas dados específicos
**So that** eu compartilhe informações selecionadas

**Acceptance Criteria:**
- Seleção por módulo
- Filtros por data
- Exportação incremental

---

## 3. Functional Requirements

### REL-FR-001: Exportar Dados
**Description**: Exportar dados da clínica.
**Priority**: Must Have
**Acceptance Criteria**:
- Serviço: ReportControllerService.exportClinicData
- Opções:
  - includeModules: módulos ativos
  - includePatients: pacientes
  - includeHistory: histórico/wiki
  - includeProntuarios: prontuários
  - includeAppointments: agendamentos
  - includeFinanceiro: contas a receber/pagar
  - format: json, csv, excel
- Metadados: version, exportedAt, clinicId
- Audit log de DATA_EXPORT

### REL-FR-002: Importar Dados
**Description**: Importar dados para a clínica.
**Priority**: Must Have
**Acceptance Criteria**:
- Serviço: ReportControllerService.importClinicData
- Validação: version, data format
- Opções:
  - overwriteExisting: false
  - skipConflicts: true
  - mergeData: false
- Importação de módulos (via module_catalog)
- Importação de prontuários (com odontogramas)
- Resultados: imported, errors, skipped
- Audit log de DATA_IMPORT

### REL-FR-003: Relatórios Específicos
**Description**: Gerar relatórios específicos.
**Priority**: Should Have
**Acceptance Criteria**:
- Relatórios por módulo
- Filtros por período
- Exportação em múltiplos formatos

---

## 4. Non-Functional Requirements

### Performance
- Exportação: < 5s para 10.000 registros
- Importação: < 10s para 1.000 registros

### Security
- clinicId obrigatório
- Apenas usuários autenticados
- Dados criptografados em repouso
- Audit log de todas as operações
- Validação de formato de importação

### Usability
- Interface de seleção de módulos
- Progresso de importação
- Relatório de erros detalhado

---

## 5. Success Criteria

### REL-SC-001: Integridade
**Description**: 100% dos dados exportados são recuperáveis na importação
**Target**: 100%
**Measurement**: Testes de exportação/importação

### REL-SC-002: Performance
**Description**: Exportação de 10.000 registros em menos de 5s
**Target**: p99 < 5s
**Measurement**: Logs de API

---

## 6. User Scenarios & Testing

### Scenario 1: Exportar Dados
**Given** uma clínica com 500 pacientes
**When** o admin exporta todos os dados
**Then** arquivo JSON é gerado com todos os módulos selecionados

### Scenario 2: Importar Dados
**Given** um arquivo de exportação válido
**When** o admin importa para nova clínica
**Then** pacientes e prontuários são importados com sucesso

### Scenario 3: Importar com Conflitos
**Given** um arquivo com pacientes existentes
**When** o admin importa com skipConflicts=true
**Then** pacientes existentes são pulados, novos são importados

---

## 7. Edge Cases

### EC-001: Formato Inválido
**Condition**: Arquivo de importação sem version ou data
**Expected Behavior**: Erro "Invalid import data format"

### EC-002: Dados Corrompidos
**Condition**: JSON malformado
**Expected Behavior**: Erro de parsing, nenhum dado importado

### EC-003: Permissão Negada
**Condition**: Usuário sem permissão tenta exportar
**Expected Behavior**: Erro 403

---

## 8. Key Entities

### Entity: ExportData
**Attributes**:
- version (String)
- exportedAt (DateTime)
- clinicId (String)
- data (JSON)

### Entity: ImportResult
**Attributes**:
- success (Boolean)
- imported (JSON)
- errors (String[])
- skipped (String[])

---

## 9. API Endpoints

Este módulo não expõe endpoints REST diretamente. É consumido via:
- `configuracoes` — /api/configuracoes/export-data
- `configuracoes` — /api/configuracoes/import-data

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — dados de pacientes
- `agenda` — agendamentos
- `pep` — prontuários
- `financeiro` — contas a receber/pagar
- `configuracoes` — módulos ativos

### Assumptions
- Exportação em JSON é o formato padrão
- Importação requer dados da mesma versão
- Dados de odontogramas são importados com prontuários

---

## 11. Out of Scope

- Geração de PDFs
- Dashboards (módulo BI)
- Relatórios fiscais
- Relatórios contábeis
- Agendamento de relatórios

---

## 12. Notes

- Backend: módulo `relatorios` com Prisma
- Serviço: ReportControllerService
- clinicGuard via módulos consumidores
- Operações registradas em audit log
- Frontend: interface em configurações
