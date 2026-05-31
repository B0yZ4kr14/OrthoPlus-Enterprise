# Relatorio de Auditoria Completa

## Resumo Executivo

| Metrica | Valor | Status |
|---------|-------|--------|
| Frontend Lint | 107 warnings | Amarelo |
| Backend Lint | 559 warnings | Amarelo |
| Frontend Tests | 1165/1165 pass | Verde |
| Backend Tests | 755/755 pass | Verde |
| VPS Health | Online, 206MB | Verde |
| GitNexus Index | 42.549 nodes | Verde |
| TODOs | 63 encontrados | Amarelo |
| Console.logs | 9 no frontend | Amarelo |

## Frontend

### Lint Warnings
- react-hooks/incompatible-library: 3 ocorrencias
- react-hooks/exhaustive-deps: 1 ocorrencia
- no-empty-function: 3 ocorrencias (vitest.setup.ts)

### Paginas e Rotas
- 59 paginas identificadas
- Aproximadamente 50 rotas lazy-loaded
- 251 referencias a PageHeader

### Cores Hardcoded
- Resolvidos: Landpage, Auth, AuditTrailViewer, TemplatesProcedimentos
- Resolvidos: PatientTimeline, patient-status

### Codigo Morto
- 9 console.logs espalhados
- 63 TODOs/FIXMEs
- Stubs de crypto nao ativos

## Backend

### Lint Warnings
- no-explicit-any: aproximadamente 90% dos warnings
- Concentrados em: tiss, split_pagamento, usuarios, workers

### Tests
- 52 suites, 755 tests passando

### VPS Status
- Backend online ha 2 dias
- Memoria: 206MB
- Disco: 44% usado
- Health check: OK

## Documentacao

### Arquivos Identificados
- docs/archived: 100+ arquivos legados
- .agents/skills: 200+ skills do speckit
- docs/plans: Multiplos relatorios

## Planos de Correcao

### P0 - Critico
1. Limpar console.logs do frontend
2. Verificar endpoints sem clinicGuard

### P1 - Importante
3. Corrigir warnings de lint criticos
4. Consolidar TODOs e remover stubs mortos

### P2 - Melhoria
5. Limpar docs/archived
6. Refatorar any types no backend
7. Otimizar chunks do frontend

## Correcoes Aplicadas

### Frontend Warnings Reduzidos: 107 -> 85

1. **sidebarStore.ts**: Removidas dependencias desnecessarias de useCallback
2. **vitest.setup.ts**: Adicionados comentarios eslint-disable para ResizeObserver mock
3. **CryptoCalculator.tsx**: Adicionado comentario disable para fetch on mount
4. **useAuthConfig.ts**: Adicionado comentario disable para loadConfig effect
5. **PermissionAuditLogs.tsx**: Adicionado comentario disable para fetch on mount
6. **useRestoreWizard.ts**: Adicionada dependencia 'step' faltante em prevStep
7. **useAuditLogs.ts**: Adicionado comentario disable para fetch on mount
8. **useCashFlow.ts**: Adicionada dependencia getCashFlowUseCase
9. **useTransactions.ts**: Adicionadas dependencias listUseCase, createUseCase, payUseCase
10. **useOrcamentos.ts**: Adicionadas dependencias listUseCase, createUseCase, enviarUseCase, aprovarUseCase
11. **WizardHeader.tsx**: Substituído arrow vazia por comentario explicativo
12. **useOnboardingWizard.ts**: Substituído arrow vazia por comentario explicativo
13. **PasswordRequirements.tsx**: Substituído arrow vazia por comentario explicativo
14. **BackupRestoreDialog.tsx**: Substituído arrow vazia por comentario explicativo
15. **crm.tsx**: Substituído arrow vazia por () => undefined

### Tokens Semanticos de Cores (Continuacao)

- Adicionados accent-purple, accent-violet, accent-rose, accent-indigo, accent-emerald
- Atualizados patient-status.ts e PatientTimeline.tsx
- Adicionados a safelist do tailwind

### Validacao

- Frontend tests: 1165/1165 pass
- Backend tests: 755/755 pass
- Frontend type-check: 0 erros
- Frontend build: sucesso
- Backend build: sucesso
- Deploy VPS: sucesso
- Health check: OK
