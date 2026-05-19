# Blueprint — Feature 004: Gestão Financeira

## Overview
Módulo financeiro da clínica odontológica. Gerencia receitas, despesas, fluxo de caixa, contas a receber/pagar, conciliação bancária e relatórios gerenciais (DRE, fluxo de caixa). Integra com PDV e split de pagamento.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/financeiro/components/TransactionForm.tsx` — Formulário de transação
- [X] `apps/web/src/modules/financeiro/components/TransactionsList.tsx` — Lista de transações
- [X] `apps/web/src/modules/financeiro/components/TransactionDetails.tsx` — Detalhes de transação
- [X] `apps/web/src/modules/financeiro/components/CaixaPanel.tsx` — Painel do caixa
- [X] `apps/web/src/modules/financeiro/components/FluxoCaixaDashboard.tsx` — Dashboard de fluxo de caixa
- [X] `apps/web/src/modules/financeiro/components/FinancialStats.tsx` — Estatísticas financeiras
- [X] `apps/web/src/modules/financeiro/components/RevenueDistributionChart.tsx` — Gráfico de distribuição de receita
- [X] `apps/web/src/modules/financeiro/components/RevenueExpenseChart.tsx` — Gráfico de receitas vs despesas
- [X] `apps/web/src/modules/financeiro/components/ContaReceberForm.tsx` — Formulário de conta a receber
- [X] `apps/web/src/modules/financeiro/components/ContaPagarForm.tsx` — Formulário de conta a pagar
- [X] `apps/web/src/modules/financeiro/components/ContasReceberList.tsx` — Lista de contas a receber
- [X] `apps/web/src/modules/financeiro/components/ContasPagarList.tsx` — Lista de contas a pagar
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/DashboardVendasPDV.tsx` — Dashboard vendas PDV
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/KPICards.tsx` — KPIs do PDV
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/PagamentosTab.tsx` — Tab de pagamentos
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/ProdutosTab.tsx` — Tab de produtos
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/VendedoresTab.tsx` — Tab de vendedores
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/HorariosTab.tsx` — Tab de horários
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/PeriodFilter.tsx` — Filtro de período
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/CryptoPagamentos.tsx` — Crypto pagamentos
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/BitcoinInfoSection.tsx` — Info Bitcoin
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/useCryptoPagamentos.ts` — Hook crypto
- [X] `apps/web/src/modules/financeiro/ui/components/ContasReceberTable.tsx` — Tabela contas a receber
- [X] `apps/web/src/modules/financeiro/ui/components/ContasReceberFilters.tsx` — Filtros contas a receber
- [X] `apps/web/src/modules/financeiro/ui/components/ContasReceberKPIs.tsx` — KPIs contas a receber
- [X] `apps/web/src/modules/financeiro/ui/components/ContasReceberChart.tsx` — Gráfico contas a receber
- [X] `apps/web/src/modules/financeiro/ui/components/NovaContaWizard.tsx` — Wizard nova conta
- [ ] `apps/web/src/modules/financeiro/components/ConciliacaoUploader.tsx` — Upload de OFX/CSV para conciliação (pending)
- [ ] `apps/web/src/modules/financeiro/components/ConciliacaoMatcher.tsx` — Interface de matching de conciliação (pending)
- [ ] `apps/web/src/modules/financeiro/components/RelatorioDRE.tsx` — Relatório DRE (pending)
- [ ] `apps/web/src/modules/financeiro/components/CashFlowReport.tsx` — Relatório de fluxo de caixa (pending)

### Hooks
- [X] `apps/web/src/modules/financeiro/application/hooks/useFinanceiro.ts` — Hook principal financeiro
- [X] `apps/web/src/modules/financeiro/application/hooks/useContasReceber.ts` — Hook contas a receber
- [X] `apps/web/src/modules/financeiro/application/hooks/useContasReceberController.ts` — Controller hook
- [X] `apps/web/src/modules/financeiro/presentation/hooks/useTransactions.ts` — Hook de transações
- [X] `apps/web/src/modules/financeiro/presentation/hooks/useCashFlow.ts` — Hook de fluxo de caixa
- [X] `apps/web/src/modules/financeiro/presentation/hooks/useCashRegister.ts` — Hook de caixa registradora
- [X] `apps/web/src/modules/financeiro/presentation/hooks/useCategories.ts` — Hook de categorias
- [X] `apps/web/src/modules/financeiro/hooks/useTransactionsAPI.ts` — Hook de API de transações
- [X] `apps/web/src/modules/financeiro/hooks/useTransactionsUnified.ts` — Hook unificado de transações
- [ ] `apps/web/src/modules/financeiro/hooks/useConciliacao.ts` — Hook de conciliação bancária (pending)
- [ ] `apps/web/src/modules/financeiro/hooks/useRelatorios.ts` — Hook de relatórios (pending)

### Pages
- [X] `apps/web/src/modules/financeiro/ui/pages/FinanceiroPage.tsx` — Página principal financeiro
- [X] `apps/web/src/modules/financeiro/ui/pages/Transacoes.tsx` — Página de transações
- [X] `apps/web/src/modules/financeiro/ui/pages/ContasReceber.tsx` — Página de contas a receber
- [X] `apps/web/src/modules/financeiro/ui/pages/ContasPagar.tsx` — Página de contas a pagar
- [X] `apps/web/src/modules/financeiro/ui/pages/RelatorioCaixa.tsx` — Página de relatório de caixa
- [X] `apps/web/src/modules/financeiro/ui/pages/Conciliacao.tsx` — Página de conciliação
- [X] `apps/web/src/modules/financeiro/ui/pages/ConciliacaoBancaria.tsx` — Página de conciliação bancária
- [X] `apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx` — Página de crypto pagamentos
- [X] `apps/web/src/modules/financeiro/ui/pages/DashboardVendasPDV.tsx` — Página dashboard vendas PDV
- [X] `apps/web/src/modules/financeiro/ui/pages/NotasFiscais.tsx` — Página de notas fiscais
- [ ] `apps/web/src/modules/financeiro/ui/pages/RelatorioDREPage.tsx` — Página de relatório DRE (pending)
- [ ] `apps/web/src/modules/financeiro/ui/pages/AgingReportPage.tsx` — Página de relatório aging (pending)

### Domain / Application (Clean Architecture)
- [X] `apps/web/src/modules/financeiro/domain/entities/Transaction.ts` — Entidade Transaction
- [X] `apps/web/src/modules/financeiro/domain/entities/CashRegister.ts` — Entidade CashRegister
- [X] `apps/web/src/modules/financeiro/domain/entities/Category.ts` — Entidade Category
- [X] `apps/web/src/modules/financeiro/domain/aggregates/Transaction.ts` — Aggregate Transaction
- [X] `apps/web/src/modules/financeiro/domain/valueObjects/Money.ts` — Value Object Money
- [X] `apps/web/src/modules/financeiro/domain/valueObjects/Period.ts` — Value Object Period
- [X] `apps/web/src/modules/financeiro/domain/repositories/ITransactionRepository.ts` — Repositório de transações
- [X] `apps/web/src/modules/financeiro/domain/repositories/ICashRegisterRepository.ts` — Repositório de caixa
- [X] `apps/web/src/modules/financeiro/domain/repositories/ICategoryRepository.ts` — Repositório de categorias
- [X] `apps/web/src/modules/financeiro/infrastructure/repositories/ApiTransactionRepository.ts` — Repositório API transações
- [X] `apps/web/src/modules/financeiro/infrastructure/repositories/ApiCashRegisterRepository.ts` — Repositório API caixa
- [X] `apps/web/src/modules/financeiro/infrastructure/repositories/ApiCategoryRepository.ts` — Repositório API categorias
- [X] `apps/web/src/modules/financeiro/application/use-cases/CreateTransactionUseCase.ts` — UC criar transação
- [X] `apps/web/src/modules/financeiro/application/use-cases/ListTransactionsUseCase.ts` — UC listar transações
- [X] `apps/web/src/modules/financeiro/application/use-cases/PayTransactionUseCase.ts` — UC pagar transação
- [X] `apps/web/src/modules/financeiro/application/use-cases/GetCashFlowUseCase.ts` — UC fluxo de caixa
- [X] `apps/web/src/modules/financeiro/application/use-cases/OpenCashRegisterUseCase.ts` — UC abrir caixa
- [X] `apps/web/src/modules/financeiro/application/use-cases/CloseCashRegisterUseCase.ts` — UC fechar caixa
- [X] `apps/web/src/modules/financeiro/application/use-cases/CreateCategoryUseCase.ts` — UC criar categoria
- [X] `apps/web/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` — Comando criar transação
- [X] `apps/web/src/modules/financeiro/application/queries/GetCashFlowQuery.ts` — Query fluxo de caixa
- [ ] `apps/web/src/modules/financeiro/application/use-cases/ConciliarExtratoUseCase.ts` — UC conciliar extrato (pending)
- [ ] `apps/web/src/modules/financeiro/application/use-cases/GerarRelatorioDREUseCase.ts` — UC gerar DRE (pending)

### Types
- [X] `apps/web/src/modules/financeiro/types/financeiro.types.ts` — Tipos financeiros
- [X] `apps/web/src/modules/financeiro/types/financeiro-completo.types.ts` — Tipos financeiros completos
- [X] `apps/web/src/modules/financeiro/components/dashboard-vendas-pdv/types.ts` — Tipos PDV
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/types.ts` — Tipos crypto
- [ ] `apps/web/src/modules/financeiro/types/conciliacao.types.ts` — Tipos de conciliação (pending)
- [ ] `apps/web/src/modules/financeiro/types/relatorio.types.ts` — Tipos de relatório (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/financeiro/api/FinanceiroController.ts` — Controller financeiro
- [X] `backend/src/modules/financeiro/api/router.ts` — Rotas financeiro
- [X] `backend/src/modules/financeiro/api/dbRouter.ts` — Rotas DB financeiro
- [ ] `backend/src/modules/financeiro/api/ConciliacaoController.ts` — Controller de conciliação (pending)
- [ ] `backend/src/modules/financeiro/api/RelatorioController.ts` — Controller de relatórios (pending)
- [ ] `backend/src/modules/financeiro/api/CashRegisterController.ts` — Controller de caixa registradora (pending)

### Services / Commands
- [X] `backend/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` — Comando criar transação
- [X] `backend/src/modules/financeiro/infrastructure/FinanceiroBackupService.ts` — Serviço de backup
- [X] `backend/src/modules/financeiro/infrastructure/FinanceiroDatabaseManager.ts` — Gerenciador de DB
- [ ] `backend/src/modules/financeiro/application/services/FinanceiroService.ts` — Serviço principal (pending)
- [ ] `backend/src/modules/financeiro/application/services/CashRegisterService.ts` — Serviço de caixa (pending)
- [ ] `backend/src/modules/financeiro/application/services/ConciliacaoService.ts` — Serviço de conciliação (pending)
- [ ] `backend/src/modules/financeiro/application/services/RelatorioService.ts` — Serviço de relatórios (pending)
- [ ] `backend/src/modules/financeiro/application/services/ContasReceberService.ts` — Serviço de contas a receber (pending)

### Domain
- [X] `backend/src/modules/financeiro/domain/entities/Transaction.ts` — Entidade Transaction
- [X] `backend/src/modules/financeiro/domain/events/TransactionCreatedEvent.ts` — Evento transação criada
- [X] `backend/src/modules/financeiro/domain/repositories/ITransactionRepository.ts` — Repositório de transações
- [ ] `backend/src/modules/financeiro/domain/entities/CashRegister.ts` — Entidade CashRegister (pending)
- [ ] `backend/src/modules/financeiro/domain/entities/Category.ts` — Entidade Category (pending)
- [ ] `backend/src/modules/financeiro/domain/entities/ContaReceber.ts` — Entidade ContaReceber (pending)
- [ ] `backend/src/modules/financeiro/domain/events/TransactionPaidEvent.ts` — Evento transação paga (pending)

### Infrastructure
- [X] `backend/src/modules/financeiro/infrastructure/repositories/TransactionRepositoryPostgres.ts` — Repositório PostgreSQL
- [ ] `backend/src/modules/financeiro/infrastructure/repositories/CashRegisterRepositoryPostgres.ts` — Repositório caixa (pending)
- [ ] `backend/src/modules/financeiro/infrastructure/repositories/ContaReceberRepositoryPostgres.ts` — Repositório contas a receber (pending)
- [ ] `backend/src/modules/financeiro/infrastructure/parsers/OFXParser.ts` — Parser de OFX (pending)
- [ ] `backend/src/modules/financeiro/infrastructure/parsers/CSVParser.ts` — Parser de CSV (pending)

## Shared Types
- [X] `apps/web/src/domain/events/PagamentoEvents.ts` — Eventos de pagamento
- [X] `apps/web/src/hooks/api/useFinanceiro.ts` — Hook API financeiro shared
- [X] `apps/web/src/hooks/api/useFaturamento.ts` — Hook API faturamento shared
- [X] `apps/web/src/components/patients/tabs/FinanceiroTab.tsx` — Tab financeiro do paciente
- [X] `apps/web/src/components/patients/tabs/financeiro-tab/FinanceiroTab.tsx` — Tab financeiro alternativa
- [X] `apps/web/src/modules/bi/ui/components/FinanceiroReports.tsx` — Relatórios BI
- [X] `apps/web/src/modules/dashboard/ui/components/DashboardTabFinanceiro.tsx` — Tab financeiro do dashboard
- [X] `backend/src/shared/events/handlers/GerarFinanceiroHandler.ts` — Handler de eventos financeiros
- [X] `backend/src/workers/jobs/financeiroJobs.ts` — Jobs financeiros

## Tests
- [X] `backend/tests/unit/financeiroController.test.ts` — Testes do controller financeiro
- [X] `apps/web/src/modules/financeiro/domain/aggregates/__tests__/Transaction.test.ts` — Teste aggregate Transaction
- [X] `apps/web/src/modules/financeiro/presentation/hooks/__tests__/useTransactions.test.ts` — Teste hook transações
- [X] `apps/web/src/modules/financeiro/presentation/hooks/__tests__/useCashFlow.test.ts` — Teste hook fluxo de caixa
- [X] `apps/web/src/modules/financeiro/presentation/hooks/__tests__/useCategories.test.ts` — Teste hook categorias
- [ ] `backend/tests/unit/financeiroConciliacao.test.ts` — Testes de conciliação (pending)
- [ ] `backend/tests/unit/financeiroRelatorio.test.ts` — Testes de relatórios (pending)
- [ ] `tests/e2e/financeiro.spec.ts` — Teste E2E financeiro (pending)

## Summary
- Pre-completed: 67 files
- Pending: 32 files
- Total: 99 files
