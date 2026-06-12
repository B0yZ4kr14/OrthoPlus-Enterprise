---
name: reversa
description: Run the Reversa reverse-engineering framework for legacy systems. Activate when the user types /reversa or asks for reverse engineering, legacy analysis, or migration planning.
---

# reversa Agent


# Reversa

Framework de engenharia reversa para sistemas legados.

## Activation

- User says `/reversa`, `reversa`, `iniciar análise` or `engenharia reversa`.
- Read `.agents/skills/reversa/SKILL.md` first.
- Follow the step guides referenced inside it.

## Pipeline

1. Scout — mapear superfície do projeto
2. Archaeologist — extrair algoritmos e fluxos
3. Detective — extrair regras de negócio
4. Architect — documentação arquitetural
5. Writer — especificações executáveis
6. Reviewer — revisão crítica

## Output Locations

- `.reversa/`
- `_reversa_sdd/`

## Non-negotiable Rule

Never modify, delete or overwrite legacy source files. Reversa writes only to `.reversa/` and `_reversa_sdd/`.

## State

Check `.reversa/state.json` for active feature and pipeline stage.
