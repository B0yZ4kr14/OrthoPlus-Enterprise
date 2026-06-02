# Tasks: Terminal Web Shell

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/terminal/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelo Prisma `TerminalSession` no schema `terminal` com campos definidos
- [x] T3: Definir enum `TerminalSessionStatus` (ACTIVE, IDLE, TERMINATED) no Prisma
- [x] T4: Implementar middleware de role check (apenas ADMIN) em todas as rotas do módulo

## Phase 2: Implementation
- [x] T5: Implementar `POST /api/terminal/sessions` criando sessão com ID UUID, status ACTIVE, registro de IP e user-agent
- [x] T6: Implementar `POST /api/terminal/execute` retornando 501 com mensagem "Terminal feature is disabled for security compliance (LGPD). Use SSH for server access."
- [x] T7: Implementar `GET /api/terminal/sessions/:sessionId/history` retornando 501 (desativado LGPD)
- [x] T8: Implementar `DELETE /api/terminal/sessions/:sessionId` encerrando sessão (status TERMINATED, registro de terminatedAt)
- [x] T9: Implementar timeout de inatividade: após 15 minutos sem atividade, status muda para IDLE automaticamente

## Phase 3: Polish
- [x] T10: Criar interface visual do terminal em `apps/web/src/modules/admin/` exibindo mensagem de desativação LGPD
- [x] T11: Criar página de auditoria de sessões listando sessões ativas e encerradas com IP e user-agent
- [x] T12: Implementar audit log de criação e encerramento de sessões
- [x] T13: Adicionar testes unitários em `backend/tests/unit/` para criação, encerramento e endpoints desativados
- [x] T14: Documentar política LGPD e instruções de acesso SSH como alternativa no README do módulo
