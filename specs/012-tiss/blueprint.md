# Blueprint — Feature 012: Integração TISS e Convênios

## Overview
Gestão de operadoras de saúde, geração e envio de guias TISS, consulta de status de autorização e processamento de glosas. Integração via webservice SOAP com padrão TISS 3.0.0+.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/tiss/presentation/components/TISSDashboard.tsx` — Dashboard principal com visão geral de guias e batches
- [X] `apps/web/src/modules/tiss/presentation/components/TISSGuideForm.tsx` — Formulário de criação/edição de guia TISS
- [X] `apps/web/src/modules/tiss/presentation/components/TISSBatchList.tsx` — Listagem de lotes (batches) de guias enviadas
- [ ] `apps/web/src/modules/tiss/presentation/components/ConvenioForm.tsx` — Formulário de cadastro de convênios/operadoras
- [ ] `apps/web/src/modules/tiss/presentation/components/ConvenioList.tsx` — Listagem e gestão de convênios
- [ ] `apps/web/src/modules/tiss/presentation/components/AutorizacaoStatus.tsx` — Acompanhamento de status de autorização
- [ ] `apps/web/src/modules/tiss/presentation/components/GlosaList.tsx` — Listagem de glosas e recursos
- [ ] `apps/web/src/modules/tiss/presentation/components/GlosaForm.tsx` — Formulário de recurso de glosa

### Hooks
- [X] `apps/web/src/modules/tiss/application/hooks/useTISS.ts` — Hook principal de integração TISS
- [X] `apps/web/src/modules/tiss/application/hooks/useTISSGuides.ts` — Hook de gestão de guias TISS
- [ ] `apps/web/src/modules/tiss/application/hooks/useConvenios.ts` — CRUD de convênios
- [ ] `apps/web/src/modules/tiss/application/hooks/useAutorizacoes.ts` — Consulta e acompanhamento de autorizações
- [ ] `apps/web/src/modules/tiss/application/hooks/useGlosas.ts` — Gestão de glosas e recursos

### Pages
- [X] `apps/web/src/modules/tiss/ui/pages/tiss.tsx` — Página principal do módulo TISS
- [ ] `apps/web/src/modules/tiss/ui/pages/ConveniosPage.tsx` — Página de gestão de convênios
- [ ] `apps/web/src/modules/tiss/ui/pages/AutorizacoesPage.tsx` — Página de acompanhamento de autorizações
- [ ] `apps/web/src/modules/tiss/ui/pages/GlosasPage.tsx` — Página de faturamento de glosas

### Services (Frontend API)
- [ ] `apps/web/src/modules/tiss/services/tissApi.ts` — Camada de integração com backend TISS

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/tiss/api/controller.ts` — Controller TISS (404 linhas, endpoints existentes)
- [X] `backend/src/modules/tiss/api/router.ts` — Rotas Express do módulo TISS
- [X] `backend/src/modules/tiss/api/schemas.ts` — Schemas de validação Zod
- [ ] `backend/src/modules/tiss/api/types/` — DTOs e tipos do módulo

### Services
- [ ] `backend/src/modules/tiss/application/tissService.ts` — Camada de serviço com regras de negócio TISS
- [ ] `backend/src/modules/tiss/application/convenioService.ts` — Serviço de gestão de convênios
- [ ] `backend/src/modules/tiss/application/glosaService.ts` — Serviço de processamento de glosas

### Infrastructure
- [ ] `backend/src/modules/tiss/infrastructure/tissWebServiceClient.ts` — Client SOAP para webservice TISS

## Database (Prisma)
- [X] `backend/prisma/schema.prisma` — Models `tiss_batches` e `tiss_guides` existentes
- [ ] `backend/prisma/schema.prisma` — Model `Convenio` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `Autorizacao` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `Glosa` (não existe)

## Shared Types
- [ ] `shared-types/src/tiss.ts` — Tipos compartilhados TISS (não existe)
- [X] `apps/web/src/types/database.ts` — Tipos gerados pelo Prisma (inclui tiss_batches, tiss_guides)

## Tests
- [X] `backend/tests/unit/tissController.test.ts` — Testes unitários do controller TISS
- [X] `apps/web/src/modules/tiss/application/hooks/__tests__/useTISS.test.tsx` — Testes do hook useTISS
- [X] `apps/web/src/modules/tiss/application/hooks/__tests__/useTISSGuides.test.tsx` — Testes do hook useTISSGuides
- [X] `apps/web/src/modules/tiss/presentation/components/__tests__/TISSDashboard.test.tsx` — Testes do dashboard
- [X] `apps/web/src/modules/tiss/presentation/components/__tests__/TISSGuideForm.test.tsx` — Testes do formulário
- [X] `apps/web/src/modules/tiss/presentation/components/__tests__/TISSBatchList.test.tsx` — Testes da listagem
- [ ] `apps/web/src/modules/tiss/presentation/components/__tests__/ConvenioForm.test.tsx` — Testes do formulário de convênio
- [ ] `apps/web/src/modules/tiss/presentation/components/__tests__/GlosaList.test.tsx` — Testes da listagem de glosas
- [ ] `tests/e2e/tiss.spec.ts` — Testes E2E do fluxo TISS

## Summary
- Pre-completed: 14 files
- Pending: 19 files
- Total: 33 files
