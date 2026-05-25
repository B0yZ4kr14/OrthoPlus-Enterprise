# Tasks: 001-theme-premium-fix


**Functional Requirements Coverage:**
- THM-FR-1: Auditoria e Inventário de Cores Legadas
- THM-FR-2: Utility de Cores Semânticas
- THM-FR-3: Refatoração de Componentes
- THM-FR-4: Validação Visual

## Phase 1: Auditoria e Foundation

### T1.1 [X] Gerar inventário completo de cores legadas
- Executar grep por `amber-500`, `cyan-500`, `bg-amber`, `text-amber`, `bg-cyan`, `text-cyan` em `apps/web/src`
- Salvar resultado em `.specify/features/001-theme-premium-fix/audit-colors.md`
- Classificar cada ocorrência: `warning`, `info`, `accent`, `destructive`, `success`

### T1.2 [X] Criar utility de cores semânticas
- Arquivo: `apps/web/src/theme/semantic-colors.ts`
- Exportar funções:
  - `getSemanticColor(type: 'warning'|'info'|'accent'|'destructive'|'success', variant: 'bg'|'text'|'border', opacity?: number): string`
  - `semanticColorMap: Record<string, string>` para uso em objetos constantes
- Garantir compatibilidade com todas as opacidades Tailwind (`/10`, `/20`, etc.)

### T1.3 [X] Exportar utilities no theme index
- Atualizar `apps/web/src/theme/index.ts` para exportar semantic colors
- Garantir que `ThemeContext` pode acessar os novos utilities

## Phase 2: Refatoração de Componentes Core

### T2.1 [X] Refatorar auth components (já estava concluído no codebase)
- `apps/web/src/components/auth/PasswordStrengthIndicator.tsx`
- `apps/web/src/components/auth/password-strength-indicator/SecurityTip.tsx`
- Substituir `amber-500` → `warning`, `amber-700` → `warning` (dark variant via CSS var)

### T2.2 [X] Refatorar onboarding components (já estava concluído no codebase)
- `apps/web/src/components/onboarding/steps/step-dependencies/components/ExamplesCard.tsx`
- `apps/web/src/components/onboarding/steps/step-simulation/ModuleCard.tsx`
- `apps/web/src/components/onboarding/steps/StepDependencies.tsx`
- `apps/web/src/components/onboarding/steps/StepSimulation.tsx`
- Substituir `amber-*` → `warning` semântico

### T2.3 [X] Refatorar settings components (já estava concluído no codebase)
- `apps/web/src/components/settings/ai-model-config/RecommendationAlert.tsx`
- `apps/web/src/components/settings/AIModelConfig.tsx`
- `apps/web/src/components/settings/backup-restore-dialog/BackupRestoreDialog.tsx`
- `apps/web/src/components/settings/ModuleCard.tsx`
- `apps/web/src/components/ThemePreview.tsx`
- Substituir `amber-*` → `warning`, `amber-50/400` no ThemePreview → tokens semânticos

### T2.4 [X] Refatorar CRM lead-card status
- `apps/web/src/components/crm/lead-card/constants/status.ts`
- `QUALIFICADO` usa `bg-info/10 text-info border-info/20` via `semanticColorMap`
- Refatoração aplicada: de `cyan-500` hardcoded para `info` semântico

## Phase 3: Refatoração de Módulos

### T3.1 [X] Refatorar financeiro/crypto components (já estava concluído no codebase)
- `apps/web/src/modules/financeiro/components/crypto-pagamentos/ClinicWarning.tsx`
- `apps/web/src/modules/financeiro/ui/pages/CryptoPagamentos.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoExchangesView.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoTransactionsView.tsx`
- `apps/web/src/modules/financeiro/ui/views/crypto/CryptoWalletsView.tsx`
- Substituir `amber-*` → `warning`, `amber-600/400` → `warning` com dark variant

### T3.2 [X] Refatorar crypto components
- `apps/web/src/components/crypto/bitcoin-info-card/types.ts`
- `apps/web/src/components/crypto/bitcoin-qr-dialog/QRCodeDisplay.tsx`
- `apps/web/src/components/crypto/BitcoinQRCodeDialog.tsx`
- Substituir `amber-*` → `warning`, `cyan-*` → `info`

### T3.3 [X] Validação final
- Executar grep novamente — confirmar zero ocorrências restantes
- Verificar que não há novas ocorrências introduzidas

## Phase 4: Validação e QA

### T4.1 [X] Build do frontend
- `cd apps/web && pnpm build`
- Garantir 0 erros TypeScript e 0 erros Vite

### T4.2 [X] Verificação visual
- Testar tema `premium-light` (padrão): alertas devem ser consistentes
- Testar tema `premium-dental-dark`: alertas devem usar `amber-400` via CSS var

### T4.3 [X] Commit e push na feature branch
- `git checkout -b 001-theme-premium-fix`
- `git cherry-pick <commits-de-main>` ou reaplicar mudanças
- `git add -A`
- `git commit -m "fix(theme): replace hardcoded amber/cyan with semantic color utilities"`
- `git push origin 001-theme-premium-fix`

---

**Legend:**
- `[P]` = Parallelizable (can run concurrently with other tasks in same phase)
- Phase dependencies: Phase 2 depends on Phase 1 completion. Phase 3 depends on Phase 2.
