# Feature Specification: Gestão de Arquivos e Documentos

**Short Name**: `file-management`
**Feature Branch**: `[015-files]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Infrastructure

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Armazenamento de arquivos com metadados.
- Must Have: Armazenamento seguro e escalável.
- Must Have: Preview e download.
- Should Have: Controle de acesso por arquivo.
- Could Have: Indexação de conteúdo.

**Exclui:**
- Assinatura digital avançada
- Workflow de aprovação
- Integração com DICOM
- Sincronização com Google Drive/Dropbox

---

## 2. User Stories

### Story 1 — Upload de Documento (P1)
**As a** dentista
**I want** anexar documentos a um paciente
**So that** centralize documentação

**Acceptance Criteria:**
- Drag-and-drop
- Múltiplos formatos (PDF, JPG, PNG, DOCX)
- Categorização (radiografia, receita, contrato)
- Vinculação a paciente ou atendimento

### Story 2 — Visualização e Download (P1)
**As a** paciente/staff
**I want** visualizar e baixar documentos
**So that** acesse quando necessário

**Acceptance Criteria:**
- Preview inline (PDF, imagens)
- Download individual ou em lote (ZIP)
- Compartilhamento por link temporário
- Restrição por permissão

### Story 3 — OCR e Indexação (P2)
**As a** administrador
**I want** pesquisar dentro de documentos
**So that** encontre informações rapidamente

**Acceptance Criteria:**
- OCR em PDFs e imagens
- Indexação de texto
- Busca por palavra-chave
- Extração de dados estruturados (futuro)

### Story 4 — Versionamento (P3)
**As a** administrador
**I want** manter histórico de versões
**So that** recupere versões anteriores

**Acceptance Criteria:**
- Versionamento automático ao sobrescrever
- Comparativo entre versões
- Restauração de versão anterior
- Auditoria de quem alterou

---

## 3. Functional Requirements

### FIL-FR-001: Upload
**Description**: Armazenamento de arquivos com metadados.
**Priority**: Must Have
**Acceptance Criteria**:
- Drag-and-drop ou seleção
- Formatos: PDF, JPG, PNG, DOCX, XLSX, DICOM
- Max 50MB por arquivo
- Categorização: radiografia, foto, receita, contrato, outro
- Vinculação a paciente, atendimento, orçamento

### FIL-FR-002: Storage
**Description**: Armazenamento seguro e escalável.
**Priority**: Must Have
**Acceptance Criteria**:
- Backend: MinIO (S3-compatible) ou AWS S3
- URL pré-assinada para download
- Criptografia em repouso (AES-256)
- Backup automático

### FIL-FR-003: Visualização
**Description**: Preview e download.
**Priority**: Must Have
**Acceptance Criteria**:
- Preview inline (lightbox para imagens, viewer para PDF)
- Download individual
- Download em lote (ZIP)
- Link temporário (expira em 24h)

### FIL-FR-004: Permissões
**Description**: Controle de acesso por arquivo.
**Priority**: Should Have
**Acceptance Criteria**:
- Nível: público (paciente), restrito (staff), confidencial (apenas admin/dentista)
- Herança de permissão do paciente
- Audit log de acesso

### FIL-FR-005: OCR e Busca
**Description**: Indexação de conteúdo.
**Priority**: Could Have
**Acceptance Criteria**:
- OCR em imagens e PDFs
- Indexação de texto extraído
- Busca por palavra-chave
- Extração de dados estruturados (futuro)

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

### FIL-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### FIL-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### FIL-SC-003: Disponibilidade
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

### Entity: Arquivo
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Categoria
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: PermissaoArquivo
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Versao
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
- `pep` — módulo funcional necessário
- `orcamentos` — módulo funcional necessário
- `auth` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Assinatura digital avançada
- Workflow de aprovação
- Integração com DICOM
- Sincronização com Google Drive/Dropbox

---

## 11. Notes

- Backend: módulo `files` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
