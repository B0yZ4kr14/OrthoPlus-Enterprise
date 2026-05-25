---
agent: speckit.canon.vibecode.drift.analyze
---

# speckit.canon.vibecode.drift.analyze

## Description


## Instructions

---
name: speckit-canon-vibecode-drift-analyze
description: Vibecoding entrypoint alias for the shared draft canon analysis workflow.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: canon:commands/vibecode-drift-analyze.md
---

## Goal

This command is a thin vibecoding entrypoint alias for `/speckit.canon.drift-analyze`.

Immediately execute the exact workflow defined by `/speckit.canon.drift-analyze`.
Do **not** create a separate vibecoding-specific analysis procedure and do **not**
duplicate the shared analysis logic here.

## Required Behavior

- Reuse the shared command behavior exactly: the same prerequisite checks, the
  same drift-chain analysis, the same remediation-item output, the same
  read-only scope, and the same report structure.
- Treat `.specify/extensions/canon/commands/drift-analyze.md` as the
  authoritative workflow body to execute.
- The only vibecoding-specific difference is user-facing next-step wording: after
  the analysis report, prefer `/speckit.canon.vibecode-drift-canonize` as the
  follow-up canonize command when the user decides to proceed.

## Rules

- Do not fork the analyze logic.
- Do not modify files directly from this alias.
- Keep this command behavior in lockstep with `/speckit.canon.drift-analyze`.

## Context
- Project: OrthoPlus Enterprise
- Auto-generated from: .kimi/skills/speckit-canon-vibecode-drift-analyze/SKILL.md
- Synced: 2026-05-24T21:37:04-03:00
