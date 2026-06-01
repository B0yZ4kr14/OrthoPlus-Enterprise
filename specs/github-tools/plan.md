# Plan: Integração GitHub

## Overview
Permitir que clínicas conectem seus repositórios GitHub para monitorar branches, pull requests e workflows de CI/CD diretamente do OrthoPlus Enterprise.

## Architecture
- Frontend: `apps/web/src/modules/admin/` — interface de integração, cards de repositórios
- Backend: `backend/src/modules/github_tools/` — controllers, mock data
- Database: schema `github_tools` com tabela `GitHubRepository`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/github_tools/`
- [ ] Verificar/criar tabela `GitHubRepository` no schema `github_tools`
- [ ] Implementar validação Zod para conexão de repositório
- [ ] Garantir omissão de accessToken e webhookSecret no JSON de resposta

### Phase 2: Implementation
- [ ] Implementar listagem de repositórios conectados (mock data)
- [ ] Implementar conexão de novo repositório com validação de URL
- [ ] Implementar visualização de branches (mock)
- [ ] Implementar visualização de pull requests (mock)
- [ ] Implementar visualização de workflows (mock)
- [ ] Implementar role check (apenas ADMIN para conectar)

### Phase 3: Polish
- [ ] Criar interface de integração com cards de repositórios
- [ ] Criar abas para branches, PRs e workflows
- [ ] Adicionar indicadores visuais de status
- [ ] Documentar que dados são mockados e futura integração real
- [ ] Adicionar criptografia de tokens para produção

## Risks
- Dados atualmente mockados — integração real requer trabalho futuro
- Tokens de acesso são sensíveis — devem ser criptografados em produção
- URL de repositório deve ser validada para evitar SSRF
