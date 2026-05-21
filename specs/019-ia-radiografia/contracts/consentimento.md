# Contract: Consentimento LGPD para IA Radiografia

## Base Path
`/api/ia-radiografia/consentimento`

## Endpoints

### POST `/consentimento`
Register patient consent for AI radiography processing.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard → iaRateLimiter

**Request Body**:
```json
{
  "paciente_id": "string (uuid)",
  "consentido": "boolean",
  "hash_termo": "string (sha256)"
}
```

**Response 201 Created**:
```json
{
  "id": "uuid",
  "paciente_id": "uuid",
  "clinic_id": "uuid",
  "tipo_consentimento": "IA_RADIOGRAFIA",
  "consentido": true,
  "data_consentimento": "2026-05-21T10:00:00Z",
  "ip_consentimento": "100.111.74.69",
  "hash_termo": "abc123...",
  "revogado": false,
  "created_at": "2026-05-21T10:00:00Z",
  "updated_at": "2026-05-21T10:00:00Z"
}
```

**Errors**:
- `500` — Generic server error

---

### GET `/consentimento/:pacienteId`
Get current consent status and history for a patient.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard

**Path Parameters**:
- `pacienteId`: string (uuid)

**Response 200 OK**:
```json
{
  "ativo": true,
  "historico": [
    {
      "id": "uuid",
      "paciente_id": "uuid",
      "clinic_id": "uuid",
      "consentido": true,
      "data_consentimento": "2026-05-21T10:00:00Z",
      "revogado": false,
      ...
    }
  ]
}
```

**Errors**:
- `500` — Generic server error

---

### DELETE `/consentimento/:pacienteId`
Revoke patient consent. Writes audit log entry.

**Middleware**: authMiddleware → clinicGuard → aiFeatureFlagGuard

**Path Parameters**:
- `pacienteId`: string (uuid)

**Request Body** (optional):
```json
{
  "motivo": "string"  // default: "Revogacao pelo paciente"
}
```

**Response 200 OK**:
```json
{
  "id": "uuid",
  "paciente_id": "uuid",
  "revogado": true,
  "data_revogacao": "2026-05-21T10:00:00Z",
  "motivo_revogacao": "Revogacao pelo paciente",
  ...
}
```

**Side Effects**:
- Creates audit log entry with `acao: REVOGAR_CONSENTIMENTO`

**Errors**:
- `500` — Generic server error
