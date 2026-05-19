# Tasks: Sidebar com Categorias Recolhidas por Padrão

**Input**: Design documents from `/specs/018-sidebar-collapsed-default/`

**Prerequisites**: plan.md (required), spec.md (required)

---

## Phase 1: State Management Foundation

**Purpose**: Core state layer that MUST be complete before ANY UI work

**CRITICAL**: No UI work can begin until this phase is complete

- [ ] T001 Create `SidebarCategoryContext` — React Context with expandedGroups state
- [ ] T002 Create `useSidebarCategoryState` hook — wraps context + localStorage
- [ ] T003 Implement localStorage save/load with key `orthoplus:sidebar:groups:{userId}`
- [ ] T004 Implement default state: all groups collapsed
- [ ] T005 Implement auto-expand for active category (based on current route)
- [ ] T006 Add error handling for corrupted/missing localStorage
- [ ] T007 Run `cd apps/web && pnpm type-check`

**Checkpoint**: Context works independently — can toggle and persist state

---

## Phase 2: Component Enhancement

**Purpose**: UI integration

- [ ] T100 [P] Modify `SidebarGroup.tsx` — integrate context, add collapse toggle
- [ ] T101 [P] Modify `SidebarGroup.tsx` — add chevron icon with rotation
- [ ] T102 [P] Modify `SidebarGroup.tsx` — add Framer Motion AnimatePresence
- [ ] T103 [P] Modify `SidebarNav.tsx` — wrap with SidebarCategoryProvider
- [ ] T104 [P] Add keyboard accessibility (Enter/Space on group header)
- [ ] T105 [P] Add ARIA attributes (aria-expanded, aria-controls)
- [ ] T106 Run `cd apps/web && pnpm type-check`

**Checkpoint**: Sidebar renders with collapsible categories

---

## Phase 3: Animation Polish

**Purpose**: Premium feel

- [ ] T200 Add collapse/expand animation variants in `lib/animations.ts`
- [ ] T201 Apply stagger animation to child items on expand
- [ ] T202 Add chevron rotation animation (0° ↔ 180°)
- [ ] T203 Verify no layout shift during animation
- [ ] T204 Verify 60fps in Chrome DevTools

**Checkpoint**: Animations are smooth and professional

---

## Phase 4: Edge Cases & Accessibility

- [ ] T300 Handle single visible category (auto-expand, disable toggle)
- [ ] T301 Handle localStorage unavailable (private mode) — graceful fallback
- [ ] T302 Handle corrupted localStorage JSON — reset to default
- [ ] T303 Verify keyboard navigation (Tab, Enter, Space)
- [ ] T304 Verify screen reader announces expanded/collapsed state

---

## Phase 5: Quality Gates

- [ ] T400 `cd apps/web && pnpm type-check` passes (0 errors)
- [ ] T401 `cd apps/web && pnpm lint` passes (0 errors)
- [ ] T402 `pnpm build` succeeds
- [ ] T403 Component tests for SidebarGroup pass
- [ ] T404 No new `as any` or `@ts-ignore`
- [ ] T405 `@orthoplus/core-ui` used for all generic UI

---

## Dependencies & Execution Order

| Phase | Depends On | Parallelizable |
|-------|-----------|----------------|
| Phase 1 (State) | — | — |
| Phase 2 (UI) | Phase 1 | T100-T105 |
| Phase 3 (Animation) | Phase 2 | T200-T202 |
| Phase 4 (Edge Cases) | Phase 3 | — |
| Phase 5 (Gates) | All above | — |

### Critical Path

```
T001-T007 (State) → T100-T106 (UI) → T200-T204 (Animation)
→ T300-T304 (Edge Cases) → T400-T405 (Quality Gates)
```

---

## Notes

- **[P]** = Parallelizable (different files, no dependencies)
- All tasks affect frontend only — no backend changes
- Use existing Framer Motion patterns from `lib/animations.ts`
