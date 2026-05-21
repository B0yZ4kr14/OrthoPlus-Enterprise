# Contract: Análise de Radiografia com IA

## Base Path
`/api/ia-radiografia`

## Endpoints

### POST `/upload-e-analisar`
Upload radiograph image and trigger AI analysis.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard → iaRateLimiter

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file`: File (required) — PNG, JPEG, or DICOM
- `patient_id`: string (uuid, required)
- `prontuario_id`: string (uuid, optional)
- `tipo_radiografia`: string (required) — one of: PERIAPICAL, PANORAMICA, BITE_WING, OCLUSAL, LATERAL

**Flow**:
1. Validates LGPD consent (403 if missing, code `CONSENTIMENTO_AUSENTE`)
2. Strips DICOM/EXIF metadata (400 if PII detected)
3. Creates placeholder storage path
4. Creates `ia_radiografia_analise` record with status `PENDENTE`
5. Writes audit log (`UPLOAD`)
6. Processes AI analysis synchronously (updates to `PROCESSANDO` → `CONCLUIDA`/`ERRO`)

**Response 201 Created**:
```json
{
  "id": "uuid",
  "status": "CONCLUIDA",
  "message": "Analise iniciada com sucesso"
}
```

**Errors**:
- `400` — No file uploaded OR PII detected in image metadata
- `403` — Patient consent missing (`{ "error": "Consentimento LGPD ausente", "code": "CONSENTIMENTO_AUSENTE" }`)
- `429` — Rate limit exceeded
- `500` — Generic server error

---

### GET `/analises`
List all analyses for the current clinic.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard

**Query Parameters**: None

**Response 200 OK**:
```json
[
  {
    "id": "uuid",
    "paciente_id": "uuid",
    "tipo_radiografia": "PANORAMICA",
    "status": "CONCLUIDA",
    "confidence_score": 87.5,
    "revisada": true,
    "created_at": "2026-05-21T10:00:00Z"
  }
]
```

**Errors**:
- `500` — Generic server error

---

### GET `/analises/:id`
Get single analysis detail with decrypted AI result.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard

**Path Parameters**:
- `id`: string (uuid) — analysis ID

**Response 200 OK**:
```json
{
  "id": "uuid",
  "clinic_id": "uuid",
  "paciente_id": "uuid",
  "dentista_id": "uuid",
  "imagem_hash": "sha256",
  "imagem_storage_path": "uploads/ia-radiografia/...",
  "tipo_radiografia": "PANORAMICA",
  "status": "CONCLUIDA",
  "resultado_ia": {
    "problemas_detectados": [...],
    "dentes_avaliados": [11, 12, 13],
    "qualidade_imagem": "boa",
    "observacoes_gerais": "..."
  },
  "confidence_score": 87.5,
  "processamento_ms": 12450,
  "revisada": true,
  "dentista_revisor_id": "uuid",
  "observacoes_dentista": "Cárie confirmada",
  "assinatura_digital": "sha256-hash",
  "modelo_usado": "local/llama-3.3",
  "created_at": "2026-05-21T10:00:00Z",
  "updated_at": "2026-05-21T10:00:00Z"
}
```

**Side Effects**:
- Creates audit log entry with `acao: VISUALIZAR`

**Errors**:
- `404` — Analysis not found
- `500` — Generic server error

---

### PATCH `/analises/:id/revisar`
Mark analysis as reviewed by dentist.

**⚠️ CRITICAL**: Frontend currently does NOT send `assinatura_digital`, causing 400 errors.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard

**Path Parameters**:
- `id`: string (uuid) — analysis ID

**Request Body**:
```json
{
  "observacoes_dentista": "string (required)",
  "assinatura_digital": "string (required)"
}
```

**Response 200 OK**:
```json
{
  "message": "Analise revisada com sucesso"
}
```

**Side Effects**:
- Updates `revisada=true`, `dentista_revisor_id`, stores SHA-256 of signature
- Creates audit log entry with `acao: REVISAR`

**Errors**:
- `400` — Required fields missing
- `404` — Analysis not found
- `500` — Generic server error
