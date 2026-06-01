# Plan: Comunicação (Teleconsulta / Agora)

## Overview
Integrar o serviço Agora.io para realização de teleconsultas (videochamadas) entre dentistas e pacientes, incluindo geração de tokens de acesso e gerenciamento de gravações na nuvem.

## Architecture
- Frontend: integrado no módulo `apps/web/src/modules/teleodonto/` — tela de videochamada
- Backend: `backend/src/modules/comm/` — controllers para token e gravação
- Database: schema relacionado a `agenda` (teleconsultas) com campo `link_sala` e `recording_url`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/comm/`
- [ ] Verificar configuração de variáveis de ambiente (AGORA_APP_ID, AGORA_APP_CERTIFICATE)
- [ ] Validar existência da tabela/entidade `Teleconsulta` no schema apropriado
- [ ] Implementar fallback de simulação para desenvolvimento

### Phase 2: Implementation
- [ ] Implementar `POST /api/comm/agora/token` com validação de teleconsulta e geração de token
- [ ] Implementar `POST /api/comm/agora/recording` com ações start/stop
- [ ] Implementar integração com Agora Cloud Recording (acquire, start, stop)
- [ ] Atualizar link_sala na teleconsulta ao gerar token
- [ ] Registrar operações em audit_logs

### Phase 3: Polish
- [ ] Criar interface de videochamada no frontend (integrada ao teleodonto)
- [ ] Adicionar indicador de gravação em andamento
- [ ] Implementar notificações de início/fim de consulta
- [ ] Adicionar testes unitários para geração de token e gravação
- [ ] Documentar configuração obrigatória do Agora para produção

## Risks
- AGORA_APP_ID é obrigatório em produção — falta de configuração causa erro fatal
- Gravações dependem de bucket S3 configurado
- Simulação em dev pode mascarar problemas de integração real
