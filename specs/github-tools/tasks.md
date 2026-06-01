# Tasks: Integração GitHub

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/github_tools/` e mapear gaps vs spec.md
- [ ] T2: Adicionar/verificar modelo Prisma `GitHubRepository` no schema `github_tools` com campos definidos
- [ ] T3: Criar schema Zod para conexão de repositório (`repoName`, `repoUrl`, `accessToken`, `defaultBranch`)
- [ ] T4: Garantir que `toJSON()` ou serialização omita `accessToken` e `webhookSecret`

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/github_tools/repositories` retornando lista com mock data e campos definidos
- [ ] T6: Implementar `POST /api/github_tools/repositories` com validação Zod, role ADMIN, clinicId obrigatório
- [ ] T7: Implementar `GET /api/github_tools/repositories/:repoId/branches` com mock branches (name, lastCommit, lastUpdated)
- [ ] T8: Implementar `GET /api/github_tools/repositories/:repoId/pull-requests` com mock PRs (id, title, state, author, createdAt, mergedAt)
- [ ] T9: Implementar `GET /api/github_tools/repositories/:repoId/workflows` com mock workflows (id, name, status, lastRun, duration)
- [ ] T10: Implementar criptografia de `accessToken` e `webhookSecret` em repouso (preparar para produção)

## Phase 3: Polish
- [ ] T11: Criar interface de integração GitHub em `apps/web/src/modules/admin/` com cards de repositórios
- [ ] T12: Criar abas para visualização de branches, pull requests e workflows
- [ ] T13: Adicionar indicadores visuais de status (OPEN, MERGED, CLOSED para PRs; status de workflows)
- [ ] T14: Adicionar testes unitários em `backend/tests/unit/` para validação e listagem
- [ ] T15: Documentar limitação de dados mockados e roadmap para integração real com GitHub API
