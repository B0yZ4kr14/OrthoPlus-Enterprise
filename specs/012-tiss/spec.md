# Feature Specification: Integração TISS e Convênios

**Short Name**: `tiss-integration`
**Feature Branch**: `[012-tiss]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Healthcare Compliance

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Gestão de operadoras de saúde.
- Must Have: Geração e envio de guias de autorização.
- Should Have: Consulta e acompanhamento.
- Should Have: Processamento de pagamento e recursos.
- Could Have: Análise de convênios.

**Exclui:**
- Emissão de NF-e (módulo faturamento)
- Faturamento SUS
- Integração com outras operadoras (não TISS)
- Telemedicina

---

## 2. User Stories

### Story 1 — Cadastrar Convênio (P1)
**As a** administrador
**I want** cadastrar convênios e suas regras
**So that** atenda pacientes de plano

**Acceptance Criteria:**
- Nome do convênio, CNPJ, registro ANS
- Tabela de preços própria
- Regras de autorização
- Tempo de carência

### Story 2 — Solicitar Autorização (GUIA TISS) (P1)
**As a** recepcionista
**I want** solicitar autorização de procedimento
**So that** o paciente seja atendido

**Acceptance Criteria:**
- Preenchimento da guia TISS (XML)
- Envio via webservice do convênio
- Acompanhamento de status
- Vinculação ao agendamento

### Story 3 — Consultar Status de Autorização (P2)
**As a** recepcionista
**I want** verificar se a autorização foi aprovada
**So that** evite agendamentos sem cobertura

**Acceptance Criteria:**
- Consulta por número de guia
- Status: pendente, aprovado, negado
- Motivo de negação
- Reenvio com correções

### Story 4 — Faturamento de Glosas (P3)
**As a** administrador
**I want** tratar glosas e recursos
**So that** recupere valores negados

**Acceptance Criteria:**
- Importação de retorno do convênio
- Identificação de glosas
- Geração de recurso
- Acompanhamento de pagamento

---

## 3. Functional Requirements

### TIS-FR-001: Cadastro de Convênios
**Description**: Gestão de operadoras de saúde.
**Priority**: Must Have
**Acceptance Criteria**:
- Dados: nome, CNPJ, registro ANS, tabela de preços
- Regras: carência, autorização obrigatória, limite de procedimentos
- Configuração por clínica

### TIS-FR-002: Guia TISS
**Description**: Geração e envio de guias de autorização.
**Priority**: Must Have
**Acceptance Criteria**:
- Preenchimento XML conforme padrão TISS (versão 3.0.0+)
- Dados do beneficiário, solicitante, executante
- Procedimentos solicitados
- Envio via webservice SOAP
- Acompanhamento de protocolo

### TIS-FR-003: Status de Autorização
**Description**: Consulta e acompanhamento.
**Priority**: Should Have
**Acceptance Criteria**:
- Consulta por número de guia
- Status: PENDENTE, APROVADO, NEGADO, CANCELADO
- Motivo de negação
- Histórico de guias por paciente

### TIS-FR-004: Retorno e Glosas
**Description**: Processamento de pagamento e recursos.
**Priority**: Should Have
**Acceptance Criteria**:
- Importação de retorno em lote
- Matching guia vs. pagamento
- Identificação de glosas
- Geração de recurso de glosa
- Relatório de inadimplência do convênio

### TIS-FR-005: Relatórios TISS
**Description**: Análise de convênios.
**Priority**: Could Have
**Acceptance Criteria**:
- Produção por convênio
- Taxa de aprovação/negativa
- Tempo médio de autorização
- Valor glosado vs. recebido

---

## 4. Non-Functional Requirements

### Performance
- Operações principais: < 300ms (p99)
- Listagens: < 500ms para 1.000 registros
- Upload de arquivos (se aplicável): progresso visual

### Security
- clinicId obrigatório em todas as operações (multi-tenancy)
- Dados sensíveis criptografados em repouso (LGPD)
- Audit log de operações críticas
- Acesso apenas por usuários autenticados

### Usability
- Interface responsiva (mobile-friendly)
- Feedback visual para todas as ações
- Keyboard navigation onde aplicável

---

## 5. Success Criteria

### TIS-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### TIS-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### TIS-SC-003: Disponibilidade
**Description**: Módulo disponível 99.9% durante horário comercial
**Target**: 99.9% uptime
**Measurement**: Health checks + Prometheus

---

## 6. User Scenarios & Testing

### Scenario 1: Fluxo Principal
**Given** um usuário autenticado na clínica
**When** ele executa a operação principal do módulo
**Then** o sistema processa corretamente e retorna feedback apropriado

### Scenario 2: Erro de Validação
**Given** um usuário preenchendo dados inválidos
**When** ele tenta salvar
**Then** mensagens de erro claras aparecem e o formulário não é submetido

### Scenario 3: Multi-Tenancy
**Given** um usuário da Clínica A
**When** ele acessa o módulo
**Then** ele vê apenas dados da Clínica A, nunca da Clínica B

---

## 7. Edge Cases

### EC-001: Dados Inválidos
**Condition**: Usuário envia dados fora do formato esperado
**Expected Behavior**: Validação retorna erro 400 com mensagem específica. Nenhum dado é persistido.

### EC-002: Acesso Não Autorizado
**Condition**: Usuário sem permissão tenta acessar recurso restrito
**Expected Behavior**: Resposta 403 com mensagem "Acesso negado"

### EC-003: clinicId Inválido
**Condition**: Token manipulado com clinicId não associado ao usuário
**Expected Behavior**: clinicGuard rejeita com 403

---

## 8. Key Entities

### Entity: Convenio
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: GuiaTISS
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Autorizacao
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Glosa
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `pacientes` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário
- `agenda` — módulo funcional necessário
- `faturamento` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Emissão de NF-e (módulo faturamento)
- Faturamento SUS
- Integração com outras operadoras (não TISS)
- Telemedicina

---

## 11. Notes

- Backend: módulo `tiss` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
