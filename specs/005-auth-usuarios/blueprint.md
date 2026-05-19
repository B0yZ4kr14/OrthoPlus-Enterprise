# Blueprint — Feature 005: Autenticação e Controle de Acesso

## Overview
Fundação de segurança do OrthoPlus Enterprise. Garante acesso autorizado com JWT, isolamento multi-tenant por clinicId, controle granular de permissões por módulo, rate limiting e proteção CSRF. Inclui portal do paciente com autenticação separada.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/auth/ui/pages/Auth.tsx` — Página de login/autenticação
- [X] `apps/web/src/modules/auth/ui/pages/ResetPassword.tsx` — Página de recuperação de senha
- [X] `apps/web/src/components/settings/authentication-config/AuthenticationConfig.tsx` — Configuração de autenticação
- [X] `apps/web/src/components/settings/authentication-config/GoogleOAuthSection.tsx` — Seção OAuth Google
- [X] `apps/web/src/components/settings/authentication-config/useAuthConfig.ts` — Hook de config auth
- [X] `apps/web/src/components/settings/user-management-tab/AddUserDialog.tsx` — Dialog adicionar usuário
- [X] `apps/web/src/components/settings/user-management-tab/UserManagementTab.tsx` — Tab gestão de usuários
- [X] `apps/web/src/components/settings/user-management-tab/UsersList.tsx` — Lista de usuários
- [X] `apps/web/src/components/settings/user-management-tab/useUserManagement.ts` — Hook gestão usuários
- [X] `apps/web/src/components/settings/user-management-tab/add-user-dialog/components/UserFormField.tsx` — Campo do formulário
- [X] `apps/web/src/components/settings/user-management-tab/add-user-dialog/hooks/useAddUserForm.ts` — Hook formulário
- [X] `apps/web/src/components/settings/user-management/UserFilters.tsx` — Filtros de usuários
- [X] `apps/web/src/components/settings/user-management/UserForm.tsx` — Formulário de usuário
- [X] `apps/web/src/components/settings/user-management/UserTable.tsx` — Tabela de usuários
- [X] `apps/web/src/components/usuarios/UserForm.tsx` — Formulário de usuários (legacy)
- [X] `apps/web/src/components/usuarios/user-form/UserForm.tsx` — Formulário de usuários novo
- [X] `apps/web/src/components/usuarios/user-form/useUserForm.ts` — Hook formulário usuário
- [X] `apps/web/src/components/settings/permission-templates/UserSelect.tsx` — Seletor de usuário
- [ ] `apps/web/src/modules/auth/ui/components/ClinicSwitcher.tsx` — Componente de troca de clínica (pending)
- [ ] `apps/web/src/modules/auth/ui/components/PermissionMatrix.tsx` — Matriz de permissões por módulo (pending)
- [ ] `apps/web/src/modules/auth/ui/components/RoleBadge.tsx` — Badge de papel/role (pending)
- [ ] `apps/web/src/modules/auth/ui/components/LoginAttemptLog.tsx` — Log de tentativas de login (pending)

### Hooks
- [X] `apps/web/src/contexts/AuthContext.tsx` — Contexto de autenticação
- [ ] `apps/web/src/modules/auth/hooks/useClinicSwitch.ts` — Hook de troca de clínica (pending)
- [ ] `apps/web/src/modules/auth/hooks/usePermissions.ts` — Hook de permissões (pending)
- [ ] `apps/web/src/modules/auth/hooks/useLoginAttempts.ts` — Hook de tentativas de login (pending)

### Pages
- [X] `apps/web/src/modules/auth/ui/pages/Auth.tsx` — Página de login
- [X] `apps/web/src/modules/auth/ui/pages/ResetPassword.tsx` — Página de reset de senha
- [X] `apps/web/src/modules/admin/ui/pages/Usuarios.tsx` — Página admin de usuários
- [X] `apps/web/src/modules/Auth.tsx` — Página Auth legacy
- [ ] `apps/web/src/modules/auth/ui/pages/PermissionConfigPage.tsx` — Página de configuração de permissões (pending)
- [ ] `apps/web/src/modules/auth/ui/pages/UserProfilePage.tsx` — Página de perfil do usuário (pending)
- [ ] `apps/web/src/modules/auth/ui/pages/PortalPacienteLogin.tsx` — Login do portal do paciente (pending)

### Domain / Application (Clean Architecture)
- [X] `apps/web/src/domain/entities/User.ts` — Entidade User
- [X] `apps/web/src/domain/repositories/IUserRepository.ts` — Repositório de usuários
- [X] `apps/web/src/infrastructure/repositories/DbUserRepository.ts` — Repositório DB usuários
- [X] `apps/web/src/infrastructure/mappers/UserMapper.ts` — Mapper de usuários
- [X] `apps/web/src/infrastructure/errors/UnauthorizedError.ts` — Erro de não autorizado
- [X] `apps/web/src/application/use-cases/user/GetUserByIdUseCase.ts` — UC buscar usuário
- [X] `apps/web/src/application/use-cases/user/ListUsersByClinicUseCase.ts` — UC listar usuários
- [X] `apps/web/src/application/use-cases/user/UpdateUserUseCase.ts` — UC atualizar usuário
- [ ] `apps/web/src/modules/auth/domain/entities/User.ts` — Entidade User (module) (pending)
- [ ] `apps/web/src/modules/auth/domain/entities/LoginAttempt.ts` — Entidade LoginAttempt (pending)
- [ ] `apps/web/src/modules/auth/domain/entities/UserClinicAccess.ts` — Entidade UserClinicAccess (pending)
- [ ] `apps/web/src/modules/auth/domain/repositories/IUserRepository.ts` — Repositório (pending)
- [ ] `apps/web/src/modules/auth/infrastructure/repositories/AuthRepositoryApi.ts` — Repositório API (pending)

### Types
- [ ] `apps/web/src/modules/auth/types/auth.types.ts` — Tipos de autenticação (pending)
- [ ] `apps/web/src/modules/auth/types/permission.types.ts` — Tipos de permissão (pending)
- [ ] `apps/web/src/modules/auth/types/user.types.ts` — Tipos de usuário (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/auth/api/AuthController.ts` — Controller de autenticação
- [X] `backend/src/modules/auth/api/router.ts` — Rotas de auth
- [X] `backend/src/modules/usuarios/api/usuariosController.ts` — Controller de usuários
- [X] `backend/src/modules/usuarios/api/router.ts` — Rotas de usuários
- [ ] `backend/src/modules/auth/api/PermissionController.ts` — Controller de permissões (pending)
- [ ] `backend/src/modules/auth/api/PortalPacienteController.ts` — Controller do portal do paciente (pending)

### Middleware
- [X] `backend/src/middleware/authMiddleware.ts` — Middleware de autenticação JWT
- [X] `backend/src/infrastructure/auth/IAuthService.ts` — Interface do serviço de auth
- [ ] `backend/src/middleware/clinicGuard.ts` — Middleware clinicGuard (pending — verify if exists)
- [ ] `backend/src/middleware/rateLimitMiddleware.ts` — Middleware de rate limiting (pending)
- [ ] `backend/src/middleware/csrfMiddleware.ts` — Middleware de CSRF (pending)

### Services
- [ ] `backend/src/modules/auth/application/services/AuthService.ts` — Serviço de autenticação (pending)
- [ ] `backend/src/modules/auth/application/services/PasswordService.ts` — Serviço de senhas (pending)
- [ ] `backend/src/modules/auth/application/services/TokenService.ts` — Serviço de tokens JWT (pending)
- [ ] `backend/src/modules/auth/application/services/PermissionService.ts` — Serviço de permissões (pending)
- [ ] `backend/src/modules/auth/application/services/PortalPacienteService.ts` — Serviço portal paciente (pending)
- [ ] `backend/src/modules/usuarios/application/services/UsuarioService.ts` — Serviço de usuários (pending)

### Domain
- [ ] `backend/src/modules/auth/domain/entities/User.ts` — Entidade User (pending)
- [ ] `backend/src/modules/auth/domain/entities/LoginAttempt.ts` — Entidade LoginAttempt (pending)
- [ ] `backend/src/modules/auth/domain/entities/UserClinicAccess.ts` — Entidade UserClinicAccess (pending)
- [ ] `backend/src/modules/auth/domain/repositories/IUserRepository.ts` — Repositório (pending)
- [ ] `backend/src/modules/auth/domain/events/UserLoggedInEvent.ts` — Evento login (pending)
- [ ] `backend/src/modules/auth/domain/events/UserCreatedEvent.ts` — Evento criação (pending)

### Infrastructure
- [ ] `backend/src/modules/auth/infrastructure/repositories/UserRepositoryPrisma.ts` — Repositório Prisma (pending)
- [ ] `backend/src/modules/auth/infrastructure/services/JwtTokenService.ts` — Serviço JWT (pending)
- [ ] `backend/src/modules/auth/infrastructure/services/BcryptPasswordService.ts` — Serviço bcrypt (pending)
- [ ] `backend/src/modules/auth/infrastructure/services/EmailService.ts` — Serviço de email (pending)

## Shared Types
- [X] `apps/web/src/contexts/__tests__/AuthContext.test.tsx` — Teste do contexto de auth
- [X] `apps/web/src/modules/bi/ui/pages/UserBehaviorAnalytics.tsx` — Analytics de comportamento

## Tests
- [X] `backend/tests/unit/authController.test.ts` — Testes do controller de auth
- [ ] `backend/tests/unit/authService.test.ts` — Testes do serviço de auth (pending)
- [ ] `backend/tests/unit/authMiddleware.test.ts` — Testes do middleware (pending)
- [ ] `backend/tests/unit/usuariosController.test.ts` — Testes do controller de usuários (pending)
- [ ] `backend/tests/unit/permissionService.test.ts` — Testes de permissões (pending)
- [ ] `tests/e2e/auth.spec.ts` — Teste E2E de autenticação (pending)
- [ ] `tests/e2e/portal-paciente.spec.ts` — Teste E2E portal do paciente (pending)

## Summary
- Pre-completed: 27 files
- Pending: 38 files
- Total: 65 files
