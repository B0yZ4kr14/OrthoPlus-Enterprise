# Plan: Configurações e Módulos

## Overview
Gerenciar o catálogo de módulos do OrthoPlus Enterprise, permitindo que clínicas ativem/desativem funcionalidades, gerenciem dependências entre módulos, configurem backups agendados e importem/exportem dados.

## Architecture
- Frontend: `apps/web/src/modules/settings/` — páginas de catálogo de módulos, importação/exportação
- Backend: `backend/src/modules/configuracoes/` — controllers, catálogo hardcoded, lógica de dependências
- Database: schema `configuracoes` com tabelas `module_catalog`, `clinic_modules`, `scheduled_backups`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/configuracoes/`
- [ ] Verificar/criar catálogo hardcoded `MODULE_CATALOG` com todos os módulos e dependências
- [ ] Verificar/criar tabelas `module_catalog`, `clinic_modules`, `scheduled_backups` no Prisma
- [ ] Criar estrutura frontend em `apps/web/src/modules/settings/`

### Phase 2: Implementation
- [ ] Implementar `GET /api/configuracoes/modulos` com catálogo e status por clínica
- [ ] Implementar `GET /api/configuracoes/modulos/dependencies` com grafo de dependências
- [ ] Implementar toggle de módulo por key e por ID com validação de dependências/dependentes
- [ ] Implementar endpoints de importação/exportação de dados da clínica
- [ ] Implementar CRUD de backups agendados
- [ ] Implementar endpoints de sugestão e sequência recomendada

### Phase 3: Polish
- [ ] Criar interface de catálogo de módulos com cards, ícones e indicadores de dependência
- [ ] Criar wizard de ativação com verificação de dependências
- [ ] Criar interface de importação/exportação com progresso e relatório
- [ ] Adicionar testes unitários para lógica de dependências
- [ ] Documentar dependências entre módulos

## Risks
- Dependências circulares no catálogo podem causar loops — necessário validação
- Desativar módulo com dependentes ativos pode quebrar funcionalidades
- Importação de dados requer transações atômicas para evitar dados parciais
