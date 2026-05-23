# OMK Extension Suite Orchestrator

## Objective
Install ALL available Speckit extensions from the official catalog and execute
the complete extension suite for the OrthoPlus Enterprise project.

## Strategy
1. **Discovery**: Parse official catalog, compare with installed extensions
2. **Installation**: Batch-install missing extensions via `specify extension install`
3. **Execution**: Run extensions in dependency order via OMK multi-agent orchestration
4. **Documentation**: Aggregate results into canonical report

## Extension Categories
- **Core SDD**: specify, plan, tasks, implement, verify, status
- **Quality Gates**: red-team, security-review, architecture-guard, critique, review
- **Analysis**: doctor, brownfield, repoindex, scope, ripple, analyze
- **Governance**: agent-governance, memorylint, version-guard, ci-guard
- **Integration**: github-issues, git, pr-bridge, changelog
- **Advanced**: fleet, maqa, schedule, orchestrator, multi-model-review

## Execution Order (Dependency DAG)
```
Phase 1: Discovery + Install
  └─> doctor (health check)
  └─> catalog-ci (validate catalog)
Phase 2: Analysis
  └─> brownfield-scan
  └─> repoindex
  └─> scope-estimate
Phase 3: Quality Gates
  └─> red-team
  └─> security-review
  └─> architecture-guard
Phase 4: Governance
  └─> agent-governance-refresh
  └─> memorylint
  └─> version-guard
Phase 5: Integration
  └─> ripple-scan
  └─> verify-run
  └─> cleanup-run
```
