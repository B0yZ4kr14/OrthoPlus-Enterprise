# Blueprint — Feature 010: Gestão de Funcionários

## Overview
Gestão completa de colaboradores (dentistas e staff), incluindo cadastro, controle de ponto, escalas/folgas, comissões por procedimento e gestão de documentos/contratos.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/funcionarios/components/FuncionariosList.tsx` — Lista de funcionários (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/FuncionarioDetails.tsx` — Detalhes do funcionário (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/funcionario-form/FuncionarioForm.tsx` — Formulário de cadastro/edição (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/funcionario-form/DadosPessoaisTab.tsx` — Aba de dados pessoais (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/funcionario-form/DadosProfissionaisTab.tsx` — Aba de dados profissionais (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/funcionario-form/useFuncionarioForm.ts` — Hook do formulário (pre-completed)
- [X] `apps/web/src/modules/funcionarios/components/PermissoesManager.tsx` — Gerenciamento de permissões (pre-completed)
- [ ] `apps/web/src/modules/funcionarios/components/ControlePontoPanel.tsx` — Painel de registro de entrada/saída (pending)
- [ ] `apps/web/src/modules/funcionarios/components/BancoHorasDisplay.tsx` — Visualização do banco de horas (pending)
- [ ] `apps/web/src/modules/funcionarios/components/EscalaSemanalCalendar.tsx` — Calendário visual de escala semanal/mensal (pending)
- [ ] `apps/web/src/modules/funcionarios/components/FolgaForm.tsx` — Formulário de solicitação/registro de folga (pending)
- [ ] `apps/web/src/modules/funcionarios/components/ComissaoConfigForm.tsx` — Configuração de percentual de comissão por procedimento (pending)
- [ ] `apps/web/src/modules/funcionarios/components/ComissaoRelatorio.tsx` — Relatório de comissões calculadas (pending)
- [ ] `apps/web/src/modules/funcionarios/components/DocumentosUpload.tsx` — Upload de contratos, diplomas e certificados (pending)
- [ ] `apps/web/src/modules/funcionarios/components/AlertaVencimento.tsx` — Alerta de vencimento de certificados/CRO (pending)

### Hooks
- [X] `apps/web/src/modules/funcionarios/hooks/useFuncionarios.ts` — Hook de listagem/dados de funcionários (pre-completed)
- [X] `apps/web/src/modules/funcionarios/hooks/useFuncionariosStore.ts` — Zustand store de funcionários (pre-completed)
- [ ] `apps/web/src/modules/funcionarios/hooks/useControlePonto.ts` — Hook para registro de ponto (pending)
- [ ] `apps/web/src/modules/funcionarios/hooks/useBancoHoras.ts` — Hook para cálculo de banco de horas (pending)
- [ ] `apps/web/src/modules/funcionarios/hooks/useEscalas.ts` — Hook para gestão de escalas e folgas (pending)
- [ ] `apps/web/src/modules/funcionarios/hooks/useComissoes.ts` — Hook para cálculo e relatório de comissões (pending)
- [ ] `apps/web/src/modules/funcionarios/hooks/useDocumentos.ts` — Hook para upload e gestão de documentos (pending)

### Pages
- [X] `apps/web/src/modules/funcionarios/ui/pages/FuncionariosPage.tsx` — Página principal de funcionários (pre-completed)
- [ ] `apps/web/src/modules/funcionarios/ui/pages/ControlePontoPage.tsx` — Página de controle de ponto (pending)
- [ ] `apps/web/src/modules/funcionarios/ui/pages/EscalasPage.tsx` — Página de escalas e folgas (pending)
- [ ] `apps/web/src/modules/funcionarios/ui/pages/ComissoesPage.tsx` — Página de comissões (pending)
- [ ] `apps/web/src/modules/funcionarios/ui/pages/DocumentosPage.tsx` — Página de documentos (pending)

### Services
- [ ] `apps/web/src/modules/funcionarios/services/funcionarioApi.ts` — API client para funcionários (pending)
- [ ] `apps/web/src/modules/funcionarios/services/pontoApi.ts` — API client para registro de ponto (pending)
- [ ] `apps/web/src/modules/funcionarios/services/escalaApi.ts` — API client para escalas (pending)
- [ ] `apps/web/src/modules/funcionarios/services/comissaoApi.ts` — API client para comissões (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/funcionarios/api/controller.ts` — Controller CRUD de funcionários (pre-completed)
- [X] `backend/src/modules/funcionarios/api/router.ts` — Rotas com clinicGuard (pre-completed)
- [X] `backend/src/modules/funcionarios/api/schemas.ts` — Schemas Zod de validação (pre-completed)
- [ ] `backend/src/modules/funcionarios/api/PontoController.ts` — Controller de registro de ponto (pending)
- [ ] `backend/src/modules/funcionarios/api/EscalaController.ts` — Controller de escalas e folgas (pending)
- [ ] `backend/src/modules/funcionarios/api/ComissaoController.ts` — Controller de comissões (pending)
- [ ] `backend/src/modules/funcionarios/api/DocumentoController.ts` — Controller de documentos (pending)
- [ ] `backend/src/modules/funcionarios/api/pontoRoutes.ts` — Rotas de ponto (pending)
- [ ] `backend/src/modules/funcionarios/api/escalaRoutes.ts` — Rotas de escalas (pending)
- [ ] `backend/src/modules/funcionarios/api/comissaoRoutes.ts` — Rotas de comissões (pending)

### Services
- [ ] `backend/src/modules/funcionarios/funcionariosService.ts` — Camada de serviço de funcionários (pending)
- [ ] `backend/src/modules/funcionarios/pontoService.ts` — Serviço de controle de ponto (pending)
- [ ] `backend/src/modules/funcionarios/escalaService.ts` — Serviço de escalas e folgas (pending)
- [ ] `backend/src/modules/funcionarios/comissaoService.ts` — Serviço de cálculo de comissões (pending)
- [ ] `backend/src/modules/funcionarios/documentoService.ts` — Serviço de gestão de documentos (pending)

### Domain / DTOs
- [ ] `backend/src/modules/funcionarios/types/funcionarioDTO.ts` — DTOs e schemas (pending)
- [ ] `backend/src/modules/funcionarios/types/pontoDTO.ts` — DTOs de registro de ponto (pending)
- [ ] `backend/src/modules/funcionarios/types/escalaDTO.ts` — DTOs de escala (pending)
- [ ] `backend/src/modules/funcionarios/types/comissaoDTO.ts` — DTOs de comissão (pending)

## Shared Types
- [ ] `shared-types/src/funcionarios.ts` — Tipos compartilhados de funcionários, ponto, escala e comissão (pending)

## Tests
- [X] `apps/web/src/modules/funcionarios/components/__tests__/FuncionariosList.test.tsx` — Testes da lista (pre-completed)
- [X] `apps/web/src/modules/funcionarios/hooks/__tests__/useFuncionariosStore.test.ts` — Testes do store (pre-completed)
- [X] `apps/web/src/modules/funcionarios/hooks/__tests__/useFuncionarios.test.ts` — Testes do hook (pre-completed)
- [ ] `backend/tests/unit/funcionariosController.test.ts` — Testes unitários do controller (pending)
- [ ] `backend/tests/unit/pontoController.test.ts` — Testes de controle de ponto (pending)
- [ ] `backend/tests/unit/escalaController.test.ts` — Testes de escalas (pending)
- [ ] `backend/tests/unit/comissaoController.test.ts` — Testes de comissões (pending)
- [ ] `apps/web/src/modules/funcionarios/components/__tests__/ControlePontoPanel.test.tsx` — Testes do painel de ponto (pending)
- [ ] `apps/web/src/modules/funcionarios/components/__tests__/EscalaSemanalCalendar.test.tsx` — Testes do calendário (pending)
- [ ] `apps/web/src/modules/funcionarios/components/__tests__/ComissaoConfigForm.test.tsx` — Testes de comissão (pending)

## Summary
- Pre-completed: 10 files
- Pending: 34 files
- Total: 44 files
