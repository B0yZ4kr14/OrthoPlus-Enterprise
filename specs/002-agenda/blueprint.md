# Blueprint — Feature 002: Agenda e Agendamentos

## Overview
Módulo de agenda operacional da clínica odontológica. Gerencia horários de dentistas, marcação de consultas, confirmações, bloqueios de horário e detecção de conflitos. Inclui calendário visual multi-modo (dia/semana/mês), confirmações automáticas e recall de pacientes.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/agenda/components/AgendaCalendar.tsx` — Calendário principal da agenda
- [X] `apps/web/src/modules/agenda/components/AppointmentDetails.tsx` — Detalhes do agendamento
- [X] `apps/web/src/modules/agenda/components/AppointmentForm.tsx` — Formulário de agendamento
- [X] `apps/web/src/modules/agenda/ui/components/AppointmentCard.tsx` — Card de agendamento
- [X] `apps/web/src/modules/agenda/ui/components/AppointmentDetailsDialog.tsx` — Dialog de detalhes
- [X] `apps/web/src/modules/agenda/ui/components/AppointmentForm.tsx` — Formulário de agendamento (UI)
- [X] `apps/web/src/modules/agenda/ui/components/BlockedTimeForm.tsx` — Formulário de bloqueio de horário
- [X] `apps/web/src/modules/agenda/ui/components/DentistScheduleForm.tsx` — Formulário de horário do dentista
- [X] `apps/web/src/modules/agenda/ui/components/WeekCalendar.tsx` — Calendário semanal
- [ ] `apps/web/src/modules/agenda/ui/components/MonthCalendar.tsx` — Calendário mensal (pending)
- [ ] `apps/web/src/modules/agenda/ui/components/DayCalendar.tsx` — Calendário diário com timeline vertical (pending)
- [ ] `apps/web/src/modules/agenda/ui/components/ConflictAlert.tsx` — Alerta de conflito de horário com sugestão (pending)
- [ ] `apps/web/src/modules/agenda/ui/components/ConfirmationPanel.tsx` — Painel de confirmações automáticas (pending)
- [ ] `apps/web/src/modules/agenda/ui/components/RecallList.tsx` — Lista de recall de pacientes (pending)

### Hooks
- [X] `apps/web/src/modules/agenda/hooks/useAgendaApi.ts` — Hook de API da agenda
- [X] `apps/web/src/modules/agenda/hooks/useAgendamentos.ts` — Hook de agendamentos
- [X] `apps/web/src/modules/agenda/hooks/useConfirmacoes.ts` — Hook de confirmações
- [X] `apps/web/src/modules/agenda/presentation/hooks/useAppointments.ts` — Hook de apresentação de agendamentos
- [X] `apps/web/src/modules/agenda/presentation/hooks/useBlockedTimes.ts` — Hook de horários bloqueados
- [X] `apps/web/src/modules/agenda/presentation/hooks/useDentistSchedules.ts` — Hook de horários dos dentistas
- [ ] `apps/web/src/modules/agenda/hooks/useRecall.ts` — Hook de recall de pacientes (pending)
- [ ] `apps/web/src/modules/agenda/hooks/useRealTimeUpdates.ts` — Hook para atualizações em tempo real/SSE (pending)

### Pages
- [X] `apps/web/src/modules/agenda/ui/pages/AgendaPage.tsx` — Página principal da agenda
- [X] `apps/web/src/modules/agenda/ui/pages/AgendaClinicaPage.tsx` — Página da agenda da clínica
- [ ] `apps/web/src/modules/agenda/ui/pages/ConfirmacoesPage.tsx` — Página de confirmações automáticas (pending)
- [ ] `apps/web/src/modules/agenda/ui/pages/BloqueiosPage.tsx` — Página de gestão de bloqueios (pending)

### Domain / Application (Clean Architecture)
- [X] `apps/web/src/modules/agenda/domain/entities/Appointment.ts` — Entidade Appointment
- [X] `apps/web/src/modules/agenda/domain/entities/BlockedTime.ts` — Entidade BlockedTime
- [X] `apps/web/src/modules/agenda/domain/entities/DentistSchedule.ts` — Entidade DentistSchedule
- [X] `apps/web/src/modules/agenda/domain/repositories/IAppointmentRepository.ts` — Repositório de agendamentos
- [X] `apps/web/src/modules/agenda/domain/repositories/IBlockedTimeRepository.ts` — Repositório de bloqueios
- [X] `apps/web/src/modules/agenda/domain/repositories/IDentistScheduleRepository.ts` — Repositório de horários
- [X] `apps/web/src/modules/agenda/infrastructure/repositories/AppointmentRepositoryApi.ts` — Repositório API de agendamentos
- [X] `apps/web/src/modules/agenda/infrastructure/repositories/BlockedTimeRepositoryApi.ts` — Repositório API de bloqueios
- [X] `apps/web/src/modules/agenda/infrastructure/repositories/DentistScheduleRepositoryApi.ts` — Repositório API de horários
- [X] `apps/web/src/modules/agenda/infrastructure/mappers/AppointmentMapper.ts` — Mapper de agendamentos
- [X] `apps/web/src/modules/agenda/infrastructure/mappers/BlockedTimeMapper.ts` — Mapper de bloqueios
- [X] `apps/web/src/modules/agenda/infrastructure/mappers/DentistScheduleMapper.ts` — Mapper de horários
- [X] `apps/web/src/modules/agenda/application/useCases/CreateAppointmentUseCase.ts` — UC criar agendamento
- [X] `apps/web/src/modules/agenda/application/useCases/UpdateAppointmentUseCase.ts` — UC atualizar agendamento
- [X] `apps/web/src/modules/agenda/application/useCases/CancelAppointmentUseCase.ts` — UC cancelar agendamento
- [X] `apps/web/src/modules/agenda/application/useCases/ConfirmAppointmentUseCase.ts` — UC confirmar agendamento
- [X] `apps/web/src/modules/agenda/application/useCases/ListAppointmentsUseCase.ts` — UC listar agendamentos
- [X] `apps/web/src/modules/agenda/application/useCases/CreateBlockedTimeUseCase.ts` — UC criar bloqueio
- [X] `apps/web/src/modules/agenda/application/useCases/DeleteBlockedTimeUseCase.ts` — UC deletar bloqueio
- [X] `apps/web/src/modules/agenda/application/useCases/ListBlockedTimesUseCase.ts` — UC listar bloqueios
- [X] `apps/web/src/modules/agenda/application/useCases/CreateDentistScheduleUseCase.ts` — UC criar horário dentista
- [X] `apps/web/src/modules/agenda/application/useCases/ListDentistSchedulesUseCase.ts` — UC listar horários dentista
- [X] `apps/web/src/modules/agenda/application/useCases/UpdateDentistScheduleUseCase.ts` — UC atualizar horário dentista
- [X] `apps/web/src/modules/agenda/presentation/contexts/AgendaContext.tsx` — Contexto da agenda

### Types
- [X] `apps/web/src/modules/agenda/types/agenda.types.ts` — Tipos da agenda
- [ ] `apps/web/src/modules/agenda/types/confirmation.types.ts` — Tipos de confirmação (pending)
- [ ] `apps/web/src/modules/agenda/types/recall.types.ts` — Tipos de recall (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/agenda/api/agendaController.ts` — Controller da agenda
- [X] `backend/src/modules/agenda/api/router.ts` — Rotas da agenda
- [ ] `backend/src/modules/agenda/api/confirmationController.ts` — Controller de confirmações (pending)
- [ ] `backend/src/modules/agenda/api/recallController.ts` — Controller de recall (pending)

### Services / Commands
- [X] `backend/src/modules/agenda/application/commands/CreateAppointmentCommand.ts` — Comando criar agendamento
- [ ] `backend/src/modules/agenda/application/commands/UpdateAppointmentCommand.ts` — Comando atualizar agendamento (pending)
- [ ] `backend/src/modules/agenda/application/commands/CancelAppointmentCommand.ts` — Comando cancelar agendamento (pending)
- [ ] `backend/src/modules/agenda/application/commands/ConfirmAppointmentCommand.ts` — Comando confirmar agendamento (pending)
- [ ] `backend/src/modules/agenda/application/services/AgendaService.ts` — Serviço de negócio da agenda (pending)
- [ ] `backend/src/modules/agenda/application/services/ConfirmationService.ts` — Serviço de confirmações (pending)
- [ ] `backend/src/modules/agenda/application/services/ConflictDetectionService.ts` — Serviço de detecção de conflitos (pending)

### Domain
- [X] `backend/src/modules/agenda/domain/entities/Appointment.ts` — Entidade Appointment
- [X] `backend/src/modules/agenda/domain/events/AppointmentCreatedEvent.ts` — Evento de agendamento criado
- [X] `backend/src/modules/agenda/domain/repositories/IAppointmentRepository.ts` — Interface repositório
- [ ] `backend/src/modules/agenda/domain/entities/BlockedTime.ts` — Entidade BlockedTime (pending)
- [ ] `backend/src/modules/agenda/domain/entities/DentistSchedule.ts` — Entidade DentistSchedule (pending)
- [ ] `backend/src/modules/agenda/domain/events/AppointmentConfirmedEvent.ts` — Evento de confirmação (pending)
- [ ] `backend/src/modules/agenda/domain/events/AppointmentCancelledEvent.ts` — Evento de cancelamento (pending)

### Infrastructure
- [ ] `backend/src/modules/agenda/infrastructure/repositories/AppointmentRepositoryPrisma.ts` — Repositório Prisma (pending)
- [ ] `backend/src/modules/agenda/infrastructure/repositories/BlockedTimeRepositoryPrisma.ts` — Repositório Prisma bloqueios (pending)

## Shared Types
- [X] `apps/web/src/domain/entities/Agendamento.ts` — Entidade Agendamento (shared)
- [X] `apps/web/src/domain/repositories/IAgendamentoRepository.ts` — Repositório shared
- [X] `apps/web/src/infrastructure/repositories/DbAgendamentoRepository.ts` — Repositório DB shared
- [X] `apps/web/src/infrastructure/repositories/mappers/AgendamentoMapper.ts` — Mapper shared
- [X] `apps/web/src/application/use-cases/agenda/CreateAgendamentoUseCase.ts` — UC criar (shared)
- [X] `apps/web/src/application/use-cases/agenda/UpdateAgendamentoUseCase.ts` — UC atualizar (shared)
- [X] `apps/web/src/application/use-cases/agenda/CancelAgendamentoUseCase.ts` — UC cancelar (shared)
- [X] `apps/web/src/application/use-cases/agenda/GetAgendamentosByDateRangeUseCase.ts` — UC buscar por range (shared)

## Tests
- [X] `backend/tests/unit/agendaCommands.test.ts` — Testes de comandos da agenda
- [X] `backend/tests/unit/agendaDomain.test.ts` — Testes de domínio da agenda
- [X] `apps/web/src/modules/agenda/application/useCases/__tests__/CreateAppointmentUseCase.test.ts` — Teste UC criar
- [X] `apps/web/src/modules/agenda/application/useCases/__tests__/CancelAppointmentUseCase.test.ts` — Teste UC cancelar
- [X] `apps/web/src/modules/agenda/application/useCases/__tests__/ListAppointmentsUseCase.test.ts` — Teste UC listar
- [X] `apps/web/src/modules/agenda/domain/entities/__tests__/Appointment.test.ts` — Teste entidade Appointment
- [X] `apps/web/src/modules/agenda/domain/entities/__tests__/BlockedTime.test.ts` — Teste entidade BlockedTime
- [X] `apps/web/src/modules/agenda/infrastructure/mappers/__tests__/AppointmentMapper.test.ts` — Teste mapper
- [X] `apps/web/src/modules/agenda/presentation/contexts/__tests__/AgendaContext.test.tsx` — Teste contexto
- [X] `apps/web/src/modules/agenda/presentation/hooks/__tests__/useAppointments.test.tsx` — Teste hook
- [X] `apps/web/src/modules/agenda/ui/pages/__tests__/AgendaPage.test.tsx` — Teste página
- [ ] `backend/tests/unit/agendaConfirmation.test.ts` — Testes de confirmação (pending)
- [ ] `backend/tests/unit/agendaConflict.test.ts` — Testes de detecção de conflito (pending)
- [ ] `tests/e2e/agenda.spec.ts` — Teste E2E da agenda (pending)

## Summary
- Pre-completed: 48 files
- Pending: 28 files
- Total: 76 files
