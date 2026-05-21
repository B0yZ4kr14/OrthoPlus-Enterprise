# Feature Specification: Autenticação e Controle de Acesso

**Short Name**: `auth-access-control`
**Feature Branch**: `[005-auth-usuarios]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Security Foundation

---

## 1. Overview / Context

O módulo de **Autenticação e Usuários** é a fundação de segurança do OrthoPlus Enterprise. Garante que apenas pessoas autorizadas acessem dados da clínica, com isolamento multi-tenant (cada clínica vê apenas seus dados) e controle granular de permissões.

### Motivation
Uma clínica odontológica lida com dados sensíveis (LGPD): dados pessoais, histórico médico, informações financeiras. Qualquer vazamento ou acesso indevido é inaceitável. O sistema deve ser seguro por design.

### Scope
**Inclui:**
- Login com JWT (email + senha)
- Registro de novos usuários (staff)
- Controle de papéis (ADMIN, MEMBER, PATIENT)
- Permissões por módulo
- Multi-tenancy (isolação por clinicId)
- Rate limiting e proteção CSRF
- Portal do paciente (autenticação separada — Auth fornece JWT/segurança; Pacientes (001) own as features do portal)

**Exclui:**
- SSO/SAML (futuro)
- Biometria
- OAuth externo (Google, etc.)

---

## 2. User Stories

### Story 1 — Login Seguro (P1)
**As a** usuário da clínica
**I want** fazer login com email e senha de forma segura
**So that** meus dados estejam protegidos

**Acceptance Criteria:**
- Senha com mínimo 8 caracteres, maiúscula, número e símbolo
- JWT access token com expiração de 15 minutos + refresh token de 7 dias
- Cookie HttpOnly + SameSite=Strict (access token) + refresh token em cookie separado
- Rate limit: 10 tentativas / 15 min
- Mensagem genérica em caso de erro (não revela se email existe)

### Story 2 — Troca de Clínica (P2)
**As a** administrador multi-clínica
**I want** alternar entre clínicas sem fazer logout
**So that** eu gerencie todas as minhas unidades

**Acceptance Criteria:**
- Dropdown de clínicas disponíveis
- Contexto atualiza automaticamente
- Módulos ativos recarregam para a nova clínica
- Permissões reavaliadas

### Story 3 — Permissão por Módulo (P2)
**As a** administrador
**I want** definir quais módulos cada usuário pode acessar
**So that** a recepcionista não veja relatórios financeiros

**Acceptance Criteria:**
- Lista de módulos com toggle on/off por usuário
- Papéis pré-definidos (Recepcionista, Dentista, Admin)
- Permissões granulares (ex: financeiro → só visualizar, não editar)

### Story 4 — Recuperação de Senha (P2)
**As a** usuário
**I want** recuperar minha senha por email
**So that** eu não fique bloqueado

**Acceptance Criteria:**
- Email com link de reset (expira em 1h)
- Token único e não previsível
- Notificação de alteração de senha
- Invalidação de sessões anteriores

---

## 3. Functional Requirements

### FR-001: Autenticação JWT
**Description**: Sistema de login baseado em tokens JWT.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /auth/token retorna access_token (HS256)
- Token contém: userId, clinicId, role, permissions
- Refresh token opcional (para sessões longas)
- Logout invalida token no cliente

### FR-002: Registro de Usuários
**Description**: Criação de novos usuários staff.
**Priority**: Must Have
**Acceptance Criteria**:
- Apenas ADMIN pode criar usuários
- Campos: nome, email, senha, papel, clínica
- Validação de email único
- Envio de email de boas-vindas com senha temporária

### FR-003: Multi-Tenancy (clinicGuard)
**Description**: Isolamento de dados por clínica.
**Priority**: Must Have
**Acceptance Criteria**:
- Todo request valida clinicId no token
- clinicGuard middleware em todos os routers
- Usuário só acessa dados da própria clínica
- ADMIN com múltiplas clínicas pode alternar

### FR-004: Controle de Permissões
**Description**: Sistema de roles e permissions.
**Priority**: Must Have
**Acceptance Criteria**:
- Roles: ADMIN, MEMBER, PATIENT
- Permissions: array de strings no token
- Módulos ativos por clínica (configuráveis)
- Verificação em frontend (ProtectedRoute) e backend (clinicGuard)

### FR-005: Rate Limiting
**Description**: Proteção contra brute force e abuse.
**Priority**: Must Have
**Acceptance Criteria**:
- Auth: 10 req / 15 min
- Upload: 50 req / hora
- API geral: 500 req / 15 min
- Resposta 429 com Retry-After header

### FR-006: Portal do Paciente
**Description**: Autenticação separada para pacientes.
**Priority**: Should Have
**Acceptance Criteria**:
- Login: CPF + senha ou OTP SMS
- Acesso apenas aos próprios dados
- Visualização de agendamentos, orçamentos, documentos
- Sem acesso a dados de outros pacientes

---

## 4. Non-Functional Requirements

### Security
- JWT secret com 256+ bits de entropia
- Senhas hasheadas com bcrypt (cost 12)
- Headers de segurança (Helmet)
- CSRF protection para mutations
- Nunca expor stack traces em produção

### Performance
- Login: < 500ms
- Validação de token: < 10ms
- Clinic switching: < 300ms

### Availability
- Auth deve estar disponível 99.99%
- Fallback para modo offline não aplicável (cloud-only)

---

## 5. Success Criteria

### SC-001: Segurança de Senhas
**Description**: 100% das senhas atendem política mínima
**Target**: 100%
**Measurement**: Query de senhas não conformes (zero)

### SC-002: Isolamento Multi-Tenant
**Description**: Zero acessos cruzados entre clínicas
**Target**: 100% isolamento
**Measurement**: Audit logs + testes de penetração

### SC-003: Tempo de Login
**Description**: Usuário faz login em menos de 2 segundos
**Target**: p99 < 2s
**Measurement**: Logs de API

---

## 6. User Scenarios & Testing

### Scenario 1: Login Bem-Sucedido
**Given** um usuário válido
**When** ele informa email e senha corretos
**Then** token JWT é gerado, cookie é setado, e dashboard carrega

### Scenario 2: Acesso Negado
**Given** uma recepcionista logada
**When** ela tenta acessar /admin/database
**Then** recebe página 403 Acesso Negado

### Scenario 3: Troca de Clínica
**Given** um admin logado na Clínica A
**When** ele seleciona Clínica B no dropdown
**Then** o contexto atualiza, os dados da Clínica B carregam, e os módulos ativos são reavaliados

---

## 7. Edge Cases

### EC-001: Token Expirado
**Condition**: Usuário tenta acessar com token vencido
**Expected Behavior**: Redirecionamento para /auth com mensagem Sessão expirada

### EC-002: Usuário Deletado com Sessão Ativa
**Condition**: Admin deleta um usuário que está logado
**Expected Behavior**: Próxima requisição retorna 401, sessão invalidada

### EC-003: Brute Force
**Condition**: 11 tentativas de login em 10 minutos
**Expected Behavior**: Bloqueio por 15 minutos, email de alerta ao admin

### EC-004: clinicId Inválido no Token
**Condition**: Token manipulado com clinicId que usuário não tem acesso
**Expected Behavior**: 403 clinicGuard, token rejeitado

---

## 8. Key Entities

### Entity: User
**Attributes**:
- id (UUID)
- email (String): unique
- passwordHash (String): bcrypt
- name (String)
- role (Enum): ADMIN, MEMBER, PATIENT
- profile (Enum): ADMIN, MEMBER, PATIENT
- status (Enum): ATIVO, INATIVO, PENDENTE
- createdAt, updatedAt

### Entity: UserClinicAccess
**Attributes**:
- id (UUID)
- userId (UUID)
- clinicId (String)
- permissions (String[]): [ALL] ou módulos específicos
- isDefault (Boolean)

### Entity: LoginAttempt
**Attributes**:
- id (UUID)
- email (String)
- ip (String)
- success (Boolean)
- createdAt

---

## 9. Dependencies & Assumptions

### Dependencies
- usuarios — gestão de usuários
- configuracoes — módulos ativos por clínica
- notifications — alertas de segurança

### Assumptions
- Cada clínica tem pelo menos um ADMIN
- Email é confiável para recuperação de senha
- Cliente suporta cookies HttpOnly

---

## 10. Out of Scope

- SSO/SAML (AD, Okta, etc.)
- OAuth 2.0 / OpenID Connect
- 2FA/MFA (SMS, TOTP, hardware key)
- Biometria
- Single Sign-On entre clínicas

---

## 11. Notes

- Backend: módulo auth com Prisma (users, profiles, login_attempts)
- Frontend: AuthContext com useAuth() hook
- JWT: HS256, 15 min access + 7 day refresh
- clinicGuard middleware obrigatório em todos os routers protegidos
- Rate limiting: express-rate-limit com tiers distintos
- LGPD: middleware dedicado para compliance
