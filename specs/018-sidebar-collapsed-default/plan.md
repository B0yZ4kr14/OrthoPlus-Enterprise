# Implementation Plan: Sidebar com Categorias Recolhidas por Padrão

**Branch**: `[018-sidebar-collapsed-default]` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-sidebar-collapsed-default/spec.md`

**Status**: Draft Plan — awaiting `/speckit-tasks` breakdown

---

## Summary

This plan implements **collapsible sidebar categories with premium animations** for OrthoPlus Enterprise. The approach is incremental: create a state management layer, enhance existing Sidebar components, and add persistence.

**Primary requirement**: All sidebar categories start collapsed by default, with smooth expand/collapse animations and localStorage persistence.
**Technical approach**: React Context → Sidebar component enhancement → Animation integration → Persistence layer

---

## Technical Context

| Item | Value |
|------|-------|
| **Language/Version** | TypeScript 5.8 |
| **Primary Dependencies** | React 18.3, Framer Motion 12, Tailwind CSS 3.4 |
| **Storage** | localStorage (browser) |
| **Testing** | Vitest + @testing-library/react |
| **Target Platform** | Web SPA (React + Vite) |
| **Project Type** | Brownfield enhancement |
| **Performance Goals** | State init < 50ms, animations at 60fps |
| **Constraints** | Zero new `as any` / `@ts-ignore`, use existing animation patterns |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-3** React Query + apiClient | N/A (no API calls) | N/A |
| **CQ-1** TypeScript strict | Zero new `as any` / `@ts-ignore` | Enforce |
| **FE-1** core-ui components | Use `@orthoplus/core-ui` | Existing |
| **FE-2** Date Handling | N/A | N/A |
| **FE-3** Authentication | Use `useAuth()` | Existing |
| **TP-2** Quality gates | build, type-check, lint, test pass | Enforce |

---

## Project Structure

### Source Code (repository root)

```text
apps/web/src/
├── core/layout/Sidebar/
│   ├── SidebarGroup.tsx           # MODIFY — add collapse toggle + animation
│   ├── SidebarNav.tsx             # MODIFY — integrate state context
│   ├── sidebar.config.ts          # (no change)
│   └── index.tsx                  # (no change)
├── contexts/
│   └── SidebarCategoryContext.tsx # NEW — state management + localStorage
├── lib/animations.ts              # MODIFY — add collapse variants
└── hooks/
    └── useSidebarCategoryState.ts # NEW — hook for category state
```

---

## Implementation Phases

### Phase 1: State Management Foundation

- [ ] P001 Create `SidebarCategoryContext` with React Context
- [ ] P002 Create `useSidebarCategoryState` hook
- [ ] P003 Add localStorage persistence (save/load/clear)
- [ ] P004 Add default state logic (all collapsed)
- [ ] P005 Add auto-expand for active category
- [ ] P006 Add error handling for corrupted localStorage

### Phase 2: Component Enhancement

- [ ] P007 [P] Modify `SidebarGroup.tsx` — add collapse toggle
- [ ] P008 [P] Modify `SidebarGroup.tsx` — add chevron icon
- [ ] P009 [P] Modify `SidebarGroup.tsx` — add Framer Motion animations
- [ ] P010 [P] Modify `SidebarNav.tsx` — wrap with context provider
- [ ] P011 [P] Add keyboard accessibility (Enter/Space)
- [ ] P012 [P] Add ARIA attributes

### Phase 3: Animation Polish

- [ ] P013 Add `staggerContainer` variants for child items
- [ ] P014 Add `collapseExpand` variant for category content
- [ ] P015 Add chevron rotation animation
- [ ] P016 Verify 60fps on dev tools

### Phase 4: Edge Cases & Accessibility

- [ ] P017 Handle single visible category (auto-expand)
- [ ] P018 Handle localStorage unavailable (private mode)
- [ ] P019 Handle corrupted localStorage state
- [ ] P020 Verify keyboard navigation
- [ ] P021 Verify screen reader announcements

### Phase 5: Quality Gates

- [ ] P022 `cd apps/web && pnpm type-check` (0 errors)
- [ ] P023 `cd apps/web && pnpm lint` (0 errors)
- [ ] P024 `pnpm build` succeeds
- [ ] P025 Component tests pass
- [ ] P026 No new `as any` or `@ts-ignore`
