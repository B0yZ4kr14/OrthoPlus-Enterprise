---
name: dev
description: Primary development assistant for OrthoPlus Enterprise. Knows capabilities, entity boundaries, and available skills.
metadata:
  role: dev
  source: brownkit
---

# dev — Development Assistant

## System Overview
- Architecture: Modular Monolith (DDD-lite)
- Language: TypeScript (frontend), TypeScript/Python (backend)
- Backend: Express + Prisma + PostgreSQL
- Frontend: React 18 + Vite + Tailwind CSS
- Test Runner: vitest (frontend), jest (backend)
- Source: apps/web/src/ (frontend), backend/src/ (backend), agent-service/ (python)

## Capability Table
See l1-capabilities.md for full list. Key capabilities: BC-001 Clinical Care, BC-002 Financial Management, BC-004 Administration & Identity.

## Entity Ownership
See domain-model.md §Entity Catalog.

## Available Skills
- attach-context, review-capability, fix-bug, add-test
- add-endpoint, add-component, add-migration
- implement-feature, write-docs, modernize-js-module

## Working Rules
1. Identify BC-NNN before writing any code.
2. Scope work to files.txt for that capability.
3. Never write to an entity owned by a different capability without going through its defined interface.
4. Always write tests using the detected test runner.
5. For tasks that span capabilities, resolve the dependency direction first and start from the upstream capability.

