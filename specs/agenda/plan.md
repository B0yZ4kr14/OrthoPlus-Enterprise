# Implementation Plan: Agenda (Gestao de Agendamentos)

**Status**: `migrated` — Feature already implemented  
**Migration date**: 2026-05-18

---

## Summary

Sistema de agenda odontologica implementado com Clean Architecture no frontend e CRUD Express no backend. Suporta criacao, confirmacao, cancelamento e reagendamento de consultas, alem de gerenciamento de horarios de trabalho e bloqueios.

**Complexity**: Medium-High (6.681 frontend lines + 861 backend lines, 12 test files)

---

## Technical Context

### Frontend Stack
- **Framework**: React 18.3 + Vite 8
- **State Management**: TanStack React Query (server state) + AgendaContext (local state)
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation → UI)
- **Styling**: Tailwind CSS 3.4 + Radix UI primitives via `@orthoplus/core-ui`
- **Notifications**: sonner toasts

### Backend Stack
- **Framework**: Express 4 + TypeScript
- **ORM**: Prisma 6 (PostgreSQL)
- **Validation**: Zod 3
- **Auth**: JWT + clinicGuard middleware (multi-tenant)
- **Logging**: Winston

### API Contract
- Base path: `/api/agenda`
- All routes protected by `clinicGuard`
- Content-type: JSON

---

## Constitution Check

| Principle | Status | Detail |
|-----------|--------|--------|
| CQ-1 TypeScript Strictness | Pass | Frontend uses strict types. Backend controller compiles under strict mode (`@ts-nocheck` removed). |
| CQ-2 No new `as any` | Pass | `@ts-expect-error` removed from `CreateAppointmentUseCase`. `AppointmentType` used strictly. |
| FE-5 Component Placement | Pass | All agenda components live in `modules/agenda/`. |
| FE-6 Barrel File Policy | Pass | `index.ts` files at each layer boundary. |
| SEC-2.4 Token Storage | Warning | `useAuth()` reads from context — verify not using localStorage. |
| DB-1 Prisma as Primary ORM | Pass | All CRUD via Prisma. No raw SQL. |
| AS-1 Python Boundary | N/A | Agenda is pure TypeScript stack. |

---

## Project Structure

```
apps/web/src/modules/agenda/
├── domain/
│   ├── entities/
│   │   ├── Appointment.ts          # Domain entity with validation + business rules
│   │   ├── BlockedTime.ts          # Blocked period entity
│   │   └── DentistSchedule.ts      # Working hours entity
│   ├── repositories/
│   │   ├── IAppointmentRepository.ts
│   │   ├── IBlockedTimeRepository.ts
│   │   └── IDentistScheduleRepository.ts
│   └── events/
│       └── AppointmentScheduledEvent.ts
├── application/
│   └── useCases/
│       ├── CreateAppointmentUseCase.ts
│       ├── UpdateAppointmentUseCase.ts
│       ├── CancelAppointmentUseCase.ts
│       ├── ConfirmAppointmentUseCase.ts
│       ├── ListAppointmentsUseCase.ts
│       ├── CreateBlockedTimeUseCase.ts
│       ├── DeleteBlockedTimeUseCase.ts
│       ├── ListBlockedTimesUseCase.ts
│       ├── CreateDentistScheduleUseCase.ts
│       ├── UpdateDentistScheduleUseCase.ts
│       ├── ListDentistSchedulesUseCase.ts
│       └── DeleteDentistScheduleUseCase.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── AppointmentRepositoryApi.ts
│   │   ├── BlockedTimeRepositoryApi.ts
│   │   └── DentistScheduleRepositoryApi.ts
│   └── mappers/
│       ├── AppointmentMapper.ts
│       ├── BlockedTimeMapper.ts
│       └── DentistScheduleMapper.ts
├── presentation/
│   ├── contexts/
│   │   └── AgendaContext.tsx       # Week navigation state
│   └── hooks/
│       ├── useAppointments.ts      # TanStack Query + Use Cases composition
│       ├── useBlockedTimes.ts
│       └── useDentistSchedules.ts
├── ui/
│   ├── components/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentDetailsDialog.tsx
│   │   ├── WeekCalendar.tsx
│   │   ├── BlockedTimeForm.tsx
│   │   └── DentistScheduleForm.tsx
│   └── pages/
│       ├── AgendaPage.tsx          # Main page with Tabs (Calendar/List)
│       └── AgendaClinicaPage.tsx
└── types/
    └── agenda.types.ts

backend/src/modules/agenda/
├── api/
│   ├── router.ts                   # Express router with all CRUD routes
│   └── agendaController.ts         # Route handlers (~700 lines, strict mode)
├── application/
│   └── commands/
│       └── CreateAppointmentCommand.ts
└── domain/
    ├── entities/
    │   └── Appointment.ts
    ├── events/
    │   └── AppointmentCreatedEvent.ts
    └── repositories/
        └── IAppointmentRepository.ts

tests/e2e/agenda.spec.ts            # 10 E2E scenarios
```

---

## Deployment Context

- **Route**: `/agenda` (SPA route)
- **API**: `/api/agenda/*` → backend port 3005
- **Database**: PostgreSQL via Prisma (`appointments`, `appointment_confirmations`, `blocked_times`, `dentist_schedules` tables)
- **Multi-tenant**: All queries filtered by `clinic_id`

---

## Complexity Tracking

| Layer | Files | Lines | Test Coverage |
|-------|-------|-------|---------------|
| Domain (entities) | 3 | ~400 | Partial (entity tests exist) |
| Application (use cases) | 11 | ~700 | Partial (3 use case tests) |
| Infrastructure | 6 | ~500 | Partial (mapper tests) |
| Presentation | 4 | ~400 | Partial (context + hook tests) |
| UI Components | 8 | ~1.800 | Partial (page test) |
| Backend API | 2 | ~860 | Partial (domain + command tests) |
| E2E | 1 | ~230 | Full (10 scenarios) |

**Total**: 35 files, ~4.890 lines of source code

---

## Technical Decisions (Reverse-Engineered)

1. **Clean Architecture on Frontend**: Domain entities encapsulate business rules (status transitions, conflict detection, validation). This isolates business logic from React components.
2. **Repository Pattern**: Interfaces in domain, concrete API implementations in infrastructure. Enables swapping API for local storage in tests.
3. **TanStack Query + Use Cases**: Presentation hooks compose use cases with React Query for caching, optimistic updates, and error handling.
4. **Backend Partial Clean Architecture**: `createAppointment` delegates to `CreateAppointmentCommandHandler` + `AppointmentRepositoryPostgres`. Other endpoints (update, delete, list) still use direct Prisma — gradual migration in progress.
5. **Zod Validation**: All request bodies validated before Prisma operations.
6. **clinicGuard Middleware**: Centralized multi-tenant isolation at router level.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Backend strict mode compliance | Low | Low | File compiles under `tsc` strict mode since 2026-05-23 |
| Frontend/backend logic divergence | Medium | High | Align backend to use domain entities/commands |
| E2E tests flaky | Medium | Low | Add `data-testid` attributes to key elements |
| Performance with large datasets | Low | Medium | Add pagination to list endpoints |
