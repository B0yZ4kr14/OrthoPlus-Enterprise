# Feature Specification: Faturamento e NF-e

**Short Name**: `billing-nfe`
**Feature Branch**: `[009-faturamento]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Compliance

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Emissão completa de nota fiscal eletrônica de serviços.
- Must Have: Setup por clínica.
- Should Have: Gestão do ciclo de vida da NF-e.
- Should Have: Exportação para contabilidade.
- Could Have: Fluxo direto de aprovação a faturamento.

**Exclui:**
- NFC-e (cupom fiscal)
- CT-e (transporte)
- MDF-e
- Integração direta com contador via API

---

## 2. User Stories

### Story 1 — Emitir NF-e (P1)
**As a** administrador
**I want** emitir nota fiscal eletrônica de serviço
**So that** esteja em conformidade fiscal

**Acceptance Criteria:**
- Dados do tomador (paciente)
- Código de serviço (LC 116)
- Valor e desconto
- Emissão via SEFAZ
- Download XML e PDF

### Story 2 — Configurar Série e Certificado (P1)
**As a** administrador
**I want** configurar série e certificado digital
**So that** a NF-e seja válida

**Acceptance Criteria:**
- Série e numeração da NF-e
- Certificado A1 vinculado
- Ambiente: homologação/produção
- Configuração por clínica

### Story 3 — Consultar e Cancelar NF-e (P2)
**As a** administrador
**I want** consultar status e cancelar NF-e
**So that** corrija erros

**Acceptance Criteria:**
- Consulta na SEFAZ por chave de acesso
- Cancelamento dentro do prazo legal
- Carta de correção
- Histórico de operações

### Story 4 — Relatório Fiscal (P3)
**As a** contador
**I want** exportar relatório de notas emitidas
**So that** faça a apuração de impostos

**Acceptance Criteria:**
- Período customizável
- Filtro por status (autorizada/cancelada)
- Exportação CSV/Excel
- Totalizadores por imposto

---

## 3. Functional Requirements

### FR-001: Emissão de NF-e
**Description**: Emissão completa de nota fiscal eletrônica de serviços.
**Priority**: Must Have
**Acceptance Criteria**:
- Dados do tomador (paciente ou empresa)
- Código de serviço LC 116
- Alíquotas de ISS, PIS, COFINS, CSLL, INSS, IR
- Cálculo de retenções (se aplicável)
- Envio à SEFAZ
- Retorno: chave de acesso, protocolo
- Download XML e PDF DANFSE

### FR-002: Configuração Fiscal
**Description**: Setup por clínica.
**Priority**: Must Have
**Acceptance Criteria**:
- Certificado digital A1 (pfx)
- Série e próximo número
- Regime tributário (simples/lucro real)
- Configuração de impostos
- Ambiente: homologação/produção

### FR-003: Consulta e Cancelamento
**Description**: Gestão do ciclo de vida da NF-e.
**Priority**: Should Have
**Acceptance Criteria**:
- Consulta status na SEFAZ
- Cancelamento (prazo legal)
- Carta de correção (CC-e)
- Inutilização de numeração

### FR-004: Relatórios Fiscais
**Description**: Exportação para contabilidade.
**Priority**: Should Have
**Acceptance Criteria**:
- Relatório de notas por período
- Filtros por status e tipo
- Exportação CSV/Excel
- Totalizadores por imposto (ISS, PIS, COFINS, etc.)

### FR-005: Integração Orçamento → NF-e
**Description**: Fluxo direto de aprovação a faturamento.
**Priority**: Could Have
**Acceptance Criteria**:
- Ao aprovar orçamento, opção 'faturar agora'
- Preenchimento automático de dados
- Emissão em lote

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

### SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### SC-003: Disponibilidade
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

### Entity: NotaFiscal
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: NotaFiscalItem
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: ConfiguracaoFiscal
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: CertificadoDigital
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `orcamentos` — módulo funcional necessário
- `pacientes` — módulo funcional necessário
- `configuracoes` — módulo funcional necessário
- `financeiro` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- NFC-e (cupom fiscal)
- CT-e (transporte)
- MDF-e
- Integração direta com contador via API

---

## 11. Notes

- Backend: módulo `faturamento` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
