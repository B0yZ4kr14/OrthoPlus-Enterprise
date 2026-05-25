---
name: orthoplus-quality-gate
description: OrthoPlus Enterprise — Quality Gate skill para validação completa de build, lint, testes e arquitetura.
metadata:
  author: OrthoPlus AI Team
  scope: project
---

# OrthoPlus Quality Gate

Skill customizada para execução de quality gates no projeto OrthoPlus Enterprise.

## Commands

### /quality.gate
Executa `scripts/speckit-quality-gate.sh` para validar:
- Backend build (tsc)
- Backend lint (eslint)
- Backend tests (jest)
- Frontend type-check (tsc --noEmit)
- Frontend lint (eslint)
- Frontend build (vite)
- Architecture Guard (arch-guard.sh)

### /quality.backend
Executa apenas gates do backend.

### /quality.frontend
Executa apenas gates do frontend.

## Rules

- Quality gate DEVE passar antes de qualquer merge
- Falhas em gates P0 bloqueiam deploy
- Warnings podem ser aceitos com justificativa documentada
