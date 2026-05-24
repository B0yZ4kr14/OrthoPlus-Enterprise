# Quickstart: IA Radiografia

## Prerequisites

- Docker Compose running (`pnpm dev` or `docker-compose up`)
- Ollama available at `OLLAMA_HOST` (default: http://localhost:11434)
- Backend env vars: `ENABLE_AI_RADIOGRAPHY=true`, `IA_ENCRYPTION_KEY` (32+ chars)

## 1. Verify Ollama

```bash
curl http://localhost:11434/api/tags | grep llava
```

If llava is not available, pull it:
```bash
curl -X POST http://localhost:11434/api/pull -d '{"name":"llava"}'
```

## 2. Seed Test Data

```bash
cd backend
npx tsx scripts/seed-ia-radiografia.ts
```

Or create a patient and consent via API (see step 3).

## 3. Register Patient Consent

```bash
curl -X POST http://localhost:3005/api/ia-radiografia/consentimento \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":"PATIENT_UUID","consentido":true,"hash_termo":"abc123"}'
```

## 4. Upload and Analyze

```bash
curl -X POST http://localhost:3005/api/ia-radiografia/upload-e-analisar \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.png" \
  -F "patient_id=PATIENT_UUID" \
  -F "tipo_radiografia=PANORAMICA"
```

Expected response (201):
```json
{
  "id": "analise-uuid",
  "job_id": "bullmq-job-id",
  "status": "PENDENTE",
  "message": "Analise enfileirada"
}
```

> **Note**: The analysis is now processed asynchronously via BullMQ worker. Poll `GET /api/ia-radiografia/analises` or check the frontend for status updates.


## 5. View Results

Open http://localhost:3000/ia-radiografia and verify:
- Analysis card appears in the list
- Confidence score is displayed
- Problems detected are listed

## 6. Review Analysis

```bash
curl -X PATCH http://localhost:3005/api/ia-radiografia/analises/ANALISE_UUID/revisar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"observacoes_dentista":"Caries confirmada na regiao 14","assinatura_digital":"dentista-uuid:analise-uuid:timestamp"}'
```

## 7. View Insights

```bash
curl http://localhost:3005/api/ia-radiografia/insights \
  -H "Authorization: Bearer TOKEN"
```

## 8. Run Tests

```bash
# Backend unit tests
cd backend && npx jest --testPathPattern="iaRadiografiaController"

# Frontend type-check
cd apps/web && pnpm type-check

# E2E (requires backend + frontend running)
npx playwright test tests/e2e/ia-radiografia-upload.spec.ts
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `FEATURE_DISABLED` | Set `ENABLE_AI_RADIOGRAPHY=true` in backend `.env` |
| `CONSENTIMENTO_AUSENTE` | Register consent for the patient first (step 3) |
| `Rate limit excedido` | Wait 1 hour (dentist) or 24 hours (clinic) |
| AI returns empty result | Check Ollama is running and llava model is loaded |
| Upload fails with 500 | Check `IA_ENCRYPTION_KEY` is set and >= 32 characters |
