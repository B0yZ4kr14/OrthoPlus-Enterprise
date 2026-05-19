# Blueprint — Feature 006: Gestão de Orçamentos

## Overview
Sistema de criação, aprovação e acompanhamento de orçamentos de tratamento odontológico. Permite seleção de procedimentos do catálogo, cálculo automático de valores, descontos configuráveis, aprovação digital pelo paciente e geração automática de contas a receber no financeiro.

## Frontend Scaffold

### Components
- [X] `apps/web/src/components/financeiro/OrcamentoForm.tsx` — Formulário de orçamento (shared)
- [X] `apps/web/src/components/patients/tabs/financial-tab/BudgetCard.tsx` — Card de orçamento
- [X] `apps/web/src/components/patients/tabs/financial-tab/BudgetList.tsx` — Lista de orçamentos
- [X] `apps/web/src/components/patients/tabs/financial-tab/BudgetsList.tsx` — Lista de orçamentos alternativa
- [X] `apps/web/src/components/patients/tabs/financial-tab/BudgetStatusBadge.tsx` — Badge de status
- [X] `apps/web/src/components/patients/tabs/treatment-plan-tab/TreatmentPlanTab.tsx` — Tab de plano de tratamento
- [X] `apps/web/src/components/patients/tabs/TreatmentPlanTab.tsx` — Tab plano de tratamento alternativa
- [ ] `apps/web/src/modules/orcamentos/ui/components/OrcamentoWizard.tsx` — Wizard de criação de orçamento (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/components/ProcedimentoSelector.tsx` — Seletor de procedimentos (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/components/DescontoConfig.tsx` — Configuração de desconto (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/components/AprovacaoPanel.tsx` — Painel de aprovação digital (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/components/VersionComparator.tsx` — Comparador de versões (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/components/ConversaoDashboard.tsx` — Dashboard de conversão (pending)

### Hooks
- [X] `apps/web/src/modules/orcamentos/hooks/useOrcamentos.ts` — Hook de orçamentos
- [X] `apps/web/src/modules/orcamentos/hooks/useItensOrcamento.ts` — Hook de itens
- [X] `apps/web/src/modules/orcamentos/presentation/hooks/useOrcamentos.ts` — Hook de apresentação
- [ ] `apps/web/src/modules/orcamentos/hooks/useAprovacao.ts` — Hook de aprovação (pending)
- [ ] `apps/web/src/modules/orcamentos/hooks/useConversaoMetrics.ts` — Hook de métricas de conversão (pending)
- [ ] `apps/web/src/modules/orcamentos/hooks/useOrcamentoVersions.ts` — Hook de versões (pending)

### Pages
- [X] `apps/web/src/modules/orcamentos/ui/pages/OrcamentosPage.tsx` — Página de orçamentos
- [X] `apps/web/src/modules/orcamentos/ui/pages/OrcamentoFormPage.tsx` — Página de formulário
- [X] `apps/web/src/modules/core/ui/pages/Orcamentos.tsx` — Página core de orçamentos
- [ ] `apps/web/src/modules/orcamentos/ui/pages/AprovacaoPortalPage.tsx` — Página de aprovação do portal (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/pages/ConversaoDashboardPage.tsx` — Página de dashboard de conversão (pending)
- [ ] `apps/web/src/modules/orcamentos/ui/pages/RevisaoOrcamentoPage.tsx` — Página de revisão (pending)

### Domain / Application (Clean Architecture)
- [X] `apps/web/src/modules/orcamentos/domain/entities/Orcamento.ts` — Entidade Orcamento
- [X] `apps/web/src/modules/orcamentos/domain/entities/ItemOrcamento.ts` — Entidade ItemOrcamento
- [X] `apps/web/src/modules/orcamentos/domain/repositories/IOrcamentoRepository.ts` — Repositório de orçamentos
- [X] `apps/web/src/modules/orcamentos/domain/repositories/IItemOrcamentoRepository.ts` — Repositório de itens
- [X] `apps/web/src/modules/orcamentos/infrastructure/repositories/OrcamentoRepositoryApi.ts` — Repositório API orçamentos
- [X] `apps/web/src/modules/orcamentos/infrastructure/repositories/ItemOrcamentoRepositoryApi.ts` — Repositório API itens
- [X] `apps/web/src/modules/orcamentos/application/use-cases/CreateOrcamentoUseCase.ts` — UC criar orçamento
- [X] `apps/web/src/modules/orcamentos/application/use-cases/AprovarOrcamentoUseCase.ts` — UC aprovar orçamento
- [X] `apps/web/src/modules/orcamentos/application/use-cases/EnviarOrcamentoUseCase.ts` — UC enviar orçamento
- [X] `apps/web/src/modules/orcamentos/application/use-cases/ListOrcamentosUseCase.ts` — UC listar orçamentos
- [X] `apps/web/src/modules/orcamentos/index.ts` — Index do módulo
- [X] `apps/web/src/modules/orcamentos/domain/index.ts` — Index de domínio
- [X] `apps/web/src/modules/orcamentos/infrastructure/index.ts` — Index de infraestrutura
- [X] `apps/web/src/modules/orcamentos/ui/index.ts` — Index de UI
- [X] `apps/web/src/modules/orcamentos/hooks/index.ts` — Index de hooks
- [ ] `apps/web/src/modules/orcamentos/application/use-cases/RejeitarOrcamentoUseCase.ts` — UC rejeitar orçamento (pending — exists in shared but not module)
- [ ] `apps/web/src/modules/orcamentos/application/use-cases/RevisarOrcamentoUseCase.ts` — UC revisar orçamento (pending)
- [ ] `apps/web/src/modules/orcamentos/application/use-cases/GerarContasReceberUseCase.ts` — UC gerar contas a receber (pending)

### Types
- [X] `apps/web/src/modules/orcamentos/types/orcamento.types.ts` — Tipos de orçamento
- [ ] `apps/web/src/modules/orcamentos/types/aprovacao.types.ts` — Tipos de aprovação (pending)
- [ ] `apps/web/src/modules/orcamentos/types/conversao.types.ts` — Tipos de conversão (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/orcamentos/api/controller.ts` — Controller de orçamentos
- [X] `backend/src/modules/orcamentos/api/router.ts` — Rotas de orçamentos
- [X] `backend/src/modules/orcamentos/api/schemas.ts` — Schemas de validação
- [ ] `backend/src/modules/orcamentos/api/aprovacaoController.ts` — Controller de aprovação (pending)
- [ ] `backend/src/modules/orcamentos/api/relatorioController.ts` — Controller de relatórios (pending)

### Services
- [X] `backend/src/modules/orcamentos/application/services/OrcamentoService.ts` — Serviço de orçamentos
- [ ] `backend/src/modules/orcamentos/application/services/AprovacaoService.ts` — Serviço de aprovação (pending)
- [ ] `backend/src/modules/orcamentos/application/services/RelatorioConversaoService.ts` — Serviço de relatório de conversão (pending)
- [ ] `backend/src/modules/orcamentos/application/services/VersionamentoService.ts` — Serviço de versionamento (pending)
- [ ] `backend/src/modules/orcamentos/application/services/GerarParcelasService.ts` — Serviço de geração de parcelas (pending)

### Domain
- [ ] `backend/src/modules/orcamentos/domain/entities/Orcamento.ts` — Entidade Orcamento (pending)
- [ ] `backend/src/modules/orcamentos/domain/entities/ItemOrcamento.ts` — Entidade ItemOrcamento (pending)
- [ ] `backend/src/modules/orcamentos/domain/entities/ProcedimentoCatalogo.ts` — Entidade ProcedimentoCatalogo (pending)
- [ ] `backend/src/modules/orcamentos/domain/repositories/IOrcamentoRepository.ts` — Repositório (pending)
- [ ] `backend/src/modules/orcamentos/domain/events/OrcamentoAprovadoEvent.ts` — Evento de aprovação (pending)
- [ ] `backend/src/modules/orcamentos/domain/events/OrcamentoRejeitadoEvent.ts` — Evento de rejeição (pending)
- [ ] `backend/src/modules/orcamentos/domain/events/OrcamentoRevisadoEvent.ts` — Evento de revisão (pending)

### Infrastructure
- [ ] `backend/src/modules/orcamentos/infrastructure/repositories/OrcamentoRepositoryPrisma.ts` — Repositório Prisma (pending)
- [ ] `backend/src/modules/orcamentos/infrastructure/repositories/ItemOrcamentoRepositoryPrisma.ts` — Repositório Prisma itens (pending)
- [ ] `backend/src/modules/orcamentos/infrastructure/email/OrcamentoEmailService.ts` — Serviço de email (pending)

## Shared Types
- [X] `apps/web/src/domain/aggregates/OrcamentoAggregate.ts` — Aggregate Orcamento
- [X] `apps/web/src/domain/entities/Orcamento.ts` — Entidade Orcamento (shared)
- [X] `apps/web/src/domain/entities/ItemOrcamento.ts` — Entidade ItemOrcamento (shared)
- [X] `apps/web/src/domain/repositories/IOrcamentoRepository.ts` — Repositório shared
- [X] `apps/web/src/domain/repositories/IItemOrcamentoRepository.ts` — Repositório itens shared
- [X] `apps/web/src/domain/events/OrcamentoEvents.ts` — Eventos de orçamento
- [X] `apps/web/src/lib/adapters/orcamentoAdapter.ts` — Adapter de orçamento
- [X] `apps/web/src/application/use-cases/orcamentos/CreateOrcamentoUseCase.ts` — UC criar (shared)
- [X] `apps/web/src/application/use-cases/orcamentos/UpdateOrcamentoUseCase.ts` — UC atualizar (shared)
- [X] `apps/web/src/application/use-cases/orcamentos/AddItemOrcamentoUseCase.ts` — UC adicionar item (shared)
- [X] `apps/web/src/application/use-cases/orcamentos/AprovarOrcamentoUseCase.ts` — UC aprovar (shared)
- [X] `apps/web/src/application/use-cases/orcamentos/RejeitarOrcamentoUseCase.ts` — UC rejeitar (shared)
- [X] `apps/web/src/components/patients/tabs/treatment-plan-tab/useTreatmentPlan.tsx` — Hook plano de tratamento

## Tests
- [X] `backend/tests/unit/orcamentosController.test.ts` — Testes do controller
- [X] `apps/web/src/modules/orcamentos/hooks/__tests__/useOrcamentos.test.tsx` — Teste hook orçamentos
- [X] `apps/web/src/modules/orcamentos/presentation/hooks/__tests__/useOrcamentos.test.ts` — Teste hook apresentação
- [X] `apps/web/src/modules/orcamentos/ui/pages/__tests__/OrcamentosPage.test.tsx` — Teste página
- [ ] `backend/tests/unit/orcamentosService.test.ts` — Testes do serviço (pending)
- [ ] `backend/tests/unit/orcamentosAprovacao.test.ts` — Testes de aprovação (pending)
- [ ] `tests/e2e/orcamentos.spec.ts` — Teste E2E de orçamentos (pending)

## Summary
- Pre-completed: 43 files
- Pending: 32 files
- Total: 75 files
