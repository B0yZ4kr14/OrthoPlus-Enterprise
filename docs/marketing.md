# Marketing Automático

Módulo de campanhas de marketing, envios e recalls do OrthoPlus Enterprise.

## Visão Geral

O módulo de Marketing Automático permite criar e gerenciar campanhas de comunicação com pacientes, rastrear envios e automatizar recalls de retorno.

## Funcionalidades

### User Story 1 — Gerenciar Campanhas
- CRUD completo de campanhas (nome, tipo, canal, conteúdo, status)
- Filtros por status e clínica (`clinicId`)
- Validação de schemas com Zod

### User Story 2 — Rastrear Envios e Recalls
- Criar envios vinculados a campanhas
- Processar recalls em batch (pacientes com retorno pendente)
- Triggers automáticos baseados em eventos (aniversário, pós-consulta, inatividade)

### User Story 3 — Programa de Fidelidade
- Pontos e badges por paciente
- Recompensas e resgates
- Indicações de novos pacientes

## Arquitetura

### Backend
```
backend/src/modules/marketing/
├── api/
│   ├── controller.ts     # MarketingController (CRUD + triggers + recalls)
│   ├── router.ts         # Rotas com clinicGuard
│   └── schemas.ts        # Zod schemas
```

### Frontend
```
apps/web/src/modules/marketing-auto/
├── presentation/hooks/
│   └── useCampaigns.ts
├── presentation/components/
│   ├── CampaignCard.tsx
│   └── ...
└── ui/pages/
    └── marketing-auto.tsx
```

## Métricas Prometheus

O módulo emite métricas via `MarketingMetrics`:

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `marketing_campaigns_created_total` | Counter | Total de campanhas criadas |
| `marketing_envios_created_total` | Counter | Total de envios criados |
| `marketing_recalls_processed_total` | Counter | Total de recalls processados |
| `marketing_triggers_fired_total` | Counter | Total de triggers disparados |

## Edge Cases e Mitigações

| Edge Case | Mitigação | Status |
|-----------|-----------|--------|
| **Campanha inexistente** | `createEnvio` verifica se a campanha existe antes de criar o envio | ✅ |
| **Cross-clinic access** | Todas as queries filtram por `clinic_id` | ✅ |
| **ClinicId ausente** | Controller retorna 401 em todas as rotas | ✅ |
| **Recall duplicado** | Verifica `notificacao_enviada` antes de enviar | ✅ |
| **Envio duplicado** | `processTriggers` verifica envios nas últimas 24h | ✅ |
| **Trigger com JSON inválido** | Try/catch no parse de `trigger_condition` com log de warning | ✅ |

## Testes

- **Backend unit**: `backend/tests/unit/marketingController.test.ts` (13 testes)
- **Frontend unit**: `apps/web/src/modules/marketing-auto/hooks/__tests__/useMarketingCampaigns.test.ts`
- **E2E**: Fluxo completo de campanha → envio → recall

## APIs

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/marketing/campanhas` | Listar campanhas |
| POST | `/api/marketing/campanhas` | Criar campanha |
| GET | `/api/marketing/campanhas/:id` | Obter campanha |
| PATCH | `/api/marketing/campanhas/:id` | Atualizar campanha |
| DELETE | `/api/marketing/campanhas/:id` | Deletar campanha |
| POST | `/api/marketing/envios` | Criar envio |
| POST | `/api/marketing/recalls/process` | Processar recalls |
| POST | `/api/marketing/triggers/process` | Processar triggers |
