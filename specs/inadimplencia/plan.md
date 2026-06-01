# Plan: Inadimplência e Cobrança

## Overview
Gerenciar pacientes inadimplentes e executar campanhas de cobrança para recuperação de crédito, incluindo cálculo automático de dias de atraso e templates de mensagem.

## Architecture
- Frontend: `apps/web/src/modules/cobranca/` ou `apps/web/src/modules/inadimplencia/` — listagem, campanhas, filtros
- Backend: `backend/src/modules/inadimplencia/` — controllers, cálculo de atraso
- Database: schema `financeiro` ou schema dedicado com tabelas `Inadimplente`, `CampanhaCobranca`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/inadimplencia/`
- [ ] Verificar/criar tabelas `Inadimplente` e `CampanhaCobranca` no Prisma schema
- [ ] Definir enums de status para inadimplentes e campanhas
- [ ] Implementar rate limiting (200 req/15min)

### Phase 2: Implementation
- [ ] Implementar CRUD de inadimplentes com filtros e scope por clinic_id
- [ ] Implementar cálculo automático de dias de atraso
- [ ] Implementar CRUD de campanhas de cobrança
- [ ] Implementar validação de valores não-negativos
- [ ] Implementar regra de campanha expirada (status automático)

### Phase 3: Polish
- [ ] Criar interface com indicadores visuais de atraso (cores por faixa)
- [ ] Criar página de campanhas com templates de mensagem
- [ ] Adicionar exportação de relatórios
- [ ] Integrar notificações para envio de lembretes
- [ ] Adicionar testes unitários

## Risks
- Dados de inadimplência são sensíveis (LGPD) — devem ser criptografados
- Cálculo de dias de atraso deve considerar feriados e finais de semana (opcional)
- Rate limiting pode afetar operações em massa
