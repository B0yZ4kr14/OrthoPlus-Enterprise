# Spec-Kit — Visão Geral do Projeto OrthoPlus

> Documento gerado em: 2026-05-18
> Fonte: github.github.io/spec-kit | Repo: github.com/github/spec-kit

---

## 1. Status da Instalação no OrthoPlus

| Atributo | Valor |
|----------|-------|
| **Versão Instalada** | 0.10.2 (release estável, 2026-06-15) |
| **Versão Repo (submodule)** | v0.10.2 em `docs/spec-kit-source/` |
| **Integração Ativa** | Kimi (também configurado: Claude, Codex) |
| **Data Correção/Instalação** | 2026-06-15 |
| **Extensions Ativas** | 92 + 1 bundled (git) |
| **Extensions Skipped** | 0 (todas as extensões locais validadas pelo `specify extension list`)

---

## 2. Estrutura do Repositório Clonado

Local: `docs/spec-kit-source/` (submodule Git, tag `v0.10.2`)

```
spec-kit-source/
├── src/specify_cli/          # CLI Python (uv-based)
│   ├── agents.py             # Orquestração de agentes
│   ├── extensions.py         # Sistema de extensões
│   ├── catalogs.py           # Catálogos community/bundled
│   ├── integrations/         # 30+ integrações
│   └── authentication/       # Auth GitHub, Azure DevOps
├── extensions/               # 113+ community extensions
│   ├── catalog.community.json
│   ├── EXTENSION-API-REFERENCE.md
│   ├── EXTENSION-DEVELOPMENT-GUIDE.md
│   ├── EXTENSION-PUBLISHING-GUIDE.md
│   ├── EXTENSION-USER-GUIDE.md
│   └── git/                  # Extension bundled
├── presets/                  # 18+ presets
├── workflows/                # 6 workflows
├── docs/                     # Documentação completa
├── templates/                # Templates de artefatos SDD
├── tests/                    # Testes do CLI
├── pyproject.toml            # specify-cli v0.10.2
└── README.md                 # ~597 linhas
```

---

## 3. Extensions Instaladas no OrthoPlus (92 ativas)

> Lista completa em `.specify/extensions.yml`. Verificação via `specify extension list`.

### Tier 1: Essentials
- agent-assign, agent-governance, agent-orchestrator, aide, arch, architecture-guard, archive, blueprint, branch-convention, brownfield, brownkit, checkpoint, cleanup, conduct, cost, critique, diagram, docguard, doctor, fix-findings, fixit, fleet, fx-to-dotnet, git, github-issues, issue, iterate, jira, learn, maqa, maqa-azure-devops, maqa-ci, maqa-github-projects, maqa-jira, maqa-linear, maqa-trello, markitdown, mde, memory-loader, memory-md, memorylint, multi-model-review, onboard, optimize, orchestrator, plan-review-gate, presetify, preview, product-forge, qa, ralph, reconcile, red-team, refine, repoindex, reqnroll-bdd, retro, retrospective, review, ripple, schedule, scope, security-review, ship, sf, spec-reference-loader, spec-validate, spec2cloud, speckit-superpowers-bridge, squad, staff-review, status, superb, sync, team-assign, threatmodel, time-machine, tinyspec, token-analyzer, v-model, verify, verify-tasks, version-guard, wireframe, workiq, worktree, worktrees

### Tier 2: Quality & Review
- staff-review, verify, verify-tasks, cleanup, fix-findings, fixit, ripple, security-review, review, critique, retro, retrospective

### Tier 3: Spec Evolution
- iterate, refine, red-team, critique, sync, reconcile, canon

### Tier 4-9: PM, Integrations, Governance, Architecture, Retrospective, Memory
- scope, version-guard, diagram, github-issues, ship, agent-governance, memorylint, squad, arch, retrospective, retro, archive, azure-devops, jira, maqa, product-forge

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

- Instalado: 0.10.2 (release estável)
- Repo clonado (submodule): v0.10.2 (alinhado com o release instalado)

Recomendação: Manter ambos em `v0.10.2`. Atualizar apenas quando houver release estável superior e após validação das extensões customizadas do OrthoPlus.

---

## 6. Documentação Local Disponível

Após o clone/correção do submodule, documentação oficial offline em:
- docs/spec-kit-source/docs/installation.md
- docs/spec-kit-source/docs/quickstart.md
- docs/spec-kit-source/docs/concepts/sdd.md
- docs/spec-kit-source/docs/upgrade.md
- docs/spec-kit-source/extensions/EXTENSION-API-REFERENCE.md
- docs/spec-kit-source/extensions/EXTENSION-DEVELOPMENT-GUIDE.md
- docs/spec-kit-source/extensions/EXTENSION-PUBLISHING-GUIDE.md
- docs/spec-kit-source/extensions/EXTENSION-USER-GUIDE.md

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

1. Manter o submodule `docs/spec-kit-source/` em tag estável (`v0.10.2`)
2. Não atualizar para dev — aguardar release estável superior
3. Verificar periodicamente com `specify self check`
4. Usar `/speckit.doctor` para health check do projeto
5. Consultar `docs/spec-kit-source/extensions/` para extensions customizadas
6. Remover/rotacionar o token GitHub exposto no remote `origin` (ver relatório A4 / A3)
7. Avaliar instalação persistente do `specify` CLI via `uv` em ambiente compartilhado (atualmente em `.tmp/uv/bin`)


---

## 9. Correção Realizada (A4 — 2026-06-15)

### Problemas encontrados
- `docs/spec-kit-source/` estava registrado como submodule no índice Git (`git ls-tree` mostrava modo `160000`), mas `.gitmodules` não existia.
- O diretório físico estava vazio (`fatal: no submodule mapping found in .gitmodules for path 'docs/spec-kit-source'`).
- O documento `SPEC-KIT-OVERVIEW.md` referenciava versões antigas (`0.8.11`/`0.8.12.dev0`) e 33 extensões.
- O CLI `specify` não estava instalado no ambiente.
- O remote `origin` continha um token GitHub hardcoded (`ghp_...`) — **blocker de segurança** documentado separadamente.

### Ações executadas
1. Criado branch isolado `feat/a4-omk-speckit-fix`.
2. Removido o submodule quebrado do índice (`git rm --cached docs/spec-kit-source`).
3. Re-adicionado `docs/spec-kit-source` como submodule oficial do GitHub:
   ```bash
   git submodule add https://github.com/github/spec-kit.git docs/spec-kit-source
   ```
4. Fixado o submodule na tag estável `v0.10.2`:
   ```bash
   cd docs/spec-kit-source && git checkout v0.10.2
   ```
5. Instalado o `specify` CLI localmente via `uv` (sem poluir PATH global):
   ```bash
   # uv instalado em .tmp/uv
   UV_TOOL_BIN_DIR="$PWD/.tmp/uv/bin" UV_TOOL_DIR="$PWD/.tmp/uv/tools" \
     uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.10.2
   ```
6. Validado que todas as 92 extensões locais estão habilitadas:
   ```bash
   .tmp/uv/bin/specify extension list
   .tmp/uv/bin/specify self check   # Up to date: 0.10.2
   ```
7. Corrigidas permissões do submodule (`chown -R tsi:tsi docs/spec-kit-source`).
8. Adicionado `docs/spec-kit-source` ao `.gitmodules` e atualizado `docs/SPEC-KIT-OVERVIEW.md`.

### Estado final
- `.gitmodules` criado e versionado.
- `docs/spec-kit-source` é um submodule funcional apontando para `v0.10.2`.
- `.specify/extensions.yml` e `.specify/extensions/` continuam consistentes (92 extensões).
- `.specify/extension-catalogs.yml` aponta para o catálogo community oficial.
- Instalação local do `specify` CLI disponível em `.tmp/uv/bin/specify` (não versionada, pois `.tmp/` está em `.gitignore`).

### Comandos de verificação
```bash
# OMK
echo "OMK: $(omk --version)"

# Submodule
git submodule status
cat docs/spec-kit-source/pyproject.toml | grep version

# SpecKit CLI
.tmp/uv/bin/specify version
.tmp/uv/bin/specify extension list | grep -E "^  ✓" | wc -l
.tmp/uv/bin/specify self check
```
