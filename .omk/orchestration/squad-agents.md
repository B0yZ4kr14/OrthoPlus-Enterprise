# OMK Squad Agents — OrthoPlus Enterprise

**Feature**: 017-omk-governance-integration
**Last Updated**: 2026-05-19

## Squad Definition

| Agent | Role | SpecKit Phase | Capabilities |
|-------|------|---------------|--------------|
| **Planner** | Arquiteto de especificação | specify → plan → tasks | Análise de requisitos, arquitetura, estimativa |
| **Implementer** | Desenvolvedor | implement | Codificação, refatoração, integração |
| **Reviewer** | Revisor de código | (entre fases) | Análise de impacto, padrões de código, segurança |
| **Verifier** | QA Engineer | verify | Testes, validação, quality gates |

## Capability Mapping

```
Especificação (specify)  → Planner
  ↓
Clarificação (clarify)   → Planner + Reviewer
  ↓
Planning (plan)            → Planner
  ↓
Tasks (tasks)              → Planner
  ↓
Implementação (implement)  → Implementer
  ↓
Revisão (review)           → Reviewer
  ↓
Verificação (verify)       → Verifier
  ↓
Release (ship)             → Planner + Verifier
```

## Human-in-the-Loop Gates

| Gate | Trigger | Action |
|------|---------|--------|
| Plan Approval | Após `speckit-plan` | Human revisa plan.md antes de prosseguir |
| Implement Checkpoint | Após fase core | Human aprova antes de polish |
| Security Review | Qualquer mudança em auth/infra | Reviewer obrigatório |
| Quality Gate | Falha em lint/type-check/test | Workflow pausa, Verifier investiga |

## OMK Goal Integration

Cada feature cria um OMK Goal com:
- **Title**: Feature name
- **Objective**: Descrição do que a feature deve alcançar
- **Criteria**: SpecKit success criteria mapeados para OMK criteria
- **Agents**: Squad agents atribuídos por fase
- **Evidence**: Commits, test results, deploy confirmations
