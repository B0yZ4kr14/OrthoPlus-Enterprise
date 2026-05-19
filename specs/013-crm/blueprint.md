# Blueprint — Feature 013: CRM e Marketing

## Overview
Criação e execução de campanhas de marketing, fluxos automáticos baseados em eventos, visualização do funil de conversão do paciente e coleta de feedback via NPS.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/crm/presentation/components/LeadCard.tsx` — Card de lead no kanban
- [X] `apps/web/src/modules/crm/presentation/components/LeadForm.tsx` — Formulário de lead
- [X] `apps/web/src/modules/crm/presentation/components/LeadKanban.tsx` — Board kanban de leads
- [X] `apps/web/src/modules/crm/presentation/components/AtividadesList.tsx` — Listagem de atividades
- [X] `apps/web/src/components/crm/lead-card/constants/status.ts` — Constantes de status do lead
- [X] `apps/web/src/components/crm/lead-form/LeadForm.tsx` — Componente alternativo de formulário
- [ ] `apps/web/src/modules/crm/presentation/components/CampanhaForm.tsx` — Formulário de criação de campanha
- [ ] `apps/web/src/modules/crm/presentation/components/CampanhaList.tsx` — Listagem de campanhas de marketing
- [ ] `apps/web/src/modules/crm/presentation/components/AutomacaoForm.tsx` — Formulário de fluxos automáticos
- [ ] `apps/web/src/modules/crm/presentation/components/FunilChart.tsx` — Visualização gráfica do funil de conversão
- [ ] `apps/web/src/modules/crm/presentation/components/NPSSurvey.tsx` — Pesquisa de satisfação NPS
- [ ] `apps/web/src/modules/crm/presentation/components/NPSReport.tsx` — Relatório de satisfação

### Hooks
- [X] `apps/web/src/modules/crm/presentation/hooks/useLeads.ts` — Hook de gestão de leads
- [X] `apps/web/src/modules/crm/presentation/hooks/useAtividades.ts` — Hook de atividades
- [ ] `apps/web/src/modules/crm/presentation/hooks/useCampanhas.ts` — Hook de campanhas
- [ ] `apps/web/src/modules/crm/presentation/hooks/useAutomacoes.ts` — Hook de automações
- [ ] `apps/web/src/modules/crm/presentation/hooks/useNPS.ts` — Hook de pesquisa NPS

### Pages
- [X] `apps/web/src/modules/crm/ui/pages/crm.tsx` — Página principal CRM
- [X] `apps/web/src/modules/crm/ui/pages/CRMFunil.tsx` — Página do funil de conversão
- [ ] `apps/web/src/modules/crm/ui/pages/CampanhasPage.tsx` — Página de campanhas
- [ ] `apps/web/src/modules/crm/ui/pages/AutomacoesPage.tsx` — Página de automações
- [ ] `apps/web/src/modules/crm/ui/pages/NPSPage.tsx` — Página de pesquisa NPS

### Domain (Clean Architecture)
- [X] `apps/web/src/modules/crm/domain/entities/Lead.ts` — Entidade Lead
- [X] `apps/web/src/modules/crm/domain/entities/Atividade.ts` — Entidade Atividade
- [X] `apps/web/src/modules/crm/domain/aggregates/Lead.ts` — Aggregate Lead
- [X] `apps/web/src/modules/crm/domain/repositories/ILeadRepository.ts` — Interface de repositório
- [X] `apps/web/src/modules/crm/domain/repositories/IAtividadeRepository.ts` — Interface de repositório
- [X] `apps/web/src/modules/crm/domain/events/LeadConvertedEvent.ts` — Evento de conversão

### Application (Clean Architecture)
- [X] `apps/web/src/modules/crm/application/use-cases/CreateLeadUseCase.ts` — Criação de lead
- [X] `apps/web/src/modules/crm/application/use-cases/UpdateLeadStatusUseCase.ts` — Atualização de status
- [X] `apps/web/src/modules/crm/application/use-cases/GetLeadsByStatusUseCase.ts` — Busca por status
- [X] `apps/web/src/modules/crm/application/use-cases/CreateAtividadeUseCase.ts` — Criação de atividade
- [X] `apps/web/src/modules/crm/application/use-cases/ConcluirAtividadeUseCase.ts` — Conclusão de atividade

### Infrastructure (Clean Architecture)
- [X] `apps/web/src/modules/crm/infrastructure/repositories/LeadRepositoryApi.ts` — Repositório Lead
- [X] `apps/web/src/modules/crm/infrastructure/repositories/AtividadeRepositoryApi.ts` — Repositório Atividade
- [X] `apps/web/src/modules/crm/infrastructure/mappers/LeadMapper.ts` — Mapper Lead
- [X] `apps/web/src/modules/crm/infrastructure/mappers/AtividadeMapper.ts` — Mapper Atividade

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/crm/api/controller.ts` — Controller CRM
- [X] `backend/src/modules/crm/api/dbRouter.ts` — Rotas de banco comercial
- [X] `backend/src/modules/crm/api/router.ts` — Rotas principais CRM
- [X] `backend/src/modules/crm/api/schemas.ts` — Schemas Zod
- [X] `backend/src/modules/crm/infrastructure/ComercialBackupService.ts` — Serviço de backup
- [X] `backend/src/modules/crm/infrastructure/ComercialDatabaseManager.ts` — Gerenciador de DB
- [ ] `backend/src/modules/crm/api/types/` — DTOs e tipos do módulo

### Services
- [ ] `backend/src/modules/crm/application/campanhaService.ts` — Serviço de campanhas
- [ ] `backend/src/modules/crm/application/automacaoService.ts` — Serviço de automações
- [ ] `backend/src/modules/crm/application/npsService.ts` — Serviço de pesquisa NPS
- [ ] `backend/src/modules/crm/application/funilService.ts` — Serviço de funil de conversão

## Database (Prisma)
- [X] `backend/prisma/schema.prisma` — Model `campanhas_marketing`
- [X] `backend/prisma/schema.prisma` — Model `campanha_envios`
- [X] `backend/prisma/schema.prisma` — Model `campanhas_inadimplencia`

## Shared Types
- [X] `apps/web/src/types/database.ts` — Tipos gerados pelo Prisma
- [ ] `shared-types/src/crm.ts` — Tipos compartilhados CRM (não existe)

## Tests
- [X] `backend/tests/unit/crmController.test.ts` — Testes unitários do controller
- [X] `apps/web/src/modules/crm/presentation/hooks/__tests__/useLeads.test.tsx` — Testes useLeads
- [X] `apps/web/src/modules/crm/presentation/hooks/__tests__/useAtividades.test.tsx` — Testes useAtividades
- [X] `apps/web/src/modules/crm/presentation/components/__tests__/LeadCard.test.tsx` — Testes LeadCard
- [X] `apps/web/src/modules/crm/domain/aggregates/__tests__/Lead.test.ts` — Testes de domínio
- [ ] `backend/tests/unit/campanhaService.test.ts` — Testes de campanha
- [ ] `backend/tests/unit/npsService.test.ts` — Testes de NPS
- [ ] `tests/e2e/crm.spec.ts` — Testes E2E do fluxo CRM

## Summary
- Pre-completed: 26 files
- Pending: 16 files
- Total: 42 files
