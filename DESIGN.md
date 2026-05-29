# OrthoPlus Enterprise — Design System v4 Premium

## Overview

SaaS B2B multitenant para clínicas odontológicas. O redesign v4 eleva a experiência de "funcional" para "premium", alinhando identidade visual, micro-interações e acessibilidade com o posicionamento Enterprise.

## Design Philosophy

- **Clínica & Confiança**: Cores que evocam saúde, limpeza e tecnologia de ponta
- **Data-First**: Dashboard como centro de comando, não apenas relatório
- **Motion com Propósito**: Animações guiam atenção, não distraem
- **Acessibilidade by Default**: AA como mínimo, AAA onde possível

---

## Color Palette

### Primary — Navy Medical

```
navy-900:  #0A1628  (títulos, autoridade)
navy-800:  #1E293B  (texto primário)
navy-700:  #334155  (texto secundário)
navy-600:  #475569  (descrições)
navy-500:  #64748B  (placeholder)
navy-100:  #F1F5F9  (backgrounds secundários)
navy-50:   #F8FAFC  (background principal)
```

### Interactive — Sage Green (CTAs, ações)

```
sage-600:  #059669  (primário, hover states)
sage-700:  #047857  (hover pressionado)
sage-500:  #10B981  (estados ativos)
sage-400:  #34D399  (destaques leves)
sage-100:  #ECFDF5  (backgrounds de destaque)
sage-50:   #F0FDF4  (backgrounds sutis)
```

### Accent — Teal Dental (identidade odontológica)

```
teal-500:  #14B8A6  (gráficos, badges informativos)
teal-400:  #2DD4BF  (hover em badges)
teal-100:  #CCFBF1  (backgrounds informativos)
teal-50:   #F0FDFA  (backgrounds de alerta suave)
```

### Semantic

```
danger:    #EF4444  (erros, cancelamentos)
warning:   #F59E0B  (atenção, pendentes)
success:   #22C55E  (concluído, saúde)
info:      #0EA5E9  (informação, links)
```

### Charts — Gradient Palette

```
chart-1: linear-gradient(135deg, #059669, #14B8A6)
chart-2: linear-gradient(135deg, #0EA5E9, #06B6D4)
chart-3: linear-gradient(135deg, #8B5CF6, #A78BFA)
chart-4: linear-gradient(135deg, #F59E0B, #FBBF24)
chart-5: linear-gradient(135deg, #EF4444, #F87171)
```

---

## Typography

### Font Stack

```css
--font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
--font-display: "Plus Jakarta Sans", system-ui, sans-serif;
```

### Scale

| Token    | Size             | Weight | Line Height | Usage             |
| -------- | ---------------- | ------ | ----------- | ----------------- |
| display  | 2.5rem (40px)    | 700    | 1.1         | Page titles, hero |
| h1       | 1.875rem (30px)  | 700    | 1.2         | Section headers   |
| h2       | 1.5rem (24px)    | 600    | 1.3         | Card titles       |
| h3       | 1.25rem (20px)   | 600    | 1.4         | Sub-sections      |
| body-lg  | 1.125rem (18px)  | 400    | 1.6         | Lead text         |
| body     | 1rem (16px)      | 400    | 1.5         | Default text      |
| body-sm  | 0.875rem (14px)  | 400    | 1.5         | Descriptions      |
| caption  | 0.75rem (12px)   | 500    | 1.4         | Labels, badges    |
| overline | 0.6875rem (11px) | 600    | 1.2         | Uppercase labels  |

---

## Spacing System

Base 4px. Tokens: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

---

## Shadows & Elevation

```css
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-card-hover:
  0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-elevated:
  0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
--shadow-glow-sage: 0 0 20px rgba(5, 150, 105, 0.15);
--shadow-glow-teal: 0 0 20px rgba(20, 184, 166, 0.15);
```

---

## Border Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;
```

---

## Animation Tokens

### Durations

```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

### Easings

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Key Patterns

- **Card Entrance**: translateY(12px) + opacity(0→1), 400ms, ease-out, stagger 80ms
- **Stat Counter**: count-up animation, 800ms, ease-out
- **Chart Draw**: stroke-dashoffset animation, 1200ms, ease-out
- **Pulse Indicator**: scale(1→1.05→1), 2s, infinite, ease-in-out
- **Hover Lift**: translateY(-2px) + shadow-elevated, 200ms
- **Focus Ring**: box-shadow glow, 150ms
- **Skeleton Shimmer**: background-position shift, 1.5s, infinite

---

## Component Patterns

### StatCard Premium

```
- Glassmorphism sutil: bg-white/80 + backdrop-blur-sm
- Border: 1px solid sage-100
- Icon container: 48px rounded-xl, gradient bg (sage→teal)
- Value: display font, navy-900, tabular-nums
- Trend badge: pill shape, green/red with arrow icon
- Hover: shadow-card-hover + translateY(-2px)
- Entrance: fade-up stagger
```

### ChartCard Premium

```
- Header: icon + title + period selector (semanal/mensal/anual)
- Chart area: gradient fill under lines, rounded bars
- Tooltip: card with shadow, valor formatado em BRL, delta vs período anterior
- Legend: interactive (toggle séries)
- Empty state: ilustração + CTA "Adicionar primeiro agendamento"
```

### Sidebar NavItem

```
- Default: navy-600 icon, navy-800 text
- Active: sage-600 icon + text, sage-50 bg, right-border 3px sage-600
- Hover: navy-50 bg, navy-700 text
- Badge: pill, danger para overdue, sage para padrão
- Transition: background 150ms, color 150ms
- Collapsed: apenas ícone, tooltip no hover
```

### Dashboard Tab

```
- Container: pill-shaped background navy-100
- Active: white bg, shadow-sm, sage-600 text + icon
- Inactive: transparent, navy-500 text
- Indicator: underline animado (width 0→100%), 200ms
- Transition: all 200ms ease-out
```

### Empty State

```
- Ilustração SVG custom (50% opacity)
- Título: h3, navy-800, "Nenhum paciente cadastrado"
- Descrição: body-sm, navy-500, "Comece adicionando seu primeiro paciente"
- CTA: button sage-600, "Adicionar Paciente" + ícone
- Background: dashed border navy-200, rounded-lg
```

---

## Responsive Breakpoints

| Token | Width  | Usage            |
| ----- | ------ | ---------------- |
| sm    | 640px  | Mobile landscape |
| md    | 768px  | Tablet           |
| lg    | 1024px | Desktop          |
| xl    | 1280px | Large desktop    |
| 2xl   | 1536px | Ultra-wide       |

---

## Accessibility Requirements

- WCAG 2.1 AA minimum, AAA where feasible
- Focus indicators: 2px solid sage-600, 2px offset
- Reduced motion: disable animations, instant transitions
- Color independence: never rely solely on color for information
- Minimum touch target: 44x44px
- Screen reader: all icons have aria-label, charts have aria-describedby
