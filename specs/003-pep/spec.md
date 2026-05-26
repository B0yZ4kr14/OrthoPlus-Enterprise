# Feature Specification: Prontuário Eletrônico do Paciente (PEP)

**Short Name**: `electronic-health-record`
**Feature Branch**: `[003-pep]`
**Created**: 2026-05-17
**Status**: Partially Implemented — Backfilled 2026-05-24
**Implementation**: ~75% (core backend + odontograma + anamnese + prescricao form + assinatura ICP; missing: IA radiografia, E2E tests, edge cases)
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Clinical Core

---

## 1. Overview / Context

O **Prontuário Eletrônico do Paciente (PEP)** é o registro clínico digital que armazena toda a trajetória de saúde bucal do paciente. É o módulo mais crítico do ponto de vista legal e médico, exigindo conformidade com normas odontológicas e privacidade de dados sensíveis (LGPD/HIPAA).

### Motivation
O PEP substitui prontuários em papel, garantindo registro permanente e auditável de atendimentos, visualização gráfica do odontograma, acompanhamento de tratamentos e prescrições digitais com assinatura ICP.

### Scope
**Inclui:**
- Ficha clínica com anamnese e histórico médico
- Odontograma interativo (2D e 3D)
- Registro de evoluções/procedimentos realizados
- Prescrições e receituário
- Anexos (radiografias, fotos, documentos)
- Assinatura digital ICP-BR

**Exclui:**
- Agendamento da consulta (módulo agenda)
- Orçamento do tratamento (módulo orçamentos)
- Faturamento (módulo financeiro)

---

## 2. User Stories

### Story 1 — Odontograma Digital (P1)
**As a** dentista
**I want** registrar condições e procedimentos em um odontograma visual
**So that** eu tenha um mapa completo da saúde bucal do paciente

**Acceptance Criteria:**
- Representação gráfica dos 32 dentes permanentes + 20 decíduos
- Marcação de superfícies (mesial, distal, vestibular, lingual, oclusal)
- Cores por condição (cárie, restauração, extraído, saudável, etc.)
- Suporte a procedimentos múltiplos por dente
- Histórico de alterações no odontograma

### Story 2 — Registro de Evolução (P1)
**As a** dentista
**I want** documentar cada atendimento com texto estruturado
**So that** eu tenha rastreabilidade completa do tratamento

**Acceptance Criteria:**
- Template por tipo de procedimento
- Campos: queixa principal, exame clínico, diagnóstico, procedimento realizado, prescrição, orientações
- Anexos de fotos intraorais
- Assinatura digital do dentista

### Story 3 — Prescrição Digital (P2)
**As a** dentista
**I want** gerar receituário e prescrições digitais
**So that** o paciente possa comprar medicamentos e o registro fique auditável

**Acceptance Criteria:**
- Campos: medicamento, posologia, duração, quantidade
- Template padrão da CFO (Conselho Federal de Odontologia)
- Impressão em PDF
- Assinatura digital ICP

### Story 4 — Análise IA de Radiografia (P3)
**As a** dentista
**I want** receber sugestões de IA ao analisar radiografias
**So that** eu não perca diagnósticos sutis

**Acceptance Criteria:**
- Upload de radiografia (PAN, periapical)
- Detecção automática de cáries, reabsorções, lesões
- Sugestão de diagnóstico com nível de confiança
- Marcação visual das áreas detectadas

---

## 3. Functional Requirements

### PEP-FR-001: Odontograma Interativo
**Description**: Visualização e edição gráfica da arcada dentária.
**Priority**: Must Have
**Acceptance Criteria**:
- Dentes numerados por FDI (11-48) e Universal (1-32)
- Interação: hover mostra detalhes, click abre editor
- Editor de superfícies com paleta de condições
- Undo/redo de alterações
- Snapshot do odontograma por data

### PEP-FR-002: Ficha Clínica Estruturada
**Description**: Formulário completo de anamnese e histórico.
**Priority**: Must Have
**Acceptance Criteria**:
- Dados pessoais (herdados do módulo pacientes)
- Anamnese: histórico médico, alergias, medicamentos, hábitos
- Exame clínico geral
- Consentimentos informados (LGPD)

### PEP-FR-003: Evoluções Clínicas
**Description**: Registro cronológico de atendimentos.
**Priority**: Must Have
**Acceptance Criteria**:
- Data/hora automática
- Dentista responsável (autopreenchido)
- Campos estruturados (SOAP ou similar)
- Anexos ilimitados por evolução
- Busca e filtro por data/procedimento

### PEP-FR-004: Prescrições e Receituário
**Description**: Geração de documentos prescritivos.
**Priority**: Should Have
**Acceptance Criteria**:
- Cadastro de medicamentos favoritos
- Template CFO
- PDF com cabeçalho da clínica
- Controle de numeração de receituário

### PEP-FR-005: Anexos e Documentos
**Description**: Armazenamento de arquivos clínicos.
**Priority**: Should Have
**Acceptance Criteria**:
- Upload de imagens (JPG, PNG, DICOM), PDFs
- Organização por categoria (radiografia, foto intraoral, documento)
- Visualização inline (lightbox)
- Download individual ou zip

### PEP-FR-006: Assinatura Digital ICP
**Description**: Assinatura de documentos com certificado digital.
**Priority**: Could Have
**Acceptance Criteria**:
- Integração com certificado A1 ou A3
- Validação da cadeia de confiança ICP-Brasil
- Carimbo de tempo
- Verificação de autenticidade

---

## 4. Non-Functional Requirements

### Security
- Criptografia AES-256 para dados sensíveis em repouso
- Audit log de todas as visualizações e edições
- Controle de acesso por papel (somente dentistas e assistentes autorizados)
- Retenção mínima de 20 anos (conforme resoluções odontológicas)

### Performance
- Odontograma: < 500ms para carregar histórico completo
- Upload de anexos: progresso visual, até 50MB por arquivo
- Busca em evoluções: < 1s

### Compliance
- Resolução CFO sobre prontuário eletrônico
- LGPD: consentimento para coleta de dados de saúde
- Possibilidade de exportação completa do prontuário (portabilidade)

---

## 5. Success Criteria

### PEP-SC-001: Cobertura do Odontograma
**Description**: 100% dos pacientes ativos têm odontograma preenchido
**Target**: 100%
**Measurement**: Query de pacientes sem odontograma

### PEP-SC-002: Tempo de Registro
**Description**: Dentista completa evolução em menos de 5 minutos
**Target**: 90% das evoluções < 5min
**Measurement**: Analytics de tempo de preenchimento

### PEP-SC-003: Disponibilidade do PEP
**Description**: Sistema disponível 99.9% durante horário comercial
**Target**: 99.9% uptime
**Measurement**: Health checks + Prometheus

---

## 6. User Scenarios & Testing

### Scenario 1: Primeira Consulta
**Given** um paciente novo na clínica
**When** o dentista abre o PEP e preenche anamnese + odontograma inicial
**Then** todos os dados são salvos, odontograma reflete condição atual, e paciente assina termo de consentimento

### Scenario 2: Tratamento de Cárie
**Given** um paciente com cárie no dente 36
**When** o dentista realiza o tratamento e registra a evolução
**Then** o odontograma é atualizado (restauração no 36), evolução documenta o procedimento, e uma foto do antes/depois é anexada

### Scenario 3: Prescrição de Antibiótico
**Given** um paciente pós-cirúrgico
**When** o dentista emite prescrição de amoxicilina
**Then** o PDF é gerado com assinatura digital, impresso para o paciente, e arquivado no PEP

---

## 7. Edge Cases

### EC-001: Odontograma de Criança
**Condition**: Paciente com dentição mista (decíduos + permanentes)
**Expected Behavior**: Visualização adaptada com dentes decíduos (A-J, K-T) e indicador de erupção

### EC-002: Extração
**Condition**: Dente extraído precisa ser marcado no histórico
**Expected Behavior**: Dente mostra como extraído mas mantém histórico de procedimentos anteriores

### EC-003: Paciente Solicita Portabilidade
**Condition**: Paciente pede cópia completa do prontuário (LGPD)
**Expected Behavior**: Geração de PDF consolidado com todas as evoluções, anexos e odontogramas

---

## 8. Key Entities

### Entity: Prontuario
**Attributes**:
- id (UUID)
- clinicId (String)
- patientId (UUID)
- anamnese (JSON): histórico médico completo
- odontograma (JSON): estado atual dos dentes
- createdAt, updatedAt

### Entity: OdontogramaData
**Attributes**:
- id (UUID)
- prontuarioId (UUID)
- toothNumber (String): FDI notation
- surface (Enum): MESIAL, DISTAL, VESTIBULAR, LINGUAL, OCLUSAL
- condition (Enum): SAUDAVEL, CARIE, RESTAURACAO, EXTRAIDO, AUSENTE, TRATAMENTO, OUTRO
- procedureId (UUID): referência
- notes (String)
- createdAt

### Entity: Evolucao
**Attributes**:
- id (UUID)
- prontuarioId (UUID)
- dentistId (UUID)
- date (DateTime)
- chiefComplaint (String)
- clinicalExam (String)
- diagnosis (String)
- procedureDone (String)
- prescription (String)
- instructions (String)
- attachments (String[]): URLs

---

## 9. Dependencies & Assumptions

### Dependencies
- pacientes — dados pessoais
- procedimentos — catálogo de procedimentos
- funcionarios — dentistas
- files — upload de anexos
- auth — assinatura digital

### Assumptions
- Dentistas têm CRMV/CFMV ativo
- Certificado digital disponível para assinatura ICP
- Imagens radiográficas em formato compatível (DICOM ou JPG)

---

## 10. Out of Scope

- Integração com equipamentos de raio-X (importação automática DICOM)
- Comparação temporal de radiografias (side-by-side)
- Telemedicina (teleodonto)
- Integração com sistema nacional de saúde

---

## 11. Notes

- Backend: módulo pep com 10+ tabelas Prisma
- Frontend: odontograma usa Fabric.js para canvas interativo
- Suporta 2D e visualização 3D experimental (Three.js)
- Histórico de odontograma versionado
