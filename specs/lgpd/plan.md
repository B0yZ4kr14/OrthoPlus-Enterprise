# Plan: LGPD — Compliance de Dados

## Overview
Gerenciar consentimentos de pacientes, solicitações de direitos do titular e exportações de dados pessoais, garantindo conformidade com a legislação brasileira de proteção de dados.

## Architecture
- Frontend: `apps/web/src/modules/settings/` (consentimentos) e portal do paciente (solicitações)
- Backend: `backend/src/modules/lgpd/` — controllers, validações
- Database: schema `configuracoes` ou schema dedicado com tabelas `Consentimento`, `SolicitacaoLGPD`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/lgpd/`
- [ ] Verificar/criar tabelas `Consentimento` e `SolicitacaoLGPD` no Prisma schema
- [ ] Definir enum de status de solicitações: PENDENTE, EM_ANALISE, ATENDIDA, NEGADA
- [ ] Criar schemas Zod para consentimentos e solicitações

### Phase 2: Implementation
- [ ] Implementar CRUD de consentimentos com filtro por patient_id
- [ ] Implementar CRUD de solicitações de direitos do titular
- [ ] Implementar atualização de status de solicitação (PATCH)
- [ ] Implementar exportação de dados pessoais (JSON/CSV)
- [ ] Implementar regra de anonimização para solicitações de exclusão com dados médicos
- [ ] Integrar notificações ao paciente sobre atualizações

### Phase 3: Polish
- [ ] Criar interface de consentimentos por paciente
- [ ] Criar dashboard de solicitações pendentes para o DPO
- [ ] Adicionar filtros por tipo e status
- [ ] Implementar relatório de tempo médio de atendimento
- [ ] Adicionar testes unitários e documentar fluxo LGPD

## Risks
- Solicitações de exclusão com dados médicos devem ser anonimizadas, não excluídas
- Dados sensíveis devem ser criptografados em repouso
- Tempo de resposta deve ser ≤ 15 dias úteis — necessário monitoramento
- Consentimentos revogados devem bloquear campanhas de marketing
