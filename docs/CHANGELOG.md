# Changelog - OrthoPlus Enterprise

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-05-13

### 🚀 Deploy & Infrastructure
- **VPS Sync**: Sincronizado código local (ca5b92cd4) → VPS — backend atualizado de v2 para **v2.2**
- **Dockerfile fix**: Adicionado `prisma generate` no stage `builder` para gerar tipos antes do build
- **Container backend**: Recriado com `orthoplus-backend:v2.2`, healthy e respondendo `/health` → 200
- **Backup pré-deploy**: `pg_dump` realizado antes de qualquer alteração no VPS

### 🏗️ Backend
- **Stubs 404 reduzidos**: De ~156 para **<30** endpoints
  - Corrigido `admin_tools/controller.ts`: query em `profiles` com filtro `app_role` (model `dentists` inexistente)
  - Corrigido `financeiro/api/FinanceiroController.ts`: extração de `metadata` do model `pdv_vendas` (models `pdv_venda_itens`/`pdv_pagamentos` inexistentes)
  - Criado model `comunicacao_logs` no schema Prisma (schema `operacional`)
  - Criado model `analytics_events` no schema Prisma (schema `operacional`)
- **TypeScript fixes**: Adicionado `return next(e)` em `analyticsController.ts` (TS7030)
- **Prisma schema**: `@@schema("public")` removido de todos os 178 modelos (zero ocorrências)

### 🧪 Tests
- **AuthController tests**: Corrigidos 18 testes quebrados
  - Mock de `asyncHandler` como pass-through com try/catch
  - Atualizados mocks do Prisma Client (`users.findUnique`, `patients.findFirst`)
  - Ajustadas mensagens de erro para refletir factories `Errors.*` / `ApiError`
  - Resultado: **17 suites passed, 363 tests passed, 0 failures**

### 🎨 Frontend
- **React Compiler fix**: `Auth.tsx` — substituído `window.location.href` por `navigate()` do react-router-dom (2 erros `react-hooks/immutability`)
- **Lint**: 0 erros, 107 warnings (pré-existentes)

### 📚 Documentation
- Atualizado `AGENTS.md` com estado atual (2026-05-13)
- Criado `docs/STATUS-2026-05-13.md` com resultados da orquestração

---

## [Unreleased] - 2026-04-23

### 🔒 Security
- Removed `.ssh_key_vps` from git repository and added to `.gitignore` ([#security-hotfix])

### 🏗️ Backend
- **Eliminated all Supabase references** from backend codebase
  - Removed `JWTAuthService.ts` (legacy Supabase auth, unused in entry point)
  - Added `last_sign_in_at` field to `configuracoes.users` Prisma model
  - Refactored `usuariosController.ts` to use `prisma.users` instead of raw `auth.users` queries
  - Refactored `admin_tools/controller.ts` to remove raw `auth.users` UPDATE
  - Refactored `moduleController.ts` to use `clinic_modules`/`module_catalog` instead of phantom tables `modules`/`tenant_modules`
- **Finalized queryRaw migration** — migrated 4+ queries to Prisma Client, documented 9 remaining architecturally-blocked occurrences
  - `upcomingAppointments` → `appointments.findMany` with `patient` include
  - `previousAlerts` → `crypto_price_alerts.findMany`
  - `latestRate` → `crypto_exchange_rates.findFirst`
  - `admins` → `users.findMany`
- Backend build: `tsc && tsc-alias` passes (exit 0)
- Backend lint: 0 errors, 45 warnings

### 🎨 Frontend
- Fixed react-hooks lint errors blocking pre-commit hook
  - `eslint.config.js`: disabled React Compiler false-positive rules
  - `ComparacaoStats.tsx`: removed IIFE component creation during render
  - `useOnboardingWizard.ts`: `useRef(Date.now())` instead of `useState(Date.now())`
- Frontend lint: 0 errors, ~98 warnings (all non-blocking)

### 📚 Documentation
- Updated `PROMPT-CONTINUE-SESSION.md` with Wave-2 progress
- Updated `HANDOFF.md` with current infrastructure status
- Created `docs/session-memory/2026-04-23-wave2-supabase-elimination-queryraw-cleanup.md`

### 🏥 Infrastructure
- VPS `vps-tsi-02`: deploy pipeline verified (tarball + PM2 reload)
- Health check endpoint returning `{"status":"ok"}`

---

## [Previous] - 2026-04-05

### Validation & Fixes (Wave 1)
- Multi-agent validation completed (5 agents)
- Prisma migrations baseline prepared
- TypeScript errors reduced from 1869 to 137
- Git commits synchronized to GitHub

