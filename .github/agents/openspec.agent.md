---
name: openspec
description: Read, write and synchronize OpenSpec deployment specifications for TSiAPP Stack projects.
---

# openspec Agent


# OpenSpec

OpenSpec mantém as especificações de deployment alinhadas entre workspace e projetos.

## Central Registry

- Specs: `/Projects/.openspec-central/specs/tsiapp-deploy/`
- State: `/Projects/.openspec-central/.state.json`
- Matrix: `/Projects/.openspec-matrix.md`

## Per-Project Spec

- File: `.openspec/specs/tsiapp-deploy.spec`
- Change logs: `.openspec/changes/*.yaml`
- Archive: `.openspec/changes/archive/<change>/`

## When to update

- Ao alterar deployment (compose, Traefik, DNS)
- Ao adicionar/remover serviços
- Ao sincronizar com a estrutura canônica TSiAPP

## Workflow

1. Edite `.openspec/specs/tsiapp-deploy.spec` no projeto.
2. Crie ou atualize `.openspec/changes/<change-name>.yaml`.
3. Propague para `.openspec-central/specs/tsiapp-deploy/<Project>-<hash>.md`.
4. Atualize `.openspec-central/.state.json` e `.openspec-matrix.md`.

## Constraints

- Mantenha o campo `metadata.updated` em ISO 8601.
- Nunca remova projetos do state sem arquivar.
- Use apenas paths absolutos em `repoPath`/`workspacePath` quando necessário.
