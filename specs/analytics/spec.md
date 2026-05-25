# Feature Specification: Analytics Dashboard

## Feature ID
**analytics**

## Short Name
`analytics`

## Overview
Módulo de analytics do OrthoPlus Enterprise que fornece métricas agregadas de clinicas: total de pacientes, agendamentos do dia, receita mensal, taxa de ocupação, e tratamentos pendentes/concluídos.

## Functional Requirements

### ANL-FR-1: Dashboard Overview
- Endpoint que retorna estatísticas consolidadas da clínica
- Dados: totalPatients, todayAppointments, monthlyRevenue, occupancyRate, pendingTreatments, completedTreatments

### ANL-FR-2: Clinic Context Isolation
- Todas as queries devem filtrar por `clinic_id`
- Retornar 401 se clinicId não estiver presente no request

## Success Criteria

| ID | Criterion | Measurement |
|----|-----------|-------------|
| ANL-SC-1 | Endpoint retorna estatísticas corretas | Testes unitários passam |
| ANL-SC-2 | Dados isolados por clínica | Queries filtram por clinic_id |

## Out of Scope
- Drill-down de analytics
- Exportação de relatórios
- Agendamento de relatórios
