# Tasks: Split de Pagamento

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/split_pagamento/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelos Prisma `SplitPaymentConfig`, `SplitTransaction`, `SplitComissao` no schema apropriado
- [x] T3: Definir enums `TransactionStatus` (PENDING, COMPLETED, CANCELLED) e `ComissaoStatus` (PENDENTE, PAGA, CANCELADA)
- [x] T4: Configurar rate limiting de 200 req/15min no router do módulo

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/split-pagamento/config` e `POST /api/split-pagamento/config` com campos (`professional_id`, `percentage`, `procedure_type`, `is_active`)
- [x] T6: Implementar `PUT /api/split-pagamento/config` para atualização de configuração existente
- [x] T7: Implementar `POST /api/split-pagamento/calculate` com busca de configuração específica → fallback genérica, validação de percentual (0-100), criação de transação e comissão
- [x] T8: Implementar `GET /api/split-pagamento/comissoes` com filtros por `professional_id` e `status`
- [x] T9: Implementar `POST /api/split-pagamento/comissoes` para criação manual de comissão
- [x] T10: Implementar `GET /api/split-pagamento/transacoes` com filtros por status e scope por clinic_id

## Phase 3: Polish
- [x] T11: Criar página de configuração de percentuais em `apps/web/src/modules/split-pagamento/`
- [x] T12: Criar dashboard de comissões por profissional com filtros e busca
- [x] T13: Implementar resumo financeiro consolidado (total clínica vs total profissional) no dashboard
- [x] T14: Criar relatório de comissões pendentes com opção de exportação
- [x] T15: Adicionar testes unitários em `backend/tests/unit/` para cálculo de split e fallback
