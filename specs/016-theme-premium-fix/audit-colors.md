# Audit: Legacy Color Occurrences in Frontend

**Date:** 2026-05-18
**Command:** `grep -rE "amber-500|cyan-500|bg-amber|text-amber|bg-cyan|text-cyan" apps/web/src --include="*.tsx"`

## Total Occurrences: 52

| # | File | Line | Legacy Code | Semantic Type | Suggested Fix |
|---|------|------|-------------|---------------|---------------|
| 1 | apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx | 5 | `<div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">` | warning | bg-warning/10 |
| 2 | apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx | 6 | `<Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />` | warning | text-warning |
| 3 | apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx | 7 | `<p className="text-xs text-amber-700 dark:text-amber-300">` | warning | text-warning |
| 4 | apps/web/src/components/auth/PasswordStrengthIndicator.tsx | 119 | `<div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">` | warning | bg-warning/10 |
| 5 | apps/web/src/components/auth/PasswordStrengthIndicator.tsx | 120 | `<Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />` | info | text-warning |
| 6 | apps/web/src/components/auth/PasswordStrengthIndicator.tsx | 121 | `<p className="text-xs text-amber-700 dark:text-amber-300">` | warning | text-warning |
| 7 | apps/web/src/components/crypto/bitcoin-qr-dialog/QRCodeDisplay.tsx | 60 | `<p className="mt-2 text-amber-600 dark:text-amber-400">` | info | text-warning |
| 8 | apps/web/src/components/crypto/BitcoinQRCodeDialog.tsx | 239 | `<p className="mt-2 text-amber-600 dark:text-amber-400">` | info | text-warning |
| 9 | apps/web/src/components/onboarding/steps/step-dependencies/components/ExamplesCard.tsx | 6 | `<Card className="p-6 bg-amber-500/10 border-amber-500/20">` | warning | bg-warning/10 |
| 10 | apps/web/src/components/onboarding/steps/step-dependencies/components/ExamplesCard.tsx | 8 | `<AlertCircle className="h-5 w-5 text-amber-500" />` | warning | text-warning |
| 11 | apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx | 70 | `<div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">` | warning | bg-warning/10 |
| 12 | apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx | 71 | `<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />` | warning | text-warning |
| 13 | apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx | 72 | `<p className="text-xs text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 14 | apps/web/src/components/onboarding/steps/StepDependencies.tsx | 78 | `<Card className="p-6 bg-amber-500/10 border-amber-500/20">` | warning | bg-warning/10 |
| 15 | apps/web/src/components/onboarding/steps/StepDependencies.tsx | 80 | `<AlertCircle className="h-5 w-5 text-amber-500" />` | warning | text-warning |
| 16 | apps/web/src/components/onboarding/steps/StepSimulation.tsx | 191 | `<div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">` | warning | bg-warning/10 |
| 17 | apps/web/src/components/onboarding/steps/StepSimulation.tsx | 192 | `<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />` | warning | text-warning |
| 18 | apps/web/src/components/onboarding/steps/StepSimulation.tsx | 193 | `<p className="text-xs text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 19 | apps/web/src/components/settings/ai-model-config/RecommendationAlert.tsx | 5 | `<div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">` | warning | bg-warning/10 |
| 20 | apps/web/src/components/settings/ai-model-config/RecommendationAlert.tsx | 6 | `<p className="text-sm text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 21 | apps/web/src/components/settings/backup-restore-dialog/BackupRestoreDialog.tsx | 70 | `<div className="flex items-center gap-2 text-amber-600">` | warning | text-warning |
| 22 | apps/web/src/components/settings/AIModelConfig.tsx | 458 | `<div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">` | warning | bg-warning/10 |
| 23 | apps/web/src/components/settings/AIModelConfig.tsx | 459 | `<p className="text-sm text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 24 | apps/web/src/components/settings/ModuleCard.tsx | 166 | `<AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />` | warning | text-warning |
| 25 | apps/web/src/components/ThemePreview.tsx | 59 | `text: "text-amber-50",` | accent | Replace with semantic accent |
| 26 | apps/web/src/components/ThemePreview.tsx | 60 | `accent: "bg-amber-400",` | accent | Replace with semantic accent |
| 27 | apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx | 7 | `<Card variant="default" className="border-amber-500/50 bg-amber-500/5">` | warning | bg-warning |
| 28 | apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx | 10 | `<Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />` | warning | text-warning |
| 29 | apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx | 12 | `<p className="text-sm font-medium text-amber-900 dark:text-amber-100">` | warning | text-warning |
| 30 | apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx | 15 | `<p className="text-sm text-amber-700 dark:text-amber-200 mt-1">` | warning | text-warning |
| 31 | apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx | 231 | `<Card variant="default" className="border-amber-500/50 bg-amber-500/5">` | warning | bg-warning |
| 32 | apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx | 234 | `<Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />` | info | text-warning |
| 33 | apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx | 236 | `<p className="text-sm font-medium text-amber-900 dark:text-amber-100">` | warning | text-warning |
| 34 | apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx | 239 | `<p className="text-sm text-amber-700 dark:text-amber-200 mt-1">` | warning | text-warning |
| 35 | apps/web/src/modules/financeiro/ui/views/crypto/CryptoExchangesView.tsx | 134 | `<span className="font-semibold text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 36 | apps/web/src/modules/financeiro/ui/views/crypto/CryptoTransactionsView.tsx | 240 | `<p className="font-semibold text-amber-600 dark:text-amber-400">` | warning | text-warning |
| 37 | apps/web/src/modules/financeiro/ui/views/crypto/CryptoWalletsView.tsx | 64 | `<div className="rounded-full bg-amber-500/10 p-6">` | warning | bg-warning/10 |
| 38 | apps/web/src/modules/financeiro/ui/views/crypto/CryptoWalletsView.tsx | 65 | `<Info className="h-12 w-12 text-amber-500" />` | info | text-warning |
| 39 | apps/web/src/modules/marketing-auto/ui/pages/ProgramaFidelidade.tsx | 67 | `return "text-amber-700";` | warning | text-warning |
| 40 | apps/web/src/modules/pacientes/components/PatientTimeline.tsx | 39 | `budget: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",` | warning | text-warning |
| 41 | apps/web/src/modules/pdv/ui/pages/DashboardExecutivoPDV.tsx | 336 | `<Award className="h-5 w-5 text-amber-600" />` | warning | text-warning |
| 42 | apps/web/src/modules/pdv/ui/pages/MetasGamificacao.tsx | 84 | `if (badge === "BRONZE") return <Medal className="h-5 w-5 text-amber-600" />;` | warning | text-warning |
| 43 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 79 | `<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">` | warning | Replace with semantic warning |
| 44 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 80 | `<Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />` | warning | text-warning |
| 45 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 81 | `<p className="text-xs text-amber-800">Faça backups diários após o expediente.</p>` | warning | Replace with semantic warning |
| 46 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 83 | `<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">` | warning | Replace with semantic warning |
| 47 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 84 | `<Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />` | warning | text-warning |
| 48 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 85 | `<p className="text-xs text-amber-800">Mantenha os backups em um disco externo ou nuvem.</p>` | warning | Replace with semantic warning |
| 49 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 87 | `<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">` | warning | Replace with semantic warning |
| 50 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 88 | `<Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />` | warning | text-warning |
| 51 | apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx | 89 | `<p className="text-xs text-amber-800">Teste as restaurações periodicamente.</p>` | warning | Replace with semantic warning |
| 52 | apps/web/src/modules/settings/ui/pages/ModulesPage.tsx | 69 | `<Lock className="h-6 w-6 text-amber-500" />` | warning | text-warning |

## Summary by Semantic Type

- **warning**: 45 occurrences
- **info**: 5 occurrences
- **accent**: 2 occurrences
