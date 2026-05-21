# Feature Specification: Correção do Tema Premium — Consistência de Cores no Frontend

## Feature ID
**001-theme-premium-fix**

## Short Name
`theme-premium-color-fix`

## Overview
O OrthoPlus Enterprise implementou um redesign premium (v3) com design tokens semânticos e CSS variables para controle de tema via `ThemeContext`. Os temas premium (`premium-light`, `premium-dental-dark`) definem paletas de cores consistentes através de CSS variables injetadas na classe `:root` do `<html>`.

No entanto, **0 ocorrências** de cores hardcoded legadas (`amber-500`, `cyan-500`, `bg-amber`, `text-amber`, `bg-cyan`, `text-cyan`) foram identificadas em componentes React `.tsx`. As referências remanescentes estão no utilitário de mapeamento semântico (`semantic-colors.ts`) e nas CSS variables (`index.css`), ambos intencionais e compatíveis com o tema. Essas cores não respondem ao tema selecionado pelo usuário, criando inconsistências visuais quando o tema premium está ativo.

## Problem Statement
- Componentes com cores hardcoded (`amber-500`, `cyan-500`) ignoram o tema ativo
- A experiência visual quebra quando o usuário seleciona `premium-light` ou `premium-dental-dark`
- Cores de aviso/alerta (`amber`) e destaque (`cyan`) do legado v2 aparecem misturadas com o design v3
- Não existe um utility centralizado para aplicação de cores semânticas (warning, info, accent)

## Functional Requirements

### FR-1: Auditoria e Inventário de Cores Legadas
- Identificar todas as ocorrências de `amber-500`, `cyan-500` e variações em componentes `.tsx`
- Classificar cada ocorrência por tipo semântico: `warning`, `info`, `accent`, `destructive`, `success`
- Documentar o componente afetado e a correção sugerida

### FR-2: Utility de Cores Semânticas
- Criar/exportar funções/utilitários em `@/theme/tokens-v3` para mapeamento semântico
- Mapeamento: `warning` → `warning` CSS var, `info` → `info` CSS var, `accent` → `accent` CSS var
- Garantir que `warning` no `premium-light` use `amber-500` (corretamente) mas via CSS var
- Garantir que `info` no `premium-light` use `sky-500` via CSS var

### FR-3: Refatoração de Componentes
- Substituir todas as 0 ocorrências restantes de cores hardcoded em componentes `.tsx` por classes/utilitários semânticos
- Priorizar componentes de alto impacto visual:
  - `PasswordStrengthIndicator` (auth)
  - `ClinicWarning` (financeiro/crypto)
  - `StepSimulation`, `StepDependencies` (onboarding)
  - `ThemePreview` (settings)
  - Cards e alertas em CRM, Configurações

### FR-4: Validação Visual
- Verificar que ambos os temas premium (`premium-light`, `premium-dental-dark`) renderizam cores consistentes

## Success Criteria

| ID | Criterion | Measurement |
|----|-----------|-------------|
| SC-1 | Zero ocorrências de `amber-500`/`cyan-500` hardcoded em componentes | `grep` retorna vazio |
| SC-2 | Todos os componentes de alerta usam cores semânticas via CSS vars | `grep` confirma zero hardcoded + build passa em ambos os temas premium (`premium-light`, `premium-dental-dark`) |
| SC-3 | Build do frontend passa sem erros | `pnpm build` em `apps/web` completa com 0 erros |
| SC-4 | Não há regressões entre `premium-light` e `premium-dental-dark` | Comparação visual antes/depois |

## User Stories

- **US-1**: Como usuário do tema premium-light, quero que os alertas de aviso usem a cor âmbar consistente do meu tema, não uma cor hardcoded que não combina.
- **US-2**: Como desenvolvedor, quero usar utilitários semânticos (`warning`, `info`, `accent`) em vez de hardcodar cores Tailwind, para que meus componentes sejam automaticamente compatíveis com todos os temas.

## Edge Cases

- **EC-1**: Componentes que usam `dark:text-amber-300` com `text-amber-700` — precisam mapear para dark variants via CSS vars
- **EC-2**: Gradientes e opacidades (`bg-amber-500/10`, `border-amber-500/20`) — precisam de equivalente semântico
- **EC-3**: Cores usadas em constantes/objetos (ex: `status.ts` em CRM) — precisam de abordagem diferente das classes inline

## Technical Constraints

- **TC-1**: Não alterar `index.css` (CSS vars já estão definidos corretamente)
- **TC-2**: Não introduzir novas dependências
- **TC-3**: Temas suportados: `premium-light` (padrão) e `premium-dental-dark`
- **TC-4**: Build deve continuar passando (`pnpm build` 0 erros)

## Out of Scope

- Redesign de componentes (apenas correção de cores)
- Alteração de paletas nos temas existentes
- Criação de novos temas
- Refatoração de tokens.ts (legado v2)
