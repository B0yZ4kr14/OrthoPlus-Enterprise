# Tasks: Inadimplência e Cobrança

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/inadimplencia/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelos Prisma `Inadimplente` e `CampanhaCobranca` no schema apropriado
- [x] T3: Definir enums `InadimplenteStatus` (ATIVO, NEGOCIADO, PAGO, CANCELADO) e `CampanhaStatus` (ATIVA, PAUSADA, CONCLUIDA, CANCELADA)
- [x] T4: Configurar rate limiting de 200 req/15min no router do módulo

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/inadimplencia/inadimplentes` com filtros por status, ordenação por dias de atraso decrescente, paginação e scope por clinic_id
- [x] T6: Implementar `GET /api/inadimplencia/inadimplentes/:id` com detalhes do inadimplente
- [x] T7: Implementar `PATCH /api/inadimplencia/inadimplentes/:id` com validação Zod e cálculo automático de `dias_atraso`
- [x] T8: Implementar `GET /api/inadimplencia/campanhas` e `POST /api/inadimplencia/campanhas` com campos definidos e status padrão ATIVA
- [x] T9: Implementar `PATCH /api/inadimplencia/campanhas/:id` para atualização de campanhas
- [x] T10: Implementar validação de valor não-negativo e regra de campanha expirada (status CONCLUIDA automático)

## Phase 3: Polish
- [x] T11: Criar página de listagem de inadimplentes em `apps/web/src/modules/cobranca/` com indicadores visuais de atraso (cores: verde < 30d, amarelo 30-60d, vermelho > 60d)
- [x] T12: Criar página de campanhas de cobrança com criação, edição e templates de mensagem
- [x] T13: Adicionar funcionalidade de exportação de relatórios de inadimplência
- [x] T14: Integrar envio de notificações/lembretes com módulo `notifications`
- [x] T15: Adicionar testes unitários em `backend/tests/unit/` para cálculo de atraso e validações
