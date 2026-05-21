# Quickstart: IA Radiografia Module

## Prerequisites

- Ollama running locally with `llava` or `llama-3.3` model pulled
- `ENABLE_AI_RADIOGRAPHY=true` in backend `.env`
- `IA_ENCRYPTION_KEY` set to a 32+ character string in backend `.env`

## Running the Module

### 1. Start the AI Service

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the vision model
ollama pull llava

# Verify it's running
curl http://localhost:11434/api/tags
```

### 2. Enable the Feature Flag

Add to backend `.env`:
```bash
ENABLE_AI_RADIOGRAPHY=true
IA_ENCRYPTION_KEY=your-32-char-minimum-key-here-123
```

### 3. Verify Prisma Models

```bash
cd backend
npx prisma generate
npx prisma migrate status
```

Ensure `ia_radiografia_analise`, `ia_radiografia_audit_log`, and `paciente_consentimento_ia` are in the `pep` schema.

### 4. Test the API

```bash
# Register consent
curl -X POST http://localhost:3005/api/ia-radiografia/consentimento \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":"...","consentido":true,"hash_termo":"..."}'

# Upload and analyze
curl -X POST http://localhost:3005/api/ia-radiografia/upload-e-analisar \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@xray.png" \
  -F "patient_id=..." \
  -F "tipo_radiografia=PANORAMICA"
```

## Known Issues During Development

| Issue | Workaround |
|-------|------------|
| Upload is faked (local path) | Images are not actually stored; path is a placeholder |
| AI runs synchronously | Large images will block the request; use small test images |
| Review endpoint fails from frontend | Send `assinatura_digital` manually in the request body |
| Rate limiter resets on restart | In-memory only; restart server to reset limits |
| Hardcoded encryption fallback | Set `IA_ENCRYPTION_KEY` to avoid using dev-only fallback |

## Frontend Development

```bash
cd apps/web
pnpm dev
```

Navigate to `/ia-radiografia` (requires "IA" module enabled for the clinic).

The module uses:
- `useRadiografia.ts` hook for data fetching and upload
- Zod schemas in `types/radiografia.types.ts`
- `@orthoplus/core-ui` components

## Testing

```bash
# Backend tests
cd backend && pnpm test

# Frontend tests
cd apps/web && pnpm test

# E2E tests
cd tests/e2e && pnpm test
```
