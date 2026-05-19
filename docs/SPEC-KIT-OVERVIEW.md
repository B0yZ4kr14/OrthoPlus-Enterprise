# Spec-Kit — Visão Geral do Projeto OrthoPlus

> Documento gerado em: 2026-05-18
> Fonte: github.github.io/spec-kit | Repo: github.com/github/spec-kit

---

## 1. Status da Instalação no OrthoPlus

| Atributo | Valor |
|----------|-------|
| **Versão Instalada** | 0.8.11 (2026-05-15) |
| **Versão Repo (dev)** | 0.8.12.dev0 (clonado em docs/spec-kit-source/) |
| **Integração Ativa** | Kimi (também configurado: Claude, Codex) |
| **Data Instalação** | 2026-05-17 |
| **Extensions Ativas** | 33 + 1 bundled (git) |
| **Extensions Skipped** | 5 (erros de validação de manifesto upstream) |

---

## 2. Estrutura do Repositório Clonado

Local: `docs/spec-kit-source/` (depth=1)

```
spec-kit-source/
├── src/specify_cli/          # CLI Python (uv-based)
│   ├── agents.py             # Orquestração de agentes
│   ├── extensions.py         # Sistema de extensões
│   ├── catalogs.py           # Catálogos community/bundled
│   ├── integrations/         # 30+ integrações
│   └── authentication/       # Auth GitHub, Azure DevOps
├── extensions/               # 91+ community extensions
│   ├── catalog.community.json
│   ├── EXTENSION-API-REFERENCE.md
│   ├── EXTENSION-DEVELOPMENT-GUIDE.md
│   ├── EXTENSION-PUBLISHING-GUIDE.md
│   └── git/                  # Extension bundled
├── presets/                  # 18+ presets
├── workflows/                # 6 workflows
├── docs/                     # Documentação completa
├── templates/                # Templates de artefatos SDD
├── tests/                    # Testes do CLI
├── pyproject.toml            # specify-cli v0.8.12.dev0
└── README.md                 # 592 linhas
```

---

## 3. Extensions Instaladas no OrthoPlus (33 ativas)

### Tier 1: Essentials
- brownfield, architecture-guard, repoindex, blueprint, status, doctor, memory-loader, checkpoint

### Tier 2: Quality & Review
- staff-review, verify, verify-tasks, cleanup, fix-findings, fixit, ripple, security-review

### Tier 3: Spec Evolution
- iterate, refine, red-team, critique, sync, reconcile

### Tier 4-9: PM, Integrations, Governance, Architecture, Retrospective, Memory
- scope, version-guard, diagram, github-issues, ship, agent-governance, memorylint, squad, arch, retrospective, retro, archive

---

## 4. Comandos Core Disponíveis (Kimi Integration)

| Comando | Skill | Fase SDD |
|---------|-------|----------|
| /speckit.constitution | speckit-constitution | Setup |
| /speckit.specify | speckit-specify | Spec |
| /speckit.clarify | speckit-clarify | Spec |
| /speckit.plan | speckit-plan | Plan |
| /speckit.tasks | speckit-tasks | Tasks |
| /speckit.implement | speckit-implement | Implement |
| /speckit.analyze | speckit-analyze | Quality |
| /speckit.checklist | speckit-checklist | Quality |
| /speckit.taskstoissues | speckit-taskstoissues | Integration |

---

## 5. Diferenças: Instalado vs Repo

- Instalado: 0.8.11 (estável, release 2026-05-15)
- Repo clonado: 0.8.12.dev0 (development)

Recomendação: Manter 0.8.11. Atualizar apenas com release estável 0.8.12.

---

## 6. Documentação Local Disponível

Após o clone, documentação oficial offline em:
- docs/spec-kit-source/docs/installation.md
- docs/spec-kit-source/docs/quickstart.md
- docs/spec-kit-source/docs/concepts/sdd.md
- docs/spec-kit-source/extensions/EXTENSION-DEVELOPMENT-GUIDE.md

---

## 7. Catálogos Community (91+ Extensions)

Principais categorias disponíveis no catalog.community.json:
- CI/CD: ci-guard, catalog-ci
- Integrations: jira, azure-devops, confluence, linear, trello
- Multi-Agent: maqa, squad, fleet-orchestrator
- Testing: spectest, qa-testing, v-model
- Specialized: spec2cloud (Azure), sfspeckit (Salesforce)

---

## 8. Próximos Passos Sugeridos

1. Manter o repo clonado como referência offline
2. Não atualizar para dev — aguardar release estável
3. Verificar extensions skipped (5 com erros) se necessário
4. Usar /speckit.doctor para health check do projeto
5. Consultar docs/spec-kit-source/extensions/ para extensions customizadas
