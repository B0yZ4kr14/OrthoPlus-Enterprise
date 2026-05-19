# Blueprint — Feature 003: Prontuário Eletrônico do Paciente (PEP)

## Overview
Registro clínico digital que armazena toda a trajetória de saúde bucal do paciente. Inclui ficha clínica com anamnese, odontograma interativo 2D/3D, registro de evoluções, prescrições digitais, anexos e assinatura digital ICP-BR.

## Frontend Scaffold

### Components
- [X] `apps/web/src/modules/pep/components/Odontograma2D.tsx` — Odontograma 2D interativo
- [X] `apps/web/src/modules/pep/components/Odontograma3D.tsx` — Odontograma 3D
- [X] `apps/web/src/modules/pep/components/odontograma-3d/Odontograma3D.tsx` — Componente 3D principal
- [X] `apps/web/src/modules/pep/components/odontograma-3d/OdontogramaCanvas.tsx` — Canvas Three.js
- [X] `apps/web/src/modules/pep/components/odontograma-3d/ToothArcade.tsx` — Arcada dentária 3D
- [X] `apps/web/src/modules/pep/components/odontograma-3d/ToothMesh.tsx` — Mesh de dente individual
- [X] `apps/web/src/modules/pep/components/odontograma-3d/StatusSelector.tsx` — Seletor de condição
- [X] `apps/web/src/modules/pep/components/odontograma-3d/StatsCard.tsx` — Card de estatísticas
- [X] `apps/web/src/modules/pep/components/odontograma-3d/LoadingState.tsx` — Loading do 3D
- [X] `apps/web/src/modules/pep/components/OdontogramaAIAnalysis.tsx` — Análise IA de radiografia
- [X] `apps/web/src/modules/pep/components/OdontogramaComparison.tsx` — Comparação de odontogramas
- [X] `apps/web/src/modules/pep/components/OdontogramaHistory.tsx` — Histórico de odontograma
- [X] `apps/web/src/modules/pep/components/ToothDetailDialog.tsx` — Dialog de detalhes do dente
- [X] `apps/web/src/modules/pep/components/EvolucoesTimeline.tsx` — Timeline de evoluções
- [X] `apps/web/src/modules/pep/components/HistoricoClinicoForm.tsx` — Formulário de histórico clínico
- [X] `apps/web/src/modules/pep/components/PrescricaoForm.tsx` — Formulário de prescrição
- [X] `apps/web/src/modules/pep/components/ReceitaForm.tsx` — Formulário de receituário
- [X] `apps/web/src/modules/pep/components/TratamentoForm.tsx` — Formulário de tratamento
- [X] `apps/web/src/modules/pep/components/AnexosUpload.tsx` — Upload de anexos
- [X] `apps/web/src/modules/pep/components/AssinaturaDigital.tsx` — Assinatura digital
- [X] `apps/web/src/modules/pep/components/assinatura-icp/AssinaturaICP.tsx` — Assinatura ICP principal
- [X] `apps/web/src/modules/pep/components/assinatura-icp/CertificatesTab.tsx` — Tab de certificados
- [X] `apps/web/src/modules/pep/components/assinatura-icp/DocumentsTab.tsx` — Tab de documentos
- [X] `apps/web/src/modules/pep/components/assinatura-icp/RequestsTab.tsx` — Tab de requisições
- [X] `apps/web/src/modules/pep/components/assinatura-icp/ValidationTab.tsx` — Tab de validação
- [X] `apps/web/src/modules/pep/components/assinatura-icp/OverviewTab.tsx` — Tab overview
- [X] `apps/web/src/modules/pep/components/assinatura-icp/KpiCards.tsx` — KPIs de assinatura
- [X] `apps/web/src/modules/pep/components/pep-page/PEPPage.tsx` — Página principal PEP
- [X] `apps/web/src/modules/pep/components/pep-page/OdontogramaTab.tsx` — Tab odontograma
- [X] `apps/web/src/modules/pep/components/pep-page/TratamentosTab.tsx` — Tab tratamentos
- [X] `apps/web/src/modules/pep/components/pep-page/HistoricoTab.tsx` — Tab histórico
- [X] `apps/web/src/modules/pep/components/pep-page/AnexosTab.tsx` — Tab anexos
- [X] `apps/web/src/modules/pep/components/pep-page/HistoricoOdontoTab.tsx` — Tab histórico odonto
- [X] `apps/web/src/modules/pep/components/pep-page/ComparacaoOdontoTab.tsx` — Tab comparação odonto
- [X] `apps/web/src/modules/pep/components/pep-page/Odontograma3DTab.tsx` — Tab odontograma 3D
- [X] `apps/web/src/modules/pep/components/pep-page/PatientSelectorCard.tsx` — Card seletor de paciente
- [X] `apps/web/src/modules/pep/components/tabs/AnamneseContent.tsx` — Conteúdo anamnese
- [X] `apps/web/src/modules/pep/components/tabs/DocumentosContent.tsx` — Conteúdo documentos
- [X] `apps/web/src/modules/pep/components/tabs/FinanceiroContent.tsx` — Conteúdo financeiro
- [X] `apps/web/src/modules/pep/components/tabs/OdontogramaContent.tsx` — Conteúdo odontograma
- [X] `apps/web/src/modules/pep/components/lazy/TabAnamnese.tsx` — Tab anamnese lazy
- [X] `apps/web/src/modules/pep/components/lazy/TabDocumentos.tsx` — Tab documentos lazy
- [X] `apps/web/src/modules/pep/components/lazy/TabFinanceiro.tsx` — Tab financeiro lazy
- [X] `apps/web/src/modules/pep/components/lazy/TabOdontograma.tsx` — Tab odontograma lazy
- [X] `apps/web/src/modules/pep/components/lazy/Odontograma3DLazy.tsx` — Odontograma 3D lazy
- [X] `apps/web/src/modules/pep/components/ProntuarioPDF.tsx` — PDF do prontuário
- [ ] `apps/web/src/modules/pep/components/OdontogramaDeciduo.tsx` — Odontograma de dentição decídua (pending)
- [ ] `apps/web/src/modules/pep/components/PortabilidadeExport.tsx` — Exportação para portabilidade LGPD (pending)

### Hooks
- [X] `apps/web/src/modules/pep/hooks/useOdontograma.ts` — Hook do odontograma
- [X] `apps/web/src/modules/pep/hooks/useOdontogramaStore.ts` — Store do odontograma
- [X] `apps/web/src/modules/pep/hooks/useEvolucoes.ts` — Hook de evoluções
- [X] `apps/web/src/modules/pep/hooks/useTratamentos.ts` — Hook de tratamentos
- [X] `apps/web/src/modules/pep/hooks/useAnexos.ts` — Hook de anexos
- [ ] `apps/web/src/modules/pep/hooks/usePrescricoes.ts` — Hook de prescrições (pending)
- [ ] `apps/web/src/modules/pep/hooks/useAssinaturaICP.ts` — Hook de assinatura ICP (pending)

### Pages
- [X] `apps/web/src/modules/pep/ui/pages/PEPPage.tsx` — Página principal PEP
- [X] `apps/web/src/modules/pep/ui/pages/PEPPageLazy.tsx` — Página PEP lazy-loaded
- [X] `apps/web/src/modules/pep/ui/pages/AssinaturaICP.tsx` — Página de assinatura ICP
- [X] `apps/web/src/modules/pep/ui/pages/FluxoDigital.tsx` — Página de fluxo digital
- [X] `apps/web/src/modules/pep/ui/pages/QuickChart.tsx` — Página de gráfico rápido
- [ ] `apps/web/src/modules/pep/ui/pages/AnaliseRadiografiaPage.tsx` — Página de análise de radiografia (pending)

### Domain / Application (Clean Architecture)
- [X] `apps/web/src/modules/pep/domain/aggregates/Prontuario.ts` — Aggregate Prontuario
- [X] `apps/web/src/modules/pep/hooks/index.ts` — Index de hooks
- [X] `apps/web/src/modules/pep/domain/index.ts` — Index de domínio
- [X] `apps/web/src/modules/pep/infrastructure/index.ts` — Index de infraestrutura
- [X] `apps/web/src/modules/pep/ui/index.ts` — Index de UI
- [ ] `apps/web/src/modules/pep/domain/entities/Evolucao.ts` — Entidade Evolução (pending)
- [ ] `apps/web/src/modules/pep/domain/entities/Prescricao.ts` — Entidade Prescrição (pending)
- [ ] `apps/web/src/modules/pep/domain/entities/Anexo.ts` — Entidade Anexo (pending)
- [ ] `apps/web/src/modules/pep/domain/repositories/IEvolucaoRepository.ts` — Repositório de evoluções (pending)
- [ ] `apps/web/src/modules/pep/domain/repositories/IProntuarioRepository.ts` — Repositório de prontuários (pending)
- [ ] `apps/web/src/modules/pep/infrastructure/repositories/EvolucaoRepositoryApi.ts` — Repositório API evoluções (pending)
- [ ] `apps/web/src/modules/pep/infrastructure/repositories/ProntuarioRepositoryApi.ts` — Repositório API prontuários (pending)

### Types
- [X] `apps/web/src/modules/pep/types/odontograma.types.ts` — Tipos do odontograma
- [X] `apps/web/src/modules/pep/components/pep-page/types.ts` — Tipos da página PEP
- [X] `apps/web/src/modules/pep/components/assinatura-icp/types.ts` — Tipos de assinatura ICP
- [ ] `apps/web/src/modules/pep/types/evolucao.types.ts` — Tipos de evolução (pending)
- [ ] `apps/web/src/modules/pep/types/prescricao.types.ts` — Tipos de prescrição (pending)

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/pep/api/PepController.ts` — Controller do PEP
- [X] `backend/src/modules/pep/api/router.ts` — Rotas do PEP
- [ ] `backend/src/modules/pep/api/evolucaoController.ts` — Controller de evoluções (pending)
- [ ] `backend/src/modules/pep/api/prescricaoController.ts` — Controller de prescrições (pending)
- [ ] `backend/src/modules/pep/api/anexoController.ts` — Controller de anexos (pending)
- [ ] `backend/src/modules/pep/api/odontogramaController.ts` — Controller de odontograma (pending)

### Services
- [ ] `backend/src/modules/pep/application/services/PepService.ts` — Serviço principal PEP (pending)
- [ ] `backend/src/modules/pep/application/services/EvolucaoService.ts` — Serviço de evoluções (pending)
- [ ] `backend/src/modules/pep/application/services/PrescricaoService.ts` — Serviço de prescrições (pending)
- [ ] `backend/src/modules/pep/application/services/AnexoService.ts` — Serviço de anexos (pending)
- [ ] `backend/src/modules/pep/application/services/OdontogramaService.ts` — Serviço de odontograma (pending)
- [ ] `backend/src/modules/pep/application/services/AssinaturaService.ts` — Serviço de assinatura digital (pending)
- [ ] `backend/src/modules/pep/application/services/IAAnalysisService.ts` — Serviço de análise IA (pending)

### Domain
- [X] `backend/src/modules/pep/domain/entities/Prontuario.ts` — Entidade Prontuario
- [ ] `backend/src/modules/pep/domain/entities/Evolucao.ts` — Entidade Evolução (pending)
- [ ] `backend/src/modules/pep/domain/entities/OdontogramaData.ts` — Entidade OdontogramaData (pending)
- [ ] `backend/src/modules/pep/domain/entities/Prescricao.ts` — Entidade Prescrição (pending)
- [ ] `backend/src/modules/pep/domain/repositories/IProntuarioRepository.ts` — Repositório de prontuários (pending)
- [ ] `backend/src/modules/pep/domain/repositories/IEvolucaoRepository.ts` — Repositório de evoluções (pending)
- [ ] `backend/src/modules/pep/domain/events/EvolucaoCreatedEvent.ts` — Evento de evolução criada (pending)

### Infrastructure
- [ ] `backend/src/modules/pep/infrastructure/repositories/ProntuarioRepositoryPrisma.ts` — Repositório Prisma (pending)
- [ ] `backend/src/modules/pep/infrastructure/repositories/EvolucaoRepositoryPrisma.ts` — Repositório Prisma evoluções (pending)
- [ ] `backend/src/modules/pep/infrastructure/storage/AnexoStorageService.ts` — Serviço de storage de anexos (pending)

## Shared Types
- [X] `apps/web/src/domain/entities/Prontuario.ts` — Entidade Prontuario (shared)
- [X] `apps/web/src/domain/repositories/IProntuarioRepository.ts` — Repositório shared
- [X] `apps/web/src/infrastructure/repositories/DbProntuarioRepository.ts` — Repositório DB shared
- [X] `apps/web/src/infrastructure/mappers/ProntuarioMapper.ts` — Mapper shared
- [X] `apps/web/src/application/use-cases/prontuario/GetTratamentosByProntuarioUseCase.ts` — UC tratamentos por prontuário

## Tests
- [X] `backend/tests/unit/pepDomain.test.ts` — Testes de domínio PEP
- [X] `apps/web/src/modules/pep/hooks/useOdontogramaStore.test.ts` — Teste store odontograma
- [ ] `backend/tests/unit/pepController.test.ts` — Testes do controller PEP (pending)
- [ ] `backend/tests/unit/pepEvolucao.test.ts` — Testes de evoluções (pending)
- [ ] `tests/e2e/pep.spec.ts` — Teste E2E do PEP (pending)

## Summary
- Pre-completed: 56 files
- Pending: 35 files
- Total: 91 files
