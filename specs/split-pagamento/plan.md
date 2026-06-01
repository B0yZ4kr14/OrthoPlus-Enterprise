# Plan: Split de Pagamento

## Overview
Configurar a divisão automática de receitas entre a clínica e os profissionais com base em percentuais configuráveis por procedimento.

## Architecture
- Frontend: `apps/web/src/modules/split-pagamento/` — configuração de percentuais, listagem de comissões
- Backend: `backend/src/modules/split_pagamento/` — controllers, cálculo de split
- Database: schema `financeiro` ou schema dedicado com tabelas `SplitPaymentConfig`, `SplitTransaction`, `SplitComissao`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/split_pagamento/`
- [ ] Verificar/criar tabelas `SplitPaymentConfig`, `SplitTransaction`, `SplitComissao` no Prisma schema
- [ ] Definir enums de status para transações e comissões
- [ ] Implementar rate limiting (200 req/15min)

### Phase 2: Implementation
- [ ] Implementar CRUD de configurações de split (GET, PUT, POST)
- [ ] Implementar cálculo de split com fallback de configuração genérica
- [ ] Implementar listagem de comissões com filtros
- [ ] Implementar criação manual de comissão
- [ ] Implementar listagem de transações de split
- [ ] Validar percentual entre 0 e 100

### Phase 3: Polish
- [ ] Criar interface para configurar percentuais por profissional
- [ ] Criar dashboard de comissões por profissional
- [ ] Adicionar resumo financeiro (clínica vs profissional)
- [ ] Implementar relatório de comissões pendentes
- [ ] Adicionar testes unitários para cálculo de split

## Risks
- Cálculo incorreto de split pode causar disputas financeiras
- Configuração inativa deve ser tratada como inexistente
- Sem configuração ativa, transação deve falhar com erro claro
- Dados financeiros são sensíveis — requer audit log
