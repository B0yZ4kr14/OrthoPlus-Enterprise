# 🤖 Cross-Repository Agent Discovery Report

**Generated**: 2026-05-24T23:30:00-03:00
**Project**: OrthoPlus Enterprise
**Repository**: `B0yZ4kr14/OrthoPlus-Enterprise` (main branch)

---

## 📂 Repositories Scanned

| Repository | Type | Agents | Skills | Extensions | Workflows |
|-----------|------|--------|--------|-----------|-----------|
| OrthoPlus Enterprise | Current | 23 | 1,850 | 93 | 1 |
| **Total** | | **23** | **1,850** | **93** | **1** |

> No linked repositories or git submodules found.

---

## 🧠 AGENTS.md Files (23)

Agent governance files found across the codebase:

| Location | Scope |
|----------|-------|
| `./AGENTS.md` | Root project governance |
| `./apps/web/AGENTS.md` | Frontend React app |
| `./backend/AGENTS.md` | Backend Node.js/Express |
| `./agent-service/AGENTS.md` | Python FastAPI agent service |
| `./backend/src/modules/financeiro/AGENTS.md` | Financeiro module |
| `./categories/@orthoplus/core/packages/ui/AGENTS.md` | Core UI package |
| `./tests/e2e/AGENTS.md` | E2E testing |
| `./docs/spec-kit-source/AGENTS.md` | Spec Kit documentation |
| `.omk/open-design/AGENTS.md` | OMK Open Design (root) |
| `.omk/open-design/apps/*/AGENTS.md` | 10 Open Design sub-projects |
| `.omk/open-design/design-systems/_schema/AGENTS.md` | Design system schema |
| `.omk/open-design/design-templates/AGENTS.md` | Design templates |
| `.omk/open-design/e2e/AGENTS.md` | Open Design E2E |
| `.omk/open-design/packages/AGENTS.md` | Open Design packages |
| `.omk/open-design/skills/AGENTS.md` | Open Design skills |
| `.omk/open-design/tools/*/AGENTS.md` | 3 Open Design tools |
| `.specify/extensions/memory-md/templates/AGENTS.md` | Memory MD templates |

---

## 🛠️ SKILL.md Files (1,850)

Skills discovered across multiple agent platforms:

### By Scope

| Scope | Count | Platform |
|-------|-------|----------|
| `.agents/skills/` | 377 | Generic agents |
| `.claude/skills/` | 383 | Claude Code |
| `.cursor/skills/` | 377 | Cursor IDE |
| `.kimi/skills/` | 382 | Kimi CLI |
| `.omk/open-design/skills/` | 107 | OMK Open Design |
| Other locations | 1,204 | Scattered across project |

### By Category (Top 10)

| Category | Count | Description |
|----------|-------|-------------|
| speckit-core | ~350 | Core Spec Kit workflows (specify, plan, tasks, implement, verify) |
| speckit-product-forge | ~80 | Product Forge suite |
| speckit-architecture-guard | ~80 | Architecture guard & review |
| speckit-brownkit | ~60 | Brownfield toolkit |
| speckit-canon-drift | ~40 | Canon drift detection |
| speckit-security-review | ~40 | Security review workflows |
| speckit-verify | ~20 | Verification gates |
| speckit-sync | ~20 | Sync & drift analysis |
| speckit-squad | ~10 | Squad management |
| gitnexus | ~10 | Code intelligence |
| omk-flows | ~15 | OMK feature/bugfix/refactor flows |
| Other | ~1,115 | Misc templates, design patterns, utilities |

### Notable Skills

| Skill | Location | Purpose |
|-------|----------|---------|
| `speckit-brownfield-scan` | `.agents/skills/` | Auto-discover project structure |
| `speckit-verify-run` | `.agents/skills/` | Post-implementation verification |
| `speckit-sync-analyze` | `.agents/skills/` | Spec drift analysis |
| `speckit-status` | `.agents/skills/` | Project status overview |
| `gitnexus-impact-analysis` | `.claude/skills/` | Blast radius analysis |
| `gitnexus-exploring` | `.claude/skills/` | Codebase exploration |
| `omk-flow-feature-dev` | `.kimi/skills/` | End-to-end feature development |
| `omk-flow-bugfix` | `.kimi/skills/` | Bugfix workflow |
| `omk-quality-gate` | `.kimi/skills/` | Lint/typecheck/test/build gates |
| `speckit-memory-md-capture` | `.kimi/skills/` | Memory capture from diffs |

---

## 🤖 Copilot Instructions (5)

| Location | Purpose |
|----------|---------|
| `.github/copilot-instructions.md` | Main Copilot instructions |
| Additional locations | 4 more copilot instruction files |

---

## 💬 Prompts (297)

GitHub Copilot prompts found in `.github/prompts/`:

| Category | Count |
|----------|-------|
| Feature prompts | ~100 |
| Bugfix prompts | ~50 |
| Refactor prompts | ~50 |
| Review prompts | ~50 |
| Misc | ~47 |

---

## 📦 Extensions (93)

Extension manifests found in `.specify/extensions/`:

| Extension Type | Count |
|---------------|-------|
| memory-md | 5 |
| verify | 3 |
| orchestrator | 4 |
| Other | 81 |

---

## ⚙️ Workflows (1)

| Workflow | Location | Purpose |
|----------|----------|---------|
| memory-hub-drift-scan | `.specify/workflows/` | Scheduled drift scan for Memory Hub |

---

## 🎯 Capability Matrix

| Capability | Agents | Skills | Status |
|-----------|--------|--------|--------|
| **Spec Kit SDD** | Root AGENTS.md | 350+ | ✅ Active |
| **Architecture Guard** | — | 80 | ✅ Active |
| **Brownfield Analysis** | — | 60 | ✅ Active |
| **Security Review** | — | 40 | ✅ Active |
| **Code Intelligence** | — | 10 (gitnexus) | ✅ Active |
| **OMK Flows** | — | 15 | ✅ Active |
| **Memory Management** | — | 15 | ✅ Active |
| **Squad Management** | `.squad/` | 10 | ✅ Active |
| **Design System** | `.omk/open-design/` | 107 | ✅ Active |
| **Copilot Prompts** | `.github/prompts/` | 297 | ✅ Active |

---

## 📊 Summary Statistics

```
Total Agent Definitions:      23 AGENTS.md
Total Skills:               1,850 SKILL.md
Total Extensions:              93 extension.yml
Total Workflows:                1 workflow.yml
Total Prompts:                297 prompts
Total Copilot Instructions:     5
Platforms Supported:            5 (.agents, .claude, .cursor, .kimi, .omk)
```

---

## 🔍 Key Observations

1. **Massive Skill Library**: 1,850 skills across 5 platforms — one of the largest agent skill libraries observed
2. **Multi-Platform Support**: Skills mirrored across `.agents/`, `.claude/`, `.cursor/`, `.kimi/` — ensures cross-IDE compatibility
3. **Hierarchical Governance**: AGENTS.md at root, frontend, backend, module, and package levels
4. **Active Spec Kit**: 350+ core speckit skills indicate heavy Spec Kit SDD usage
5. **OMK Integration**: Open Design + Memory Hub + Flows show mature OMK ecosystem
6. **GitNexus Indexed**: Code intelligence active with 25,750 symbols indexed
7. **Squad Ready**: `.squad/` directory with 4 agent definitions (planner, implementer, reviewer, verifier)

---

*Report generated by speckit-agent-orchestrator-discover*
*Saved to: `.specify/extensions/orchestrator/discovery-report.json`*
