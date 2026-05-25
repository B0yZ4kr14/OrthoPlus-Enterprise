# Architecture Governance Report

## Input Summary
- **Artifacts Scanned**: architecture_constitution.md, specs/architecture-refactor/*, backend/src/modules/**/*.ts
- **Extensions Used**: Memory Hub: no, Security Review: no
- **Mode**: architecture
- **Focus**: general

## Findings

### Violations

| ID | Category | Severity | Location | Summary | Evidence |
|----|----------|----------|----------|---------|----------|
| V-01 | Boundary Erosion | High | notifications/api/notificationController.ts | Controller acessa Prisma diretamente via $queryRaw | 5 chamadas prisma.$queryRaw (overdue payments, low stock, birthdays, alerts, products) |
| V-02 | Boundary Erosion | High | inventario/api/InventarioController.ts | Controller acessa Prisma diretamente via $queryRaw | 2 chamadas prisma.$queryRaw (low stock & alert products) |
| V-03 | Boundary Erosion | Critical | financeiro/api/FinanceiroController.ts | Controller com 1.151 linhas contém lógica de negócio inline | ~848 linhas de lógica de orquestração, validação e regras de negócio |
| V-04 | Boundary Erosion | High | files/api/filesController.ts | Controller com 736 linhas contém lógica de upload inline | ~582 linhas de lógica S3/GDrive/Dropbox inline |
| V-05 | Boundary Erosion | High | agenda/api/agendaController.ts | Controller com 678 linhas contém lógica de agendamento inline | ~438 linhas de lógica de scheduling inline |
| V-06 | Boundary Erosion | High | auth/api/AuthController.ts | Controller com 456 linhas contém fluxos de auth inline | ~355 linhas de lógica de autenticação (bcrypt, JWT) no controller |
| V-07 | Boundary Erosion | High | analytics/api/analyticsController.ts | Controller com 420 linhas contém agregações inline | ~339 linhas de lógica de agregação e analytics |
| V-08 | Isolation Breach | Medium | database_admin/api/DatabaseAdminController.ts | Raw SQL via db.query bypassando ORM | 14 chamadas db.query via raw PostgreSQL connection |
| V-09 | Missing Abstraction | High | 32 modules (76%) | Módulos sem camada de repository | admin_tools, agents, ai, analytics, auth, backups, bi, comm, crm, crypto, crypto_config, dashboard, database_admin, fidelidade, files, funcionarios, github_tools, ia_radiografia, inadimplencia, lgpd, marketing, memory_hub, notifications, orcamentos, pep, procedimentos, relatorios, split_pagamento, teleodonto, terminal, tiss, usuarios |
| V-10 | Constitution Breach | Critical | Multiple controllers | Controllers thicker than 100 lines of business logic | Financeiro (848), files (582), agenda (438), notifications (407), auth (355), analytics (339), comm (330) |
| V-11 | Missing Contract | Medium | All API modules | API responses não usam DTOs consistentes | Raw Prisma entities retornadas diretamente; sem response envelope padronizado |
| V-12 | Coupling | Medium | memory_hub/domain/services/ | Domain services importam implementações concretas | HealthService, GraphService, SearchService importam infraestrutura diretamente |

### Refactor Tasks

1. **T-REF-01**: Extrair NotificationRepository de notificationController.ts
   - Mover 5 chamadas $queryRaw para NotificationRepository
   - Prioridade: P0
   - Esforço: 1 dia

2. **T-REF-02**: Extrair ProdutoRepository de InventarioController.ts
   - Mover 2 chamadas $queryRaw para ProdutoRepository
   - Prioridade: P0
   - Esforço: 0.5 dia

3. **T-REF-03**: Thin Controller — FinanceiroController.ts
   - Extrair orquestração para FinanceiroService/UseCases
   - Reduzir controller para <200 linhas
   - Prioridade: P0
   - Esforço: 3 dias

4. **T-REF-04**: Thin Controller — filesController.ts
   - Extrair lógica de upload para FileUploadService
   - Prioridade: P1
   - Esforço: 2 dias

5. **T-REF-05**: Thin Controller — agendaController.ts
   - Extrair scheduling logic para AgendaService/UseCases
   - Prioridade: P1
   - Esforço: 2 dias

6. **T-REF-06**: Extrair AuthService de AuthController.ts
   - Mover bcrypt/JWT/token logic para AuthService
   - Prioridade: P0
   - Esforço: 2 dias

7. **T-REF-07**: Introduzir Repository Interfaces nos 32 módulos sem repository
   - Criar repository pattern para módulos críticos
   - Prioridade: P1
   - Esforço: 5 dias

8. **T-REF-08**: Fix Dependency Inversion em memory_hub
   - Criar interfaces IDocumentRepository, IEmbeddingRepository
   - Refatorar services para usar interfaces
   - Prioridade: P1
   - Esforço: 2 dias

9. **T-REF-09**: Introduzir DTOs em shared-types
   - Criar TransactionDTO, DashboardOverviewDTO, UserDTO
   - Atualizar controllers para retornar DTOs
   - Prioridade: P2
   - Esforço: 3 dias

10. **T-REF-10**: Standardizar API Response Envelope
    - Implementar { success, data, error } pattern em todos os controllers
    - Prioridade: P2
    - Esforço: 3 dias

### Constitution Update Proposals

- **CUP-01**: Adicionar regra "Controllers MUST NOT exceed 200 lines total"
- **CUP-02**: Adicionar regra "Direct Prisma access in controllers is a P0 violation"
- **CUP-03**: Adicionar checklist "New modules MUST include repository layer"

## Context Applied
- **Memory Hub**: Not available
- **Security Review**: Not available

## Recommended Next Step
Executar T-REF-03 (Thin Controller Financeiro) + T-REF-06 (AuthService extraction) em paralelo — são os maiores impactos e independentes.
