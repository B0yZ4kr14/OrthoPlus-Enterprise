# Blueprint — Feature 014: Sistema de Notificações

## Overview
Notificações multi-canal (WhatsApp, SMS, email) com lembretes de agendamento, alertas de recall, notificações in-app (toasts, badges) e editor de templates personalizados.

## Frontend Scaffold

### Components
- [ ] `apps/web/src/modules/notifications/presentation/components/NotificationCenter.tsx` — Centro de notificações in-app
- [ ] `apps/web/src/modules/notifications/presentation/components/NotificationBadge.tsx` — Badge de contador (dedicado ao módulo)
- [ ] `apps/web/src/modules/notifications/presentation/components/NotificationList.tsx` — Listagem de notificações
- [ ] `apps/web/src/modules/notifications/presentation/components/TemplateBuilder.tsx` — Editor de templates
- [ ] `apps/web/src/modules/notifications/presentation/components/TemplatePreview.tsx` — Preview de template
- [ ] `apps/web/src/modules/notifications/presentation/components/CanalConfigForm.tsx` — Configuração de canais
- [ ] `apps/web/src/modules/notifications/presentation/components/AgendamentoNotificationForm.tsx` — Config de notificação de agendamento
- [ ] `apps/web/src/modules/notifications/presentation/components/RecallAlertForm.tsx` — Config de alerta de recall
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/NotificationBadge.tsx` — Badge existente (não dedicado)

### Hooks
- [X] `apps/web/src/hooks/useNotifications.ts` — Hook global de notificações (básico)
- [X] `apps/web/src/hooks/useCryptoNotifications.ts` — Hook específico de crypto
- [ ] `apps/web/src/modules/notifications/presentation/hooks/useNotificationCenter.ts` — Centro de notificações
- [ ] `apps/web/src/modules/notifications/presentation/hooks/useTemplates.ts` — Gestão de templates
- [ ] `apps/web/src/modules/notifications/presentation/hooks/useCanalConfig.ts` — Configuração de canais
- [ ] `apps/web/src/modules/notifications/presentation/hooks/useEnvios.ts` — Acompanhamento de envios

### Pages
- [ ] `apps/web/src/modules/notifications/ui/pages/NotificationsPage.tsx` — Página principal
- [ ] `apps/web/src/modules/notifications/ui/pages/TemplatesPage.tsx` — Página de templates
- [ ] `apps/web/src/modules/notifications/ui/pages/CanalConfigPage.tsx` — Página de configuração de canais
- [ ] `apps/web/src/modules/notifications/ui/pages/RelatoriosPage.tsx` — Relatórios de envio

### Services (Frontend API)
- [ ] `apps/web/src/modules/notifications/services/notificationApi.ts` — Camada de API

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/notifications/api/notificationController.ts` — Controller (548 linhas)
- [X] `backend/src/modules/notifications/api/router.ts` — Rotas Express
- [ ] `backend/src/modules/notifications/api/schemas.ts` — Schemas Zod (não existe)
- [ ] `backend/src/modules/notifications/api/types/` — DTOs e tipos

### Services
- [ ] `backend/src/modules/notifications/application/notificationService.ts` — Serviço de notificações
- [ ] `backend/src/modules/notifications/application/templateService.ts` — Serviço de templates
- [ ] `backend/src/modules/notifications/application/envioService.ts` — Serviço de envios
- [ ] `backend/src/modules/notifications/application/canalService.ts` — Serviço de canais

### Infrastructure
- [ ] `backend/src/modules/notifications/infrastructure/whatsappProvider.ts` — Provedor WhatsApp
- [ ] `backend/src/modules/notifications/infrastructure/smsProvider.ts` — Provedor SMS
- [ ] `backend/src/modules/notifications/infrastructure/emailProvider.ts` — Provedor Email

## Database (Prisma)
- [X] `backend/prisma/schema.prisma` — Model `notifications`
- [X] `backend/prisma/schema.prisma` — Model `patient_notifications`
- [ ] `backend/prisma/schema.prisma` — Model `Template` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `Envio` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `CanalComunicacao` (não existe)

## Shared Types
- [X] `apps/web/src/types/database.ts` — Tipos gerados pelo Prisma
- [ ] `shared-types/src/notifications.ts` — Tipos compartilhados (não existe)

## Tests
- [ ] `backend/tests/unit/notificationController.test.ts` — Testes do controller
- [ ] `backend/tests/unit/notificationService.test.ts` — Testes do serviço
- [ ] `apps/web/src/modules/notifications/presentation/hooks/__tests__/useNotificationCenter.test.tsx` — Testes do hook
- [ ] `apps/web/src/modules/notifications/presentation/components/__tests__/NotificationCenter.test.tsx` — Testes do componente
- [ ] `tests/e2e/notifications.spec.ts` — Testes E2E

## Summary
- Pre-completed: 5 files
- Pending: 28 files
- Total: 33 files
