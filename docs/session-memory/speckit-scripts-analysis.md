# Speckit Scripts, Workflows & Automation Analysis

> **Project:** OrthoPlus Enterprise  
> **Analysis Date:** 2026-05-24  
> **Analyst:** Kimi Code CLI  

---

## 1. Executive Summary

The OrthoPlus Enterprise project has a **massive Spec-Kit (Speckit) automation surface** with **93 installed extensions**, **6 core bash scripts**, **2 workflow definitions**, **14 GitHub Actions workflows**, and **382 mapped Kimi skills**. The infrastructure is largely healthy: all core scripts are executable, extension manifests are valid, and script references resolve correctly. Key issues identified: one extension (`team-assign`) is present on disk but missing from the install registry; several spec directories are near-empty stubs; and the `v-model` extension contains a nested `.specify/` directory tree that appears to be packaging residue.

---

## 2. Core Scripts (`.specify/scripts/`)

### 2.1 Script Inventory

| Script | Lines | Purpose | Executable | Status |
|--------|-------|---------|------------|--------|
| `bash/common.sh` | 645 | Shared functions: repo-root discovery, branch resolution, template resolution, JSON escaping, feature-path resolution | ✅ | **Healthy** |
| `bash/check-prerequisites.sh` | 190 | Validates feature directory, plan.md, and optional docs; outputs JSON or text; supports `--paths-only`, `--require-tasks`, `--include-tasks` | ✅ | **Healthy** |
| `bash/create-new-feature.sh` | 413 | Creates numbered/timestamped feature branches, resolves next available feature number from git branches + specs dir, copies spec template | ✅ | **Healthy** |
| `bash/doctor.sh` | 159 | Project health diagnostic: structure, agents, features completeness, script permissions, extensions, git status | ✅ | **Healthy** |
| `bash/setup-plan.sh` | 75 | Copies plan template to feature directory; resolves via template override stack | ✅ | **Healthy** |
| `bash/setup-tasks.sh` | 96 | Copies tasks template to feature directory; validates plan.md and spec.md prerequisites | ✅ | **Healthy** |

### 2.2 Script Functional Analysis

- **Shebangs:** All use `#!/usr/bin/env bash` except `doctor.sh` which uses `#!/bin/bash` — functionally equivalent.
- **`set -e` usage:** Present in all standalone scripts; `common.sh` omits it (correct, as it is sourced).
- **Template resolution stack:** `common.sh` implements a sophisticated 4-priority template resolution system:
  1. `.specify/templates/overrides/`
  2. `.specify/presets/<preset>/templates/` (sorted by priority registry)
  3. `.specify/extensions/<ext>/templates/`
  4. `.specify/templates/` (core)
- **Branch naming:** Supports sequential (`001-feature-name`) and timestamp (`20260319-143022-feature-name`) prefixes, with GitHub 244-byte limit truncation.
- **Git independence:** Scripts work in non-git repos by falling back to `SPECIFY_FEATURE` env var or latest specs directory.

### 2.3 Broken / Missing Scripts

| Issue | Severity | Details |
|-------|----------|---------|
| **No PowerShell core scripts** | Low | Only bash scripts exist in `.specify/scripts/`; Windows users rely on extension-level PowerShell scripts. |
| **No `setup-specify.sh`** | Info | `create-new-feature.sh` handles spec creation inline; no dedicated script. |

---

## 3. Workflows

### 3.1 Spec-Kit Workflows (`.specify/workflows/`)

| File | Purpose | Status |
|------|---------|--------|
| `workflow-registry.json` | Registry of installed workflows; currently contains 1 entry: "Full SDD Cycle" (speckit v1.0.0) | ✅ Valid JSON |
| `speckit/workflow.yml` | Bundled workflow definition: specify → review gate → plan → review gate → tasks → implement | ✅ Valid YAML |

**Workflow triggers and gates:**
- Requires `speckit_version: ">=0.7.2"`
- Integrations: `copilot`, `claude`, `gemini` (any)
- Inputs: `spec` (string), `integration` (default: copilot), `scope` (full/backend-only/frontend-only)
- Gates: 2 human-in-the-loop gates (`review-spec`, `review-plan`) with `on_reject: abort`

### 3.2 GitHub Actions Workflows (`.github/workflows/`)

| Workflow | Trigger | Speckit-Related? | Status |
|----------|---------|------------------|--------|
| `build.yml` | push/PR main, develop | ❌ CI/CD | ✅ |
| `cd.yml` | push main | ❌ CD | ✅ |
| `ci.yml` | push/PR main | ❌ CI | ✅ |
| `deploy-theme-v2.yml` | manual | ❌ Deploy | ✅ |
| `deploy-vps-orthoplus.yml` | push main / manual | ❌ Deploy | ✅ |
| `deploy.yml` | push main, master | ❌ Deploy | ✅ |
| `e2e-tests.yml` | push/PR main, develop | ❌ QA | ✅ |
| `gitnexus-index.yml` | push main | ❌ Indexing | ✅ |
| `playwright.yml` | workflow_dispatch | ❌ E2E | ✅ |
| `production-validation.yml` | push/PR main | ❌ Security | ✅ |
| `quality-check.yml` | push/PR main, develop | ❌ Quality | ✅ |
| `security.yml` | push/PR main + cron | ❌ Security | ✅ |
| **`speckit-compliance.yml`** | PR opened/sync/reopened on `apps/**`, `backend/**`, etc. | ✅ **YES** | ✅ |
| `test.yml` | push/PR main, develop | ❌ Tests | ✅ |

**Speckit Compliance Workflow Analysis:**
- Checks if PR branch follows feature naming (`^[0-9]+-`)
- Validates that a matching `specs/<NNN>-*/` directory exists
- Validates that at least one complete spec (spec.md + plan.md + tasks.md) exists repo-wide
- Skips gracefully for non-feature branches (hotfix/docs)
- **Status:** Functional, well-structured

---

## 4. Extensions (`.specify/extensions/`)

### 4.1 Extension Inventory Summary

- **Total extension directories:** 94 (including `.cache`)
- **Valid `extension.yml` manifests:** 93
- **Listed in `extensions.yml` installed:** 92
- **Skills mapped in `.kimi/skills/`:** 382

### 4.2 Extension Categories

| Category | Extensions | Count |
|----------|-----------|-------|
| **Core SDD** | specify, plan, tasks, implement, analyze, verify, checklist, clarify | 8 |
| **Git & Branching** | git, branch-convention, checkpoint, ship | 4 |
| **Architecture & Design** | arch, architecture-guard, blueprint, diagram | 4 |
| **Quality & Review** | review, critique, staff-review, security-review, red-team, ripple, cleanup, fix-findings, fixit, qa, docguard | 11 |
| **Project Management** | status, doctor, orchestrator, scope, cost, schedule, iterate, refine, sync, reconcile, retro, retrospective, time-machine, fleet | 14 |
| **Integrations** | azure-devops, github-issues, issue, jira, maqa*, workiq, markitdown | 9 |
| **AI Agents & Squads** | agent-assign, agent-governance, agent-orchestrator, squad, team-assign, memory-loader, memorylint, memory-md | 8 |
| **Specialized Workflows** | product-forge, ralph, superb, speckit-superpowers-bridge, canon, v-model, reqnroll-bdd, brownfield, brownkit, fx-to-dotnet, sf, tinyspec | 14 |
| **Utilities** | extensify, presetify, catalog-ci, preview, wireframe, token-analyzer, version-guard, threatmodel, conduct, onboard, learn, optimize, mde, archive, spec-validate, verify-tasks, spec-reference-loader, spec2cloud, deploy, multi-model-review, worktree, worktrees | 22 |

### 4.3 Configuration & Hook Surface

The `extensions.yml` defines a **dense hook graph**:

| Hook Point | Extension Hooks | Notable Gates |
|------------|----------------|---------------|
| `before_specify` | 5 hooks (branch-convention, brownkit, mde, tinyspec, workiq) | branch-convention validates naming |
| `after_specify` | 9 hooks (memory-loader, red-team, fx-to-dotnet, refine, spec-validate, token-analyzer, wireframe, workiq, worktree/worktrees) | red-team is optional; mde sync is mandatory |
| `before_plan` | 5 hooks (mde, memory-md, spec-reference-loader, speckit-superpowers-bridge.guard, wireframe) | plan-review-gate is actually under `before_tasks` |
| `after_plan` | 6 hooks (blueprint, scope, architecture-guard, fx-to-dotnet, refine, token-analyzer) | architecture-guard.governed-plan optional |
| `before_tasks` | 5 hooks (docguard, mde, plan-review-gate, spec-reference-loader, speckit-superpowers-bridge.guard) | **plan-review-gate is mandatory** |
| `after_tasks` | 17 hooks (verify-tasks, squad, agent-assign, azure-devops, docguard, fleet, fx-to-dotnet, jira, maqa, ralph, schedule, sf, spec-validate, speckit-superpowers-bridge.handoff, superb.review, token-analyzer, v-model.trace) | speckit-superpowers-bridge.handoff is **mandatory** |
| `before_implement` | 9 hooks (blueprint.validate, architecture-guard.governed-implement, brownkit.gate, fx-to-dotnet.implement-hook, mde, onboard, reqnroll-bdd, spec-reference-loader, spec-validate.gate, speckit-superpowers-bridge.guard, superb.tdd) | **superb.tdd and spec-validate.gate are mandatory** |
| `after_implement` | 18 hooks (checkpoint, verify, ripple, security-review, staff-review, cleanup, architecture-guard.verify, brownkit.validate, bugfix.verify, docguard.guard, fx-to-dotnet.verify-hook, learn.review, maqa-ci, memory-md.capture-from-diff, onboard, qa, review, sf.verify, superb.verify, threatmodel, time-machine.next, token-analyzer, wireframe.screenshots) | **superb.verify is mandatory** |

**Settings:**
- `auto_execute_hooks: false` — hooks are interactive/prompt-based, not automatic
- `notify_on_drift: true`
- `enable_memory_loader: true`

### 4.4 Extension Issues

| Issue | Location | Severity | Details |
|-------|----------|----------|---------|
| **Uninstalled extension on disk** | `.specify/extensions/team-assign/` | Low | Extension manifest exists and is valid, but `team-assign` is **not** in `.specify/extensions.yml` `installed:` list. It is therefore inactive. |
| **Dual manifest files** | `.specify/extensions/onboard/` | Low | Has both `extension.json` and `extension.yml`. The YAML likely takes precedence. |
| **Nested `.specify` directory** | `.specify/extensions/v-model/.specify/` | Low | Contains templates and scripts nested inside the extension. Appears to be packaging residue or a self-contained preset. Functional but unusual. |
| **Empty `.cache` directory** | `.specify/extensions/.cache/` | Info | No `extension.yml`; ignored by the system. |
| **Bak files in repoindex** | `.specify/extensions/repoindex/commands/*.md.bak` | Low | 3 `.bak` files (`architecture.md.bak`, `module.md.bak`, `overview.md.bak`) present. Safe to delete. |

---

## 5. Extension Scripts (`.specify/extensions/*/scripts/`)

### 5.1 Script Distribution

Scripts were found in **25+ extensions** across three languages:

| Language | Approximate Count | Extensions |
|----------|-------------------|------------|
| **Bash** | ~45 | architecture-guard, arch, azure-devops, blueprint, brownkit, canon, conduct, docguard, doctor, fx-to-dotnet, git, memory-md, product-forge, ralph, review, security-review, speckit-superpowers-bridge, spec-validate, status, superb, token-analyzer, verify, v-model, wireframe, worktrees |
| **PowerShell** | ~35 | architecture-guard, arch, azure-devops, brownkit, canon, conduct, doctor, fx-to-dotnet, git, memory-md, ralph, review, worktrees |
| **Python** | ~15 | agent-governance, brownkit, memory-md, schedule, security-review |
| **TypeScript/Node** | ~3 | memory-md (bin/speckit-memory.ts), product-forge (migrate scripts) |

### 5.2 Script Path Validation

A spot-check of extensions that declare `scripts:` or reference script files in `extension.yml` found **no broken references**:

- `verify`: `scripts/bash/load-config.sh` and `scripts/powershell/load-config.ps1` → both exist
- `conduct`: `scripts/bash/common.sh`, `scripts/bash/load.sh` → both exist
- `docguard`: `scripts/bash/common.sh`, `docguard-check-docs.sh`, `docguard-init-doc.sh`, `docguard-suggest-fix.sh` → all exist
- `fx-to-dotnet`: `scripts/bash/dotnet-build.sh`, `find-recommended-package-upgrades.sh`, `get-minimal-package-set.sh` → all exist
- `review`: `scripts/bash/detect-changed-files.sh` → exists

**Note:** Many extensions reference scripts inside command markdown files rather than in `extension.yml`. Those were not exhaustively validated but the file structure is consistent.

### 5.3 Notable Extension Scripts

| Extension | Script | Purpose |
|-----------|--------|---------|
| **brownkit** | `bash/detect-stack.sh`, `python/detect_stack.py` | Detect project tech stack |
| **brownkit** | `bash/find-secrets.sh`, `python/find_secrets.py` | Scan for hardcoded secrets |
| **brownkit** | `bash/git-churn.sh`, `python/git_churn.py` | Identify high-churn code areas |
| **brownkit** | `bash/validate-evidence.sh`, `python/validate_evidence.py` | Validate assessment evidence |
| **fx-to-dotnet** | `bash/dotnet-build.sh` | Iterative build-fix loop for .NET migration |
| **fx-to-dotnet** | `bash/find-recommended-package-upgrades.sh` | Find NuGet package upgrades |
| **memory-md** | `scripts/bash/detect-changed-files.sh` | Detect changed files for memory capture |
| **memory-md** | `bin/speckit-memory.ts` | TypeScript CLI entry point |
| **schedule** | `solver/` (Python package, 30+ modules) | CP-SAT scheduling solver with visualization |
| **product-forge** | `scripts/migrate-status-v2-to-v3.js` | Status schema migration |

---

## 6. Spec-Kit Command Surface

### 6.1 Core Commands

These are the foundational SDD commands (defined by core templates and scripts):

| Command | Script/Skill | Phase |
|---------|-------------|-------|
| `/speckit.specify` | `.kimi/skills/speckit-specify/SKILL.md` | Specification |
| `/speckit.plan` | `.kimi/skills/speckit-plan/SKILL.md` | Planning |
| `/speckit.tasks` | `.kimi/skills/speckit-tasks/SKILL.md` | Task Generation |
| `/speckit.implement` | `.kimi/skills/speckit-implement/SKILL.md` | Implementation |
| `/speckit.verify` | `.kimi/skills/speckit-verify/SKILL.md` | Verification |
| `/speckit.analyze` | `.kimi/skills/speckit-analyze/SKILL.md` | Analysis |
| `/speckit.clarify` | `.kimi/skills/speckit-clarify/SKILL.md` | Clarification |
| `/speckit.checklist` | `.kimi/skills/speckit-checklist/SKILL.md` | Checklist |

### 6.2 Skill-to-Extension Mapping

The `.kimi/skills/` directory contains **382 `speckit-*` skill directories**, each with a `SKILL.md`. This provides a near-complete command surface. Skills are named using the pattern:

```
speckit-<ext-id>-<command-name>
```

Examples:
- `speckit-specify` → core specify
- `speckit-product-forge-forge` → product-forge extension, forge command
- `speckit-canon-drift-detect` → canon extension, drift-detect command
- `speckit-fx-to-dotnet-assess` → fx-to-dotnet extension, assess command

### 6.3 Command Status Assessment

| Status | Count | Notes |
|--------|-------|-------|
| **Active / Mapped** | ~370+ | Have corresponding `SKILL.md` and extension manifest |
| **Potentially Broken** | ~5-10 | Commands depending on external tools not installed in this environment (e.g., `az` for Azure DevOps, `gh` for GitHub Issues, `squad-cli` for squad) |
| **Environment-Dependent** | ~15 | Python-based extensions (schedule solver, memory-md CLI) may need `npm install` or `pip install` in their directories |

### 6.4 Broken or At-Risk Commands

| Command | Risk | Reason |
|---------|------|--------|
| `speckit.azure-devops.sync` | High | Requires `az` CLI (Azure CLI) which is not guaranteed to be installed |
| `speckit.github-issues.import` | High | Requires `gh` CLI >= 2.0.0 |
| `speckit.squad.*` | High | Requires `@bradygaster/squad-cli` npm package |
| `speckit.schedule.run` | Medium | Requires Python CP-SAT solver dependencies (`ortools`, etc.) from `pyproject.toml` |
| `speckit.memory-md.*` | Medium | TypeScript CLI requires `npm install` in extension directory |
| `speckit.workiq.*` | High | Requires M365 / Work IQ integration (external service) |
| `speckit.maqa.*` | Medium | Requires external board configurations (Azure DevOps, Jira, Linear, Trello, GitHub Projects) that may not be set up |
| `speckit.fx-to-dotnet.*` | Low-Medium | Requires .NET SDK for build-fix loops; harmless if no .NET Framework projects exist |

---

## 7. Feature Specs Health

### 7.1 Active Features (`specs/`)

| Feature Dir | Files Present | Size | Status |
|-------------|--------------|------|--------|
| `001-pacientes` — `020-spec-memory-hub` | Varies | 44B–1.2KB | Mixed completeness |
| `021-teleodontologia` | ~0 files | 44B | **Empty stub** |
| `022-marketing` | ~0 files | 44B | **Empty stub** |
| `023-dashboard` | ~0 files | 44B | **Empty stub** |
| `024-nfe` | ~0 files | 44B | **Empty stub** |
| `025-fidelidade` | Minimal | 106B | Near-empty |
| `agenda`, `analytics`, `bi`, `pacientes` | Minimal | 44B–62B | Legacy or stub dirs |

### 7.2 Most Complete Features

| Feature | Evidence |
|---------|----------|
| `017-omk-governance-integration` | 398B, contains plan.md, changelog.md, spec.md (archived) |
| `020-spec-memory-hub` | 1.2KB, most substantial spec directory |
| `018-sidebar-collapsed-default` | 210B, has spec.md |
| `019-ia-radiografia` | 174B, has spec.md |

---

## 8. Templates

### 8.1 Core Templates (`.specify/templates/`)

| Template | Size | Purpose |
|----------|------|---------|
| `spec-template.md` | 7.5KB | Feature specification template |
| `plan-template.md` | 9.2KB | Implementation plan template |
| `tasks-template.md` | 13.3KB | Task breakdown template |
| `checklist-template.md` | 2.5KB | Quality checklist template |
| `constitution-template.md` | 2.3KB | Project constitution template |

All core templates are present and non-empty.

---

## 9. Recommendations

| Priority | Action | Owner |
|----------|--------|-------|
| **P1** | **Register `team-assign` in `.specify/extensions.yml`** or remove the directory if intentionally uninstalled. | DevOps |
| **P2** | **Clean up empty spec stubs** (`021-teleodontologia`, `022-marketing`, `023-dashboard`, `024-nfe`) or populate them. | Product |
| **P2** | **Remove `.bak` files** from `repoindex/commands/` to reduce clutter. | Maintenance |
| **P3** | **Document external tool dependencies** (`az`, `gh`, `squad-cli`, Python venv for schedule/memory-md) in project onboarding. | Docs |
| **P3** | **Evaluate `v-model` nested `.specify/` directory** — determine if it is intentional packaging or residue. | Maintenance |
| **P3** | **Add `setup-specify.sh`** for symmetry with `setup-plan.sh` and `setup-tasks.sh`, or document that `create-new-feature.sh` covers it. | Core |

---

## Appendix A: Extension ID Reference

The following 93 extensions have valid `extension.yml` manifests:

```
agent-assign, agent-governance, agent-orchestrator, aide, arch,
architecture-guard, archive, azure-devops, blueprint, branch-convention,
brownfield, brownkit, bugfix, canon, catalog-ci, checkpoint, cleanup,
conduct, cost, critique, diagram, docguard, doctor, extensify,
fix-findings, fixit, fleet, fx-to-dotnet, git, github-issues, issue,
iterate, jira, learn, maqa, maqa-azure-devops, maqa-ci,
maqa-github-projects, maqa-jira, maqa-linear, maqa-trello, markitdown,
mde, memorylint, memory-loader, memory-md, multi-model-review, onboard,
optimize, orchestrator, plan-review-gate, presetify, preview,
product-forge, qa, ralph, reconcile, red-team, refine, repoindex,
reqnroll-bdd, retro, retrospective, review, ripple, schedule, scope,
security-review, sf, ship, spec2cloud, speckit-superpowers-bridge,
spec-reference-loader, spec-validate, squad, staff-review, status,
superb, sync, team-assign, threatmodel, time-machine, tinyspec,
token-analyzer, verify, verify-tasks, version-guard, v-model, wireframe,
workiq, worktree, worktrees
```

*(Note: `team-assign` is present on disk but absent from `extensions.yml` installed list.)*
