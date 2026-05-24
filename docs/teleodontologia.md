# Teleodontologia

Módulo de teleconsultas odontológicas do OrthoPlus Enterprise.

## Visão Geral

O módulo de Teleodontologia permite agendar, conduzir e documentar teleconsultas entre dentistas e pacientes, incluindo gestão de sessões de vídeo, prescrições digitais e anotações clínicas.

## Funcionalidades

### User Story 1 — Agendar Teleconsulta
- CRUD completo de teleconsultas
- Filtros por clínica (`clinicId`) via `clinicGuard`
- Validação de schemas com Zod

### User Story 2 — Conduzir Sessão de Vídeo
- Iniciar e encerrar sessões
- Registro automático de duração (`duracao_minutos`)
- Lista de sessões com indicadores de status

### User Story 3 — Emitir Prescrição e Anotações
- Adicionar anotações clínicas com diagnóstico
- Emitir prescrições digitais com array de medicamentos
- Formulários de triagem e prescrição remota

## Arquitetura

### Backend
```
backend/src/modules/teleodonto/
├── api/
│   ├── controller.ts     # TeleodontoController (CRUD + sessões)
│   ├── dbRouter.ts       # Rotas com clinicGuard
│   └── schemas.ts        # Zod schemas
├── application/
│   └── service.ts        # TeleodontoService (lógica de negócio)
└── domain/
    └── types.ts          # Tipos TypeScript do domínio
```

### Frontend
```
apps/web/src/modules/teleodonto/
├── application/hooks/
│   └── useTeleconsultas.ts
├── ui/
│   ├── components/
│   │   ├── TeleconsultaForm.tsx
│   │   ├── TeleodontoScheduler.tsx
│   │   ├── TeleodontoSessionList.tsx
│   │   ├── VideoRoom.tsx
│   │   ├── PrescricaoRemotaForm.tsx
│   │   └── TriagemForm.tsx
│   └── pages/
│       └── teleodonto.tsx
```

## Métricas Prometheus

O módulo emite métricas via `TeleodontoMetrics`:

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `teleconsulta_create_duration_ms` | Histogram | Duração da criação de teleconsulta (ms) |
| `teleconsulta_session_duration_seconds` | Histogram | Duração das sessões (s) |
| `teleconsultas_created_total` | Counter | Total de teleconsultas criadas |
| `teleconsulta_sessions_started_total` | Counter | Total de sessões iniciadas |
| `teleconsulta_sessions_ended_total` | Counter | Total de sessões encerradas |
| `teleconsulta_prescriptions_total` | Counter | Total de prescrições emitidas |

## Edge Cases e Mitigações

| Edge Case | Mitigação | Status |
|-----------|-----------|--------|
| **Sessão dupla iniciada** | `startSession` atualiza status sem verificar sessão ativa prévia — aceito como comportamento v1 (permite reinício após falha) | ⚠️ Consciente |
| **Teleconsulta inexistente** | `getById` lança `Errors.notFound`; usado por `update`, `delete`, `startSession`, `endSession`, `addNotes`, `addPrescription` | ✅ |
| **Cross-clinic access** | Todas as queries Prisma filtram por `clinic_id`; controller valida `req.user?.clinicId` | ✅ |
| **Duração nula/inválida** | `endSessionSchema` exige `duration_minutes: z.number().int().nonnegative()`; controller verifica `data.duracao_minutos` antes de métricas | ✅ |
| **Status inválido** | `createTeleconsultaSchema` aceita `z.string().optional()` — não restringe a enum (flexibilidade para status customizados) | ✅ |
| **Prescrição vazia** | `addPrescriptionSchema` valida `medications: z.array(...).min(1).max(20)` | ✅ |
| **ClinicId ausente** | Controller retorna 401 em todas as rotas se `req.user?.clinicId` é undefined | ✅ |
| **LGPD — dados clínicos** | Prescrição armazenada como JSON string; observações e diagnóstico no mesmo registro — criptografia at-rest depende de configuração PostgreSQL | ⚠️ Infraestrutura |

## Testes

- **Backend unit**: 6 suites planejadas (T004–T006, T015–T016, T021–T022)
- **Frontend unit**: Hooks e componentes
- **E2E**: Fluxo completo de agendamento → sessão → prescrição

## Dependências

- `prom-client` — Métricas Prometheus
- `zod` — Validação de schemas
- Prisma — ORM para `teleconsultas` e tabelas relacionadas
