# Blueprint — Feature 008: Ponto de Venda (PDV)

## Overview
Registro completo de transações de venda com pagamento misto/parcelado, controle de caixa (abertura/movimentação/fechamento), baixa automática de estoque e relatórios de vendas.

## Frontend Scaffold

### Components
- [X] `apps/web/src/components/pdv/AberturaCaixaDialog.tsx` — Dialog de abertura de caixa (pre-completed)
- [X] `apps/web/src/components/pdv/FechamentoCaixaDialog.tsx` — Dialog de fechamento de caixa (pre-completed)
- [X] `apps/web/src/components/pdv/RelatorioFechamentoCaixa.tsx` — Relatório de fechamento de caixa (pre-completed)
- [X] `apps/web/src/components/pdv/CupomFiscal.tsx` — Emissão/visualização de cupom fiscal (pre-completed)
- [X] `apps/web/src/components/pdv/CryptoPaymentPDV.tsx` — Pagamento cripto no PDV (pre-completed)
- [X] `apps/web/src/components/pdv/ConfiguracaoFiscal.tsx` — Configuração fiscal do PDV (pre-completed)
- [X] `apps/web/src/components/pdv/ConfiguracaoBancaria.tsx` — Configuração bancária (pre-completed)
- [X] `apps/web/src/components/pdv/IntegracaoTEF.tsx` — Integração com TEF (pre-completed)
- [X] `apps/web/src/components/pdv/SangriaInteligente.tsx` — Sangria inteligente com análise de risco (pre-completed)
- [X] `apps/web/src/components/pdv/ImpressoraFiscalConfig.tsx` — Configuração de impressora fiscal (pre-completed)
- [X] `apps/web/src/components/pdv/fechamento-caixa-dialog/SummaryCards.tsx` — Cards de resumo do fechamento (pre-completed)
- [X] `apps/web/src/components/pdv/relatorio-fechamento-caixa/ComparisonChart.tsx` — Gráfico comparativo sistema vs físico (pre-completed)
- [X] `apps/web/src/components/pdv/sangria-inteligente/AnaliseRiscoCard.tsx` — Card de análise de risco da sangria (pre-completed)
- [ ] `apps/web/src/components/pdv/VendaRapidaForm.tsx` — Formulário otimizado de venda rápida (< 1 min) (pending)
- [ ] `apps/web/src/components/pdv/PagamentoMistoForm.tsx` — Formulário de pagamento misto (cartão + PIX, etc.) (pending)
- [ ] `apps/web/src/components/pdv/ParcelamentoForm.tsx` — Configuração de parcelamento em até 12x (pending)
- [ ] `apps/web/src/components/pdv/RelatorioVendasPeriodo.tsx` — Relatório de vendas por período com filtros (pending)
- [ ] `apps/web/src/components/pdv/AlertaEstoqueBaixoVenda.tsx` — Alerta de estoque insuficiente no momento da venda (pending)

### Hooks
- [X] `apps/web/src/hooks/usePDV.ts` — Hook geral de operações PDV (pre-completed)
- [X] `apps/web/src/hooks/api/usePDV.ts` — React Query hooks para API PDV (pre-completed)
- [X] `apps/web/src/modules/pdv/hooks/usePDV.test.ts` — Testes do hook PDV (pre-completed)
- [X] `apps/web/src/modules/pdv/hooks/usePDVApi.test.tsx` — Testes do hook de API (pre-completed)
- [ ] `apps/web/src/modules/pdv/hooks/useVendaRapida.ts` — Hook otimizado para fluxo de venda rápida (pending)
- [ ] `apps/web/src/modules/pdv/hooks/usePagamentoMisto.ts` — Hook para múltiplas formas de pagamento (pending)
- [ ] `apps/web/src/modules/pdv/hooks/useControleCaixa.ts` — Hook para abertura/fechamento/movimentação de caixa (pending)
- [ ] `apps/web/src/modules/pdv/hooks/useRelatorioVendas.ts` — Hook para relatórios de vendas (pending)

### Pages
- [X] `apps/web/src/modules/pdv/ui/pages/PDVPage.tsx` — Página principal do PDV (pre-completed)
- [X] `apps/web/src/modules/pdv/ui/pages/DashboardExecutivoPDV.tsx` — Dashboard executivo de vendas (pre-completed)
- [X] `apps/web/src/modules/pdv/ui/pages/MetasGamificacao.tsx` — Página de metas e gamificação (pre-completed)
- [ ] `apps/web/src/modules/pdv/ui/pages/VendaRapidaPage.tsx` — Página dedicada à venda rápida (pending)
- [ ] `apps/web/src/modules/pdv/ui/pages/RelatorioVendasPage.tsx` — Página de relatórios de vendas (pending)
- [ ] `apps/web/src/modules/pdv/ui/pages/ControleCaixaPage.tsx` — Página de controle de caixa (pending)

### Services
- [X] `apps/web/src/modules/pdv/application/index.ts` — Índice de use cases da aplicação (pre-completed)
- [X] `apps/web/src/modules/pdv/domain/index.ts` — Índice de entidades de domínio (pre-completed)
- [X] `apps/web/src/modules/pdv/infrastructure/index.ts` — Índice de repositórios infra (pre-completed)
- [ ] `apps/web/src/modules/pdv/services/vendaApi.ts` — API client específico para vendas (pending)
- [ ] `apps/web/src/modules/pdv/services/caixaApi.ts` — API client específico para caixa (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/pdv/api/controller.ts` — Controller base do PDV (pre-completed)
- [X] `backend/src/modules/pdv/api/PdvController.ts` — Controller principal de vendas (pre-completed)
- [X] `backend/src/modules/pdv/api/PdvCommandController.ts` — Controller de comandos CQRS (pre-completed)
- [X] `backend/src/modules/pdv/api/PdvQueryController.ts` — Controller de queries CQRS (pre-completed)
- [X] `backend/src/modules/pdv/api/router.ts` — Rotas com clinicGuard (pre-completed)
- [ ] `backend/src/modules/pdv/api/CaixaController.ts` — Controller dedicado ao controle de caixa (pending)
- [ ] `backend/src/modules/pdv/api/RelatorioVendasController.ts` — Controller de relatórios de vendas (pending)
- [ ] `backend/src/modules/pdv/api/caixaRoutes.ts` — Rotas de caixa (pending)
- [ ] `backend/src/modules/pdv/api/relatorioRoutes.ts` — Rotas de relatórios (pending)

### Services / CQRS
- [X] `backend/src/modules/pdv/application/commands/CreateVendaCommand.ts` — Comando de criação de venda (pre-completed)
- [X] `backend/src/modules/pdv/application/commands/ConcluirVendaCommand.ts` — Comando de conclusão de venda (pre-completed)
- [X] `backend/src/modules/pdv/application/queries/ListVendasQuery.ts` — Query de listagem de vendas (pre-completed)
- [X] `backend/src/modules/pdv/application/queries/GetVendaQuery.ts` — Query de busca de venda (pre-completed)
- [X] `backend/src/modules/pdv/application/queries/GetVendasPorCaixaQuery.ts` — Query de vendas por caixa (pre-completed)
- [X] `backend/src/modules/pdv/application/dto/VendaDTO.ts` — DTOs de venda (pre-completed)
- [ ] `backend/src/modules/pdv/application/commands/AbrirCaixaCommand.ts` — Comando de abertura de caixa (pending)
- [ ] `backend/src/modules/pdv/application/commands/FecharCaixaCommand.ts` — Comando de fechamento de caixa (pending)
- [ ] `backend/src/modules/pdv/application/commands/RegistrarSangriaCommand.ts` — Comando de sangria (pending)
- [ ] `backend/src/modules/pdv/application/queries/GetFluxoCaixaQuery.ts` — Query de fluxo de caixa (pending)

### Domain
- [X] `backend/src/modules/pdv/domain/entities/Venda.ts` — Entidade de venda (pre-completed)
- [X] `backend/src/modules/pdv/domain/events/VendaRegistradaEvent.ts` — Evento de venda registrada (pre-completed)
- [X] `backend/src/modules/pdv/domain/repositories/IVendaRepository.ts` — Interface do repositório de vendas (pre-completed)
- [X] `backend/src/modules/pdv/infrastructure/repositories/VendaRepositoryPostgres.ts` — Implementação Postgres (pre-completed)
- [ ] `backend/src/modules/pdv/domain/entities/Caixa.ts` — Entidade de caixa (pending)
- [ ] `backend/src/modules/pdv/domain/entities/MovimentacaoCaixa.ts` — Entidade de movimentação de caixa (pending)
- [ ] `backend/src/modules/pdv/domain/repositories/ICaixaRepository.ts` — Interface do repositório de caixa (pending)
- [ ] `backend/src/modules/pdv/infrastructure/repositories/CaixaRepositoryPostgres.ts` — Implementação Postgres de caixa (pending)

## Shared Types
- [ ] `shared-types/src/pdv.ts` — Tipos compartilhados de vendas, caixa e movimentações (pending)

## Tests
- [X] `backend/tests/unit/pdvCommands.test.ts` — Testes unitários de comandos PDV (pre-completed)
- [X] `backend/tests/unit/pdvDomain.test.ts` — Testes unitários de domínio PDV (pre-completed)
- [X] `apps/web/src/modules/pdv/ui/pages/__tests__/PDVPage.test.tsx` — Testes da página PDV (pre-completed)
- [X] `apps/web/src/modules/pdv/ui/pages/__tests__/DashboardExecutivoPDV.test.tsx` — Testes do dashboard (pre-completed)
- [X] `apps/web/src/modules/pdv/ui/pages/__tests__/MetasGamificacao.test.tsx` — Testes de metas (pre-completed)
- [ ] `backend/tests/unit/caixaController.test.ts` — Testes do controller de caixa (pending)
- [ ] `backend/tests/unit/relatorioVendasController.test.ts` — Testes de relatórios (pending)
- [ ] `apps/web/src/components/pdv/__tests__/VendaRapidaForm.test.tsx` — Testes de venda rápida (pending)
- [ ] `apps/web/src/components/pdv/__tests__/PagamentoMistoForm.test.tsx` — Testes de pagamento misto (pending)

## Summary
- Pre-completed: 32 files
- Pending: 24 files
- Total: 56 files
