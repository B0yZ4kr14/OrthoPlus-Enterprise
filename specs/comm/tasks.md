# Tasks: Comunicação (Teleconsulta / Agora)

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/comm/` e mapear gaps vs spec.md
- [x] T2: Verificar variáveis de ambiente Agora no `.env.example` e validação em `src/config.ts`
- [x] T3: Validar entidade `Teleconsulta` com campos `link_sala` e `recording_url` no Prisma schema
- [x] T4: Implementar serviço de fallback/stub para desenvolvimento quando Agora não estiver configurado

## Phase 2: Implementation
- [x] T5: Implementar `POST /api/comm/agora/token` com validação de `teleconsultaId`, geração de token RTC com expiração de 3600s e atualização de `link_sala`
- [x] T6: Implementar `POST /api/comm/agora/recording` com ação `start` (acquire resource, start recording, salvar resourceId/sid)
- [x] T7: Implementar ação `stop` de gravação (stop recording, listar arquivos, atualizar status teleconsulta)
- [x] T8: Adicionar registro em `audit_logs` para todas as operações de teleconsulta
- [x] T9: Implementar validação de credenciais Agora e retornar erro apropriado em produção

## Phase 3: Polish
- [x] T10: Criar/interfacear tela de videochamada no módulo `teleodonto` com embed do Agora SDK
- [x] T11: Adicionar indicador visual de gravação em andamento na interface
- [x] T12: Implementar notificações de início/fim de consulta via módulo `notifications`
- [x] T13: Adicionar testes unitários em `backend/tests/unit/` para token e recording
- [x] T14: Documentar setup do Agora (APP_ID, CERTIFICATE, CUSTOMER_ID, CUSTOMER_SECRET) no README
