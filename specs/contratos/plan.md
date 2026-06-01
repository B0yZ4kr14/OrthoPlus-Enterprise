# Plan: Gestão de Contratos

## Overview
Permitir que clínicas criem, gerenciem e acompanhem contratos de tratamento com pacientes, incluindo templates, assinatura digital e itens de procedimentos.

## Architecture
- Frontend: `apps/web/src/modules/contratos/` — páginas de listagem, criação, edição e assinatura de contratos
- Backend: `backend/src/modules/contratos/` — controllers, use cases, validação Zod
- Database: schema `faturamento` ou schema dedicado com tabelas `Contrato`, `ContratoTemplate`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/contratos/`
- [ ] Verificar/criar tabelas `Contrato` e `ContratoTemplate` no Prisma schema
- [ ] Definir enum de status: RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, EM_EXECUCAO, CONCLUIDO, CANCELADO
- [ ] Criar schemas Zod para criação e atualização de contratos

### Phase 2: Implementation
- [ ] Implementar CRUD de contratos (GET, GET/:id, POST, PATCH, PUT, DELETE)
- [ ] Implementar listagem de templates (`GET /api/contratos/templates`)
- [ ] Implementar lógica de assinatura digital (status PENDENTE_ASSINATURA → ASSINADO)
- [ ] Implementar regras de cancelamento (não permitir cancelar CONCLUIDO)
- [ ] Implementar geração de número de contrato único

### Phase 3: Polish
- [ ] Criar interface de editor de contratos com preview HTML
- [ ] Criar tela de assinatura digital para pacientes
- [ ] Adicionar filtros por status e busca na listagem
- [ ] Criar visualização de status com cores
- [ ] Adicionar testes unitários para regras de negócio

## Risks
- Assinatura digital não usa ICP-Brasil — limitação legal a documentar
- Cancelamento indevido pode afetar financeiro vinculado
- Número de contrato duplicado deve ser prevenido no banco
