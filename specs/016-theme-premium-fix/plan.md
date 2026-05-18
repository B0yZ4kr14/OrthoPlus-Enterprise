# Implementation Plan: 001-theme-premium-fix

## Architecture Overview

A correção do tema premium segue uma abordagem em 3 camadas:

1. **Auditoria** → Inventário completo das ocorrências legadas
2. **Foundation** → Utility de cores semânticas em `semantic-colors.ts` (exportado via `theme/index.ts`)
3. **Refatoração** → Substituição sistemática em componentes por prioridade

## Phases

### Phase 1: Auditoria e Foundation (1-2h)
- **P1-T1**: Gerar inventário completo de cores legadas com grep
- **P1-T2**: Criar utility `getSemanticColorClass(type, variant)` em `tokens-v3.ts`
- **P1-T3**: Adicionar export de semantic color utilities no `theme/index.ts`

### Phase 2: Refatoração de Componentes Core (2-3h)
- **P2-T1**: Refatorar componentes de auth (`PasswordStrengthIndicator`, `SecurityTip`)
- **P2-T2**: Refatorar componentes de onboarding (`StepSimulation`, `StepDependencies`, `ExamplesCard`, `ModuleCard`)
- **P2-T3**: Refatorar componentes de settings (`ThemePreview`, `AIModelConfig`, `BackupRestoreDialog`, `ModuleCard`)
- **P2-T4**: Refatorar componentes de CRM (`lead-card/status.ts`)

### Phase 3: Refatoração de Módulos (2-3h)
- **P3-T1**: Refatorar módulo financeiro (`ClinicWarning`, `CryptoPagamentos`, views crypto)
- **P3-T2**: Refatorar componentes restantes (crypto, outros módulos)
- **P3-T3**: Validação final com grep — garantir zero ocorrências restantes

### Phase 4: Validação e QA (1h)
- **P4-T1**: Build do frontend (`pnpm build`)
- **P4-T2**: Verificação visual em todos os temas (light, dark, premium-light, premium-dental-dark)
- **P4-T3**: Commit e push da feature branch

## Data Model

Nenhuma alteração no data model. Apenas design tokens e CSS.

## Technical Constraints

- Utilizar apenas classes Tailwind que mapeiam para CSS vars existentes (`bg-warning`, `text-warning`, etc.)
- Para opacidades, usar a sintaxe: `bg-warning/10`, `border-warning/20`
- Para gradientes, usar as CSS vars custom do tema (`--module-*`, `--stat-*`)

## Risk Mitigation

- **Risk**: Regressão no tema light padrão
  - **Mitigation**: Testar cada componente refatorado no tema light antes de commitar
- **Risk**: Cores em constantes/objetos não podem usar classes Tailwind
  - **Mitigation**: Para objetos de configuração, usar mapa de tokens em vez de strings hardcoded
