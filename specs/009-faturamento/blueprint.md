# Blueprint — Feature 009: Faturamento e NF-e

## Overview
Emissão completa de nota fiscal eletrônica de serviços (NF-e), configuração fiscal por clínica, consulta/cancelamento na SEFAZ, carta de correção e relatórios fiscais para contabilidade.

## Frontend Scaffold

### Components
- [ ] `apps/web/src/modules/faturamento/components/NFeEmissaoForm.tsx` — Formulário de emissão de NF-e (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeDestinatarioForm.tsx` — Dados do tomador/paciente (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeServicoForm.tsx` — Código de serviço LC 116 e alíquotas (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeList.tsx` — Listagem de notas fiscais com status (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeDetails.tsx` — Detalhes da NF-e com XML/PDF (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeCancelamentoModal.tsx` — Modal de cancelamento de NF-e (pending)
- [ ] `apps/web/src/modules/faturamento/components/NFeCartaCorrecaoModal.tsx` — Modal de carta de correção (pending)
- [ ] `apps/web/src/modules/faturamento/components/ConfiguracaoFiscalForm.tsx` — Configuração de série, certificado e regime (pending)
- [ ] `apps/web/src/modules/faturamento/components/CertificadoUpload.tsx` — Upload de certificado digital A1 (.pfx) (pending)
- [ ] `apps/web/src/modules/faturamento/components/RelatorioFiscalForm.tsx` — Filtros de relatório fiscal (pending)
- [ ] `apps/web/src/modules/faturamento/components/RelatorioFiscalTable.tsx` — Tabela de relatório com totalizadores (pending)
- [ ] `apps/web/src/modules/faturamento/components/OrcamentoParaNFeButton.tsx` — Botão "faturar agora" a partir de orçamento (pending)

### Hooks
- [X] `apps/web/src/hooks/api/useFaturamento.ts` — Hook React Query básico para NF-e (pre-completed)
- [ ] `apps/web/src/modules/faturamento/hooks/useNFeEmissao.ts` — Hook para fluxo de emissão (pending)
- [ ] `apps/web/src/modules/faturamento/hooks/useNFeConsulta.ts` — Hook para consulta/cancelamento (pending)
- [ ] `apps/web/src/modules/faturamento/hooks/useConfiguracaoFiscal.ts` — Hook para configuração fiscal (pending)
- [ ] `apps/web/src/modules/faturamento/hooks/useCertificadoDigital.ts` — Hook para upload/gestão de certificado (pending)
- [ ] `apps/web/src/modules/faturamento/hooks/useRelatorioFiscal.ts` — Hook para relatórios e exportação (pending)

### Pages
- [ ] `apps/web/src/modules/faturamento/ui/pages/FaturamentoPage.tsx` — Página principal de faturamento (pending)
- [ ] `apps/web/src/modules/faturamento/ui/pages/NFeEmissaoPage.tsx` — Página de emissão de NF-e (pending)
- [ ] `apps/web/src/modules/faturamento/ui/pages/NFeConsultaPage.tsx` — Página de consulta e cancelamento (pending)
- [ ] `apps/web/src/modules/faturamento/ui/pages/ConfiguracaoFiscalPage.tsx` — Página de configuração fiscal (pending)
- [ ] `apps/web/src/modules/faturamento/ui/pages/RelatorioFiscalPage.tsx` — Página de relatórios fiscais (pending)

### Services
- [ ] `apps/web/src/modules/faturamento/services/nfeApi.ts` — API client para NF-e (pending)
- [ ] `apps/web/src/modules/faturamento/services/configuracaoFiscalApi.ts` — API client para configuração (pending)
- [ ] `apps/web/src/modules/faturamento/services/relatorioFiscalApi.ts` — API client para relatórios (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/faturamento/api/FaturamentoController.ts` — Controller base de faturamento (pre-completed)
- [X] `backend/src/modules/faturamento/api/FaturamentoCommandController.ts` — Controller de comandos CQRS (pre-completed)
- [X] `backend/src/modules/faturamento/api/FaturamentoQueryController.ts` — Controller de queries CQRS (pre-completed)
- [X] `backend/src/modules/faturamento/api/router.ts` — Rotas de faturamento (pre-completed)
- [X] `backend/src/modules/nfe/api/controller.ts` — Controller do módulo NFe (pre-completed)
- [X] `backend/src/modules/nfe/api/router.ts` — Rotas do módulo NFe (pre-completed)
- [X] `backend/src/modules/nfe/api/schemas.ts` — Schemas de validação NFe (pre-completed)
- [ ] `backend/src/modules/faturamento/api/ConfiguracaoFiscalController.ts` — Controller de configuração fiscal (pending)
- [ ] `backend/src/modules/faturamento/api/RelatorioFiscalController.ts` — Controller de relatórios fiscais (pending)
- [ ] `backend/src/modules/faturamento/api/configuracaoRoutes.ts` — Rotas de configuração (pending)
- [ ] `backend/src/modules/faturamento/api/relatorioRoutes.ts` — Rotas de relatórios (pending)

### Services / CQRS
- [X] `backend/src/modules/faturamento/application/commands/EmitirNFeCommand.ts` — Comando de emissão (pre-completed)
- [X] `backend/src/modules/faturamento/application/commands/AutorizarNFeCommand.ts` — Comando de autorização (pre-completed)
- [X] `backend/src/modules/faturamento/application/queries/ListNFeQuery.ts` — Query de listagem (pre-completed)
- [X] `backend/src/modules/faturamento/application/queries/GetNFeQuery.ts` — Query de busca (pre-completed)
- [X] `backend/src/modules/faturamento/application/queries/GetNFePorStatusQuery.ts` — Query por status (pre-completed)
- [X] `backend/src/modules/faturamento/application/dto/NFeDTO.ts` — DTOs de NF-e (pre-completed)
- [ ] `backend/src/modules/faturamento/application/commands/CancelarNFeCommand.ts` — Comando de cancelamento (pending)
- [ ] `backend/src/modules/faturamento/application/commands/CartaCorrecaoNFeCommand.ts` — Comando de carta de correção (pending)
- [ ] `backend/src/modules/faturamento/application/commands/InutilizarNumeracaoCommand.ts` — Comando de inutilização (pending)
- [ ] `backend/src/modules/faturamento/application/queries/GetRelatorioFiscalQuery.ts` — Query de relatório fiscal (pending)
- [ ] `backend/src/modules/faturamento/application/use-cases/ConfigurarFiscalUseCase.ts` — Use case de configuração (pending)

### Domain
- [X] `backend/src/modules/faturamento/domain/entities/NFe.ts` — Entidade NF-e (pre-completed)
- [X] `backend/src/modules/faturamento/domain/events/NFeEmitidaEvent.ts` — Evento de emissão (pre-completed)
- [X] `backend/src/modules/faturamento/domain/events/NFeAutorizadaEvent.ts` — Evento de autorização (pre-completed)
- [X] `backend/src/modules/faturamento/domain/repositories/INFeRepository.ts` — Interface do repositório (pre-completed)
- [X] `backend/src/modules/faturamento/infrastructure/repositories/NFeRepositoryPostgres.ts` — Implementação Postgres (pre-completed)
- [X] `backend/src/modules/nfe/domain/entities/NFe.ts` — Entidade NFe alternativa (pre-completed)
- [X] `backend/src/modules/nfe/infrastructure/repositories/NFeRepositoryPostgres.ts` — Repositório NFe alternativo (pre-completed)
- [ ] `backend/src/modules/faturamento/domain/entities/ConfiguracaoFiscal.ts` — Entidade de configuração fiscal (pending)
- [ ] `backend/src/modules/faturamento/domain/entities/CertificadoDigital.ts` — Entidade de certificado (pending)
- [ ] `backend/src/modules/faturamento/domain/repositories/IConfiguracaoFiscalRepository.ts` — Interface de configuração (pending)
- [ ] `backend/src/modules/faturamento/infrastructure/repositories/ConfiguracaoFiscalRepositoryPostgres.ts` — Implementação de configuração (pending)

## Shared Types
- [ ] `shared-types/src/faturamento.ts` — Tipos compartilhados de NF-e, configuração e relatórios (pending)

## Tests
- [X] `backend/tests/unit/nfeController.test.ts` — Testes do controller NFe (pre-completed)
- [X] `backend/tests/unit/nfeDomain.test.ts` — Testes de domínio NFe (pre-completed)
- [ ] `backend/tests/unit/faturamentoController.test.ts` — Testes do controller de faturamento (pending)
- [ ] `backend/tests/unit/configuracaoFiscalController.test.ts` — Testes de configuração fiscal (pending)
- [ ] `backend/tests/unit/relatorioFiscalController.test.ts` — Testes de relatórios (pending)
- [ ] `apps/web/src/modules/faturamento/components/__tests__/NFeEmissaoForm.test.tsx` — Testes de emissão (pending)
- [ ] `apps/web/src/modules/faturamento/components/__tests__/ConfiguracaoFiscalForm.test.tsx` — Testes de configuração (pending)
- [ ] `apps/web/src/modules/faturamento/ui/pages/__tests__/FaturamentoPage.test.tsx` — Testes da página principal (pending)

## Summary
- Pre-completed: 17 files
- Pending: 38 files
- Total: 55 files
