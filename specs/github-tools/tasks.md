# Tasks: Integração GitHub

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/github_tools/` e mapear gaps vs spec.md
- [x] T2: Adicionar/verificar modelo Prisma `GitHubRepository` no schema `github_tools` com campos definidos
- [x] T3: Criar schema Zod para conexão de repositório (`repoName`, `repoUrl`, `accessToken`, `defaultBranch`)
- [x] T4: Garantir que `toJSON()` ou serialização omita `accessToken` e `webhookSecret`

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/github_tools/repositories` retornando lista com mock data e campos definidos
- [x] T6: Implementar `POST /api/github_tools/repositories` com validação Zod, role ADMIN, clinicId obrigatório
- [x] T7: Implementar `GET /api/github_tools/repositories/:repoId/branches` com mock branches (name, lastCommit, lastUpdated)
- [x] T8: Implementar `GET /api/github_tools/repositories/:repoId/pull-requests` com mock PRs (id, title, state, author, createdAt, mergedAt)
- [x] T9: Implementar `GET /api/github_tools/repositories/:repoId/workflows` com mock workflows (id, name, status, lastRun, duration)
- [x] T10: Implementar criptografia de `accessToken` e `webhookSecret` em repouso (preparar para produção)

## Phase 3: Polish
- [x] T11: Criar interface de integração GitHub em `apps/web/src/modules/admin/` com cards de repositórios
- [x] T12: Criar abas para visualização de branches, pull requests e workflows
- [x] T13: Adicionar indicadores visuais de status (OPEN, MERGED, CLOSED para PRs; status de workflows)
- [x] T14: Adicionar testes unitários em `backend/tests/unit/` para validação e listagem
- [x] T15: Documentar limitação de dados mockados e roadmap para integração real com GitHub API
