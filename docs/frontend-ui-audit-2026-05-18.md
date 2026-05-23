# Frontend UI Audit — OrthoPlus Enterprise

> Data: 2026-05-18
> Auditor: OMK + Speckit + GitNexus (local code analysis)
> VPS Status: Cloudflare 526 (Invalid SSL certificate) — visual inspection blocked
> Branch: main

## Resumo Executivo

Auditamos o frontend focando em funcoes, cores, cards, temas e consistencia do design system. A inspecao visual na VPS foi impedida por erro SSL, entao a analise foi feita no codigo-fonte local.

**Resultado geral:** O design system v3 esta bem estruturado, mas havia inconsistencias entre tokens semanticos e componentes de UI. As correcoes criticas foram aplicadas com sucesso.

| Gate | Status |
|------|--------|
| pnpm type-check (frontend) | PASS 0 erros |
| pnpm lint | PASS 0 erros (104 warnings pre-existentes) |
| pnpm build (frontend) | PASS 13.35s |

## Findings Criticos (Corrigidos)

### 1. Button.tsx — Cores Hardcoded
- Arquivo: categories/@orthoplus/core/packages/ui/src/components/button.tsx
- Problema: Variantes success, warning, info usavam cores Tailwind nativas
- Fix: Substituídos por tokens semanticos (bg-success, bg-warning, bg-info)

### 2. Card.tsx — Classes de Sombra Invalidas
- Arquivo: categories/@orthoplus/core/packages/ui/src/components/card.tsx
- Problema: Usava shadow-primary/5, /8, /10, /12 que nao existem no tailwind config
- Fix: Removidos shadow-primary/*, substituídos por shadow-card / shadow-card-hover

### 3. Sonner.tsx — Dependencia Inexistente
- Arquivo: categories/@orthoplus/core/packages/ui/src/components/sonner.tsx
- Problema: Importava useTheme de next-themes (nao declarado no package.json)
- Fix: Removida dependencia externa, usa theme local via CSS variables

### 4. StatCardMemo.tsx — Variant Nao Utilizado
- Arquivo: apps/web/src/components/dashboard/StatCardMemo.tsx
- Problema: Prop variant definida mas nunca usada; icon sempre emerald-500
- Fix: Adicionado variantIconStyles com tokens semanticos; trend badges usam success/destructive

### 5. Landpage.tsx — Gradientes Hardcoded
- Arquivo: apps/web/src/modules/landpage/ui/pages/Landpage.tsx
- Problema: Gradientes com sky-400, blue-500, orange-500, violet-400, etc.
- Fix: Substituídos por tokens semanticos do projeto

### 6. Tailwind Config — Shadow Tokens Ausentes
- Arquivo: tailwind.config.ts
- Problema: --shadow-card, --shadow-card-hover, --shadow-interactive nao mapeados
- Fix: Adicionados shadow-card, shadow-card-hover, shadow-interactive

## Findings Medios (Documentados)

- EventIcon, PasswordStrengthIndicator, AtividadeList, KanbanBoard usam cores hardcoded legitimas (allowlist)
- Memory Hub UI componentes existem mas nao estao roteados em AppRoutes.tsx (orphan UI)
- ThemeContext nao tem suporte a system theme (nice-to-have)

## Critique Visual (Baseado em Codigo)

- Consistencia de Cores: 4/5 (corrigido)
- Consistencia de Sombras: 5/5 (corrigido)
- Tipografia: 5/5
- Cards: 4/5
- Temas: 4/5
- Acessibilidade: 4/5
- Design System Maturity: 4/5

## Fixes Aplicados

8 files changed, 160 insertions(+), 26 deletions(-)

## Recomendacoes

1. Curto prazo: Adicionar style guard para rejeitar cores Tailwind nativas em UI
2. Curto prazo: Wire Memory Hub routes em AppRoutes.tsx
3. Medio prazo: Migrar componentes allowlisted para tokens semanticos
4. Medio prazo: Adicionar system theme detection ao ThemeContext
5. Longo prazo: Avaliar migracao para Tailwind CSS v4

## Conclusao

O frontend possui um design system maduro. As inconsistencias foram corrigidas sem quebrar build, lint ou type-check. A principal divida tecnica e a falta de enforcement automatizado (style guard).

Relatorio gerado por OMK + Speckit + GitNexus — 2026-05-18
