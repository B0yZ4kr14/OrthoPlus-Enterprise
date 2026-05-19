# Blueprint — Feature 007: Catálogo de Procedimentos

## Overview
Gestão completa do catálogo de procedimentos odontológicos, incluindo CRUD de procedimentos, tabela de preços por convênio/particular, associação dentista-procedimento, materiais/insumos e histórico de preços.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/procedimentos/components/ProcedimentosList.tsx` — Lista de procedimentos com filtros (pre-completed)
- [X] `apps/web/src/modules/procedimentos/components/ProcedimentoForm.tsx` — Formulário de cadastro/edição de procedimento (pre-completed)
- [X] `apps/web/src/modules/procedimentos/components/ProcedimentoDetails.tsx` — Detalhes do procedimento (pre-completed)
- [ ] `apps/web/src/modules/procedimentos/components/TabelaPrecosForm.tsx` — Formulário de tabela de preços por convênio (pending)
- [ ] `apps/web/src/modules/procedimentos/components/TabelaPrecosList.tsx` — Listagem de tabelas de preços (pending)
- [ ] `apps/web/src/modules/procedimentos/components/DentistaProcedimentoAssociation.tsx` — Associação de procedimentos habilitados por dentista (pending)
- [ ] `apps/web/src/modules/procedimentos/components/MateriaisNecessariosForm.tsx` — Vinculação de materiais/insumos ao procedimento (pending)
- [ ] `apps/web/src/modules/procedimentos/components/HistoricoPrecosChart.tsx` — Gráfico de evolução de preços (pending)
- [ ] `apps/web/src/modules/procedimentos/components/ReajusteLoteModal.tsx` — Modal de reajuste percentual em lote (pending)

### Hooks
- [X] `apps/web/src/modules/procedimentos/hooks/useProcedimentosStore.ts` — Zustand store para estado de procedimentos (pre-completed)
- [ ] `apps/web/src/modules/procedimentos/hooks/useProcedimentosQuery.ts` — React Query hooks para CRUD de procedimentos (pending)
- [ ] `apps/web/src/modules/procedimentos/hooks/useTabelaPrecos.ts` — Hooks para gestão de tabelas de preços (pending)
- [ ] `apps/web/src/modules/procedimentos/hooks/useDentistaProcedimento.ts` — Hooks para associação dentista-procedimento (pending)
- [ ] `apps/web/src/modules/procedimentos/hooks/useHistoricoPrecos.ts` — Hooks para histórico e reajuste de preços (pending)

### Pages
- [X] `apps/web/src/modules/procedimentos/ui/pages/ProcedimentosPage.tsx` — Página principal do catálogo (pre-completed)
- [X] `apps/web/src/modules/procedimentos/ui/pages/TemplatesProcedimentos.tsx` — Página de templates de procedimentos (pre-completed)
- [ ] `apps/web/src/modules/procedimentos/ui/pages/TabelaPrecosPage.tsx` — Página de tabelas de preços (pending)
- [ ] `apps/web/src/modules/procedimentos/ui/pages/DentistaProcedimentoPage.tsx` — Página de associação dentista-procedimento (pending)
- [ ] `apps/web/src/modules/procedimentos/ui/pages/HistoricoPrecosPage.tsx` — Página de histórico de preços (pending)

### Services
- [ ] `apps/web/src/modules/procedimentos/services/procedimentoApi.ts` — API client wrappers para procedimentos (pending)
- [ ] `apps/web/src/modules/procedimentos/services/tabelaPrecosApi.ts` — API client wrappers para tabelas de preços (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/procedimentos/api/controller.ts` — Controller CRUD de templates de procedimentos (pre-completed)
- [X] `backend/src/modules/procedimentos/api/router.ts` — Rotas com clinicGuard (pre-completed)
- [ ] `backend/src/modules/procedimentos/api/TabelaPrecosController.ts` — Controller de tabelas de preços (pending)
- [ ] `backend/src/modules/procedimentos/api/DentistaProcedimentoController.ts` — Controller de associação dentista-procedimento (pending)
- [ ] `backend/src/modules/procedimentos/api/HistoricoPrecosController.ts` — Controller de histórico de preços (pending)
- [ ] `backend/src/modules/procedimentos/api/tabelaPrecosRoutes.ts` — Rotas de tabela de preços (pending)
- [ ] `backend/src/modules/procedimentos/api/dentistaProcedimentoRoutes.ts` — Rotas de associação dentista-procedimento (pending)

### Services
- [ ] `backend/src/modules/procedimentos/procedimentosService.ts` — Camada de serviço para regras de negócio (pending)
- [ ] `backend/src/modules/procedimentos/tabelaPrecosService.ts` — Serviço de tabelas de preços (pending)
- [ ] `backend/src/modules/procedimentos/dentistaProcedimentoService.ts` — Serviço de associação dentista-procedimento (pending)
- [ ] `backend/src/modules/procedimentos/historicoPrecosService.ts` — Serviço de auditoria de reajustes (pending)

### Domain / DTOs
- [ ] `backend/src/modules/procedimentos/types/procedimentoDTO.ts` — DTOs e schemas Zod (pending)
- [ ] `backend/src/modules/procedimentos/types/tabelaPrecoDTO.ts` — DTOs de tabela de preços (pending)

## Shared Types
- [X] `shared-types/src/procedimentos.ts` — Tipos compartilhados de procedimentos (pre-completed)
- [ ] `shared-types/src/procedimentos.ts` (extend) — Adicionar tipos de TabelaPreco, PrecoItem, DentistaProcedimento (pending)

## Tests
- [X] `backend/tests/unit/procedimentosController.test.ts` — Testes unitários do controller (pre-completed)
- [X] `apps/web/src/modules/procedimentos/components/__tests__/ProcedimentosList.test.tsx` — Testes do componente de lista (pre-completed)
- [X] `apps/web/src/modules/procedimentos/hooks/__tests__/useProcedimentosStore.test.ts` — Testes do store (pre-completed)
- [X] `apps/web/src/modules/procedimentos/ui/pages/__tests__/TemplatesProcedimentos.test.tsx` — Testes da página de templates (pre-completed)
- [ ] `backend/tests/unit/tabelaPrecosService.test.ts` — Testes de tabela de preços (pending)
- [ ] `backend/tests/unit/dentistaProcedimentoService.test.ts` — Testes de associação (pending)
- [ ] `apps/web/src/modules/procedimentos/components/__tests__/TabelaPrecosForm.test.tsx` — Testes do formulário de preços (pending)
- [ ] `apps/web/src/modules/procedimentos/components/__tests__/DentistaProcedimentoAssociation.test.tsx` — Testes de associação (pending)

## Summary
- Pre-completed: 10 files
- Pending: 28 files
- Total: 38 files
