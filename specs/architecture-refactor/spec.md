# spec.md — Architecture Refactor

## Feature Name
Architecture Refactor — Clean Architecture Migration

## Description
Migrate OrthoPlus Enterprise from controller-centric architecture to Clean Architecture with repositories, use-cases, DTOs, and proper dependency inversion.

## Requirements

### Functional
- **FR-1: Isolate database access behind repository interfaces**
  - Acceptance: All new Prisma queries go through Repository layer; zero direct `prisma.` in controllers
- **FR-2: Extract business logic from controllers into use-cases**
  - Acceptance: Controllers <150 lines; business rules live in Services/UseCases with unit tests
- **FR-3: Introduce DTOs for API contracts**
  - Acceptance: All API responses use DTOs from shared-types; no raw Prisma entities exposed
- **FR-4: Create reusable data-fetching hooks on frontend**
  - Acceptance: Admin pages use custom hooks; zero inline `apiClient.` calls in page components

### Non-Functional
- **SC-1: Zero regression on existing functionality**
  - Baseline: 636 existing tests must pass; E2E smoke tests (26) must pass
  - Validation: Run full test suite before and after each phase
- **SC-2: Backend build: 0 TypeScript errors**
  - Validation: `cd backend && pnpm build` must pass after each phase
- **SC-3: All existing tests continue passing**
  - Validation: `cd backend && pnpm test` and `cd apps/web && pnpm test` must pass
- **SC-4: Coexistence strategy: old and new patterns run in parallel**
  - Mechanism: Adapter pattern + feature flags; old controllers keep working until new layer is validated
  - Validation: Dual-mode smoke test runs old and new endpoints side-by-side

## User Stories
- **US-1**: Como desenvolvedor, quero que FinanceiroController use FinanceiroRepository para que eu possa testar a lógica de persistência isoladamente
- **US-2**: Como desenvolvedor, quero que AuthController delegue para AuthService para que regras de autenticação sejam testáveis sem HTTP
- **US-3**: Como desenvolvedor, quero que o frontend use hooks reutilizáveis para que pages não contenham lógica de API inline

## Scope
- Backend: Financeiro, Auth, Analytics, memory_hub modules
- Frontend: Admin pages with inline API calls
- shared-types: DTO definitions

## Out of Scope
- Full rewrite of all 37 modules at once
- Database schema changes
- Breaking API changes (DTOs mirror existing responses)
- Security token migration (covered by separate security feature)
