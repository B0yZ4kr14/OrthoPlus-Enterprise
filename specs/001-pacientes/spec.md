# Feature Specification: Gestão de Pacientes

**Short Name**: `patient-management`
**Feature Branch**: `[001-pacientes]`
**Created**: 2026-05-17
**Status**: Completed (Backfilled 2026-05-24) ~92%
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Foundation

---

## 1. Overview / Context

O módulo de **Pacientes** é a entidade central do OrthoPlus Enterprise. Todo o ecossistema da clínica odontológica — agenda, prontuários, orçamentos, faturamento, fidelidade — orbita em torno do cadastro e gestão de pacientes.

### Motivation
Sem um cadastro de pacientes robusto, nenhum outro módulo do sistema pode operar. O paciente é o ponto de ancoragem para histórico clínico, agendamentos, orçamentos, faturamento e comunicação.

### Scope
**Inclui:**
- Cadastro completo de pacientes (dados pessoais, contato, endereço)
- Perfis e preferências do paciente
- Timeline/histórico de interações
- Autenticação do portal do paciente
- Busca, filtros e listagem
- Gestão de status (ativo, inativo, em tratamento, etc.)

**Exclui:**
- Prontuário clínico detalhado (PEP — spec separada)
- Faturamento direto (módulo financeiro)
- Agendamentos (módulo agenda)

---

## 2. User Stories

### Story 1 — Cadastro de Novo Paciente (P1)
**As a** recepcionista
**I want** cadastrar um novo paciente em menos de 2 minutos
**So that** o paciente possa ser atendido sem fricção administrativa

**Acceptance Criteria:**
- Campos obrigatórios: nome, CPF, telefone, data de nascimento
- Validação de CPF em tempo real
- Deduplicação automática (alerta se CPF já existe)
- CEP com auto-complete de endereço
- Foto do paciente opcional (upload)

### Story 2 — Busca Rápida de Paciente (P1)
**As a** dentista
**I want** encontrar qualquer paciente em menos de 5 segundos
**So that** eu não perca tempo com navegação durante a consulta

**Acceptance Criteria:**
- Busca por nome, CPF, telefone ou email
- Resultados em tempo real (debounce 300ms)
- Filtros por status, última visita, dentista responsável
- Ordenação por relevância e recência

### Story 3 — Timeline do Paciente (P2)
**As a** dentista
**I want** visualizar toda a jornada do paciente em uma timeline cronológica
**So that** eu tenha contexto completo antes de cada atendimento

**Acceptance Criteria:**
- Eventos: agendamentos, atendimentos, orçamentos, pagamentos, comunicações
- Filtros por tipo de evento e período
- Navegação por scroll infinito
- Links diretos para cada evento

### Story 4 — Portal do Paciente (P3)
**As a** paciente
**I want** acessar meus dados, agendamentos e tratamentos via portal
**So that** eu tenha transparência sobre minha saúde bucal

**Acceptance Criteria:**
- Login com CPF + senha ou OTP por SMS (camada de Auth; features do portal pertencem a Pacientes)
- Visualização de próximos agendamentos
- Acesso a orçamentos pendentes
- Download de documentos (receitas, atestados)

> **Boundary Note**: Auth (005) own a camada de autenticação (JWT, permissões). Pacientes (001) own as features e dados expostos no portal.

---

## 3. Functional Requirements

### PAC-FR-001: Cadastro de Paciente
**Description**: Sistema deve permitir criar, ler, atualizar e excluir registros de pacientes com validações de dados brasileiros.
**Priority**: Must Have
**Acceptance Criteria**:
- CRUD completo via API REST
- Validação de CPF (algoritmo oficial)
- Validação de email (formato RFC 5322)
- Validação de telefone (formato E.164 para BR)
- CEP com integração ViaCEP ou similar
- Campo clinicId obrigatório (multi-tenancy)

### PAC-FR-002: Deduplicação por CPF
**Description**: Impedir cadastro duplicado de mesmo CPF na mesma clínica.
**Priority**: Must Have
**Acceptance Criteria**:
- Constraint única em (cpf, clinicId) no banco
- Alerta visual em tempo real no frontend
- Sugestão de abrir ficha existente

### PAC-FR-003: Gestão de Status
**Description**: Pacientes devem ter status controlado com transições válidas.
**Priority**: Should Have
**Acceptance Criteria**:
- Status: NOVO, ATIVO, EM_TRATAMENTO, INATIVO, ARQUIVADO
- Transições controladas (ex: ARQUIVADO não pode agendar)
- Histórico de mudanças de status

### PAC-FR-004: Upload de Foto ✅ IMPLEMENTADO
**Description**: Permitir associar foto ao perfil do paciente.
**Priority**: Should Have
**Status**: ✅ Implementado (2026-05-17)
**Acceptance Criteria**:
- ✅ Formatos: JPG, PNG, WebP
- ✅ Max 5MB
- Thumbnail automático (200x200) — pendente
- ✅ Armazenamento via `/files/upload` (filesystem local)

### PAC-FR-005: Timeline do Paciente ✅ IMPLEMENTADO
**Description**: Agregar eventos da jornada do paciente em visualização cronológica.
**Priority**: Should Have
**Status**: ✅ Implementado (2026-05-17)
**Acceptance Criteria**:
- ✅ Fontes: agenda, pep, orçamentos, financeiro, notificações (backend completo)
- ✅ Ordenação cronológica descendente
- Paginação (20 eventos por página) — pendente
- Filtros por categoria — pendente

---

## 4. Non-Functional Requirements

### Performance
- Busca de paciente: < 200ms para até 10.000 registros por clínica
- Cadastro: < 500ms (incluindo validações)
- Timeline: < 1s para carregar 20 eventos

### Security
- Dados de paciente criptografados em repouso (LGPD)
- Acesso apenas por usuários autenticados da clínica
- Pacientes só acessam seus próprios dados no portal
- Audit log de todas as operações CRUD

### Usability
- Formulário responsivo (mobile-first para recepção)
- Auto-save de rascunho
- Keyboard navigation completa

---

## 5. Success Criteria

### PAC-SC-001: Tempo de Cadastro
**Description**: Recepcionista cadastra novo paciente em menos de 2 minutos
**Target**: 95% dos cadastros < 2min
**Measurement**: Analytics de tempo de preenchimento de formulário

### PAC-SC-002: Taxa de Deduplicação
**Description**: Zero cadastros duplicados de CPF na mesma clínica
**Target**: 100% de prevenção
**Measurement**: Query de duplicatas no banco

### PAC-SC-003: Disponibilidade da Busca
**Description**: Busca de paciente retorna resultados em menos de 200ms
**Target**: p99 < 200ms
**Measurement**: Logs de API + Prometheus metrics

---

## 6. User Scenarios & Testing

### Scenario 1: Cadastro Completo
**Given** uma recepcionista logada na clínica
**When** ela preenche nome, CPF, telefone, data de nascimento e clica em Salvar
**Then** o paciente é criado, um toast de sucesso aparece, e a página redireciona para a ficha do paciente

### Scenario 2: CPF Duplicado
**Given** um paciente João Silva com CPF já cadastrado
**When** a recepcionista tenta cadastrar outro paciente com o mesmo CPF
**Then** um alerta aparece: Paciente já cadastrado: João Silva com link para abrir a ficha

### Scenario 3: Auto-complete de CEP
**Given** o campo CEP preenchido com 01310-100
**When** o usuário sai do campo (blur)
**Then** os campos rua, bairro, cidade e estado são preenchidos automaticamente

---

## 7. Edge Cases

### EC-001: CPF Inválido
**Condition**: Usuário digita CPF com dígitos verificadores errados
**Expected Behavior**: Mensagem de erro específica: CPF inválido. Verifique os dígitos.

### EC-002: Paciente Sem CPF (Estrangeiro)
**Condition**: Paciente não tem CPF brasileiro
**Expected Behavior**: Campo CPF opcional, passaporte como alternativa. Alerta visual mas não bloqueante.

### EC-003: CEP Não Encontrado
**Condition**: CEP inexistente na base dos Correios
**Expected Behavior**: Campos de endereço ficam editáveis manualmente. Toast informativo.

### EC-004: Upload de Foto Muito Grande
**Condition**: Arquivo > 5MB
**Expected Behavior**: Rejeição com mensagem clara. Sugestão de compressão.

---

## 8. Key Entities

### Entity: Patient
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- name (String): Nome completo
- cpf (String): CPF brasileiro (unique per clinic)
- rg (String): RG opcional
- birthDate (Date): Data de nascimento
- phone (String): Telefone principal
- email (String): Email
- address (JSON): cep, street, number, complement, neighborhood, city, state
- photoUrl (String): URL da foto
- status (Enum): NOVO, ATIVO, EM_TRATAMENTO, INATIVO, ARQUIVADO
- notes (String): Observações internas
- createdAt (DateTime)
- updatedAt (DateTime)

**Relationships**:
- Has many appointments (Agenda)
- Has many budgets (Orçamentos)
- Has many records (PEP)
- Has many transactions (Financeiro)
- Has many notifications

---

## 9. Dependencies & Assumptions

### Dependencies
- files — upload de foto
- auth — autenticação do portal do paciente
- notifications — alertas de recall e aniversário

### Assumptions
- CPF é o identificador principal no Brasil
- ViaCEP ou API equivalente disponível para auto-complete
- Cada clínica opera como tenant isolado (clinicId)

---

## 10. Out of Scope

- Integração com gov.br ou CNES
- Biometria facial
- Prontuário clínico completo (módulo PEP separado)
- Gestão de convênios (módulo TISS separado)

---

## 11. Notes

- O módulo pacientes no backend usa Prisma com schema dedicado
- Frontend usa hooks diretos (não Clean Architecture) — usePatientsUnified
- A entidade patients no Prisma já existe com ~15 campos
