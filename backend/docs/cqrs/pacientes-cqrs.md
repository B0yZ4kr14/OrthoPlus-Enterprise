# CQRS Implementation: Módulo Pacientes

## Overview
Implementação do padrão CQRS (Command Query Responsibility Segregation) para o módulo de pacientes.

## Estrutura



## Commands (Escrita)

### CreatePatientCommand
- **Endpoint**: POST /api/pacientes
- **Input**: CreatePatientDTO
- **Output**: Patient

### UpdatePatientCommand
- **Endpoint**: PUT /api/pacientes/:id
- **Input**: UpdatePatientDTO
- **Output**: void

### ChangePatientStatusCommand
- **Endpoint**: PATCH /api/pacientes/:id/status
- **Input**: ChangePatientStatusDTO
- **Output**: void

## Queries (Leitura)

### GetPatientQuery
- **Endpoint**: GET /api/pacientes/:id
- **Input**: GetPatientDTO
- **Output**: Patient | null

### ListPatientsQuery
- **Endpoint**: GET /api/pacientes
- **Input**: ListPatientsDTO
- **Output**: ListPatientsResult

### GetPatientStatsQuery
- **Endpoint**: GET /api/pacientes/stats
- **Input**: PatientStatsDTO
- **Output**: PatientStatsResult

## Benefícios

1. **Separação de Responsabilidades**
   - Commands focados em escrita
   - Queries otimizadas para leitura

2. **Escalabilidade**
   - Possibilidade de escalar reads e writes separadamente
   - Queries podem usar caches diferentes

3. **Manutenibilidade**
   - Código mais organizado
   - Facilita testes unitários
