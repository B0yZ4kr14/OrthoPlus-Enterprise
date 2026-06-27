# Alinhamento Frontend + Schema + Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fechar os drifts críticos e altos aceitos do canon drift plan (`specs/_drift/frontend-schema-deploy.canon.drift.md`), alinhando frontend, schema Prisma, autenticação e documentação de specs com a constituição e o AGENTS.md do projeto.

**Architecture:** Abordagem por fases — segurança primeiro (secrets, tokens, mock), depois isolamento por clínica no banco e nas APIs, em seguida consolidação frontend, e por fim sincronização de specs/docs. Cada fase produz mudanças testáveis e commitáveis independentemente.

**Tech Stack:** Node.js 20 + Express + Prisma 6 + PostgreSQL 16, React 18 + Vite + TypeScript, Zustand, bcrypt/jsonwebtoken, cookie-parser.

---

## File Structure

| Caminho | Responsabilidade |
|---|---|
| `backend/prisma/schema.prisma` | Fonte de verdade dos modelos; recebe colunas `clinic_id` e criptografia de secrets |
| `backend/src/modules/auth/api/AuthController.ts` | Set/remove cookies HttpOnly; não retornar tokens no body |
| `backend/src/middleware/authMiddleware.ts` | Remover caminho de mock de autenticação |
| `backend/src/modules/configuracoes/application/ModulosControllerService.ts` | Persistir toggle em `clinic_modules` ao invés de mutar catálogo em memória |
| `backend/src/modules/configuracoes/domain/moduleCatalog.ts` | Tornar imutável / read-only |
| `apps/web/src/core/layout/Sidebar/sidebar.config.ts` | Config da sidebar (mantida, mas consome fonte única futura) |
| `apps/web/src/core/config/modules.config.ts` | Catálogo de módulos (mantido) |
| `categories/@orthoplus/core/packages/ui/src/components/ModuleCard.tsx` | Componente canônico de card de módulo |
| `apps/web/src/modules/settings/ui/components/ModuleCard.tsx` | Implementação a ser movida/deprecada |
| `apps/web/src/components/ModuleCard.tsx` | Implementação legada a ser removida |
| `specs/*/STATUS.md` | Atualizar status de specs implementadas |
| `docs/superpowers/auditoria-2026-06-26-findings.md` | Fonte da auditoria |
| `specs/_drift/frontend-schema-deploy.*.drift.md` | Drifts gerados |

---

## Phase 1 — Segurança Crítica

### Task 1: Remover `.env` da working tree e endurecer `.gitignore`

**Files:**
- Modify: `.gitignore`
- Delete: `.env` (sem commitar conteúdo)

- [x] **Step 1: Verificar se `.env` está untracked**

```bash
git status --short | grep -E '^\?\? \.env$'
```
Expected: `?? .env`

- [x] **Step 2: Garantir regras de ignore para `.env`**

```bash
cat .gitignore | grep -E '^\.env'
```
Expected: linhas `.env`, `.env.*`, `!.env.example`

- [x] **Step 3: Atualizar `.gitignore` se necessário**

Adicionar no final de `.gitignore`:

```gitignore
# Secrets
.env
.env.*
!.env.example
.secrets
*.secrets
```

- [x] **Step 4: Remover `.env` do working tree**

```bash
rm -f .env
git status --short | grep -E '\.env' || echo 'ok'
```
Expected: nenhuma ocorrência de `.env` (exceto `.env.example` se existir).

- [x] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "security(infra): remove .env from working tree and harden .gitignore"
```

---

### Task 2: Criptografar secrets de certificado digital em `fiscal_config`

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/modules/financeiro/application/FinanceiroService.ts` (ou novo helper)
- Create: `backend/src/modules/financeiro/application/crypto/fieldEncryption.ts`
- Create: `backend/tests/unit/fiscalConfigEncryption.test.ts`

- [x] **Step 1: Write the failing test**

Create `backend/tests/unit/fiscalConfigEncryption.test.ts`:

```typescript
import { encryptField, decryptField } from '../../src/modules/financeiro/application/crypto/fieldEncryption'

describe('fiscal config field encryption', () => {
  it('encrypts and decrypts a certificate password', () => {
    const plain = 'my-cert-password'
    const encrypted = encryptField(plain)
    expect(encrypted).not.toEqual(plain)
    expect(decryptField(encrypted)).toEqual(plain)
  })
})
```

- [x] **Step 2: Run test to verify it fails**

```bash
cd backend && pnpm test fiscalConfigEncryption.test.ts
```
Expected: FAIL "Cannot find module"

- [x] **Step 3: Implement minimal field encryption helper**

Create `backend/src/modules/financeiro/application/crypto/fieldEncryption.ts`:

```typescript
import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const KEY = Buffer.from(process.env.FISCAL_CERT_ENCRYPT_KEY || '', 'hex')

if (KEY.length !== 32) {
  throw new Error('FISCAL_CERT_ENCRYPT_KEY must be 64 hex chars (32 bytes)')
}

export function encryptField(plainText: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptField(cipherText: string): string {
  const [ivHex, authTagHex, encryptedHex] = cipherText.split(':')
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
```

- [x] **Step 4: Run test to verify it passes**

```bash
cd backend && FISCAL_CERT_ENCRYPT_KEY=$(openssl rand -hex 32) pnpm test fiscalConfigEncryption.test.ts
```
Expected: PASS

- [x] **Step 5: Add env var to `.env.example` and docs**

Modify `backend/.env.example` (or root `.env.example`):

```bash
# Fiscal certificate encryption (64 hex chars = 32 bytes)
FISCAL_CERT_ENCRYPT_KEY=
```

- [x] **Step 6: Apply encryption in service layer**

Modify `backend/src/modules/financeiro/application/FinanceiroService.ts` (or wherever `fiscal_config` is written/read):

```typescript
import { encryptField, decryptField } from './crypto/fieldEncryption'

// On create/update of fiscal_config:
const encryptedSenha = data.senha_certificado ? encryptField(data.senha_certificado) : undefined
const encryptedCsc = data.csc_token ? encryptField(data.csc_token) : undefined

// On read:
const plainSenha = row.senha_certificado ? decryptField(row.senha_certificado) : null
```

- [x] **Step 7: Commit**

```bash
git add backend/src/modules/financeiro/application/crypto/fieldEncryption.ts \
  backend/tests/unit/fiscalConfigEncryption.test.ts \
  backend/src/modules/financeiro/application/FinanceiroService.ts \
  .env.example
git commit -m "security(backend): encrypt fiscal_config certificate secrets at rest"
```

---

### Task 3: Mover refresh token para cookie HttpOnly

**Files:**
- Modify: `backend/src/modules/auth/api/AuthController.ts`
- Modify: `backend/src/modules/auth/application/AuthService.ts` (se necessário)
- Modify: `apps/web/src/contexts/AuthContext.tsx`
- Modify: `apps/web/src/lib/api/apiClient.ts`
- Test: `backend/tests/unit/authController.test.ts` (existing)

- [x] **Step 1: Inspect current refresh endpoint**

```bash
grep -n 'refreshToken' backend/src/modules/auth/api/AuthController.ts
```
Expected: occurrence around line 124 returning JSON.

- [x] **Step 2: Update `AuthController.refreshToken` to set HttpOnly cookie**

Replace the JSON response in `backend/src/modules/auth/api/AuthController.ts` (lines ~118-133):

```typescript
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
})

return res.status(200).json({ success: true })
```

- [x] **Step 3: Update login endpoint to also set refresh token cookie**

In the same file, where `accessToken`/`refreshToken` are returned, set both cookies:

```typescript
res.cookie('access_token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
})

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

return res.status(200).json({ success: true, user })
```

- [x] **Step 4: Update frontend `apiClient` to rely on cookies**

`apps/web/src/lib/api/apiClient.ts` already uses `withCredentials: true`. Remove any manual `Authorization` header injection if present:

```typescript
// Remove or guard any code like:
// headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`
```

- [x] **Step 5: Update `AuthContext` cleanup**

Ensure `signOut` clears cookies by calling backend endpoint `/auth/logout` (which should clear cookies) instead of relying solely on `localStorage.removeItem`.

- [x] **Step 6: Run backend tests**

```bash
cd backend && pnpm test authController.test.ts
```
Expected: tests pass (update mocks if they assert body tokens).

- [x] **Step 7: Commit**

```bash
git add backend/src/modules/auth/api/AuthController.ts \
  apps/web/src/contexts/AuthContext.tsx \
  apps/web/src/lib/api/apiClient.ts
git commit -m "security(auth): move refresh token to HttpOnly cookie"
```

---

### Task 4: Hard-gate `AUTH_ALLOW_MOCK` para nunca funcionar em produção

**Files:**
- Modify: `backend/src/middleware/authMiddleware.ts`
- Modify: `backend/src/modules/auth/application/AuthService.ts`
- Modify: `backend/src/modules/configuracoes/application/ModulosControllerService.ts` (se mock for usado aqui)

- [x] **Step 1: Find mock auth paths**

```bash
grep -rn 'AUTH_ALLOW_MOCK' backend/src
```

- [x] **Step 2: Add production guard**

In `backend/src/middleware/authMiddleware.ts`, change any block like:

```typescript
if (process.env.AUTH_ALLOW_MOCK === 'true') {
```

To:

```typescript
if (process.env.NODE_ENV !== 'production' && process.env.AUTH_ALLOW_MOCK === 'true') {
```

- [x] **Step 3: Add explicit throw in `AuthService` if mock is requested in production**

In `backend/src/modules/auth/application/AuthService.ts`:

```typescript
if (process.env.NODE_ENV === 'production' && process.env.AUTH_ALLOW_MOCK === 'true') {
  throw new Error('AUTH_ALLOW_MOCK is prohibited in production')
}
```

- [x] **Step 4: Validate via `validate-production.sh`**

```bash
./scripts/validate-production.sh
```
Expected: script rejects `AUTH_ALLOW_MOCK=true`.

- [x] **Step 5: Commit**

```bash
git add backend/src/middleware/authMiddleware.ts \
  backend/src/modules/auth/application/AuthService.ts
git commit -m "security(auth): hard-gate AUTH_ALLOW_MOCK against production"
```

---

## Phase 2 — Isolamento por Clínica

### Task 5: Adicionar `clinic_id` às tabelas filhas de orçamento/budget

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260626120000_add_clinic_id_to_budget_orcamento_children/migration.sql`
- Modify: `backend/src/modules/orcamentos/application/services/OrcamentoService.ts`
- Modify: `backend/src/modules/financeiro/application/FinanceiroService.ts` (if budget service exists)
- Test: `backend/tests/unit/orcamentosService.test.ts` (or create)

- [x] **Step 1: Update Prisma schema**

Add `clinic_id String` to:
- `budget_items`
- `budget_approvals`
- `budget_versions`
- `orcamento_itens`
- `orcamento_pagamento`
- `orcamento_visualizacoes`

Example:

```prisma
model budget_items {
  id          String   @id @default(uuid())
  budget_id   String
  // ... existing fields ...
  clinic_id   String
  budget      budgets  @relation(fields: [budget_id], references: [id])

  @@index([clinic_id])
}
```

- [x] **Step 2: Generate migration**

```bash
cd backend && pnpm prisma migrate dev --name add_clinic_id_to_budget_orcamento_children
```
Expected: migration created.

- [x] **Step 3: Backfill existing rows**

In the generated migration SQL, add a backfill step before adding `NOT NULL`:

```sql
UPDATE budget_items bi
SET clinic_id = b.clinic_id
FROM budgets b
WHERE bi.budget_id = b.id;

-- Repeat for other tables using appropriate parent joins
```

- [x] **Step 4: Update service layer to include `clinic_id`**

In `OrcamentoService` create/update methods:

```typescript
const clinicId = req.clinicId
// ...
await prisma.orcamento_itens.create({
  data: {
    ...itemData,
    clinic_id: clinicId,
  },
})
```

- [x] **Step 5: Run backend build and tests**

```bash
cd backend && pnpm build && pnpm test
```
Expected: build passes; existing tests still pass.

- [x] **Step 6: Commit**

```bash
git add backend/prisma/schema.prisma \
  backend/prisma/migrations/ \
  backend/src/modules/orcamentos/application/services/OrcamentoService.ts \
  backend/src/modules/financeiro/application/FinanceiroService.ts
git commit -m "feat(db): add clinic_id to budget/orcamento child tables"
```

---

### Task 6: Forçar `req.clinicId` e rejeitar `clinicId` do body

**Files:**
- Modify: `backend/src/modules/auth/api/AuthController.ts`
- Modify: `backend/src/modules/configuracoes/application/ModulosControllerService.ts`
- Modify: `backend/src/modules/crypto_config/application/CryptoConfigControllerService.ts`
- Modify: `backend/src/modules/notifications/api/notificationController.ts`
- Modify: `backend/src/modules/database_admin/api/DatabaseAdminController.ts` (audit log endpoint)

- [x] **Step 1: Audit controllers accepting `clinicId` from body**

```bash
grep -rn 'clinicId' backend/src/modules --include='*.ts' | grep -v 'req.clinicId\|req.user.clinicId\|req.params' | head -30
```

- [x] **Step 2: Update schemas to strip `clinicId` from input DTOs**

Example in `backend/src/modules/auth/api/schemas.ts`:

```typescript
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  // remove clinicId from body
})
```

- [x] **Step 3: Update services to use `req.clinicId`**

In each service, replace:

```typescript
const clinicId = data.clinicId
```

With:

```typescript
const clinicId = req.clinicId
```

- [x] **Step 4: Add tests proving body `clinicId` is ignored**

Example test:

```typescript
it('ignores clinicId from body and uses token clinicId', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .set('Cookie', [`access_token=${tokenForClinicA}`])
    .send({ email: 'x@x.com', password: 'StrongP@ss1', clinicId: 'clinic-b' })
  expect(res.status).toBe(201)
  const user = await prisma.users.findUnique({ where: { email: 'x@x.com' } })
  expect(user.clinic_id).toBe('clinic-a')
})
```

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/auth/api/AuthController.ts \
  backend/src/modules/auth/api/schemas.ts \
  backend/src/modules/configuracoes/application/ModulosControllerService.ts \
  backend/src/modules/crypto_config/application/CryptoConfigControllerService.ts \
  backend/src/modules/notifications/api/notificationController.ts \
  backend/src/modules/database_admin/api/DatabaseAdminController.ts \
  backend/tests/unit/
git commit -m "security(backend): enforce req.clinicId and ignore body clinicId"
```

---

### Task 7: Persistir toggle de módulos em `clinic_modules`

**Files:**
- Modify: `backend/src/modules/configuracoes/application/ModulosControllerService.ts`
- Modify: `backend/src/modules/configuracoes/domain/moduleCatalog.ts`
- Modify: `backend/src/modules/configuracoes/infrastructure/ClinicModuleRepository.ts` (create if absent)
- Modify: `backend/src/modules/configuracoes/api/ModulosController.ts`
- Test: create `backend/tests/unit/modulosToggle.test.ts`

- [x] **Step 1: Make `MODULE_CATALOG` immutable read-only**

In `backend/src/modules/configuracoes/domain/moduleCatalog.ts`:

```typescript
export const MODULE_CATALOG = Object.freeze([...])
```

- [x] **Step 2: Create repository for `clinic_modules`**

Create `backend/src/modules/configuracoes/infrastructure/ClinicModuleRepository.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

export class ClinicModuleRepository {
  constructor(private prisma: PrismaClient) {}

  async toggle(clinicId: string, moduleKey: string, enabled: boolean) {
    const existing = await this.prisma.clinic_modules.findUnique({
      where: { clinic_id_module_catalog_id: { clinic_id: clinicId, module_catalog_id: moduleKey } },
    })
    if (existing) {
      return this.prisma.clinic_modules.update({
        where: { id: existing.id },
        data: { enabled },
      })
    }
    return this.prisma.clinic_modules.create({
      data: {
        clinic_id: clinicId,
        module_catalog_id: moduleKey,
        enabled,
      },
    })
  }

  async listByClinic(clinicId: string) {
    return this.prisma.clinic_modules.findMany({ where: { clinic_id: clinicId } })
  }
}
```

- [x] **Step 3: Update `ModulosControllerService` to use repository**

Replace `performToggle` logic:

```typescript
private clinicModuleRepo = new ClinicModuleRepository(prisma)

async toggleModule(clinicId: string, moduleKey: string, enabled: boolean) {
  return this.clinicModuleRepo.toggle(clinicId, moduleKey, enabled)
}

async getModulesForClinic(clinicId: string) {
  const overrides = await this.clinicModuleRepo.listByClinic(clinicId)
  const overridesMap = new Map(overrides.map(o => [o.module_catalog_id, o.enabled]))
  return MODULE_CATALOG.map(m => ({
    ...m,
    enabled: overridesMap.has(m.key) ? overridesMap.get(m.key)! : m.enabledDefault,
  }))
}
```

- [x] **Step 4: Write test**

Create `backend/tests/unit/modulosToggle.test.ts`:

```typescript
import { ClinicModuleRepository } from '../../src/modules/configuracoes/infrastructure/ClinicModuleRepository'
import { prisma } from '../helpers/prisma'

describe('ClinicModuleRepository', () => {
  it('persists module toggle per clinic', async () => {
    const repo = new ClinicModuleRepository(prisma)
    await repo.toggle('clinic-1', 'agenda', false)
    const modules = await repo.listByClinic('clinic-1')
    expect(modules.find(m => m.module_catalog_id === 'agenda')?.enabled).toBe(false)
  })
})
```

- [x] **Step 5: Run tests and build**

```bash
cd backend && pnpm build && pnpm test modulosToggle.test.ts
```
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/configuracoes/application/ModulosControllerService.ts \
  backend/src/modules/configuracoes/domain/moduleCatalog.ts \
  backend/src/modules/configuracoes/infrastructure/ClinicModuleRepository.ts \
  backend/src/modules/configuracoes/api/ModulosController.ts \
  backend/tests/unit/modulosToggle.test.ts
git commit -m "feat(configuracoes): persist module toggles in clinic_modules per clinic"
```

---

## Phase 3 — Frontend

### Task 8: Consolidar `ModuleCard` em componente canônico

**Files:**
- Create: `categories/@orthoplus/core/packages/ui/src/components/ModuleCard.tsx`
- Delete: `apps/web/src/components/ModuleCard.tsx`
- Delete: `apps/web/src/components/settings/ModuleCard.tsx`
- Delete: `apps/web/src/modules/settings/components/modules-simple/ModuleCard.tsx`
- Modify: `apps/web/src/modules/settings/ui/components/ModuleCard.tsx` → become re-export/wrapper
- Modify: all consumers to import from `@orthoplus/core-ui`

- [x] **Step 1: Write the canonical component**

Create `categories/@orthoplus/core/packages/ui/src/components/ModuleCard.tsx`:

```tsx
import * as React from 'react'
import { cn } from '../../utils'

export interface ModuleCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  enabled?: boolean
  onToggle?: (enabled: boolean) => void
  className?: string
}

export function ModuleCard({ title, description, icon, enabled, onToggle, className }: ModuleCardProps) {
  return (
    <div className={cn('rounded-xl border p-4 shadow-sm transition-colors', enabled ? 'bg-card' : 'bg-muted/40', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {onToggle && (
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => onToggle(e.target.checked)}
            aria-label={`Toggle ${title}`}
          />
        )}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Update package exports**

Ensure `categories/@orthoplus/core/packages/ui/src/index.ts` exports `ModuleCard`.

- [x] **Step 3: Replace usages**

Find all `ModuleCard` imports:

```bash
grep -rn "from .*ModuleCard" apps/web/src --include='*.tsx'
```

Update each to:

```typescript
import { ModuleCard } from '@orthoplus/core-ui'
```

- [x] **Step 4: Remove duplicated files**

```bash
rm -f apps/web/src/components/ModuleCard.tsx
rm -f apps/web/src/components/settings/ModuleCard.tsx
rm -f apps/web/src/modules/settings/components/modules-simple/ModuleCard.tsx
```

- [x] **Step 5: Run frontend type-check**

```bash
cd apps/web && pnpm type-check
```
Expected: passes (existing TS errors remain, no new ones).

- [x] **Step 6: Commit**

```bash
git add categories/@orthoplus/core/packages/ui/src/components/ModuleCard.tsx \
  categories/@orthoplus/core/packages/ui/src/index.ts \
  apps/web/src/modules/settings/ui/components/ModuleCard.tsx \
  apps/web/src/
git commit -m "refactor(ui): consolidate ModuleCard into core-ui package"
```

---

### Task 9: Mover componentes novos de `src/components/*` para `modules/<feature>/`

**Files:**
- Vários em `apps/web/src/components/settings/*`
- Modify: consumers em `apps/web/src/modules/settings/`

- [x] **Step 1: Identify feature-specific components in legacy dir**

```bash
ls apps/web/src/components/settings/
```

- [x] **Step 2: Move components**

Example:

```bash
mkdir -p apps/web/src/modules/settings/components/legacy
mv apps/web/src/components/settings/backup* apps/web/src/modules/settings/components/legacy/
mv apps/web/src/components/settings/permission-templates apps/web/src/modules/settings/components/legacy/
```

- [x] **Step 3: Update imports**

```bash
grep -rl "@/components/settings" apps/web/src --include='*.tsx' --include='*.ts'
```

Replace `@/components/settings/...` with `@/modules/settings/components/legacy/...`.

- [x] **Step 4: Run type-check**

```bash
cd apps/web && pnpm type-check
```

- [x] **Step 5: Commit**

```bash
git add apps/web/src/modules/settings/components/legacy/ apps/web/src/
git commit -m "refactor(settings): move legacy settings components into module"
```

---

## Phase 4 — Specs e Documentação

### Task 10: Atualizar `STATUS.md` de specs já implementadas

**Files:**
- Modify: `specs/018-sidebar-collapsed-default/STATUS.md`
- Modify: `specs/020-spec-memory-hub/STATUS.md`
- Modify: `specs/admin-tools/STATUS.md`
- Modify: `specs/016-theme-premium-fix/STATUS.md`
- Modify: `specs/017-omk-governance-integration/STATUS.md`

- [x] **Step 1: Update 018 sidebar status**

```markdown
# Status

**State:** IMPLEMENTED  
**Last verified:** 2026-06-26  
**Evidence:**
- `apps/web/src/stores/sidebarStore.ts`
- `apps/web/src/core/layout/Sidebar/SidebarGroup.tsx`
- `apps/web/src/core/layout/Sidebar/SidebarNav.tsx`
```

- [x] **Step 2: Update 020 memory hub status**

```markdown
# Status

**State:** IMPLEMENTED  
**Last verified:** 2026-06-26  
**Evidence:**
- `backend/src/modules/memory_hub/`
- `apps/web/src/modules/memory-hub/`
```

- [x] **Step 3: Update admin-tools status**

```markdown
# Status

**State:** IMPLEMENTED  
**Last verified:** 2026-06-26  
**Evidence:**
- `backend/src/modules/admin_tools/`
- `apps/web/src/modules/admin/`
```

- [x] **Step 4: Update 016 and 017 status**

Use `IMPLEMENTED` or `PARTIALLY IMPLEMENTED` with evidence list.

- [x] **Step 5: Commit**

```bash
git add specs/018-sidebar-collapsed-default/STATUS.md \
  specs/020-spec-memory-hub/STATUS.md \
  specs/admin-tools/STATUS.md \
  specs/016-theme-premium-fix/STATUS.md \
  specs/017-omk-governance-integration/STATUS.md
git commit -m "docs(specs): update STATUS.md for implemented specs"
```

---

### Task 11: Criar matriz de rastreabilidade specs ↔ arquivos

**Files:**
- Create: `docs/superpowers/specs/spec-to-files-matrix.md`

- [x] **Step 1: Generate matrix from audit findings**

Create `docs/superpowers/specs/spec-to-files-matrix.md`:

```markdown
# Spec → Files Traceability Matrix

| Spec | Backend Files | Frontend Files | Tests | Status |
|---|---|---|---|---|
| 018-sidebar-collapsed-default | — | `apps/web/src/stores/sidebarStore.ts`, `core/layout/Sidebar/*` | — | IMPLEMENTED |
| 020-spec-memory-hub | `backend/src/modules/memory_hub/**` | `apps/web/src/modules/memory-hub/**` | `backend/tests/unit/memoryHub*.test.ts` | IMPLEMENTED |
| admin-tools | `backend/src/modules/admin_tools/**` | `apps/web/src/modules/admin/**` | — | IMPLEMENTED |
| 016-theme-premium-fix | — | `apps/web/src/theme/semantic-colors.ts` | — | PARTIAL |
| 017-omk-governance-integration | `.omk/`, `.github/workflows/gitnexus-index.yml` | — | — | IMPLEMENTED |
```

- [x] **Step 2: Commit**

```bash
git add docs/superpowers/specs/spec-to-files-matrix.md
git commit -m "docs(traceability): add spec-to-files matrix"
```

---

## Phase 5 — Validação Final

### Task 12: Rodar gates de qualidade

- [x] **Step 1: Backend build**

```bash
cd backend && pnpm build
```
Expected: passes

- [x] **Step 2: Frontend type-check**

```bash
cd apps/web && pnpm type-check
```
Expected: passes (existing known errors remain)

- [x] **Step 3: Lint**

```bash
pnpm lint
```
Expected: 0 errors

- [x] **Step 4: Tests**

```bash
pnpm test
```
Expected: all existing tests pass; new tests pass

- [x] **Step 5: Production validation**

```bash
./scripts/validate-production.sh
```
Expected: passes (no `AUTH_ALLOW_MOCK`, secrets present)

- [x] **Step 6: Commit validation results**

```bash
git add docs/superpowers/auditoria-2026-06-26-findings.md \
  specs/_drift/frontend-schema-deploy.spec.drift.md \
  specs/_drift/frontend-schema-deploy.tasks.drift.md \
  specs/_drift/frontend-schema-deploy.canon.drift.md
git commit -m "docs(auditoria): finalize drift artifacts and validation"
```

---

## Self-Review Checklist

- [x] Spec coverage: cada drift ACCEPTED do `canon.drift.md` tem ao menos uma task.
- [x] Placeholder scan: nenhum TBD/TODO/implement later.
- [x] Type consistency: `clinic_id` String em todos os modelos; `ModuleCard` props idênticas nos wrappers.
- [x] PENDING items (C006, C010, C012, C013, C016) não foram implementados sem decisão humana.
