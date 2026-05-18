# Tasks: 001-theme-premium-fix

## Phase 1: Auditoria e Foundation

### T1.1 [P] Gerar inventário completo de cores legadas
- Executar grep por `amber-500`, `cyan-500`, `bg-amber`, `text-amber`, `bg-cyan`, `text-cyan` em `apps/web/src`
- Salvar resultado em `.specify/features/001-theme-premium-fix/audit-colors.md`
- Classificar cada ocorrência: `warning`, `info`, `accent`, `destructive`, `success`

### T1.2 [P] Criar utility de cores semânticas
- Arquivo: `apps/web/src/theme/semantic-colors.ts`
- Exportar funções:
  - `getSemanticColor(type: 'warning'|'info'|'accent'|'destructive'|'success', variant: 'bg'|'text'|'border', opacity?: number): string`
  - `semanticColorMap: Record<string, string>` para uso em objetos constantes
- Garantir compatibilidade com todas as opacidades Tailwind (`/10`, `/20`, etc.)

### T1.3 [P] Exportar utilities no theme index
- Atualizar `apps/web/src/theme/index.ts` para exportar semantic colors
- Garantir que `ThemeContext` pode acessar os novos utilities

## Phase 2: Refatoração de Componentes Core

### T2.1 [P] Refatorar auth components
- `apps/web/src/components/auth/PasswordStrengthIndicator.tsx`
- `apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx`
- Substituir `amber-500` → `warning`, `amber-700` → `warning` (dark variant via CSS var)

### T2.2 [P] Refatorar onboarding components
- `apps/web/src/components/onboarding/steps/step-dependencies/components/ExamplesCard.tsx`
- `apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx`
- `apps/web/src/components/onboarding/steps/StepDependencies.tsx`
- `apps/web/src/components/onboarding/steps/StepSimulation.tsx`
- Substituir `amber-*` → `warning` semântico

### T2.3 [P] Refatorar settings components
- `apps/web/src/components/settings/ai-model-config/RecommendationAlert.tsx`
- `apps/web/src/components/settings/AIModelConfig.tsx`
- `apps/web/src/components/settings/backup-restore-dialog/BackupRestoreDialog.tsx`
- `apps/web/src/components/settings/ModuleCard.tsx`
- `apps/web/src/components/ThemePreview.tsx`
- Substituir `amber-*` → `warning`, `amber-50/400` no ThemePreview → tokens semânticos

### T2.4 [P] Refatorar CRM lead-card status
- `apps/web/src/components/crm/lead-card/constants/status.ts`
- `QUALIFICADO` usa `bg-cyan-500/10 text-cyan-500 border-cyan-500/20`
- Substituir por `info` semântico

## Phase 3: Refatoração de Módulos

### T3.1 [P] Refatorar financeiro/crypto components
- `apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx`
- `apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoExchangesView.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoTransactionsView.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoWalletsView.tsx`
- Substituir `amber-*` → `warning`, `amber-600/400` → `warning` com dark variant

### T3.2 [P] Refatorar crypto components
- `apps/web/src/components/crypto/bitcoin-info-card/types.ts`
- `apps/web/src/components/crypto/bitcoin-qr-dialog/QRCodeDisplay.tsx`
- `apps/web/src/components/crypto/BitcoinQRCodeDialog.tsx`
- Substituir `amber-*` → `warning`, `cyan-*` → `info`

### T3.3 [P] Validação final
- Executar grep novamente — confirmar zero ocorrências restantes
- Verificar que não há novas ocorrências introduzidas

## Phase 4: Validação e QA

### T4.1 [P] Build do frontend
- `cd apps/web && pnpm build`
- Garantir 0 erros TypeScript e 0 erros Vite

### T4.2 [P] Verificação visual
- Testar tema `light`: alertas devem continuar âmbar
- Testar tema `premium-light`: alertas devem ser consistentes
- Testar tema `premium-dental-dark`: alertas devem usar `amber-400` via CSS var
- Testar tema `dark`: alertas devem ser consistentes

### T4.3 [P] Commit e push
- `git add -A`
- `git commit -m "fix(theme): replace hardcoded amber/cyan with semantic color utilities"`
- `git push origin 001-theme-premium-fix`

---

**Legend:**
- `[P]` = Parallelizable (can run concurrently with other tasks in same phase)
- Phase dependencies: Phase 2 depends on Phase 1 completion. Phase 3 depends on Phase 2.
