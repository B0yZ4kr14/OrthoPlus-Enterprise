# tasks.md — Architecture Refactor

## Phase 1: Introduce Repositories
- [ ] T1.1 Create FinanceiroRepository with CRUD + aggregation methods
- [ ] T1.2 Refactor FinanceiroController to use FinanceiroRepository
- [ ] T1.3 Extract AuthService from AuthController (login, register, refresh)
- [ ] T1.4 Create UserRepository for prisma.users access

## Phase 2: Extract Use-Cases
- [ ] T2.1 Create CreateTransactionUseCase
- [ ] T2.2 Create GetDashboardOverviewUseCase
- [ ] T2.3 Create AuthenticateUserUseCase
- [ ] T2.4 Create RegisterUserUseCase

## Phase 3: Fix Dependency Inversion in memory_hub
- [ ] T3.1 Create repository interfaces (IDocumentRepository, IEmbeddingRepository, ISearchAuditRepository)
- [ ] T3.2 Refactor domain services to use interfaces
- [ ] T3.3 Refactor IndexingService with factory pattern
- [ ] T3.4 Adjust MemoryHubModule.ts for DI

## Phase 4: Frontend Hooks
- [ ] T4.1 Create useADRs, useAuditLogs, useBackups hooks
- [ ] T4.2 Create useCryptoConfig, useAIModelConfig, useAuthenticationConfig hooks
- [ ] T4.3 Refactor admin pages to use hooks
- [ ] T4.4 Create useAdminResource generic hook

## Phase 5: DTOs and API Contracts
- [ ] T5.1 Define DTOs in shared-types
- [ ] T5.2 Create entity-to-DTO mappers
- [ ] T5.3 Update frontend to use DTOs
- [ ] T5.4 Document API contracts with Zod schemas
