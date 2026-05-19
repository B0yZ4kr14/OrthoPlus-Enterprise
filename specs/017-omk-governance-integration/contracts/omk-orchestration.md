# Contract: OMK Orchestration Interface

**Feature**: 017-omk-governance-integration

## Interface

OMK exposes a goal-based orchestration interface via MCP tools.

### Goal Lifecycle

| Operation | Input | Output |
|-----------|-------|--------|
| `omk_goal_create` | Raw prompt + constraints + criteria | GoalSpec with ID |
| `omk_goal_show` | goalId | Goal details |
| `omk_goal_next` | goalId | Recommended next action |
| `omk_evidence_add` | goalId, criterionId, passed, message | Updated goal state |
| `omk_goal_verify` | goalId | Pass/fail score |
| `omk_goal_close` | goalId | Archived goal |

### Squad Routing

| Agent Role | Capabilities | Triggers |
|------------|-------------|----------|
| **Planner** | Architecture design, task decomposition | `/speckit-plan` phase |
| **Implementer** | Code generation, test writing | `/speckit-implement` phase |
| **Reviewer** | Code review, security audit | Post-implementation |
| **Verifier** | Test execution, evidence collection | `/speckit-verify` phase |

### Quality Gates

OMK runs quality gates automatically:
1. **Lint Gate**: ESLint with project config
2. **Typecheck Gate**: `tsc --noEmit` (frontend) + `tsc -p tsconfig.build.json` (backend)
3. **Test Gate**: Vitest (frontend) + Jest (backend)
4. **Build Gate**: `vite build` (frontend) + `pnpm build` (backend)

Gate failures pause the workflow and notify the human operator.

### Memory Integration

OMK stores decisions in the local graph:
- `OmkGoal`: The top-level objective
- `OmkTask`: Individual task nodes
- `OmkEvidence`: Proof of criterion satisfaction
- `OmkDecision`: Architecture/design decisions

All nodes are queryable via `omk_graph_query`.
