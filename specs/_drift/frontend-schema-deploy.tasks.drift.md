# Tarefas de Alinhamento: Frontend ↔ Schema ↔ Deploy
**Data:** 2026-06-26  
**Objetivo:** Fechar os drifts listados em `frontend-schema-deploy.spec.drift.md`

## Phase 1 — Segurança Crítica

- [x] T001 [CRITICAL] Remover `.env` da working tree e rotacionar todas as secrets potencialmente expostas.
- [x] T002 [CRITICAL] Garantir `.env*` e `.env` no `.gitignore`; adicionar `.env.example` revisado.
- [x] T003 [CRITICAL] Criptografar `fiscal_config.senha_certificado`, `csc_token` e `certificado_digital` no schema e na aplicação.
- [x] T004 [CRITICAL] Migrar registros existentes de `fiscal_config` de texto plano para formato criptografado/vault.
- [x] T005 [CRITICAL] Alterar `AuthController.refreshToken` para enviar refresh token via cookie `HttpOnly`.
- [x] T006 [CRITICAL] Remover `refreshToken` e `expiresIn` do body JSON do endpoint `/auth/refresh`.
- [x] T007 [CRITICAL] Bloquear `AUTH_ALLOW_MOCK=true` em produção ou remover a flag completamente.
- [x] T008 [CRITICAL] Eliminar os caminhos de mock de autenticação em `authMiddleware.ts` e `AuthService.ts`.

## Phase 2 — Isolamento por clínica

- [x] T009 [HIGH] Adicionar `clinic_id String` em `budget_items`, `budget_approvals` e `budget_versions`.
- [x] T010 [HIGH] Adicionar `clinic_id String` em `orcamento_itens`, `orcamento_pagamento` e `orcamento_visualizacoes`.
- [x] T011 [HIGH] Criar migration de backfill de `clinic_id` nas tabelas filhas a partir dos registros pais.
- [x] T012 [HIGH] Adicionar índices `@@index([clinic_id])` nas novas colunas.
- [x] T013 [HIGH] Auditar todos os controllers que aceitam `clinicId` do body e forçar uso de `req.clinicId`.
- [x] T014 [HIGH] Atualizar `AuthController.register`, `database_admin` audit log, `crypto_config` e `notifications` para ignorar `clinicId` do body.
- [ ] T015 [HIGH] Adicionar testes unitários que provem isolamento por clínica nas tabelas filhas.

## Phase 3 — Módulos e Frontend

- [x] T016 [HIGH] Consolidar `ModuleCard.tsx` em um único componente em `@orthoplus/core-ui`.
- [x] T017 [HIGH] Substituir as 6 implementações duplicadas de `ModuleCard` pelo componente compartilhado.
- [x] T018 [HIGH] Refatorar `ModulosControllerService` para persistir toggle em `clinic_modules` por `clinic_id`.
- [x] T019 [HIGH] Remover mutação do `MODULE_CATALOG` hard-coded em memória.
- [ ] T020 [MEDIUM] Decidir se a taxonomia da sidebar ou do catálogo de módulos é a fonte da verdade e documentar.
- [x] T021 [MEDIUM] Mover componentes novos de `src/components/*` para `modules/<feature>/components/`.

## Phase 4 — Specs e Rastreabilidade

- [x] T022 [HIGH] Atualizar `specs/018-sidebar-collapsed-default/STATUS.md` para “Implemented”.
- [x] T023 [HIGH] Atualizar `specs/020-spec-memory-hub/STATUS.md` para “Implemented”.
- [x] T024 [HIGH] Atualizar `specs/admin-tools/STATUS.md` para “Implemented”.
- [x] T025 [MEDIUM] Revisar e atualizar `specs/016-theme-premium-fix/STATUS.md` e `specs/017-omk-governance-integration/STATUS.md`.
- [x] T026 [MEDIUM] Criar matriz de rastreabilidade specs ↔ arquivos de implementação.

## Phase 5 — Deploy / Infra

- [ ] T027 [MEDIUM] Documentar desvios do `docker-compose.yml` em relação ao OpenSpec `tsiapp-deploy.spec` ou alinhar service/network names.
- [ ] T028 [MEDIUM] Implementar injeção de secrets via Infisical CE no compose local ou documentar exceção dev.
- [ ] T029 [MEDIUM] Decidir entre rotas `/api/modules/*` e `/api/configuracoes/modulos/*` e deprecar a duplicata.

## Phase 6 — Validação

- [x] T030 [HIGH] Executar `cd backend && pnpm build` após alterações.
- [x] T031 [HIGH] Executar `cd apps/web && pnpm type-check`.
- [x] T032 [HIGH] Executar `pnpm test` e garantir que cobertura não regrediu.
- [x] T033 [HIGH] Executar `pnpm lint` e corrigir novos warnings/erros.
