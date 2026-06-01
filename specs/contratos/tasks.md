# Tasks: Gestão de Contratos

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/contratos/` e mapear gaps vs spec.md
- [ ] T2: Adicionar/verificar modelos Prisma `Contrato` e `ContratoTemplate` com campos e relations definidos
- [ ] T3: Definir enum `ContratoStatus` (RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, EM_EXECUCAO, CONCLUIDO, CANCELADO) no Prisma
- [ ] T4: Criar schemas Zod para criação (`titulo`, `conteudo_html`, `patient_id`, `numero_contrato`, `valor_contrato`, `data_inicio`, etc.)

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/contratos` com filtros por status, paginação e scope por clinic_id
- [ ] T6: Implementar `GET /api/contratos/:id` com detalhes completos do contrato
- [ ] T7: Implementar `POST /api/contratos` com validação Zod, geração de número único e status padrão RASCUNHO
- [ ] T8: Implementar `PATCH /api/contratos/:id` e `PUT /api/contratos/:id` com atualização parcial
- [ ] T9: Implementar `DELETE /api/contratos/:id` com validação de permissões
- [ ] T10: Implementar `GET /api/contratos/templates` para listar templates disponíveis
- [ ] T11: Implementar lógica de assinatura digital (validar status PENDENTE_ASSINATURA, atualizar para ASSINADO, registrar data)
- [ ] T12: Implementar regra de cancelamento (rejeitar se status for CONCLUIDO)

## Phase 3: Polish
- [ ] T13: Criar página de listagem de contratos em `apps/web/src/modules/contratos/` com filtros e busca
- [ ] T14: Criar formulário de criação/edição de contratos com editor HTML e preview
- [ ] T15: Criar tela de assinatura digital para pacientes (interface simplificada)
- [ ] T16: Adicionar indicadores visuais de status com cores na listagem
- [ ] T17: Adicionar testes unitários em `backend/tests/unit/` para regras de assinatura e cancelamento
