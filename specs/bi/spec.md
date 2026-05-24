# Feature Specification: BI Dashboards

## Feature ID
**bi**

## Short Name
`bi`

## Overview
Módulo de Business Intelligence do OrthoPlus Enterprise que permite criar, editar e visualizar dashboards customizáveis com widgets. Cada dashboard pertence a uma clínica e pode conter múltiplos widgets.

## Functional Requirements

### FR-1: CRUD de Dashboards
- Listar dashboards da clínica
- Obter dashboard por ID
- Criar dashboard com nome, descrição e configuração
- Atualizar dashboard
- Remover dashboard

### FR-2: CRUD de Widgets
- Listar widgets de um dashboard
- Obter widget por ID
- Criar widget com tipo, configuração e posição
- Atualizar widget
- Remover widget

### FR-3: Clinic Context Isolation
- Todas as operações filtram por `clinic_id`
- Retornar 401 se clinicId não estiver presente

## Success Criteria

| ID | Criterion | Measurement |
|----|-----------|-------------|
| SC-1 | CRUD de dashboards funcional | Testes unitários passam |
| SC-2 | CRUD de widgets funcional | Testes unitários passam |
| SC-3 | Isolamento por clínica | Todas as queries filtram clinic_id |

## Out of Scope
- Geração de widgets dinâmicos com queries SQL
- Compartilhamento de dashboards entre clínicas
- Templates de dashboards pré-configurados
