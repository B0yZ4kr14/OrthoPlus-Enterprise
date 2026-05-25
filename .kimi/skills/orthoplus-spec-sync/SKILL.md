---
name: orthoplus-spec-sync
description: OrthoPlus Enterprise — Spec Sync skill para garantir que specs, plans e tasks estejam sincronizados com o código.
metadata:
  author: OrthoPlus AI Team
  scope: project
---

# OrthoPlus Spec Sync

Skill customizada para sincronização de especificações com implementação.

## Commands

### /spec.sync
Executa `scripts/speckit-spec-sync.sh` para verificar:
- Todas as features têm spec.md, plan.md, tasks.md
- Nenhuma feature está incompleta
- specs/ está sincronizado com .specify/memory/

### /spec.doctor
Executa `.specify/scripts/bash/doctor.sh` para diagnóstico completo.

## Rules

- Features incompletas devem ser finalizadas antes do planning
- Specs devem refletir o estado atual do código
- Doctor DEVE reportar 0 erros
