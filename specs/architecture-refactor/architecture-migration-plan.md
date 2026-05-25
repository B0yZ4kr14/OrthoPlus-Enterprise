# Plano de Migracao Arquitetural — OrthoPlus Enterprise

## Estado Atual

```
[API Request] -> [Controller] -> [Prisma/raw DB] -> [Response]
                     ^
            (business logic, validation, aggregations)
```

### Problemas
- 21 controllers acessam Prisma diretamente
- Business logic vive em controllers (FinanceiroController: 1.280 linhas)
- Domain layer importa infrastructure (memory_hub)
- Frontend faz chamadas API inline em page components
- Zero separation of concerns em analytics

## Estado Alvo

```
[API Request] -> [Controller] -> [DTO/Validation] -> [UseCase/Command]
                                                      |
                                              [Domain Service]
                                                      |
                                              [Repository Interface]
                                                      |
                                              [Repository Impl]
                                                      |
                                              [Prisma/DB]
```

### Beneficios
- Testabilidade: controllers testam apenas HTTP, use-cases testam regras
- Reusabilidade: use-cases podem ser chamados por CLI, workers, eventos
- Manutenibilidade: mudancas em DB afetam apenas repositories
- Type safety: DTOs garantem contratos API

## Fases de Migracao

### Fase 1: Introduzir Repositories nos Controllers mais Criticos (Estimativa: 5 dias)
**Objetivo**: Isolar acesso ao DB em repositories para Financeiro e Auth

- **Task 1.1**: Criar FinanceiroRepository com metodos: findTransactions, createTransaction, getResumo, getCashFlow
- **Task 1.2**: Refatorar FinanceiroController para usar FinanceiroRepository (remover Prisma direto)
- **Task 1.3**: Extrair AuthService de AuthController (login, register, token refresh)
- **Task 1.4**: Criar UserRepository para encapsular acesso a prisma.users

**Coexistencia**: Controllers continuam funcionando; repositories sao introduzidos gradualmente.

### Fase 2: Extrair Use-Cases/Camada de Aplicacao (Estimativa: 7 dias)
**Objetivo**: Mover regras de negocio dos controllers para use-cases

- **Task 2.1**: Criar CreateTransactionUseCase a partir da logica em FinanceiroController
- **Task 2.2**: Criar GetDashboardOverviewUseCase a partir de AnalyticsController
- **Task 2.3**: Criar AuthenticateUserUseCase a partir de AuthController
- **Task 2.4**: Criar RegisterUserUseCase a partir de AuthController

**Coexistencia**: Controllers chamam use-cases; use-cases podem chamar repositories ou Prisma direto.

### Fase 3: Corrigir Inversao de Dependencias no memory_hub (Estimativa: 3 dias)
**Objetivo**: Domain services dependem de abstracoes, nao de implementacoes

- **Task 3.1**: Criar interfaces: IDocumentRepository, IEmbeddingRepository, ISearchAuditRepository
- **Task 3.2**: Refatorar HealthService, GraphService, SearchService para usar interfaces
- **Task 3.3**: Refatorar IndexingService para usar factory pattern
- **Task 3.4**: Ajustar MemoryHubModule.ts para injetar implementacoes concretas

### Fase 4: Frontend — Extrair Hooks de Data Fetching (Estimativa: 4 dias)
**Objetivo**: Centralizar chamadas API em hooks reutilizaveis

- **Task 4.1**: Criar useADRs, useAuditLogs, useBackups hooks
- **Task 4.2**: Criar useCryptoConfig, useAIModelConfig, useAuthenticationConfig hooks
- **Task 4.3**: Refatorar ADRsPage, AuditLogs, BackupsPage para usar hooks
- **Task 4.4**: Criar padrao useAdminResource generico para paginas de admin

### Fase 5: Introduzir DTOs e Normalizar Responses (Estimativa: 5 dias)
**Objetivo**: Garantir contratos de API tipados e consistentes

- **Task 5.1**: Definir TransactionDTO, DashboardOverviewDTO, UserDTO em shared-types
- **Task 5.2**: Criar mappers de Prisma entity -> DTO nos controllers
- **Task 5.3**: Atualizar frontend para consumir DTOs de shared-types
- **Task 5.4**: Documentar contratos de API com Zod schemas

## Estrategia de Coexistencia

**Por que coexistencia?** Evitar rewrites massivos que quebrem funcionalidade.

**Como**:
- Novo codigo usa novo padrao imediatamente
- Codigo antigo continua no padrao antigo temporariamente
- Camada de boundary adapta entre antigo e novo

## Plano de Rollback

Se migracao falhar:
1. Reverter para commit anterior (cada fase tem checkpoint)
2. Controllers continuam funcionando com logica inline
3. Repositories e use-cases podem ser removidos sem afetar funcionalidade

## Criterios de Sucesso

- [ ] Todos controllers novos usam repositories/use-cases
- [ ] Domain layer nao importa infrastructure
- [ ] Frontend page components usam hooks
- [ ] API retorna DTOs, nao raw entities
- [ ] 636 testes passam
- [ ] Backend build: 0 erros TypeScript
- [ ] Sem regressao de performance

## Tarefas de Refactor Detalhadas

### [Refactor Task 1]
Title: Extrair FinanceiroRepository de FinanceiroController
Reason: Controller de 1.280 linhas acessa Prisma diretamente 30 vezes
Scope: FinanceiroController.ts + novo FinanceiroRepository.ts
Priority: P0
Suggested Fix: Criar FinanceiroRepository com metodos CRUD e agregacoes

### [Refactor Task 2]
Title: Extrair AuthService de AuthController
Reason: Logica de autenticacao (bcrypt, JWT) vive no controller
Scope: AuthController.ts + novo AuthService.ts
Priority: P0
Suggested Fix: Criar AuthService com login/register/refresh

### [Refactor Task 3]
Title: Introduzir interfaces nos repositories do memory_hub
Reason: Domain services importam implementacoes concretas
Scope: 6 arquivos em memory_hub/domain/services/
Priority: P1
Suggested Fix: Criar interfaces IDocumentRepository, IEmbeddingRepository

### [Refactor Task 4]
Title: Extrair hooks de data fetching do frontend admin
Reason: 15+ page components fazem chamadas API inline
Scope: apps/web/src/modules/admin/ui/pages/
Priority: P1
Suggested Fix: Criar hooks useADRs, useAuditLogs, useBackups

### [Refactor Task 5]
Title: Criar use-cases para AnalyticsController
Reason: 775 linhas de agregacoes no controller
Scope: AnalyticsController.ts + novo diretorio analytics/application/
Priority: P1
Suggested Fix: Criar GetDashboardOverviewUseCase, GetRevenueAnalyticsUseCase
