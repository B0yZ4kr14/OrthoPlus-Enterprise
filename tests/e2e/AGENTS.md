# AGENTS.md — tests/e2e/

> Suite Playwright de testes end-to-end. Não repete o root AGENTS.md.
> **Atualizado:** 2026-05-24

---

## Configuração

`playwright.config.ts` (raiz do monorepo, `testDir: './tests/e2e'`):

- **baseURL**: `http://localhost:3000` (ou `$API_BASE_URL`)
- **webServer**: `npm run dev` aguarda `http://localhost:3000/health`
- **retries**: 0 local / 2 em CI
- **workers**: ilimitado local / 1 em CI (`fullyParallel: true`)
- **projeto**: `api-tests` (Desktop Chrome)

```bash
# Rodar todos
npx playwright test

# Rodar spec específico
npx playwright test pacientes

# Com UI
npx playwright test --ui

# Em CI
CI=true npx playwright test
```

---

## Specs (38 arquivos)

### Por domínio

| Spec                                                                                                     | Foco                                        |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `auth.spec.ts`                                                                                           | Login, logout, redirect não-autenticado     |
| `auth.setup.ts`                                                                                          | Setup global de autenticação (storageState) |
| `pacientes.spec.ts` / `patients.spec.ts` / `patients-crud.spec.ts` / `patient-workflow.spec.ts`          | CRUD pacientes, workflow completo           |
| `agenda.spec.ts`                                                                                         | Agendamentos                                |
| `pep.spec.ts` / `pep-workflows.spec.ts`                                                                  | PEP / prontuário eletrônico                 |
| `financeiro.spec.ts` / `financeiro-crud.spec.ts` / `financial-flows.spec.ts`                             | Transações, contas, fluxo caixa             |
| `estoque.spec.ts` / `inventario.spec.ts`                                                                 | Estoque e inventário                        |
| `crypto-flows.spec.ts` / `crypto-payments.spec.ts`                                                       | Pagamentos crypto                           |
| `dashboard.spec.ts` / `dashboard-api.spec.ts` / `dashboard-navigation.spec.ts`                           | Dashboard                                   |
| `crm-workflow.spec.ts` / `lead-conversion.spec.ts`                                                       | CRM, conversão de leads                     |
| `modules.spec.ts` / `modules-activation.spec.ts` / `modules-management.spec.ts` / `module-smoke.spec.ts` | Ativação/gestão de módulos                  |
| `navigation.spec.ts` / `navigation-v5.spec.ts` / `modular-navigation.spec.ts`                            | Navegação                                   |
| `teleodonto-workflow.spec.ts`                                                                            | Teleodonto                                  |
| `backend-switching.spec.ts`                                                                              | Troca de backend/ambiente                   |
| `permissions.spec.ts`                                                                                    | Controle de acesso por role                 |
| `workflow-integration.spec.ts`                                                                           | Fluxos integrados multi-módulo              |
| `accessibility.spec.ts` / `wcag-accessibility.spec.ts`                                                   | A11y / WCAG                                 |
| `performance-optimization.spec.ts`                                                                       | Performance / LCP / CLS                     |
| `toast-enhanced.spec.ts`                                                                                 | Notificações toast                          |
| `transaction-flow.spec.ts`                                                                               | Fluxo de transações                         |

### Helpers

| Arquivo           | Propósito                                                   |
| ----------------- | ----------------------------------------------------------- |
| `fixtures.ts`     | Fixtures compartilhadas (dados de teste, helpers de página) |
| `global-setup.ts` | Setup global (login único, storageState salvo)              |

---

## Convenções

- **Auth**: usar `global-setup.ts` + `storageState` — nunca re-autenticar em cada teste
- **Fixtures**: helpers de página e dados em `fixtures.ts`; não duplicar lógica de navegação
- **Seletores**: preferir `data-testid` > role > text; nunca CSS class
- **Waits**: usar `waitForResponse` / `waitForSelector` — nunca `page.waitForTimeout`
- **Isolamento**: cada `test()` deve ser independente; limpar dados criados no `afterEach`
- **Novo spec**: adicionar ao bloco correto neste documento

---

## Specs Mais Pesados (>200 linhas — cuidado ao editar)

- `wcag-accessibility.spec.ts` — 369 linhas
- `estoque.spec.ts` — 353 linhas
- `toast-enhanced.spec.ts` — 252 linhas
- `crypto-payments.spec.ts` — 229 linhas
- `agenda.spec.ts` — 229 linhas
- `performance-optimization.spec.ts` — 220 linhas

---

## Variáveis de Ambiente

| Var                        | Padrão                  | Propósito                      |
| -------------------------- | ----------------------- | ------------------------------ |
| `API_BASE_URL`             | `http://localhost:3000` | URL do frontend                |
| `CI`                       | —                       | Ativa retries=2, workers=1     |
| `PLAYWRIGHT_TEST_BASE_URL` | —                       | Alias alternativo para baseURL |
