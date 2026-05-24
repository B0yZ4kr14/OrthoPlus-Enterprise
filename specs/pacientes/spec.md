# Feature Specification: Pacientes (Gestao de Pacientes)

**Status**: `migrated`
**Migrated from**: Existing codebase (brownfield migration)
**Migration date**: 2026-05-18
**Module**: `pacientes`
**Stack**: React 18 + TypeScript (frontend), Express + Prisma + CQRS (backend)

---

## Overview

Sistema completo de gestao de pacientes odontologicos, incluindo cadastro com validacao de documento/email, ficha clinica multi-aba (dados pessoais, contato, historico medico, habitos, odontograma, marketing), timeline integrada, busca avancada, controle de status e autenticacao de portal do paciente.

---

## User Stories

### US1 — Cadastrar Paciente (Priority: P1)

**Como** recepcionista
**Quero** cadastrar um novo paciente com dados pessoais, contato e endereco
**Para** manter a ficha clinica atualizada

**Acceptance Scenarios**:

```
GIVEN que estou na tela de Pacientes
WHEN clico em "Novo Paciente"
AND preencho nome (>= 3 caracteres), documento valido, email valido, telefone, endereco completo
THEN o paciente e criado com status "PROSPECT"
AND aparece na lista de pacientes
```

```
GIVEN que tento cadastrar um paciente
WHEN informo um documento ja existente na mesma clinica
THEN recebo erro de duplicacao
AND o cadastro e bloqueado
```

### US2 — Editar Ficha Clinica (Priority: P1)

**Como** dentista ou recepcionista
**Quero** editar os dados de um paciente em multiplas abas
**Para** manter o prontuario completo e atualizado

**Acceptance Scenarios**:

```
GIVEN um paciente cadastrado
WHEN acesso a ficha e edito dados pessoais, contato, historico medico, habitos ou odontograma
THEN todas as alteracoes sao salvas
AND o IMC e calculado automaticamente a partir de peso e altura
```

### US3 — Buscar e Filtrar Pacientes (Priority: P1)

**Como** recepcionista
**Quero** buscar pacientes por nome, documento ou telefone e filtrar por status
**Para** encontrar rapidamente a ficha correta

### US4 — Visualizar Timeline do Paciente (Priority: P2)

**Como** dentista
**Quero** ver a timeline completa do paciente (consultas, tratamentos, orcamentos, mudancas de status)
**Para** ter contexto historico antes da consulta

### US5 — Alterar Status do Paciente (Priority: P2)

**Como** administrador
**Quero** alterar o status do paciente (PROSPECT → TRATAMENTO → CONCLUIDO)
**Para** acompanhar o funil de tratamento

### US6 — Autenticacao no Portal do Paciente (Priority: P2)

**Como** paciente
**Quero** fazer login no portal com email e credenciais
**Para** acessar minha ficha e agendamentos

---

## Functional Requirements

### FR1 — Cadastro
- FR1.1: Campos obrigatorios: nome completo (>= 3 chars), clinica
- FR1.2: Validacao de documento (digitos verificadores) quando informado
- FR1.3: Validacao de email (formato) quando informado
- FR1.4: Deduplicacao por documento ou email na mesma clinica
- FR1.5: Campos opcionais: RG, data de nascimento, genero, endereco completo, observacoes

### FR2 — Ficha Clinica (Multi-aba)
- FR2.1: Aba Dados Pessoais: nome, documento, RG, nascimento, genero, foto
- FR2.2: Aba Contato/Endereco: telefones, email, endereco completo
- FR2.3: Aba Historico Medico: condicoes pre-existentes, alergias, medicamentos
- FR2.4: Aba Habitos/Medidas: peso, altura, IMC (calculado automaticamente), habitos
- FR2.5: Aba Odontologica: queixa principal, observacoes dentais
- FR2.6: Aba Marketing: origem, campanha, promotor
- FR2.7: Aba Outros: observacoes gerais

### FR3 — Busca e Listagem
- FR3.1: Busca full-text por nome, documento ou telefone
- FR3.2: Filtro por status: ativo, inativo, arquivado, PROSPECT, TRATAMENTO, CONCLUIDO, CANCELADO
- FR3.3: Paginacao (padrao 20 itens/pagina)
- FR3.4: Ordenacao configuravel
- FR3.5: Cards de estatisticas: total, ativos, alto risco, consultas hoje

### FR4 — Timeline
- FR4.1: Agregar dados de: appointments, tratamentos, orcamentos, historico de status
- FR4.2: Ordenacao cronologica decrescente
- FR4.3: Limitar a 20 eventos por categoria

### FR5 — Status e Transicoes
- FR5.1: Status: PROSPECT, TRATAMENTO, CONCLUIDO, CANCELADO
- FR5.2: Transicoes invalidas: CONCLUIDO → PROSPECT/TRATAMENTO; CANCELADO → TRATAMENTO
- FR5.3: Registro de historico de mudancas (who, when, why)

### FR6 — Portal do Paciente
- FR6.1: Login com email + credencial (bcrypt)
- FR6.2: Sessao com chave valida por 24h
- FR6.3: Logout invalida sessao

---

## Non-Functional Requirements

- NFR1: Cadastro deve responder em < 1s
- NFR2: Busca deve responder em < 500ms
- NFR3: Lista deve suportar > 10.000 pacientes com paginacao
- NFR4: Multi-tenant por clinic_id em todas as operacoes
- NFR5: Dados sensiveis protegidos por LGPD

---

## Success Criteria

1. Cadastro de paciente completo em < 2 minutos
2. Busca retorna resultados em < 500ms para base de 10k pacientes
3. IMC calculado automaticamente ao informar peso e altura
4. Timeline carrega todos os eventos relevantes do paciente
5. Nenhum documento duplicado na mesma clinica

---

## Known Limitations / Backlog

| Item | Description | Decision |
|------|-------------|----------|
| FR4 — Timeline Cross-Module | Agregação de appointments + tratamentos + orçamentos em timeline única. Atualmente `GET /:id/timeline` retorna apenas dados do módulo pacientes. | **Backlog** — Requer orquestração cross-module via event bus ou API composition. Será tratado na evolução do módulo. |
| NFR1-NFR2 — Performance Metrics | Instrumentação de latência (`patient_create_duration_ms`, `patient_search_duration_ms`) não implementada. | **Next iteration** — Adicionar tasks de instrumentação (EP-4). |

---

## Gaps Identified (Post-Migration)

| Gap | Severity | Description |
|-----|----------|-------------|
| GAP-1 | ~~Medium~~ ✅ **RESOLVED** | ~~PatientFormPage uses `any` type for API response~~ — Uses `PatientAPI` type via `apiClient.get<PatientAPI>` on 2026-05-23. |
| GAP-2 | ~~Medium~~ ✅ **RESOLVED** | ~~PatientFormPage has `@ts-expect-error` on `form.reset()`~~ — Uses `patientFormSchema.parse(formData)` for type-safe reset on 2026-05-23. |
| GAP-3 | ~~Low~~ ✅ **RESOLVED** | ~~Patient form uses apiClient directly instead of use cases~~ — Clean Architecture applied: `PatientRepositoryApi`, `ListPatientsUseCase`, `AddPatientUseCase`, `UpdatePatientUseCase`, `DeletePatientUseCase`, `usePatientsClean` on 2026-05-23. |
| GAP-4 | ~~Low~~ ✅ **RESOLVED** | ~~E2E tests use text-based locators~~ — `data-testid` attributes added to `PacientesListPage`, `PatientFormPage` on 2026-05-23. |
| GAP-5 | ~~Low~~ ✅ **RESOLVED** | ~~Patient portal auth returns key in body~~ — Migrated to HttpOnly/Secure/SameSite=Strict cookie (`patient_session`) on 2026-05-23. |
