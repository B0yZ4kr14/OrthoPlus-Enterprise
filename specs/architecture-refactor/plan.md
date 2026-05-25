# plan.md — Architecture Refactor

## Design Overview
Migrate from [API -> Controller -> Prisma] to [API -> Controller -> DTO -> UseCase -> Domain Service -> Repository Interface -> Repository Impl -> Prisma].

## Key Decisions
- Coexistence: new code uses new pattern immediately; old code stays temporarily
- Boundary adapters bridge old and new patterns
- Each phase has a git checkpoint for rollback

## Phase 1: Introduce Repositories (5 days)
- Task 1.1: Create FinanceiroRepository (findTransactions, createTransaction, getResumo, getCashFlow)
- Task 1.2: Refactor FinanceiroController to use FinanceiroRepository
- Task 1.3: Extract AuthService from AuthController
- Task 1.4: Create UserRepository

## Phase 2: Extract Use-Cases (7 days)
- Task 2.1: CreateTransactionUseCase from FinanceiroController
- Task 2.2: GetDashboardOverviewUseCase from AnalyticsController
- Task 2.3: AuthenticateUserUseCase from AuthController
- Task 2.4: RegisterUserUseCase from AuthController

## Phase 3: Fix Dependency Inversion in memory_hub (3 days)
- Task 3.1: Create IDocumentRepository, IEmbeddingRepository, ISearchAuditRepository
- Task 3.2: Refactor HealthService, GraphService, SearchService to use interfaces
- Task 3.3: Refactor IndexingService with factory pattern
- Task 3.4: Adjust MemoryHubModule.ts for DI

## Phase 4: Frontend Data-Fetching Hooks (4 days)
- Task 4.1: Create useADRs, useAuditLogs, useBackups hooks
- Task 4.2: Create useCryptoConfig, useAIModelConfig, useAuthenticationConfig hooks
- Task 4.3: Refactor ADRsPage, AuditLogs, BackupsPage
- Task 4.4: Create generic useAdminResource hook

## Phase 5: DTOs and Normalized Responses (5 days)
- Task 5.1: Define TransactionDTO, DashboardOverviewDTO, UserDTO in shared-types
- Task 5.2: Create Prisma entity -> DTO mappers
- Task 5.3: Update frontend to consume shared-types DTOs
- Task 5.4: Document API contracts with Zod schemas
