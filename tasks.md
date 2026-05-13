# OrthoPlus Enterprise Dashboard Premium Redesign v4

## Fase 1: Foundation
- Install framer-motion
- Extend CSS variables (animation tokens, glow shadows, radius)
- Create apps/web/src/lib/animations.ts (fadeUp, staggerContainer, countUp, pulseGlow, skeletonShimmer)
- Create apps/web/src/lib/format.ts (formatBRL, formatPercent, formatCompactNumber)

## Fase 2: StatCards Premium
- Redesign StatCardMemo.tsx: glassmorphism, gradient icons, count-up animation, hover lift
- Create EmptyStatCard.tsx: SVG illustration, contextual CTA
- Update DashboardQuickStats.tsx: stagger animation, empty state handling

## Fase 3: ChartCards Premium
- Redesign ChartCardMemo.tsx: gradient fills, custom tooltips BRL, interactive legends
- Create EmptyChartCard.tsx
- Update DashboardChartsMemo.tsx: gradient fills, empty states, entrance animation
- Create PieChartCard for Tratamentos por Status

## Fase 4: Sidebar Premium
- Redesign SidebarMenuItem.tsx: active state (right-border sage, bg highlight), hover, focus
- Redesign SidebarNav.tsx: overline labels, animated badges, admin section
- Update SidebarHeader.tsx: logo glow, Enterprise gradient badge
- Update SidebarFooter.tsx: pulse indicator, version

## Fase 5: Dashboard Layout
- Redesign tabs: pill design, animated indicator
- Update DashboardSkeleton.tsx: shimmer, pulse
- Add entrance animations: staggerContainer + fadeUp
- Optional WelcomeBanner

## Fase 6: A11y & Polish
- Focus states: ring-2 sage-500
- Reduced motion: prefers-reduced-motion + useReducedMotion
- ARIA labels on all icons, charts, badges, tabs
- Touch targets >= 44px

## Quality Gates
- pnpm lint, typecheck, build pass
- Lighthouse: Perf >= 80, A11y >= 95, Best Practices >= 90
