# Blueprint — Feature 011: Gestão de Inventário

## Overview
Catálogo de materiais e produtos com entradas/saídas rastreáveis, alertas de estoque crítico, análise de consumo/perdas e integração com PDV para baixa automática.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/estoque/components/ProdutosList.tsx` — Lista de produtos (pre-completed)
- [X] `apps/web/src/modules/estoque/components/ProdutoForm.tsx` — Formulário de cadastro/edição de produto (pre-completed)
- [X] `apps/web/src/modules/estoque/components/MovimentacoesList.tsx` — Lista de movimentações de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/components/MovimentacaoForm.tsx` — Formulário de entrada/saída/ajuste (pre-completed)
- [X] `apps/web/src/modules/estoque/components/AlertasEstoque.tsx` — Painel de alertas de estoque baixo (pre-completed)
- [X] `apps/web/src/modules/estoque/components/InventarioForm.tsx` — Formulário de inventário físico (pre-completed)
- [X] `apps/web/src/modules/estoque/components/InventarioContagemDialog.tsx` — Dialog de contagem física (pre-completed)
- [X] `apps/web/src/modules/estoque/components/InventarioDivergenciasDialog.tsx` — Dialog de divergências sistema vs físico (pre-completed)
- [X] `apps/web/src/modules/estoque/components/InventarioPDFExport.tsx` — Exportação PDF de inventário (pre-completed)
- [X] `apps/web/src/modules/estoque/components/FornecedoresList.tsx` — Lista de fornecedores (pre-completed)
- [X] `apps/web/src/modules/estoque/components/fornecedor-form/FornecedorForm.tsx` — Formulário de fornecedor (pre-completed)
- [X] `apps/web/src/modules/estoque/components/estoque-cadastros/EstoqueCadastros.tsx` — Painel de cadastros (produtos, categorias, fornecedores) (pre-completed)
- [X] `apps/web/src/modules/estoque/components/estoque-inventario-dashboard/EstoqueInventarioDashboard.tsx` — Dashboard de inventário (pre-completed)
- [X] `apps/web/src/modules/estoque/components/estoque-analise-pedidos/EstoqueAnalisePedidos.tsx` — Análise e sugestão de pedidos (pre-completed)
- [X] `apps/web/src/modules/estoque/components/previsao-reposicao/PrevisaoReposicao.tsx` — Previsão de reposição de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/components/BarcodeScannerDialog.tsx` — Leitor de código de barras (pre-completed)
- [X] `apps/web/src/modules/estoque/components/CategoriasList.tsx` — Lista de categorias (pre-completed)
- [X] `apps/web/src/modules/estoque/components/CategoriaForm.tsx` — Formulário de categoria (pre-completed)
- [ ] `apps/web/src/modules/estoque/components/AlertaValidadeProxima.tsx` — Alerta de produtos com validade próxima (< 30 dias) (pending)
- [ ] `apps/web/src/modules/estoque/components/CurvaABCTable.tsx` — Tabela de curva ABC de consumo (pending)
- [ ] `apps/web/src/modules/estoque/components/GiroEstoqueChart.tsx` — Gráfico de giro de estoque (pending)
- [ ] `apps/web/src/modules/estoque/components/CustoMedioHistoricoChart.tsx` — Gráfico de custo médio histórico (pending)
- [ ] `apps/web/src/modules/estoque/components/PerdasRelatorio.tsx` — Relatório de perdas e ajustes (pending)

### Hooks
- [X] `apps/web/src/modules/estoque/hooks/useEstoque.ts` — Hook geral de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/hooks/useEstoqueStore.ts` — Zustand store de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/hooks/useInventario.ts` — Hook de inventário físico (pre-completed)
- [X] `apps/web/src/modules/estoque/presentation/hooks/useProdutos.ts` — Hook de produtos (pre-completed)
- [X] `apps/web/src/modules/estoque/presentation/hooks/useMovimentacoes.ts` — Hook de movimentações (pre-completed)
- [X] `apps/web/src/modules/inventario/hooks/useInventoryAPI.ts` — Hook de API unificada de inventário (pre-completed)
- [X] `apps/web/src/modules/inventario/hooks/useInventoryUnified.ts` — Hook unificado de inventário (pre-completed)
- [ ] `apps/web/src/modules/estoque/hooks/useAlertasEstoque.ts` — Hook para alertas e notificações (pending)
- [ ] `apps/web/src/modules/estoque/hooks/useCurvaABC.ts` — Hook para cálculo de curva ABC (pending)
- [ ] `apps/web/src/modules/estoque/hooks/useGiroEstoque.ts` — Hook para métricas de giro (pending)
- [ ] `apps/web/src/modules/estoque/hooks/useCustoMedio.ts` — Hook para custo médio histórico (pending)

### Pages
- [X] `apps/web/src/modules/estoque/ui/pages/EstoquePage.tsx` — Página principal de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueDashboardPage.tsx` — Dashboard de estoque (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueCadastrosPage.tsx` — Página de cadastros (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueMovimentacoesPage.tsx` — Página de movimentações (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueInventarioPage.tsx` — Página de inventário físico (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueAnalisePedidos.tsx` — Página de análise de pedidos (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueAnaliseConsumo.tsx` — Página de análise de consumo (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoquePedidosPage.tsx` — Página de pedidos (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueRequisicoesPage.tsx` — Página de requisições (pre-completed)
- [X] `apps/web/src/modules/estoque/ui/pages/EstoqueScannerMobile.tsx` — Página mobile de scanner (pre-completed)
- [X] `apps/web/src/modules/inventario/ui/pages/Dashboard.tsx` — Dashboard do módulo inventário (pre-completed)
- [ ] `apps/web/src/modules/estoque/ui/pages/RelatoriosEstoquePage.tsx` — Página de relatórios (curva ABC, giro, perdas) (pending)
- [ ] `apps/web/src/modules/estoque/ui/pages/AlertasEstoquePage.tsx` — Página dedicada de alertas (pending)

### Services
- [X] `apps/web/src/modules/estoque/infrastructure/repositories/ApiProdutoRepository.ts` — Repositório de produtos (pre-completed)
- [X] `apps/web/src/modules/estoque/infrastructure/repositories/ApiMovimentacaoEstoqueRepository.ts` — Repositório de movimentações (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/CreateProdutoUseCase.ts` — Use case de criação (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/UpdateProdutoUseCase.ts` — Use case de atualização (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/AjustarEstoqueUseCase.ts` — Use case de ajuste (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/RegistrarEntradaUseCase.ts` — Use case de entrada (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/RegistrarSaidaUseCase.ts` — Use case de saída (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/ListProdutosByClinicUseCase.ts` — Use case de listagem (pre-completed)
- [X] `apps/web/src/modules/estoque/application/use-cases/GetMovimentacoesByProdutoUseCase.ts` — Use case de movimentações (pre-completed)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/inventario/api/router.ts` — Rotas principais de inventário (pre-completed)
- [X] `backend/src/modules/inventario/api/dbRouter.ts` — Rotas de operações DB (pre-completed)
- [X] `backend/src/modules/inventario/api/InventarioController.ts` — Controller de inventário (pre-completed)
- [X] `backend/src/modules/inventario/api/ProdutoCommandController.ts` — Controller de comandos de produto (pre-completed)
- [X] `backend/src/modules/inventario/api/ProdutoQueryController.ts` — Controller de queries de produto (pre-completed)
- [ ] `backend/src/modules/inventario/api/AlertaController.ts` — Controller de alertas de estoque (pending)
- [ ] `backend/src/modules/inventario/api/RelatorioController.ts` — Controller de relatórios (pending)
- [ ] `backend/src/modules/inventario/api/FornecedorController.ts` — Controller de fornecedores (pending)
- [ ] `backend/src/modules/inventario/api/alertaRoutes.ts` — Rotas de alertas (pending)
- [ ] `backend/src/modules/inventario/api/relatorioRoutes.ts` — Rotas de relatórios (pending)

### Services / CQRS
- [X] `backend/src/modules/inventario/application/commands/CreateProdutoCommand.ts` — Comando de criação (pre-completed)
- [X] `backend/src/modules/inventario/application/commands/UpdateEstoqueCommand.ts` — Comando de atualização de estoque (pre-completed)
- [X] `backend/src/modules/inventario/application/queries/GetProdutoQuery.ts` — Query de produto (pre-completed)
- [X] `backend/src/modules/inventario/application/queries/ListProdutosQuery.ts` — Query de listagem (pre-completed)
- [X] `backend/src/modules/inventario/application/queries/GetEstoqueBaixoQuery.ts` — Query de estoque baixo (pre-completed)
- [X] `backend/src/modules/inventario/application/dto/ProdutoDTO.ts` — DTOs de produto (pre-completed)
- [X] `backend/src/modules/inventario/application/use-cases/CadastrarProdutoUseCase.ts` — Use case de cadastro (pre-completed)
- [ ] `backend/src/modules/inventario/application/commands/GerarAlertaCommand.ts` — Comando de geração de alerta (pending)
- [ ] `backend/src/modules/inventario/application/queries/GetCurvaABCQuery.ts` — Query de curva ABC (pending)
- [ ] `backend/src/modules/inventario/application/queries/GetGiroEstoqueQuery.ts` — Query de giro de estoque (pending)
- [ ] `backend/src/modules/inventario/application/queries/GetCustoMedioQuery.ts` — Query de custo médio (pending)

### Domain
- [X] `backend/src/modules/inventario/domain/entities/Produto.ts` — Entidade de produto (pre-completed)
- [X] `backend/src/modules/inventario/domain/events/ProdutoCriadoEvent.ts` — Evento de criação (pre-completed)
- [X] `backend/src/modules/inventario/domain/events/EstoqueAlteradoEvent.ts` — Evento de alteração de estoque (pre-completed)
- [X] `backend/src/modules/inventario/domain/repositories/IProdutoRepository.ts` — Interface do repositório (pre-completed)
- [X] `backend/src/modules/inventario/infrastructure/repositories/ProdutoRepositoryPostgres.ts` — Implementação Postgres (pre-completed)
- [X] `backend/src/modules/inventario/infrastructure/OperacionalDatabaseManager.ts` — Gerenciador DB operacional (pre-completed)
- [X] `backend/src/modules/inventario/infrastructure/OperacionalBackupService.ts` — Serviço de backup (pre-completed)
- [ ] `backend/src/modules/inventario/domain/entities/AlertaEstoque.ts` — Entidade de alerta (pending)
- [ ] `backend/src/modules/inventario/domain/entities/Fornecedor.ts` — Entidade de fornecedor (pending)
- [ ] `backend/src/modules/inventario/domain/repositories/IAlertaRepository.ts` — Interface de alertas (pending)
- [ ] `backend/src/modules/inventario/infrastructure/repositories/AlertaRepositoryPostgres.ts` — Implementação de alertas (pending)

## Shared Types
- [ ] `shared-types/src/inventario.ts` — Tipos compartilhados de produtos, movimentações e alertas (pending)

## Tests
- [X] `apps/web/src/modules/estoque/hooks/__tests__/useEstoqueStore.test.ts` — Testes do store (pre-completed)
- [X] `apps/web/src/modules/estoque/hooks/__tests__/useEstoque.test.ts` — Testes do hook de estoque (pre-completed)
- [ ] `backend/tests/unit/inventarioController.test.ts` — Testes do controller de inventário (pending)
- [ ] `backend/tests/unit/produtoController.test.ts` — Testes do controller de produtos (pending)
- [ ] `backend/tests/unit/alertaController.test.ts` — Testes de alertas (pending)
- [ ] `apps/web/src/modules/estoque/components/__tests__/AlertasEstoque.test.tsx` — Testes do painel de alertas (pending)
- [ ] `apps/web/src/modules/estoque/components/__tests__/InventarioContagemDialog.test.tsx` — Testes de contagem (pending)

## Summary
- Pre-completed: 42 files
- Pending: 25 files
- Total: 67 files
