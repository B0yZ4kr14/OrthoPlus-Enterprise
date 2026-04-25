# OrthoPlus — Plano de Redesign Visual Premium
> Status: RASCUNHO — aguardando aprovação do cliente  
> Criado: 2026-04-25  
> Agentes consultados: explore (×2), librarian, oracle (implícito via síntese)

---

## 1. Diagnóstico do Estado Atual

### O que existe hoje
| Aspecto | Estado Atual | Problema |
|---|---|---|
| **Tema base** | Dark-first cyan (`#06B6D4`) + âmbar (`#F59E0B`) | Visual de "developer tool", não clínico/premium |
| **Tokens** | Divididos entre `tokens.ts` (hex/JS) e `index.css` (HSL vars) | Duas fontes de verdade — inconsistências visuais |
| **Hardcodes** | Muitos `rgba()` / `hex` diretos em `index.css` e `stitch-enhanced.ts` | Difícil manutenção, drift visual |
| **Tailwind config** | Não encontrado em `apps/web/` (pode estar na raiz do monorepo) | Classes Tailwind podem não mapear para CSS vars |
| **Tipografia** | Inter (único) | Falta hierarquia — sem fonte de display diferenciada |
| **Componentes base** | `@orthoplus/core-ui` com CVA/Radix — boa fundação | Visualmente datados, sem refinamento premium |
| **Design System** | `ThemeContext` com múltiplos temas já estruturados | Temas extras (`dark-gold`, `professional-dark`) mal definidos |
| **Acessibilidade** | Não auditado, gradients/low-contrast em dark theme | Risco WCAG 2.1 AA |
| **Dark/Light** | Toggle existe mas "light" sem definição adequada | Modo claro praticamente inutilizável |

### Módulos / Telas (36 rotas identificadas)
```
Grupo Clínico:       Pacientes, PEP, Odontograma, Tratamentos, IA Radiografia, Fluxo Digital, Teleodonto
Grupo Financeiro:    Financeiro, Contas a Receber, PDV, Orçamentos, Contratos, Inadimplência, Split Pagamento, Crypto, NF
Grupo Operacional:   Agenda, Estoque, Inventário, Procedimentos, CRM
Grupo Pessoas:       Dentistas, Funcionários, Usuários, Configurações
Grupo Marketing:     Marketing Auto, Fidelidade, Recall, Portal Paciente
Grupo Inteligência:  Dashboard (Home), BI, Dashboard Comercial, TISS, LGPD
Grupo Admin:         Database, Backups, Crypto Config, GitHub, Terminal, Wiki, ADRs, Monitoring, Logs, API Docs, Audit
```

---

## 2. Visão do Resultado Final

### Referência Visual (DNA do OrthoPlus Premium)

> "A precision of a Swiss watch, the calm of a dental clinic, the clarity of a Bloomberg terminal."

| Dimensão | Inspiração | Como se aplica |
|---|---|---|
| **Minimalismo** | Linear.app | Whitespace generoso, zero ruído visual |
| **Confiança** | Stripe Dashboard | Cores neutras que transmitem autoridade |
| **Healthcare calm** | Verdana Health | Sage green como cor de ação, navy como base |
| **Data-first** | Vercel Dashboard | Informação no centro, chrome mínimo |
| **Produtividade** | Notion + Linear | Command palette `Cmd+K`, atalhos de teclado |

### Paleta Proposta (OrthoPlus Premium v3)

```
── MODO CLARO (padrão para uso clínico) ─────────────────────────────
Background:        #F8FAFC   (slate-50 — calm, clean)
Surface / Card:    #FFFFFF   (pure white cards)
Surface raised:    #F1F5F9   (slight elevation)

Primary (Navy):    #0F172A   (slate-900 — clinical authority)
Primary light:     #1E293B   (slate-800)
Primary fg:        #FFFFFF

Interactive (Sage): #059669  (emerald-600 — CTAs, links, confirms)
Interactive hover:  #047857  (emerald-700)
Interactive fg:     #FFFFFF

Text primary:      #0F172A   (slate-900)
Text secondary:    #475569   (slate-600)
Text muted:        #94A3B8   (slate-400)

Border:            #E2E8F0   (slate-200)
Border focus:      #059669   (sage — foco visível)

Status success:    #22C55E   (green-500)
Status warning:    #EAB308   (yellow-500)
Status error:      #EF4444   (red-500)
Status info:       #0EA5E9   (sky-500)

── MODO ESCURO (opcional — salas escuras, plantão) ──────────────────
Background:        #0B1120
Surface / Card:    #0F172A
Surface raised:    #1E293B
Primary (sage):    #10B981   (emerald no escuro — melhor legibilidade)
Text primary:      #F8FAFC
Border:            #334155
```

### Tipografia
```
Display / H1:     Plus Jakarta Sans  —  Bold 700  —  32–40px
H2–H3:            Plus Jakarta Sans  —  SemiBold 600  —  20–28px
H4 / Card title:  Inter              —  Medium 500  —  16–18px
Body padrão:      Inter              —  Regular 400  —  14–16px
Labels / Caption: Inter              —  Medium 500  —  12–13px
Dados / Código:   JetBrains Mono     —  Regular 400  —  12–13px
```

### Espaçamento (8px grid)
```
4px  — micro (ícone + texto inline)
8px  — sm (gap entre elementos irmãos)
12px — base (padding de badges, chips)
16px — md (padding padrão de cards, cells)
24px — lg (padding de seções, gap de cards)
32px — xl (margem de página, gap de grupos)
48px — 2xl (separadores de seções maiores)
64px — 3xl (hero / top-level spacing)
```

### Border Radius
```
2px  — nenhum: tags inline, code snippets
4px  — sm: badges, inputs, chips pequenos
6px  — md: buttons, selects
8px  — lg: cards, dropdowns, modals (padrão)
12px — xl: cards maiores, sheets
16px — 2xl: modals full, popovers grandes
```

---

## 3. Arquitetura do Design System

### Fonte Única de Verdade (pós-redesign)

```
apps/web/src/theme/
├── tokens.ts          ← ÚNICA fonte (hex + HSL oklch)
├── css-vars.ts        ← gerado automaticamente de tokens.ts
└── themes/
    ├── light.ts       ← tema padrão clínico
    ├── dark.ts        ← tema escuro
    └── high-contrast.ts

categories/@orthoplus/core/packages/ui/
├── src/tokens/        ← importa de apps/web via workspace
├── src/components/    ← componentes base redesenhados
└── tailwind.preset.ts ← preset usado por todos os apps
```

### Tailwind v4 com CSS Variables
```css
/* globals.css — único ponto de config de cores */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-interactive: var(--interactive);
  --color-background: var(--background);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
}

:root {
  /* light theme (padrão) */
  --background:            oklch(0.984 0.003 247);
  --card:                  oklch(1 0 0);
  --primary:               oklch(0.145 0.02 255);
  --primary-foreground:    oklch(1 0 0);
  --interactive:           oklch(0.473 0.154 162);
  --interactive-foreground: oklch(1 0 0);
  --border:                oklch(0.882 0.008 247);
  --muted:                 oklch(0.95 0.005 247);
  --muted-foreground:      oklch(0.52 0.02 255);
  --destructive:           oklch(0.577 0.245 27);
  --success:               oklch(0.648 0.187 150);
  --warning:               oklch(0.795 0.184 86);
}

.dark {
  --background:            oklch(0.12 0.02 255);
  --card:                  oklch(0.16 0.022 255);
  --primary:               oklch(0.92 0.005 255);
  --interactive:           oklch(0.58 0.14 162);
  --border:                oklch(0.28 0.025 255);
  --muted:                 oklch(0.20 0.018 255);
  --muted-foreground:      oklch(0.60 0.015 255);
}
```

---

## 4. Plano de Execução em Fases

> **Estratégia:** começar pelo "chrome" (layout shell) — impacto máximo com mínimo de mudança.  
> Cada fase entrega algo visível e testável. O cliente aprova antes de avançar.

---

### 🔵 FASE 0 — Foundation (pré-requisito técnico)
**Objetivo:** Consolidar tokens, eliminar dual source-of-truth.  
**Impacto Visual:** Nenhum visível ainda — só infraestrutura.  
**Estimativa:** 1–2 dias  

**Tarefas:**
- [ ] Criar `apps/web/src/theme/tokens-v3.ts` com paleta nova (oklch)
- [ ] Criar script `generate-css-vars.ts` que exporta tokens → `globals.css`
- [ ] Atualizar `tailwind.config` (raiz do monorepo) para mapear classes a CSS vars
- [ ] Atualizar `ThemeContext` para setar o set completo de vars (todas as themes)
- [ ] Manter tokens.ts antigos como alias durante migração
- [ ] Instalar fontes: `Plus Jakarta Sans` + `JetBrains Mono` (via `@fontsource`)

**Arquivos afetados:**
```
apps/web/src/theme/tokens.ts                   (atualizar)
apps/web/src/theme/stitch-enhanced.ts          (deprecar gradualmente)
apps/web/src/index.css                         (limpar hardcodes)
apps/web/src/contexts/ThemeContext.tsx         (setar vars completo)
categories/@orthoplus/core/packages/ui/        (sync)
```

---

### 🟢 FASE 1 — Chrome (Layout Shell)
**Objetivo:** Sidebar + Header + Page wrapper — o que o usuário vê em TODAS as telas.  
**Impacto Visual:** ⭐⭐⭐⭐⭐ (máximo — todo o app muda de cara)  
**Estimativa:** 3–4 dias  
**Aprovação necessária:** ✅ SIM — cliente vê e aprova antes da Fase 2

**Tarefas:**
- [ ] Redesenhar `AppLayout.tsx` — padding, grid, background
- [ ] Redesenhar Sidebar — nova paleta, hierarquia de itens, ícones 24px, hover states
- [ ] Redesenhar `DashboardHeader.tsx` — menos chrome, mais espaço, breadcrumb refinado
- [ ] Adicionar "light mode" totalmente funcional (toggle no header)
- [ ] Atualizar `ProtectedRoute.tsx` loading/error states
- [ ] Refinar `GlobalSearch.tsx` — Command palette estilo Linear (Cmd+K)
- [ ] Skeleton loading states globais
- [ ] Focus rings acessíveis em todos os elementos interativos

**Entregável:** PR com screenshots lado a lado (antes/depois)

---

### 🟢 FASE 2 — Componentes Base
**Objetivo:** Button, Card, Input, Badge, Table — usados em 100% das telas.  
**Impacto Visual:** ⭐⭐⭐⭐⭐  
**Estimativa:** 3–4 dias  
**Aprovação necessária:** ✅ SIM

**Tarefas — `@orthoplus/core-ui`:**
- [ ] `button.tsx` — novas variantes premium (primary/sage, secondary, ghost, destructive, outline)
- [ ] `card.tsx` — light mode first, subtle shadows, hover states no interactive
- [ ] `input.tsx` — focus ring verde-sage, validação states (error/success/warning)
- [ ] `badge.tsx` — redesenhar status badges (Active/Pending/Error)
- [ ] `table` / `data-table` — TanStack Table com sticky header, row hover, sort indicators
- [ ] `tabs.tsx` — refinamento visual (underline style vs pill — testar com cliente)
- [ ] `dialog.tsx` / `sheet.tsx` — backdrop, padding, sombras
- [ ] `toast.tsx` (Sonner) — novos estilos por tipo (success/error/warning/info)
- [ ] `skeleton.tsx` — shimmer consistente com nova paleta

**Entregável:** Storybook ou ThemePreview page atualizado

---

### 🟡 FASE 3 — Módulo Piloto: Dashboard + Pacientes
**Objetivo:** Redesenhar os 2 módulos mais usados como validação completa.  
**Impacto Visual:** ⭐⭐⭐⭐⭐ + valida sistema de design end-to-end  
**Estimativa:** 4–5 dias  
**Aprovação necessária:** ✅ SIM — ponto de virada para aplicar em tudo

**Dashboard (Home):**
- [ ] Redesenhar cards de KPI (StatCard) — números grandes, labels pequenos, trend icons
- [ ] Redesenhar gráficos (Recharts) — cores alinhadas com nova paleta
- [ ] Layout 12-col grid responsivo
- [ ] Quick actions bar redesenhada
- [ ] Empty states com personalidade (ilustração leve ou ícone + copy)

**Pacientes:**
- [ ] Lista de pacientes — DataTable premium com avatar, status badge, ações inline
- [ ] Formulário de cadastro — multi-step com progress indicator, validação real-time
- [ ] Detalhe do paciente — card layout, timeline de tratamentos, próximo agendamento em destaque
- [ ] Estados de busca / filtro

**Entregável:** Telas funcionais + aprovação para rollout geral

---

### 🟡 FASE 4 — Módulos Críticos (alta frequência de uso)
**Objetivo:** Agenda, Financeiro, PDV, PEP, Estoque  
**Estimativa:** 6–8 dias  
**Aprovação necessária:** por módulo

**Agenda:**
- [ ] Calendar redesenhado — slots visuais por dentista, status de cor
- [ ] Agenda diária / semanal / mensal
- [ ] Card de agendamento — patient info + status + actions

**Financeiro:**
- [ ] Dashboard financeiro — receita/despesa/saldo em cards prominentes
- [ ] Tabela de lançamentos — filtros, status de pagamento colorido
- [ ] Fluxo de caixa chart

**PDV:**
- [ ] Layout tipo POS — teclado numérico, itens no carrinho, total em destaque
- [ ] Modo tablet (touchscreen friendly, targets ≥ 44px)

**PEP (Prontuário):**
- [ ] Timeline de consultas — vertical, expansível
- [ ] Odontograma integrado — visual dental chart
- [ ] Campos clínicos — layout formulário limpo

**Estoque:**
- [ ] Grid de produtos com status visual (ok/baixo/crítico)
- [ ] Entrada/saída quick actions
- [ ] Alertas de estoque mínimo

---

### 🟠 FASE 5 — Módulos Secundários
**Objetivo:** CRM, Orçamentos, Contratos, Inadimplência, Marketing  
**Estimativa:** 4–5 dias

- [ ] CRM — kanban de leads, status funil
- [ ] Orçamentos — template visual de proposta, status (enviado/aprovado/rejeitado)
- [ ] Contratos — preview de documento, assinatura digital CTA
- [ ] Inadimplência — tabela de inadimplentes com aging (dias em atraso)
- [ ] Marketing Auto — configuração de campanhas, métricas de recall

---

### 🟠 FASE 6 — Módulos de Suporte e Admin
**Objetivo:** BI, Teleodonto, TISS, Portal Paciente, Admin  
**Estimativa:** 3–4 dias

- [ ] BI / Analytics — dashboards de gráficos, exportação PDF
- [ ] Teleodonto — sala virtual, controls, chat
- [ ] Portal Paciente — UX simplificada para paciente (não dentista)
- [ ] Admin — visual funcional, sem excesso — monospace, densidade alta
- [ ] LGPD, TISS — formulários de compliance, clean e austero

---

### ✅ FASE 7 — QA Visual + Acessibilidade + Performance
**Objetivo:** Validação completa antes do "go live" do novo visual  
**Estimativa:** 3–4 dias

**Acessibilidade:**
- [ ] Auditoria axe DevTools em todas as rotas
- [ ] Contraste WCAG 2.1 AA mínimo em light e dark mode
- [ ] Navegação por teclado (Tab order, focus visible)
- [ ] Touch targets ≥ 44px (modo tablet/mobile)
- [ ] Skip links no AppLayout
- [ ] Screen reader (NVDA) — formulários e tabelas

**Visual:**
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Responsividade: 1280px, 1440px, 1920px (desktop clinica), tablet 768px
- [ ] Consistência de espaçamento (inspeção visual dos 8px grid)
- [ ] Dark mode — todas as telas

**Performance:**
- [ ] Fontes com `font-display: swap`
- [ ] CSS bundle size (purge verificado)
- [ ] Lighthouse score ≥ 90 em Performance + Accessibility

---

## 5. Métricas de Sucesso

| Métrica | Meta |
|---|---|
| WCAG 2.1 AA | 100% de contraste aprovado |
| Lighthouse Accessibility | ≥ 90 |
| Lighthouse Performance | ≥ 85 |
| CSS bundle | < 200kb gzipped |
| Consistência de tokens | Zero hardcodes hex em componentes (apenas CSS vars) |
| Cobertura de módulos | 100% das 36 rotas redesenhadas |

---

## 6. Decisões do Cliente ✅ CONFIRMADAS (2026-04-25)

| Decisão | Escolha |
|---|---|
| **Tema padrão** | ✅ Light mode (clínica diurna) |
| **Cor primária de ação** | ✅ Sage Green `#059669` |
| **Tipografia** | ✅ Plus Jakarta Sans (display) + Inter (body) |
| **Densidade** | ✅ Confortável (whitespace generoso) |
| **Gradientes** | ✅ Flat / Solid (sem gradients) |
| **Dark mode** | A definir — pode ser adicionado pós-Fase 3 |

---

## 7. Ordem de Implementação Recomendada

```
Fase 0 (Foundation)  →  cliente não vê, mas viabiliza tudo
    ↓
Fase 1 (Chrome)      →  🛑 APROVAÇÃO CLIENTE
    ↓
Fase 2 (Componentes) →  🛑 APROVAÇÃO CLIENTE
    ↓
Fase 3 (Dashboard + Pacientes — piloto) →  🛑 APROVAÇÃO CLIENTE = GREEN LIGHT PARA TUDO
    ↓
Fases 4, 5, 6 (módulos) — em paralelo se equipe permitir
    ↓
Fase 7 (QA + Acessibilidade)
    ↓
🚀 GO LIVE
```

---

## 8. O Que NÃO Mudar (preservar)

- Arquitetura de rotas e módulos (sem refatoração de lógica)
- APIs e contratos de dados
- Estrutura de `@orthoplus/core-ui` (extender, não reescrever do zero)
- ThemeContext (extender para suportar tokens completos)
- Nenhum `as any` ou supressão de tipos adicionada

---

## 9. Referências

- [Verdana Health Design System](https://designmd.ai/chef/verdana-health-design-system) — paleta + tipografia
- [Ember Healthcare Dashboard](https://dashboardpack.com/theme-details/ember-dashboard) — padrões de telas médicas
- [Linear.app](https://linear.app) — minimalismo e command palette
- [Stripe Dashboard](https://stripe.com) — trust, whitespace, neutros
- [shadcn/ui](https://ui.shadcn.com) — componentes com CSS vars + Radix
- WCAG 2.1 AA guidelines (healthcare obrigatório)
