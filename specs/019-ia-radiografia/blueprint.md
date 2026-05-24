# Blueprint: 019-ia-radiografia — Pending Tasks

**Feature**: IA Radiografia | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Tasks**: [tasks.md](tasks.md)
**Pending**: 10 / 45 | **Status**: MVP complete (US1–US3). Remaining: tests, frontend real-data wiring, docs, deferred enhancements.

---

## Summary

| Task | Phase | Priority | File(s) | Effort |
|------|-------|----------|---------|--------|
| T016 | E2E | P1 | `tests/e2e/ia-radiografia-upload.spec.ts` | Medium |
| T027 | Test US3 | P1 | `backend/tests/unit/iaRadiografiaController.test.ts` | Small |
| T028 | Test US3 | P1 | `backend/tests/unit/iaRadiografiaController.test.ts` | Small |
| T034 | FE US4 | P2 | `apps/web/src/modules/ia-radiografia/components/RadiografiaComparison.tsx` | Small |
| T035 | FE US4 | P2 | `apps/web/src/modules/ia-radiografia/components/PatientRadiographyTimeline.tsx` | Small |
| T036 | FE US4 | P2 | `apps/web/src/modules/ia-radiografia/components/ComparativoPDFExport.tsx` | Small |
| T042 | Docs | P2 | `specs/019-ia-radiografia/quickstart.md` | Small |
| T043 | Future | P3 | `backend/src/workers/iaRadiografiaWorker.ts` | Medium |
| T044 | Future | P3 | `backend/prisma/schema.prisma` + migration | Medium |
| T045 | Future | P3 | `backend/src/modules/ia_radiografia/domain/services/LocalAIService.ts` | Small |

---

## T016 — E2E: Upload Flow End-to-End

**Goal**: Validate the full upload to AI analysis to result display flow via Playwright.

**Test file**: `tests/e2e/ia-radiografia-upload.spec.ts`

### Steps
1. Reuse `global-setup.ts` auth state.
2. Navigate to `/ia-radiografia`.
3. Select a patient with consent (or register consent inline).
4. Upload a test radiograph image (`tests/e2e/fixtures/radiografia-test.png`).
5. Wait for analysis completion (poll status or wait for result card).
6. Assert result card shows `problemas_detectados` and `confidence_score`.

### Scaffold
```typescript
import { test, expect } from '@playwright/test'

test.describe('IA Radiografia Upload Flow', () => {
  test('dentist uploads radiograph and sees AI analysis results', async ({ page }) => {
    await page.goto('/ia-radiografia')

    await page.getByRole('button', { name: /nova radiografia/i }).click()
    await page.getByLabel(/paciente/i).click()
    await page.getByRole('option').first().click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/e2e/fixtures/radiografia-test.png')

    await page.getByRole('button', { name: /analisar/i }).click()

    await expect(page.getByText(/problemas detectados/i)).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(/confian.a/i)).toBeVisible()
  })
})
```

### Notes
- Requires a small test PNG in `tests/e2e/fixtures/` (any dental X-ray stub, ~50KB).
- Mock AI service in backend test env (`NODE_ENV=test`) to return instant results.
- Consent prerequisite: create consent via API in `test.beforeAll` or use a seeded patient.

---

## T027 — Backend Unit Test: Consent Revocation Blocks Uploads

**Goal**: Verify that after `revogarConsentimento` is called, `uploadEAnalisar` returns 403.

**File**: Append to `backend/tests/unit/iaRadiografiaController.test.ts`

### Scaffold
```typescript
describe('revogarConsentimento — blocks uploads', () => {
  it('should return 403 when uploading after consent is revoked', async () => {
    const mockRevogar = jest.fn()
    jest.mocked(IAConsentimentoService).mockImplementation(() => ({
      verificarConsentimento: mockVerificarConsentimento,
      registrarConsentimento: jest.fn(),
      revogarConsentimento: mockRevogar,
      obterHistoricoConsentimento: jest.fn(),
    }) as any)

    mockRevogar.mockResolvedValue({ id: 'consent-1', revogado: true })
    req.params = { pacienteId: 'patient-1' }
    req.body = { motivo: 'Paciente solicitou' }

    await controller.revogarConsentimento(req as Request, res as Response)
    expect(statusMock).toHaveBeenCalledWith(200)

    mockVerificarConsentimento.mockResolvedValue(false)
    req.body = { patient_id: 'patient-1', tipo_radiografia: 'PANORAMICA' }
    req.file = { buffer: Buffer.from('fake-image') } as any

    await controller.uploadEAnalisar(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(403)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'CONSENTIMENTO_AUSENTE' })
    )
  })
})
```

---

## T028 — Backend Unit Test: Audit Log GET Endpoint Returns Clinic-Scoped Records

**Goal**: Verify `obterAuditoriaAnalise` only returns audit records for analyses belonging to the requesting clinic.

**File**: Append to `backend/tests/unit/iaRadiografiaController.test.ts`

### Scaffold
```typescript
describe('obterAuditoriaAnalise — clinic-scoped', () => {
  it('should return 404 for analysis from another clinic', async () => {
    mockPrismaFindFirst.mockResolvedValue(null)
    req.params = { id: 'analise-other-clinic' }

    await controller.obterAuditoriaAnalise(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(404)
  })

  it('should return audit records for analysis in same clinic', async () => {
    mockPrismaFindFirst.mockResolvedValue({
      id: 'analise-1',
      clinic_id: 'clinic-123',
      paciente_id: 'patient-1',
    })
    const mockAuditRecords = [
      { id: 'audit-1', acao: 'UPLOAD', created_at: new Date() },
      { id: 'audit-2', acao: 'REVISAR', created_at: new Date() },
    ]
    mockPrismaFindMany.mockResolvedValue(mockAuditRecords)

    req.params = { id: 'analise-1' }

    await controller.obterAuditoriaAnalise(req as Request, res as Response)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith(mockAuditRecords)
  })
})
```

---

## T034 — Fix `RadiografiaComparison.tsx` Real Data Integration

**Goal**: Ensure component works with real `AnaliseComplete[]` data from backend.

**Current state**: Component receives `analises` prop and groups by patient. Already functional.

### Verification Checklist
- `AnaliseComplete` type has all fields used: `paciente_id`, `paciente_name`, `created_at`, `imagem_url`, `tipo_radiografia`, `problemas_detectados`, `confidence_score`.
- Edge case: empty `analises` shows empty state.

### Minimal Fix (if any)
The component is already wired correctly. The only potential issue is field name drift between frontend type and backend response.

**Backend must return** (verify in `controller.ts`):
```typescript
return res.status(201).json({
  ...analise,
  paciente_name: analise.paciente?.nome,
  problemas_detectados: aiResult.problemas?.length || 0,
  confidence_score: aiResult.confidence,
})
```

### Action
1. Verify backend join includes `paciente` relation in GET `/analises`.
2. Run `cd apps/web && pnpm type-check` to confirm `AnaliseComplete` matches API shape.
3. Mark T034 complete if no type errors.

---

## T035 — Fix `PatientRadiographyTimeline.tsx` Real Data Integration

**Goal**: Ensure timeline fetches real data and renders correctly.

**Current state**: Already fetches patients from `/pacientes` and analyses from `/ia/analises-radiograficas`.

### Required Fix
The component calls:
```typescript
const analisesData = await apiClient.get<AnaliseComplete[]>("/ia/analises-radiograficas")
```

But the actual backend route is `/ia-radiografia/analises` (see `useRadiografia.ts`).

**Fix**:
```typescript
const analisesData = await apiClient.get<AnaliseComplete[]>(
  "/ia-radiografia/analises",
)
```

### Additional Fixes
1. **Confidence score normalization**: Already handles both 0 to 1 and 0 to 100 scales.
2. **Date parsing**: `new Date(analise.created_at)` — verify backend returns ISO string.
3. **Empty state**: Already handled.

### Action
1. Update endpoint path on line 69.
2. Test with real backend data.
3. Verify Recharts renders correctly with 1+ data points.

---

## T036 — Verify `ComparativoPDFExport.tsx` Works with Real Data

**Goal**: Confirm PDF generation handles real `AnaliseComplete` objects without runtime errors.

### Known Issues
1. **`@ts-expect-error`** comments on lines 169, 225, 287 suppress TS errors for Date and string operations. Safe at runtime if fields are populated.
2. **Image loading CORS**: `img.crossOrigin = "anonymous"` may fail for local filesystem URLs.

### Required Fix for CORS
```typescript
try {
  const img1 = new Image()
  img1.crossOrigin = "anonymous"
  img1.src = analise1.imagem_url || ""
  await new Promise((resolve, reject) => {
    img1.onload = resolve
    img1.onerror = reject
    setTimeout(reject, 5000)
  })
} catch (error) {
  console.warn("Image load failed, skipping:", error)
  pdf.text("[Imagem nao disponivel para exportacao]", margin, yPosition)
  yPosition += 10
}
```

### Action
1. Add timeout + `onerror` handler to image loading.
2. Remove `@ts-expect-error` comments if types now align (verify with `pnpm type-check`).
3. Test PDF export with 2 real analyses.
4. Verify filename generation handles undefined `paciente_name`:
   ```typescript
   const safeName = (analise1.paciente_name || "paciente").replace(/\s+/g, "_")
   ```

---

## T042 — Quickstart Validation

**Goal**: Verify `quickstart.md` commands work end-to-end.

**File**: `specs/019-ia-radiografia/quickstart.md` (create if missing)

### Content
```markdown
# Quickstart: IA Radiografia

## Prerequisites
- Docker Compose running (`pnpm dev` or `docker-compose up`)
- Ollama available at `OLLAMA_HOST` (default: http://localhost:11434)

## 1. Seed Test Data
```bash
cd backend
npx tsx scripts/seed-ia-radiografia.ts
```

## 2. Register Patient Consent
```bash
curl -X POST http://localhost:3005/api/ia-radiografia/consentimento \
  -H "Auth: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":"...","consentido":true}'
```

## 3. Upload and Analyze
```bash
curl -X POST http://localhost:3005/api/ia-radiografia/upload-e-analisar \
  -H "Auth: Bearer TOKEN" \
  -F "file=@test.png" \
  -F "patient_id=..." \
  -F "tipo_radiografia=PANORAMICA"
```

## 4. View Results
Open http://localhost:3000/ia-radiografia and verify analysis appears.

## 5. Run Tests
```bash
pnpm test
npx playwright test tests/e2e/ia-radiografia-upload.spec.ts
```
```

### Action
1. Create `quickstart.md` with commands above.
2. Execute each command and fix any issues.
3. Mark T042 complete when all steps succeed.

---

## T043 — Background Worker for AI Processing (GAP-002)

**Goal**: Move AI analysis from synchronous controller to async Redis-backed worker.

**Why**: AI analysis can take 10-30s. Synchronous processing blocks the HTTP connection and risks timeout.

### Architecture
```
Upload Controller
  -> Save file -> Create analysis (status=PENDENTE)
  -> Enqueue job to Redis/BullMQ
  -> Return 202 { id, status: "PENDENTE" }

Worker
  -> Dequeue job
  -> Call LocalAIService.analyzeRadiografia()
  -> Update analysis (status=CONCLUIDA, resultado_ia, confidence_score)
  -> Emit audit log
  -> Emit metrics
```

### New Files
1. `backend/src/workers/iaRadiografiaWorker.ts`
2. Update `backend/src/modules/ia_radiografia/api/controller.ts` (enqueue instead of await AI)
3. Update frontend polling logic in `useRadiografia.ts`

### Scaffold: Worker
```typescript
import { Queue, Worker } from 'bullmq'
import { redisInstance } from '@/infrastructure/redis/redisClient'
import { prisma } from '@/infrastructure/database/prismaClient'
import { LocalAIService } from '@/modules/ia_radiografia/domain/services/LocalAIService'
import { IAAuditService } from '@/modules/ia_radiografia/domain/services/IAAuditService'
import { AcaoAuditIA } from '@prisma/client'

const aiService = new LocalAIService()
const auditService = new IAAuditService()

export const iaRadiografiaQueue = new Queue('ia-radiografia-analysis', {
  connection: redisInstance,
})

export const iaRadiografiaWorker = new Worker(
  'ia-radiografia-analysis',
  async (job) => {
    const { analiseId, storagePath, tipoRadiografia } = job.data

    const analise = await prisma.ia_radiografia_analise.findUnique({
      where: { id: analiseId },
    })
    if (!analise) throw new Error('Analysis not found')

    const fs = await import('fs')
    const imageBuffer = fs.readFileSync(storagePath)

    const result = await aiService.analyzeRadiografia(imageBuffer, tipoRadiografia)

    await prisma.ia_radiografia_analise.update({
      where: { id: analiseId },
      data: {
        status: 'CONCLUIDA',
        resultado_ia: result.resultado as any,
        confidence_score: result.confidence,
        processamento_ms: result.processingTimeMs,
        concluida_at: new Date(),
      },
    })

    await auditService.registrarAcao({
      analiseId,
      clinicId: analise.clinic_id,
      pacienteId: analise.paciente_id,
      dentistaId: analise.dentista_id,
      acao: AcaoAuditIA.PROCESSAR,
      detalhes: { confidence: result.confidence, model: analise.modelo_usado },
    })
  },
  { connection: redisInstance, concurrency: 2 }
)

iaRadiografiaWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job failed:`, err)
  prisma.ia_radiografia_analise.update({
    where: { id: job?.data.analiseId },
    data: { status: 'ERRO', erro_processamento: err.message },
  }).catch(console.error)
})
```

### Scaffold: Controller Update
Replace the synchronous AI call in `uploadEAnalisar` with:
```typescript
await iaRadiografiaQueue.add('analyze', {
  analiseId: analise.id,
  storagePath,
  tipoRadiografia: tipo_radiografia as TipoRadiografia,
}, {
  delay: 0,
  attempts: 2,
  backoff: { type: 'exponential', delay: 5000 },
})

return res.status(202).json({
  id: analise.id,
  status: 'PENDENTE',
  message: 'Analise enfileirada para processamento',
})
```

### Notes
- Requires `bullmq` package: `cd backend && pnpm add bullmq`.
- Update frontend to handle `status: "PENDENTE"` and poll for completion.
- Update `useRadiografia.ts` polling interval to 5s while PENDENTE analyses exist.

---

## T044 — Create `problema_radiografico` Table (GAP-005)

**Goal**: Normalize AI-detected problems into a dedicated table instead of storing in `resultado_ia` JSON.

### Migration
```prisma
model problema_radiografico {
  id                  String   @id @default(uuid())
  analise_id          String
  tipo_problema       TipoProblemaRadiografico
  dente_codigo        String?
  localizacao         String?
  severidade          SeveridadeProblema
  confianca           Float
  descricao           String?
  sugestao_tratamento String?
  urgente             Boolean  @default(false)
  created_at          DateTime @default(now())

  analise ia_radiografia_analise @relation(fields: [analise_id], references: [id], onDelete: Cascade)

  @@index([analise_id])
  @@index([tipo_problema])
  @@map("problema_radiografico")
}

enum TipoProblemaRadiografico {
  CARIE
  FRATURA
  PERIODONTAL
  IMPLANTE_NECESSARIO
  CANAL
  LESAO_PERIAPICAL
  OUTROS
}

enum SeveridadeProblema {
  LEVE
  MODERADA
  GRAVE
}
```

### Service Update
Create `backend/src/modules/ia_radiografia/domain/services/ProblemaRadiograficoService.ts`:
```typescript
export class ProblemaRadiograficoService {
  async criarProblemas(analiseId: string, problemas: ProblemaRadiograficoInput[]) {
    return prisma.problema_radiografico.createMany({
      data: problemas.map(p => ({
        analise_id: analiseId,
        ...p,
      })),
    })
  }

  async obterPorAnalise(analiseId: string) {
    return prisma.problema_radiografico.findMany({
      where: { analise_id: analiseId },
      orderBy: { confianca: 'desc' },
    })
  }
}
```

### Worker Integration
Update `iaRadiografiaWorker.ts` (T043) to parse `resultado_ia.problemas_detectados` and call `ProblemaRadiograficoService.criarProblemas()`.

### Notes
- Run `cd backend && npx prisma migrate dev --name add_problema_radiografico`.
- Regenerate `apps/web/src/types/database.ts` after migration.
- Update insights endpoint (T032) to aggregate from `problema_radiografico` instead of JSON.

---

## T045 — AI Model Versioning and A/B Testing

**Goal**: Track which model version produced each analysis. Allow clinics to opt into newer models.

### Schema Change
```prisma
model ia_radiografia_analise {
  // ... existing fields
  modelo_usado      String   @default("local/llama-3.3")
  modelo_version    String?
  experiment_id     String?
}

model ia_modelo_config {
  id              String   @id @default(uuid())
  clinic_id       String
  modelo_ativo    String   @default("local/llama-3.3")
  aceita_beta     Boolean  @default(false)
  updated_at      DateTime @updatedAt

  @@unique([clinic_id])
  @@map("ia_modelo_config")
}
```

### Service Update
Update `LocalAIService.ts`:
```typescript
interface AIModelConfig {
  name: string
  endpoint: string
  version: string
}

const MODELS: Record<string, AIModelConfig> = {
  'local/llama-3.3': { name: 'llama-3.3-vision', endpoint: '/api/generate', version: '1.0.0' },
  'local/llava': { name: 'llava', endpoint: '/api/generate', version: '2.0.0' },
}

export class LocalAIService {
  async analyzeRadiografia(
    imageBuffer: Buffer,
    tipoRadiografia: string,
    modelOverride?: string,
  ) {
    const modelKey = modelOverride || process.env.AI_LOCAL_MODEL || 'local/llama-3.3'
    const model = MODELS[modelKey]
    return {
      resultado: { /* ... */ },
      confidence: 0.88,
      processingTimeMs: 1200,
      modeloUsado: modelKey,
      modeloVersion: model.version,
    }
  }
}
```

### Controller Update
In `uploadEAnalisar`, check clinic's `ia_modelo_config` before selecting model:
```typescript
const modelConfig = await prisma.ia_modelo_config.findUnique({
  where: { clinic_id: clinicId },
})
const modelToUse = modelConfig?.aceita_beta
  ? process.env.AI_BETA_MODEL || 'local/llava'
  : modelConfig?.modelo_ativo || process.env.AI_LOCAL_MODEL || 'local/llama-3.3'
```

### Notes
- T045 is fully deferred (post-MVP). Implement only after T043 and T044 are stable.
- A/B testing requires statistical significance tracking (out of scope for MVP).

---

## Execution Order

1. **T027, T028** — Add missing unit tests (parallel, no deps).
2. **T034, T035, T036** — Frontend real-data fixes (parallel, no backend deps).
3. **T016** — E2E test (depends on frontend fixes from T034-T036).
4. **T042** — Quickstart validation (depends on all above being functional).
5. **T043** — Background worker (depends on T042 validation, introduces infra change).
6. **T044** — Problem table migration (depends on T043 for parsing logic).
7. **T045** — Model versioning (deferred, depends on T043 + T044).

---

## Quality Gates

- [ ] `cd backend && pnpm build` — 0 errors
- [ ] `cd backend && pnpm test` — all pass (including T027, T028)
- [ ] `cd apps/web && pnpm type-check` — 0 errors
- [ ] `pnpm lint` — 0 new errors
- [ ] Playwright E2E: `npx playwright test tests/e2e/ia-radiografia-upload.spec.ts` — pass
- [ ] No new `as any` or `@ts-ignore` (Constitution CQ-2)
