# Blueprint — Feature 016: Correção do Tema Premium — Consistência de Cores

## Overview
Correção de 52+ ocorrências de cores hardcoded legadas (amber-500, cyan-500 e variações) em componentes React, substituindo por classes/utilitários semânticos via CSS variables do tema v3 (premium-light, premium-dental-dark).

## Frontend Scaffold

### Theme Foundation (Existing)
- [X] `apps/web/src/theme/tokens-v3.ts` — Design tokens v3 do tema premium
- [X] `apps/web/src/theme/semantic-colors.ts` — Cores semânticas (warning, info, accent, etc.)
- [X] `apps/web/src/theme/tokens.ts` — Tokens legados
- [X] `apps/web/src/theme/index.ts` — Export central do tema
- [X] `apps/web/src/theme/stitch-enhanced.ts` — Tokens enhanced
- [X] `apps/web/src/contexts/ThemeContext.tsx` — Contexto de tema

### Components to Refactor (High Priority)
- [X] `apps/web/src/components/auth/password-strength-indicator/PasswordStrengthIndicator.tsx` — Indicador de força de senha
- [X] `apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx` — Dica de segurança
- [X] `apps/web/src/components/auth/password-strength-indicator/StrengthBar.tsx` — Barra de força
- [X] `apps/web/src/components/auth/password-strength-indicator/StrengthLabel.tsx` — Label de força
- [X] `apps/web/src/components/onboarding/steps/StepSimulation.tsx` — Step de simulação
- [X] `apps/web/src/components/onboarding/steps/StepDependencies.tsx` — Step de dependências
- [X] `apps/web/src/components/onboarding/steps/step-dependencies/components/ExamplesCard.tsx` — Card de exemplos
- [X] `apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx` — Card de módulo (onboarding)
- [X] `apps/web/src/components/settings/ThemePreview.tsx` — Preview do tema
- [X] `apps/web/src/components/settings/ai-model-config/AIModelConfig.tsx` — Config de IA
- [X] `apps/web/src/components/settings/ai-model-config/RecommendationAlert.tsx` — Alerta de recomendação
- [X] `apps/web/src/components/settings/backup-restore-dialog/BackupRestoreDialog.tsx` — Diálogo de backup
- [X] `apps/web/src/components/ModuleCard.tsx` — Card de módulo genérico
- [X] `apps/web/src/components/settings/ModuleCard.tsx` — Card de módulo (settings)
- [X] `apps/web/src/modules/settings/components/modules-simple/ModuleCard.tsx` — Card de módulo (modules-simple)
- [X] `apps/web/src/modules/settings/modules/ui/pages/ModuleCard.tsx` — Card de módulo (modules page)
- [X] `apps/web/src/modules/settings/ui/components/ModuleCard.tsx` — Card de módulo (settings UI)

### Modules to Refactor (Financial/CRM)
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx` — Aviso da clínica
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/CryptoPagamentos.tsx` — Página crypto
- [X] `apps/web/src/modules/financeiro/components/crypto-pagamentos/LoadingStateCrypto.tsx` — Loading state
- [X] `apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx` — Página crypto (UI)
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoAlertsView.tsx` — View de alertas
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoComparativeView.tsx` — View comparativa
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoSimulatorView.tsx` — View simulador
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoTechnicalAnalysisView.tsx` — View análise técnica
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoTransactionsView.tsx` — View transações
- [X] `apps/web/src/modules/financeiro/ui/views/crypto/CryptoWalletsView.tsx` — View carteiras
- [X] `apps/web/src/components/crm/lead-card/constants/status.ts` — Status colors CRM
- [X] `apps/web/src/components/crm/atividade-list/constants/status.ts` — Status colors atividades

### Theme Components (Existing)
- [X] `apps/web/src/components/ThemeToggle.tsx` — Toggle de tema
- [X] `apps/web/src/components/settings/ThemeSelector.tsx` — Seletor de tema
- [X] `apps/web/src/components/settings/theme-selector/components/ThemeCard.tsx` — Card de tema
- [X] `apps/web/src/components/settings/theme-selector/components/ColorPreview.tsx` — Preview de cores
- [X] `apps/web/src/components/settings/theme-selector/hooks/useThemeSelector.ts` — Hook de seleção

## Backend Scaffold
- Nenhum — esta feature é puramente frontend (design tokens + CSS).

## Shared Types
- Nenhum novo necessário.

## Tests
- [X] `apps/web/src/components/ModuleCard.test.tsx` — Teste existente do ModuleCard
- [ ] `apps/web/src/theme/__tests__/semantic-colors.test.ts` — Teste de utilitários semânticos
- [ ] `apps/web/src/components/auth/password-strength-indicator/__tests__/PasswordStrengthIndicator.theme.test.tsx` — Teste de regressão de tema
- [ ] `tests/e2e/theme-consistency.spec.ts` — Teste E2E de consistência visual entre temas

## Summary
- Pre-completed: 34 files (existentes, precisam de refatoração)
- Pending: 3 files (novos testes/utilitários)
- Total: 37 files

## Notes
- Todos os arquivos marcados [X] já existem no codebase e precisam ser refatorados para remover cores hardcoded.
- Nenhum arquivo novo de componente precisa ser criado — o escopo é puramente correção de cores.
- O utility getSemanticColorClass deve ser criado/adicionado em tokens-v3.ts ou semantic-colors.ts.
