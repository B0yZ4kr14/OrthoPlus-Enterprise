# Tasks — IA-Radiografia: Reimplementacao Segura (10 Controles)

> Feature: 003-pep (Story 4 — Analise IA de Radiografia)
> Status: Reimplementacao segura apos Security Review SA-1/SS-3
> Sistema: Self-hosted (sem APIs externas para imagens medicas)

---

## Fase 1: Fundacao de Seguranca (Backend)

### T1.1: Feature Flag `ENABLE_AI_RADIOGRAPHY`
- [ ] Adicionar variavel de ambiente `ENABLE_AI_RADIOGRAPHY` (default: false)
- [ ] Criar middleware `aiFeatureFlagGuard` que retorna 403 se desativado
- [ ] Aplicar middleware em TODAS as rotas `/ia-radiografia/*`
- [ ] Documentar em `.env.example`

### T1.2: LGPD Consent Schema (Prisma)
- [ ] Criar modelo `PacienteConsentimentoIA` no schema
  - `id`, `pacienteId`, `clinicId`, `tipoConsentimento: "IA_RADIOGRAFIA"`
  - `consentido: boolean`, `dataConsentimento: DateTime`, `ipConsentimento: String`
  - `revogado: boolean`, `dataRevogacao: DateTime`, `motivoRevogacao: String?`
  - `hashTermo: String` (hash do termo exibido)
- [ ] Criar migration
- [ ] Criar indices: `(pacienteId, tipoConsentimento)`, `(clinicId)`

### T1.3: Audit Trail Schema (Prisma)
- [ ] Criar modelo `IARadiografiaAuditLog`
  - `id`, `analiseId`, `clinicId`, `pacienteId`, `dentistaId`
  - `acao: enum [UPLOAD, ANALISAR, REVISAR, EXPORTAR, REVOGAR_CONSENTIMENTO]`
  - `timestamp`, `ipAddress`, `userAgent`, `detalhes: Json`
- [ ] Criar migration

### T1.4: Analise IA Schema (Prisma)
- [ ] Criar modelo `IARadiografiaAnalise`
  - `id`, `clinicId`, `pacienteId`, `prontuarioId`, `dentistaId`
  - `imagemHash: String` (SHA-256 da imagem original, NAO a imagem)
  - `imagemStoragePath: String`
  - `tipoRadiografia: enum [PERIAPICAL, PANORAMICA, BITE_WING, OCLUSAL, LATERAL]`
  - `status: enum [PENDENTE, PROCESSANDO, CONCLUIDA, ERRO]`
  - `resultadoIA: Json?` (JSONB criptografado)
  - `confidenceScore: Float?`
  - `processamentoMs: Int?`
  - `revisada: boolean`, `dentistaRevisorId: String?`, `observacoesDentista: String?`
  - `assinaturaDigital: String?` (hash da assinatura de revisao)
  - `modeloUsado: String`
  - `createdAt`, `updatedAt`
- [ ] Criar migration

---

## Fase 2: Backend Seguro

### T2.1: Servico de Strip de Metadados DICOM
- [ ] Instalar biblioteca DICOM (ex: `dicom-parser` ou `cornerstone`)
- [ ] Criar `DicomMetadataStripper`
  - Ler arquivo DICOM/JPEG/PNG
  - Remover tags: PatientName, PatientID, PatientBirthDate, InstitutionName, StudyDate, etc.
  - Re-encode como PNG/JPEG limpo
  - Gerar SHA-256 do arquivo original (para audit) e do arquivo limpo
- [ ] Testes unitarios: verificar que metadados sao removidos

### T2.2: Servico de Consentimento LGPD
- [ ] Criar `IAConsentimentoService`
  - `verificarConsentimento(pacienteId, clinicId)` → boolean
  - `registrarConsentimento(dto)` → salva com hash do termo
  - `revogarConsentimento(pacienteId, clinicId, motivo)` → soft delete logico
  - `obterHistoricoConsentimento(pacienteId)` → array de eventos
- [ ] Endpoint GET `/ia-radiografia/consentimento/:pacienteId`
- [ ] Endpoint POST `/ia-radiografia/consentimento`
- [ ] Endpoint DELETE `/ia-radiografia/consentimento/:pacienteId` (revogacao)

### T2.3: Servico de Audit Trail
- [ ] Criar `IAAuditService`
  - `registrarAcao(dto)` → salva em `IARadiografiaAuditLog`
  - `obterAuditoria(analiseId)` → lista de eventos
  - `obterAuditoriaPaciente(pacienteId)` → lista de eventos do paciente
- [ ] Integrar em TODOS os endpoints (upload, analisar, revisar, exportar)

### T2.4: Rate Limiting por Dentista + Paciente
- [ ] Adicionar rate limit especifico para `/ia-radiografia/*`
  - Por dentista: 10 uploads/analises por hora
  - Por paciente: 5 analises por dia
  - Por clinica: 100 analises por dia
- [ ] Usar Redis para contadores (ou memoria se Redis nao disponivel)

### T2.5: Backend Endpoints com clinicGuard
- [ ] POST `/ia-radiografia/upload-e-analisar`
  - Verifica feature flag
  - Verifica consentimento LGPD
  - Strip metadados DICOM
  - Salva arquivo em storage (S3/MinIO/local)
  - Registra audit log (UPLOAD)
  - Envia para fila de processamento (async)
  - Retorna `analiseId` com status PENDENTE
- [ ] GET `/ia-radiografia/analises` (clinicGuard)
  - Lista analises da clinica
  - Nao expoe `resultadoIA` cru (apenas resumo)
- [ ] GET `/ia-radiografia/analises/:id` (clinicGuard)
  - Retorna analise completa (com resultadoIA descriptografado)
  - Registra audit log (VISUALIZAR)
- [ ] PATCH `/ia-radiografia/analises/:id/revisar` (clinicGuard)
  - Requer: `observacoesDentista`, `assinaturaDigital` (hash)
  - Atualiza `revisada = true`, `dentistaRevisorId`
  - Registra audit log (REVISAR)
  - NAO permite alterar `resultadoIA`
- [ ] DELETE `/ia-radiografia/analises/:id` (clinicGuard + ADMIN only)
  - Soft delete (LGPD art. 18)
  - Registra audit log (EXCLUIR)

### T2.6: Servico de IA Self-Hosted
- [ ] Criar `LocalAIService` (interface)
  - `analyzeRadiografia(imageBuffer: Buffer, tipoRadiografia: string)`
  - Retorna JSON estruturado: problemas_detectados, observacoes, recomendacoes, confidence
- [ ] Implementar com Ollama/local LLM (ex: llama-3.3-vision via Ollama API)
  - Endpoint configuravel: `AI_LOCAL_ENDPOINT` (default: `http://localhost:11434`)
  - Prompt especializado em radiografia odontologica
  - Timeout: 60s
  - Retry: 1x
- [ ] Fallback: se local indisponivel, retorna erro (NAO envia para externo)
- [ ] Worker/Cron para processar fila de analises pendentes

### T2.7: Criptografia de Resultados IA
- [ ] Criar `IAEncryptionService`
  - Criptografar `resultadoIA` (JSON) com AES-256-GCM
  - Chave derivada de `ENCRYPTION_KEY` + `analiseId` (HKDF)
  - Salvar IV + ciphertext + tag no campo `resultadoIA`
  - Descriptografar apenas no endpoint GET autorizado

---

## Fase 3: Frontend Seguro

### T3.1: Tela de Consentimento LGPD
- [ ] Criar `IAConsentimentoDialog`
  - Texto claro sobre processamento de IA em radiografias
  - Lista de dados processados (imagem, tipo de radiografia)
  - Checkbox de consentimento explicito
  - Botao "Revogar Consentimento" (se ja consentido)
  - Timestamp + IP log (exibido ao usuario)
- [ ] Integrar no fluxo de upload: BLOQUEIA upload se sem consentimento

### T3.2: Disclaimer Medico + Assinatura
- [ ] Criar `IADisclaimerAlert`
  - Texto: "IA eh ferramenta de apoio. Diagnostico definitivo apenas por profissional habilitado."
  - Link para termos de uso
- [ ] Criar `RevisaoAnaliseDialog`
  - Exibe resultado da IA com WARNING visual
  - Campo obrigatorio: `observacoesDentista`
  - Checkbox: "Confirmo que revisei a analise de IA e valido meu julgamento clinico"
  - Botao "Assinar Revisao" gera hash SHA-256 da confirmacao + timestamp
  - NAO permite marcar como revisado sem checkbox

### T3.3: Integracao Frontend → Backend
- [ ] Atualizar `useRadiografia.ts`
  - Usar endpoints backend (NAO LovableAIService)
  - Verificar consentimento antes de upload
  - Exibir disclaimer em TODO resultado de IA
- [ ] Atualizar `IAInsightsDashboard`
  - Adicionar badge "Revisao Pendente" / "Revisada"
  - Exibir apenas analises revisadas em recomendacoes preventivas
  - Ocultar analises nao revisadas de dashboards agregados

### T3.4: Feature Flag UI
- [ ] Adicionar check no AppRoutes ou ModuleGuard
  - Se `ENABLE_AI_RADIOGRAPHY=false`, esconder menu e rotas
  - Exibir mensagem: "Funcionalidade em desenvolvimento" se acessado diretamente

---

## Fase 4: Testes e Validacao

### T4.1: Testes de Seguranca (Backend)
- [ ] Teste: upload sem consentimento → 403
- [ ] Teste: upload com feature flag desativada → 403
- [ ] Teste: acessar analise de outra clinica → 403 (clinicGuard)
- [ ] Teste: rate limit exceeded → 429
- [ ] Teste: DICOM com metadados PII → metadados removidos
- [ ] Teste: resultadoIA criptografado → nao legivel no banco
- [ ] Teste: revisar sem assinatura → 400
- [ ] Teste: revogar consentimento → bloqueia novas analises

### T4.2: Testes de Integracao
- [ ] Teste: fluxo completo upload → analise → revisao → auditoria
- [ ] Teste: revogacao de consentimento apos analises existentes
- [ ] Teste: exportar dados do paciente (LGPD portabilidade) inclui analises

### T4.3: Testes E2E
- [ ] Teste: dentista faz upload, ve resultado, marca como revisado
- [ ] Teste: paciente revoga consentimento, dentista nao consegue mais analisar

---

## Fase 5: Documentacao

### T5.1: Atualizar Spec 003-pep
- [ ] Story 4 atualizado com controles de seguranca
- [ ] FR adicionado para consentimento LGPD
- [ ] FR adicionado para audit trail
- [ ] NFR atualizado: criptografia, rate limiting, self-hosted only

### T5.2: AGENTS.md / Security Review
- [ ] Atualizar security review com status "IMPLEMENTED" dos controles
