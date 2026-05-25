# spec.md — Architecture Refactor

## Feature Name
Architecture Refactor — Clean Architecture Migration

## Description
Migrate OrthoPlus Enterprise from controller-centric architecture to Clean Architecture with repositories, use-cases, DTOs, and proper dependency inversion.

## Requirements

### Functional
- Isolate database access behind repository interfaces
- Extract business logic from controllers into use-cases
- Introduce DTOs for API contracts
- Create reusable data-fetching hooks on frontend

### Non-Functional
- Zero regression on existing functionality
- Backend build: 0 TypeScript errors
- All existing tests continue passing
- Coexistence strategy: old and new patterns run in parallel

## Scope
- Backend: Financeiro, Auth, Analytics, memory_hub modules
- Frontend: Admin pages with inline API calls
- shared-types: DTO definitions

## Out of Scope
- Full rewrite of all 37 modules at once
- Database schema changes
- Breaking API changes (DTOs mirror existing responses)
