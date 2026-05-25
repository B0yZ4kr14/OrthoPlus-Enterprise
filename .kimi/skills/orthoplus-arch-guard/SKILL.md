---
name: orthoplus-arch-guard
description: OrthoPlus Enterprise — Architecture Guard skill para detecção rápida de violações de camadas, controllers gordos, Prisma direto, e tokens em localStorage.
metadata:
  author: OrthoPlus AI Team
  scope: project
---

# OrthoPlus Architecture Guard

Skill customizada do projeto OrthoPlus Enterprise para governança arquitetural rápida e contundente.

## Capabilities

1. **Scan Backend Violations**
   - Detecta controllers acessando Prisma diretamente
   - Identifica controllers gordos (>300 linhas)
   - Mapeia módulos sem repository layer
   - Flag raw SQL fora de database_admin

2. **Scan Frontend Violations**
   - Detecta API calls inline em page components
   - Identifica componentes gordos (>300 linhas)
   - Flag tokens em localStorage (XSS risk)

3. **Generate Report**
   - Produz Markdown com findings
   - Atualiza tasks.md do architecture-refactor

## Commands

### /arch.guard
Executa o script `scripts/arch-guard.sh` no projeto.

### /arch.scan
Executa scan detalhado e gera relatório em `.omk/arch-squad/`.

### /arch.fix
Gera tarefas de refactor automaticamente no specs/architecture-refactor/tasks.md.

## Rules

- SEMPRE respeitar a architecture_constitution.md
- NUNCA bloquear merge sem violações P0
- SEMPRE sugerir fix concreto (file path + linha)
- NUNCA modificar código sem aprovação
