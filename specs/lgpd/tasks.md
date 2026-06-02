# Tasks: LGPD — Compliance de Dados

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/lgpd/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelos Prisma `Consentimento` e `SolicitacaoLGPD` com campos definidos
- [x] T3: Definir enum `SolicitacaoStatus` (PENDENTE, EM_ANALISE, ATENDIDA, NEGADA) no Prisma
- [x] T4: Criar schemas Zod para criação de consentimentos (`consent_type`, `granted`, `patient_id`, `expires_at`) e solicitações (`request_type`, `description`)

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/lgpd/consentimentos` e `POST /api/lgpd/consentimentos` com filtro por `patient_id` e clinic_id obrigatório
- [x] T6: Implementar `GET /api/lgpd/solicitacoes` e `POST /api/lgpd/solicitacoes` com status padrão PENDENTE e registro de `requested_at`/`requested_by`
- [x] T7: Implementar `PATCH /api/lgpd/solicitacoes/:id` com campos editáveis (`status`, `completed_at`, `response`, `responded_by`)
- [x] T8: Implementar exportação de dados pessoais gerando JSON/CSV com dados do paciente, consentimentos, prontuários e agendamentos
- [x] T9: Implementar regra de anonimização para solicitações de exclusão quando paciente tem prontuário médico
- [x] T10: Integrar notificações ao paciente quando status da solicitação for atualizado

## Phase 3: Polish
- [x] T11: Criar interface de consentimentos por paciente em `apps/web/src/modules/settings/`
- [x] T12: Criar dashboard de solicitações pendentes para o DPO com filtros por tipo e status
- [x] T13: Implementar relatório de tempo médio de atendimento (`requested_at` vs `completed_at`)
- [x] T14: Adicionar testes unitários em `backend/tests/unit/` para regras de anonimização e validações
- [x] T15: Documentar fluxo completo LGPD e responsabilidades do DPO no README do módulo
