# Módulo: IA Análise de Radiografias

## Visão Geral

O módulo **IA Radiografia** fornece análise automatizada de radiografias odontológicas usando modelos de visão computacional (Ollama/Gemini). Ele inclui:

- Upload de imagens (PNG, JPEG, DICOM)
- Análise por IA com detecção de problemas dentários
- Revisão por dentistas com assinatura digital
- Gestão de consentimento LGPD
- Trilha de auditoria completa
- Dashboard de insights e comparações

## Arquitetura

```
backend/src/modules/ia_radiografia/
├── api/
│   ├── controller.ts          # Lógica dos endpoints
│   ├── router.ts              # Rotas Express
│   ├── aiFeatureFlagGuard.ts  # Feature flag check
│   └── iaRateLimiter.ts       # Rate limiting (memória)
├── domain/
│   ├── entities/
│   │   ├── analise.ts
│   │   ├── audit.ts
│   │   └── consentimento.ts
│   └── services/
│       ├── LocalAIService.ts       # Integração com Ollama
│       ├── IAEncryptionService.ts  # Criptografia AES-256-GCM
│       ├── IAAuditService.ts       # Logs de auditoria
│       ├── IAConsentimentoService.ts
│       └── DicomMetadataStripper.ts

apps/web/src/modules/ia-radiografia/
├── ui/pages/IARadiografia.tsx
├── ui/components/
│   ├── UploadDialog.tsx
│   └── AnaliseList.tsx
├── components/
│   ├── AnaliseDetailsDialog.tsx
│   ├── AnaliseCharts.tsx
│   ├── IAInsightsDashboard.tsx
│   ├── RadiografiaComparison.tsx
│   ├── PatientRadiographyTimeline.tsx
│   └── ComparativoPDFExport.tsx
├── hooks/
│   ├── useRadiografia.ts
│   ├── useConsentimento.ts
│   └── useAuditTrail.ts
└── types/radiografia.types.ts
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ia-radiografia/upload-e-analisar` | Upload + análise IA |
| GET | `/api/ia-radiografia/analises` | Listar análises |
| GET | `/api/ia-radiografia/analises/:id` | Detalhes da análise |
| GET | `/api/ia-radiografia/analises/:id/audit` | Trilha de auditoria |
| PATCH | `/api/ia-radiografia/analises/:id/revisar` | Revisar análise |
| POST | `/api/ia-radiografia/consentimento` | Registrar consentimento |
| GET | `/api/ia-radiografia/consentimento/:pacienteId` | Verificar consentimento |
| DELETE | `/api/ia-radiografia/consentimento/:pacienteId` | Revogar consentimento |
| GET | `/api/ia-radiografia/insights` | KPIs e métricas |

## Variáveis de Ambiente

```bash
# Backend
ENABLE_AI_RADIOGRAPHIA=true
IA_ENCRYPTION_KEY=<minimo-32-caracteres>
AI_LOCAL_MODEL=local/llama-3.3
AI_LOCAL_ENDPOINT=http://localhost:11434
```

## Consentimento LGPD

Antes de qualquer upload, o sistema verifica se o paciente possui consentimento ativo. O fluxo:

1. Usuário informa o ID do paciente no upload
2. Frontend chama `GET /consentimento/:pacienteId`
3. Se `ativo=true`, permite upload
4. Se `ativo=false` ou ausente, exibe banner vermelho com botão de registrar consentimento
5. Ao registrar, grava IP, timestamp e hash dos termos

## Métricas Prometheus

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `orthoplus_ia_radiografia_uploads_total` | Counter | Total de uploads |
| `orthoplus_ia_radiografia_analysis_duration_seconds` | Histogram | Duração da análise |
| `orthoplus_ia_radiografia_reviews_total` | Counter | Total de revisões |
| `orthoplus_ia_radiografia_consent_revocations_total` | Counter | Revogações de consentimento |
| `orthoplus_ia_radiografia_analysis_errors_total` | Counter | Erros de análise |

## Gaps Conhecidos

- **GAP-001**: Upload usa filesystem local (não S3/MinIO)
- **GAP-002**: Processamento IA é síncrono (deveria ser fila)
- **GAP-005**: Problemas estão dentro do JSON criptografado (deveria ter tabela dedicada)
- **GAP-007**: Rate limiter usa memória (deveria usar Redis)

## Testes

```bash
# Backend
cd backend && pnpm test

# Frontend
cd apps/web && pnpm test

# E2E
cd /home/b0yz4kr14/Projects/OrthoPlus-Enterprise && pnpm test:e2e
```
