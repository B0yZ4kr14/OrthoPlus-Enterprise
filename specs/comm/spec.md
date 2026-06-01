# Feature Specification: Comunicação (Teleconsulta / Agora)

**Short Name**: `comm`
**Feature Branch**: `[029-comm]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Telemedicine

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Comunicação** fornece integração com o serviço Agora para realização de teleconsultas (videochamadas) entre dentistas e pacientes, incluindo geração de tokens de acesso e gerenciamento de gravações.

### Motivation
Permitir que dentistas realizem consultas remotas (teleodontologia) com pacientes, ampliando o alcance do atendimento e oferecendo conveniência.

### Scope
**Inclui:**
- Geração de tokens de videochamada (Agora)
- Início e término de gravações de teleconsulta
- Integração com agenda de teleconsultas
- Registro de audit logs

**Exclui:**
- Chat em tempo real (módulo teleodonto separado)
- Compartilhamento de tela
- Prescrição digital durante a consulta
- Agendamento de teleconsultas (módulo agenda)

---

## 2. User Stories

### Story 1 — Iniciar Teleconsulta (P1)
**As a** dentista
**I want** iniciar uma videochamada com um paciente
**So that** eu possa realizar uma consulta remota

**Acceptance Criteria:**
- Token de acesso gerado automaticamente
- Sala vinculada à teleconsulta agendada
- Expiração de 1 hora
- Link da sala gerado e salvo

### Story 2 — Gravar Teleconsulta (P2)
**As a** administrador
**I want** gravar as teleconsultas
**So that** eu possa manter registro para compliance e qualidade

**Acceptance Criteria:**
- Iniciar gravação na nuvem (Agora Cloud Recording)
- Parar gravação ao final da consulta
- Armazenamento em bucket configurado
- Registro de resourceId e sid

### Story 3 — Verificar Configuração (P2)
**As a** administrador de TI
**I want** verificar se o Agora está configurado
**So that** eu possa diagnosticar problemas

**Acceptance Criteria:**
- Validação de AGORA_APP_ID
- Validação de AGORA_APP_CERTIFICATE
- Alertas em produção se não configurado

---

## 3. Functional Requirements

### COM-FR-001: Gerar Token de Video
**Description**: Gerar token de acesso para videochamada Agora.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/comm/agora/token
- Parâmetro: teleconsultaId (UUID)
- Validação: teleconsulta deve existir e pertencer à clínica
- Token com expiração de 3600 segundos
- Retorno: token, appId, channelName, uid, salaUrl, expirationTime
- Atualização do link_sala na teleconsulta
- Registro em audit_logs

### COM-FR-002: Gerenciar Gravação
**Description**: Iniciar e parar gravações de teleconsulta.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/comm/agora/recording
- Parâmetros: action ("start" | "stop"), teleconsultaId, channelName, uid
- Para "start": acquire resource, start recording, salvar resourceId e sid
- Para "stop": stop recording, atualizar status para CONCLUIDA
- Fallback para simulação quando credenciais não configuradas
- Erro 404 se teleconsulta não encontrada

### COM-FR-003: Configuração Agora
**Description**: Validação de configuração do Agora.
**Priority**: Should Have
**Acceptance Criteria**:
- Variáveis de ambiente: AGORA_APP_ID, AGORA_APP_CERTIFICATE, AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET
- Erro fatal em produção se AGORA_APP_ID não configurado
- Warning em desenvolvimento
- Token stub em dev sem certificado

---

## 4. Non-Functional Requirements

### Performance
- Geração de token: < 200ms
- Início de gravação: < 2s

### Security
- clinicId obrigatório
- Token de curta duração (1h)
- Sala acessível apenas com token válido
- Gravações armazenadas de forma segura
- Audit log de todas as operações

### Usability
- Interface de videochamada integrada
- Notificações de início/fim
- Indicador de gravação em andamento

---

## 5. Success Criteria

### COM-SC-001: Disponibilidade de Video
**Description**: 99% das teleconsultas iniciam com sucesso
**Target**: 99% de sucesso
**Measurement**: Logs de API

### COM-SC-002: Qualidade de Gravação
**Description**: 100% das gravações são recuperáveis
**Target**: Zero perda de gravações
**Measurement**: Verificação de fileList no retorno

---

## 6. User Scenarios & Testing

### Scenario 1: Iniciar Teleconsulta
**Given** uma teleconsulta agendada para o paciente João
**When** o dentista clica em "Iniciar Video"
**Then** um token é gerado, a sala é criada, e o paciente recebe o link

### Scenario 2: Gravar Consulta
**Given** uma teleconsulta em andamento
**When** o dentista ativa a gravação
**Then** a gravação inicia na nuvem e o resourceId é salvo

### Scenario 3: Parar Gravação
**Given** uma teleconsulta com gravação ativa
**When** a consulta termina
**Then** a gravação é parada, os arquivos são listados, e o status é atualizado

---

## 7. Edge Cases

### EC-001: Agora Não Configurado
**Condition**: Variáveis de ambiente não configuradas
**Expected Behavior**: Em dev: token stub; Em produção: erro 500 fatal

### EC-002: Teleconsulta Não Encontrada
**Condition**: teleconsultaId inexistente
**Expected Behavior**: Erro 404 "Teleconsulta not found"

### EC-003: Gravação Já Iniciada
**Condition**: Tentativa de iniciar gravação duplicada
**Expected Behavior**: Erro de validação ou retorno do recurso existente

---

## 8. Key Entities

### Entity: Teleconsulta
**Attributes**:
- id (UUID)
- clinic_id (String)
- patient_id (UUID)
- dentist_id (UUID)
- data_hora (DateTime)
- status (Enum): AGENDADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
- link_sala (String)
- recording_url (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: AuditLog (reutilizado)
**Attributes**:
- user_id (UUID)
- clinic_id (String)
- action (String): TELECONSULTA_STARTED
- ip_address (String)
- createdAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/comm/agora/token | Gerar token de video |
| POST | /api/comm/agora/recording | Gerenciar gravação |

---

## 10. Dependencies & Assumptions

### Dependencies
- `agenda` — agendamento de teleconsultas
- `pacientes` — dados dos pacientes
- `funcionarios` — dados dos dentistas
- Agora.io SDK/API

### Assumptions
- Agora.io é o único provedor de video
- Cada teleconsulta tem uma sala única
- Gravações são armazenadas em bucket S3

---

## 11. Out of Scope

- Chat em tempo real (módulo teleodonto)
- Compartilhamento de tela
- Prescrição digital
- Agendamento de teleconsultas
- Múltiplos provedores de video

---

## 12. Notes

- Backend: módulo `comm` com Prisma
- clinicGuard obrigatório
- Simulação em desenvolvimento quando Agora não configurado
- Em produção: AGORA_APP_ID é obrigatório
- Frontend: integrado no módulo teleodonto
