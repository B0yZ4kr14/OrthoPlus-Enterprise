# OMK Extension Suite Playbook

## Mission
Execute the complete Speckit extension suite for OrthoPlus Enterprise feature 020-spec-memory-hub.

## Prerequisites
- All extensions installed (via batch install script)
- Active OMK session
- Project context set

## Execution Phases

### Phase 0: Bootstrap & Discovery
```yaml
agents: [DISCOVERY]
commands:
  - /speckit.doctor-check          # Project health diagnostic
  - /speckit.brownfield-scan       # Auto-discover architecture
  - /speckit.repoindex-overview    # Repository index
```

### Phase 1: Spec Quality Gates
```yaml
agents: [SOCRATES, POPPER]
parallel: true
commands:
  - /speckit.red-team-run          # Adversarial review
  - /speckit.critique-run          # Product+engineering critique
  - /speckit.security-review-plan  # Security review of plan
  - /speckit.architecture-guard-review  # Architecture review
```

### Phase 2: Analysis & Estimation
```yaml
agents: [ANALYST]
commands:
  - /speckit.scope-estimate        # Effort estimation
  - /speckit.ripple-scan           # Side-effect detection
  - /speckit.analyze               # Cross-artifact consistency
```

### Phase 3: Governance & Memory
```yaml
agents: [GOVERNOR]
commands:
  - /speckit.agent-governance-refresh  # Governance refresh
  - /speckit.memorylint-run        # Memory lint
  - /speckit.version-guard-check   # Version guard
```

### Phase 4: Implementation Support
```yaml
agents: [BUILDER]
commands:
  - /speckit.blueprint-generate    # Pre-implementation blueprint
  - /speckit.diagram-workflow      # Workflow diagram
  - /speckit.diagram-dependencies  # Task dependency DAG
```

### Phase 5: Verification & Cleanup
```yaml
agents: [VERIFICADOR]
commands:
  - /speckit.verify-run            # Post-implementation verification
  - /speckit.verify-tasks-run      # Task phantom check
  - /speckit.cleanup-run           # Quality cleanup
  - /speckit.ripple-resolve        # Resolve ripple findings
```

### Phase 6: Release & Archive
```yaml
agents: [SHIPPER]
commands:
  - /speckit.ship-run              # Release pipeline
  - /speckit.archive-run           # Archive to memory
  - /speckit.retro-run             # Retrospective
```

## Orchestration Notes
- Each phase gates the next (fail-fast)
- Parallel execution within phases where safe
- Results aggregated into canonical report
- All findings logged to .specify/memory/
