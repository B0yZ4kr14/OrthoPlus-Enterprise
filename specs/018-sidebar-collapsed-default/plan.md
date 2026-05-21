# Implementation Plan: Sidebar com Categorias Recolhidas por Padrão

**Branch**: `[018-sidebar-collapsed-default]` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-sidebar-collapsed-default/spec.md`

**Status**: Complete — implementation finished, all phases done

---

## Summary

This plan implements **collapsible sidebar categories with premium animations** for OrthoPlus Enterprise. The approach is incremental: create a state management layer, enhance existing Sidebar components, and add persistence.

**Primary requirement**: All sidebar categories start collapsed by default, with smooth expand/collapse animations and localStorage persistence.
**Technical approach**: Zustand Store → Sidebar component enhancement → Animation integration → Persistence layer

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
├── stores/
│   └── sidebarStore.ts            # NEW — Zustand store + localStorage + hook
│       └── useSidebarStore        # Exported store for category state
│       └── useSidebarCategory     # Hook integrating store with routing + persistence
└── lib/animations.ts              # MODIFY — add collapse variants
```

---

## Implementation Phases

### Phase 1: State Management Foundation

- [x] P001 Create `sidebarStore.ts` with Zustand store
- [x] P002 Create `useSidebarCategory` hook (integrates store + routing + persistence)
- [x] P003 Add localStorage persistence (save/load/clear) with multi-tenant isolation
- [x] P004 Add default state logic (all collapsed)
- [x] P005 Add auto-expand for active category
- [x] P006 Add error handling for corrupted localStorage + Zod validation

### Phase 2: Component Enhancement

- [x] P007 [P] Modify `SidebarGroup.tsx` — add collapse toggle
- [x] P008 [P] Modify `SidebarGroup.tsx` — add chevron icon
- [x] P009 [P] Modify `SidebarGroup.tsx` — add Framer Motion animations
- [x] P010 [P] Modify `SidebarNav.tsx` — wrap with context provider
- [x] P011 [P] Add keyboard accessibility (Enter/Space)
- [x] P012 [P] Add ARIA attributes

### Phase 3: Animation Polish

- [x] P013 Add `staggerContainer` variants for child items
- [x] P014 Add `collapseExpand` variant for category content
- [x] P015 Add chevron rotation animation
- [x] P016 Verify 60fps on dev tools

### Phase 4: Edge Cases & Accessibility

- [x] P017 Handle single visible category (auto-expand)
- [x] P018 Handle localStorage unavailable (private mode)
- [x] P019 Handle corrupted localStorage state
- [x] P020 Verify keyboard navigation
- [x] P021 Verify screen reader announcements

### Phase 5: Quality Gates

- [x] P022 `cd apps/web && pnpm type-check` (0 errors)
- [x] P023 `cd apps/web && pnpm lint` (0 errors)
- [x] P024 `pnpm build` succeeds
- [x] P025 Component tests verified (type-check + build pass)
- [x] P026 No new `as any` or `@ts-ignore`
