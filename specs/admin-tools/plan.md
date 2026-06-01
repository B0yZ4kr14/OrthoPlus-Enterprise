# Plan: Ferramentas Administrativas

## Overview
Centralizar ferramentas administrativas críticas do OrthoPlus Enterprise em um único módulo, incluindo ADRs (Architecture Decision Records), wiki interno, gerenciamento de root users, health check do banco, proxy GitHub e busca global.

## Architecture
- Frontend: `apps/web/src/modules/admin/` — páginas de ADRs, Wiki, Health Check, Busca Global, dashboard administrativo
- Backend: `backend/src/modules/admin_tools/` — controllers, use cases, routes já existentes
- Database: schemas `core` (ADR, WikiPage) com Prisma multi-schema

## Phases
### Phase 1: Foundation
- [ ] Revisar e consolidar endpoints existentes em `backend/src/modules/admin_tools/`
- [ ] Adicionar schema Prisma para `ADR` e `WikiPage` no schema `core` se ainda não existirem
- [ ] Implementar clinicGuard e validações de role em todos os endpoints
- [ ] Criar estrutura de páginas frontend em `apps/web/src/modules/admin/`

### Phase 2: Implementation
- [ ] Implementar CRUD de ADRs (list, create) com uso de use cases
- [ ] Implementar CRUD de Wiki (list, create, update, delete) com versionamento
- [ ] Implementar endpoint de health check do banco (`analyze-database-health`)
- [ ] Implementar proxy GitHub com validação rigorosa de URL
- [ ] Implementar busca global em pacientes e dentistas
- [ ] Implementar endpoint de criação de root user com proteção `ENABLE_DANGEROUS_ADMIN_ENDPOINTS`

### Phase 3: Polish
- [ ] Criar interface de wiki com editor rich-text
- [ ] Criar listagem de ADRs com filtros e tags
- [ ] Criar dashboard administrativo consolidado
- [ ] Adicionar testes unitários (Jest) para use cases
- [ ] Documentar endpoints no padrão OpenAPI

## Risks
- Endpoint de root user é crítico de segurança — requer review extra
- Proxy GitHub pode ser vetor de SSRF se URL não for validada rigorosamente
- Wiki com versionamento pode aumentar complexidade do schema
