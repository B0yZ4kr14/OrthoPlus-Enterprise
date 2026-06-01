# Tasks: Inadimplência e Cobrança

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/inadimplencia/` e mapear gaps vs spec.md
- [ ] T2: Adicionar/verificar modelos Prisma `Inadimplente` e `CampanhaCobranca` no schema apropriado
- [ ] T3: Definir enums `InadimplenteStatus` (ATIVO, NEGOCIADO, PAGO, CANCELADO) e `CampanhaStatus` (ATIVA, PAUSADA, CONCLUIDA, CANCELADA)
- [ ] T4: Configurar rate limiting de 200 req/15min no router do módulo

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/inadimplencia/inadimplentes` com filtros por status, ordenação por dias de atraso decrescente, paginação e scope por clinic_id
- [ ] T6: Implementar `GET /api/inadimplencia/inadimplentes/:id` com detalhes do inadimplente
- [ ] T7: Implementar `PATCH /api/inadimplencia/inadimplentes/:id` com validação Zod e cálculo automático de `dias_atraso`
- [ ] T8: Implementar `GET /api/inadimplencia/campanhas` e `POST /api/inadimplencia/campanhas` com campos definidos e status padrão ATIVA
- [ ] T9: Implementar `PATCH /api/inadimplencia/campanhas/:id` para atualização de campanhas
- [ ] T10: Implementar validação de valor não-negativo e regra de campanha expirada (status CONCLUIDA automático)

## Phase 3: Polish
- [ ] T11: Criar página de listagem de inadimplentes em `apps/web/src/modules/cobranca/` com indicadores visuais de atraso (cores: verde < 30d, amarelo 30-60d, vermelho > 60d)
- [ ] T12: Criar página de campanhas de cobrança com criação, edição e templates de mensagem
- [ ] T13: Adicionar funcionalidade de exportação de relatórios de inadimplência
- [ ] T14: Integrar envio de notificações/lembretes com módulo `notifications`
- [ ] T15: Adicionar testes unitários em `backend/tests/unit/` para cálculo de atraso e validações
