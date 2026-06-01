# Plan: Terminal Web Shell

## Overview
Fornecer uma interface de terminal segura para administradores do OrthoPlus Enterprise. A execução de comandos está desativada por compliance LGPD; o módulo opera em modo de sessão apenas.

## Architecture
- Frontend: componente visual desativado (mensagem de compliance) ou interface de sessão somente leitura
- Backend: `backend/src/modules/terminal/` — controllers de sessão
- Database: schema `terminal` com tabela `TerminalSession`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/terminal/`
- [ ] Verificar/criar tabela `TerminalSession` no schema `terminal`
- [ ] Implementar middleware de role check (apenas ADMIN)
- [ ] Definir enum de status: ACTIVE, IDLE, TERMINATED

### Phase 2: Implementation
- [ ] Implementar criação de sessão com registro de IP e user-agent
- [ ] Implementar endpoint de execução retornando 501 (desativado LGPD)
- [ ] Implementar endpoint de histórico retornando 501 (desativado LGPD)
- [ ] Implementar encerramento de sessão
- [ ] Implementar timeout de inatividade (15 minutos → IDLE)

### Phase 3: Polish
- [ ] Criar interface visual do terminal (desativada) com mensagem clara de compliance
- [ ] Adicionar listagem de sessões ativas para auditoria
- [ ] Implementar audit log de criação/encerramento de sessões
- [ ] Documentar política LGPD e alternativa (SSH)
- [ ] Adicionar testes unitários

## Risks
- Módulo intencionalmente limitado — não deve haver tentativa de ativar execução
- Sessões podem ficar ativas indefinidamente se não houver timeout
- IP e user-agent devem ser registrados para rastreabilidade completa
