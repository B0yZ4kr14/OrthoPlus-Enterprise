# Contract: SpecKit Workflow Interface

**Feature**: 017-omk-governance-integration

## Interface

SpecKit exposes a CLI-based workflow interface. Each command is idempotent and filesystem-backed.

### Workflow Commands

| Command | Phase | Input | Output | Artifact |
|---------|-------|-------|--------|----------|
| `/speckit-specify` | 0 | Natural language description | Feature spec | `specs/NNN-name/spec.md` |
| `/speckit-clarify` | 0 | Spec with [NEEDS CLARIFICATION] | Resolved spec | Updated `spec.md` |
| `/speckit-plan` | 1 | Resolved spec | Implementation plan | `specs/NNN-name/plan.md` |
| `/speckit-tasks` | 2 | Plan + spec | Task list | `specs/NNN-name/tasks.md` |
| `/speckit-implement` | 3 | Tasks | Code changes | Git commits |
| `/speckit-verify` | 4 | Implementation | Validation report | Evidence + score |

### State Machine

```
specify → clarify → plan → tasks → implement → verify → ship
   ↑______________|    |______________|
   (revert on fail)    (revert on fail)
```

### Quality Gates

Each phase transition requires:
- **specify → clarify**: All [NEEDS CLARIFICATION] markers resolved
- **clarify → plan**: Constitution Check passes
- **plan → tasks**: No unresolved architecture violations
- **tasks → implement**: Task list validated against spec
- **implement → verify**: build + type-check + lint + test pass
- **verify → ship**: All success criteria have evidence

### Error Handling

- `MISSING_SPEC`: Run `/speckit-specify` first
- `CLARIFICATION_PENDING`: Run `/speckit-clarify`
- `CONSTITUTION_VIOLATION`: Fix violations or document justification in plan.md
- `GATE_FAILURE`: Address failing checks before proceeding
