# plan.md — Architecture Refactor

## Design Overview
Migrate from [API -> Controller -> Prisma] to [API -> Controller -> DTO -> UseCase -> Domain Service -> Repository Interface -> Repository Impl -> Prisma].

## Key Decisions
- Coexistence: new code uses new pattern immediately; old code stays temporarily
- Boundary adapters bridge old and new patterns
- Each phase has a git checkpoint for rollback
- Controllers MUST be <150 lines (aligned with constitution §11.3)

## Phase 0: Critical Violations (P0 — 2 days)
- Task 0.1: Remove direct Prisma access from notificationController.ts
- Task 0.2: Remove direct Prisma access from InventarioController.ts
- Task 0.3: Thin Controller — Reduce FinanceiroController.ts to <150 lines
- Task 0.4: Extract AuthService from AuthController.ts
- Task 0.5: Standardize error responses in refactored controllers to RFC 7807 Problem Details (ApiError)

## Phase 1: Introduce Repositories (5 days)
- Task 1.1: Create FinanceiroRepository (findTransactions, createTransaction, getResumo, getCashFlow)
- ~~Task 1.2: Refactor FinanceiroController~~ (completed in Phase 0 / T0.3)
- Task 1.3: Create NotificationRepository for $queryRaw calls
- Task 1.4: Create ProdutoRepository for InventarioController $queryRaw calls
- Task 1.5: Create UserRepository for prisma.users access

## Phase 2: Extract Use-Cases (7 days)
- Task 2.1: CreateTransactionUseCase from FinanceiroController
- Task 2.2: GetDashboardOverviewUseCase from AnalyticsController
- Task 2.3: AuthenticateUserUseCase from AuthService
- Task 2.4: RegisterUserUseCase from AuthService
- Task 2.5: Thin Controller — Reduce agendaController.ts to <150 lines
- Task 2.6: Thin Controller — Reduce filesController.ts to <150 lines

## Phase 3: Fix Dependency Inversion in memory_hub (3 days)
- Task 3.1: Create IDocumentRepository, IEmbeddingRepository, ISearchAuditRepository
- Task 3.2: Refactor HealthService, GraphService, SearchService to use interfaces
- Task 3.3: Refactor IndexingService with factory pattern
- Task 3.4: Adjust MemoryHubModule.ts for DI

## Phase 4: Frontend Hooks (4 days)
- Task 4.1: Create useADRs, useAuditLogs, useBackups hooks
- Task 4.2: Create useCryptoConfig, useAIModelConfig, useAuthenticationConfig hooks
- Task 4.3: Refactor ADRsPage, AuditLogs, BackupsPage
- Task 4.4: Create generic useAdminResource hook

## Phase 5: DTOs and Normalized Responses (5 days)
- Task 5.1: Define TransactionDTO, DashboardOverviewDTO, UserDTO in shared-types
- Task 5.2: Create Prisma entity -> DTO mappers
- Task 5.3: Update frontend to consume shared-types DTOs
- Task 5.4: Document API contracts with Zod schemas
- Task 5.5: Standardize API response envelope { success, data, error }

## Phase 6: Repository Coverage & Brownfield (5 days)
- Task 6.1: Add repository layer to 23 modules (brownfield: exclude modules with <5 entities or no changes in 3 months)
- Task 6.2: Prioritize: analytics, auth, files, notifications, pacientes
- Task 6.3: Excluir módulos legados estáveis (EP-2 brownfield tolerance)

## Phase 7: Validation & Quality Gates (2 days)
- Task 7.1: Run full test suite — 636 unit tests + 26 E2E smoke tests (SC-1)
- Task 7.2: Verify backend build: 0 TypeScript errors (SC-2)
- Task 7.3: Verify all tests passing (SC-3)
- Task 7.4: Run dual-mode smoke test (old + new endpoints side-by-side) (SC-4)
- Task 7.5: Verify clinicGuard on all new routers (GP-1)
- Task 7.6: Verify audit logs for financial/patient operations (GP-2 / FR-5)
- Task 7.7: Verify metrics emission from new services (EP-4 / SC-5)
