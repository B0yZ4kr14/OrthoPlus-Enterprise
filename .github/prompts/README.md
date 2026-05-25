# GitHub Copilot Prompts

Este diretório contém prompts gerados automaticamente a partir dos arquivos `SKILL.md` do projeto.

## Geracao

Execute o script de sincronizacao:

```bash
bash scripts/ci/sync-copilot-prompts.sh
```

## CI Gate

O workflow `speckit-compliance.yml` verifica se os prompts estao sincronizados com os SKILL.md.

## Estrutura

Cada arquivo `.prompt.md` segue o formato:

```markdown
---
agent: <nome.do.agent>
---

# <nome.do.agent>

## Description
<descricao extraida do SKILL.md>

## Instructions
<conteudo completo do SKILL.md>

## Context
- Project: OrthoPlus Enterprise
- Auto-generated from: <caminho do SKILL.md>
- Synced: <timestamp ISO>
```

## Nota

**Nunca edite manualmente** os arquivos neste diretorio. Eles sao regenerados automaticamente pelo script de sincronizacao.
