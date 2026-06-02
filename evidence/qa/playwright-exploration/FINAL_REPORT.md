# OrthoPlus Enterprise — Playwright Navigation & Validation Report

**Date:** 2026-06-02T00:00:00Z  
**Base URL:** `https://tsiapp.io/OrthoPlus-Enterprise`  
**Tester:** Automated Playwright + cURL Exploration  
**Scope:** READ-ONLY navigation, screenshot capture, API probing, and error logging

---

## 1. Executive Summary

The OrthoPlus Enterprise application deployed at `https://tsiapp.io/OrthoPlus-Enterprise` is **non-functional from an end-user perspective**. While the server returns HTTP 200 for all tested frontend routes, the React SPA fails to hydrate because **all JavaScript and CSS assets referenced by `index.html` are missing (404) or served with the wrong MIME type (`text/html`)**.

Key findings:
- **Frontend:** Blank white screen on all routes. Zero interactive elements rendered.
- **Backend API:** Healthy and responding correctly at `https://tsiapp.io/api/health`.
- **Assets:** 100% of Vite-generated JS chunks and CSS are 404.
- **Console:** 19 module-loading errors detected (strict MIME type checking failures caused by HTML fallback).
- **Responsive:** No meaningful responsive behavior to evaluate because the app does not render.

---

## 2. VPS Navigation Map

### 2.1 Frontend Routes (SPA Fallback)

All routes below return HTTP 200 with the same `index.html` shell (SPA fallback). Because the SPA cannot boot, no actual page content is ever rendered.

| Route | Status | Content | Rendered? |
|-------|--------|---------|-----------|
| `/` | 200 | `index.html` | ❌ Blank |
| `/login` | 200 | `index.html` | ❌ Blank |
| `/auth` | 200 | `index.html` | ❌ Blank |
| `/dashboard` | 200 | `index.html` | ❌ Blank |
| `/pacientes` | 200 | `index.html` | ❌ Blank |
| `/agenda` | 200 | `index.html` | ❌ Blank |
| `/financeiro` | 200 | `index.html` | ❌ Blank |
| `/orcamentos` | 200 | `index.html` | ❌ Blank |
| `/procedimentos` | 200 | `index.html` | ❌ Blank |
| `/dentistas` | 200 | `index.html` | ❌ Blank |
| `/funcionarios` | 200 | `index.html` | ❌ Blank |
| `/estoque` | 200 | `index.html` | ❌ Blank |
| `/settings` | 200 | `index.html` | ❌ Blank |
| `/configuracoes` | 200 | `index.html` | ❌ Blank |
| `/admin` | 200 | `index.html` | ❌ Blank |
| `/portal-paciente` | 200 | `index.html` | ❌ Blank |
| `/odontograma` | 200 | `index.html` | ❌ Blank |
| `/tratamentos` | 200 | `index.html` | ❌ Blank |
| `/pep` | 200 | `index.html` | ❌ Blank |
| `/pdv` | 200 | `index.html` | ❌ Blank |
| `/crm` | 200 | `index.html` | ❌ Blank |
| `/fidelidade` | 200 | `index.html` | ❌ Blank |
| `/teleodonto` | 200 | `index.html` | ❌ Blank |
| `/tiss` | 200 | `index.html` | ❌ Blank |
| `/ia-radiografia` | 200 | `index.html` | ❌ Blank |
| `/inadimplencia` | 200 | `index.html` | ❌ Blank |
| `/cobranca` | 200 | `index.html` | ❌ Blank |
| `/split-pagamento` | 200 | `index.html` | ❌ Blank |
| `/crypto-payment` | 200 | `index.html` | ❌ Blank |
| `/marketing-auto` | 200 | `index.html` | ❌ Blank |
| `/recall` | 200 | `index.html` | ❌ Blank |
| `/bi` | 200 | `index.html` | ❌ Blank |
| `/contratos` | 200 | `index.html` | ❌ Blank |
| `/landpage` | 200 | `index.html` | ❌ Blank |

### 2.2 API Endpoints

| Endpoint | Full URL | Status | Response Summary |
|----------|----------|--------|------------------|
| `/api/health` | `https://tsiapp.io/api/health` | **200** | `{"status":"ok","time":"...","uptime":144462s}` |
| `/api/agents/health` | `https://tsiapp.io/api/agents/health` | **401** | `{"error":"Unauthorized - JWT token required"}` |
| `/api/memory-hub/health` | `https://tsiapp.io/api/memory-hub/health` | **401** | `{"error":"Unauthorized - JWT token required"}` |
| `/api/database_admin/health` | `https://tsiapp.io/api/database_admin/health` | **401** | `{"error":"Unauthorized - JWT token required"}` |
| `/api/ai/health` | `https://tsiapp.io/api/ai/health` | **401** | `{"error":"Unauthorized - JWT token required"}` |
| `/api/auth/login` | `https://tsiapp.io/api/auth/login` | **404** | HTML fallback (method mismatch; GET instead of POST may also cause this) |
| `/health` | `https://tsiapp.io/health` | **200** | `healthy` (plain text) |

**Important:** API endpoints under `/api/*` are served from the **domain root**, not from `/OrthoPlus-Enterprise/api/*`. Requests to `https://tsiapp.io/OrthoPlus-Enterprise/api/health` return HTML because Nginx treats them as SPA routes.

---

## 3. Frontend Analysis — Root Cause of Blank Screen

### 3.1 HTML Shell (`index.html`)

The server returns a valid Vite-generated `index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="OrthoPlus Enterprise — Sistema completo de gestão clínica, financeira e comercial para clínicas odontológicas. Multi-clínica. Multi-tenant. Seguro.">
  <title>OrthoPlus Enterprise</title>
  <script type="module" crossorigin="" src="/OrthoPlus-Enterprise/assets/index-BPXIgYiM.js"></script>
  <link rel="modulepreload" crossorigin="" href="/OrthoPlus-Enterprise/assets/rolldown-runtime-Djccxexk.js">
  ... (17 more modulepreload links)
  <link rel="stylesheet" crossorigin="" href="/OrthoPlus-Enterprise/assets/index-wkfnT6Il.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

**Vite base path:** `/OrthoPlus-Enterprise/` (matches `vite.config.ts`).

### 3.2 Asset Loading Failures

Every JS/CSS asset referenced by `index.html` fails to load:

| Asset URL | Expected | Actual Status | Actual Content-Type |
|-----------|----------|---------------|---------------------|
| `/OrthoPlus-Enterprise/assets/index-BPXIgYiM.js` | `application/javascript` | **404** | `text/html` |
| `/OrthoPlus-Enterprise/assets/rolldown-runtime-Djccxexk.js` | `application/javascript` | **200** ⚠️ | `text/html` |
| `/OrthoPlus-Enterprise/assets/pdf-DBY3txNg.js` | `application/javascript` | **404** | `text/html` |
| `/OrthoPlus-Enterprise/assets/index-wkfnT6Il.css` | `text/css` | **404** | `text/html` |
| `/OrthoPlus-Enterprise/assets/manifest.json` | `application/json` | **200** ⚠️ | `text/html` |

> **Note:** HTTP 200 with `text/html` on `.js` files is the Nginx SPA fallback (`try_files`) serving `index.html` for unknown paths. This triggers the browser's strict MIME type check and aborts module execution.

### 3.3 Nginx Configuration Analysis

From `nginx.conf` (repository):

```nginx
location /OrthoPlus-Enterprise/assets/ {
    alias /var/www/orthoplus/assets/;
    expires 1y;
    ...
}
```

**Diagnosis:** The files expected at `/var/www/orthoplus/assets/` are **not present** on the server. The deploy pipeline (`scripts/deploy-orthoplus-full.sh`) is supposed to `rsync` the `dist/` folder to the VPS, but either:
1. The build step did not generate the assets, or
2. The `rsync` step did not copy them to `/var/www/orthoplus/assets/`, or
3. The asset filenames in the deployed `index.html` do not match the files actually on disk (cache mismatch / stale `index.html`).

---

## 4. Screenshot Inventory

| Filename | Viewport | Dimensions | Visual Content |
|----------|----------|------------|----------------|
| `__desktop.png` | Desktop (1920×1080) | 1920×1080 | Solid white screen |
| `__tablet.png` | Tablet (768×1024) | 768×1024 | Solid white screen |
| `__mobile.png` | Mobile (375×667) | 375×667 | Solid white screen |
| `_login_desktop.png` | Desktop | 1920×1080 | Solid white screen |
| `_dashboard_desktop.png` | Desktop | 1920×1080 | Solid white screen |
| `_pacientes_desktop.png` | Desktop | 1920×1080 | Solid white screen |
| `_agenda_desktop.png` | Desktop | 1920×1080 | Solid white screen |
| `_financeiro_desktop.png` | Desktop | 1920×1080 | Solid white screen |
| … (36 screenshots total) | Desktop / Tablet / Mobile | various | **All blank white** |

> **Conclusion:** Because the React application cannot bootstrap, no DOM content is ever rendered. Screenshots uniformly show a blank white canvas.

---

## 5. UI Element Inventory

### 5.1 Visible Interactive Elements

**Count: 0**

No buttons, links, forms, cards, navigation menus, or headings are present in the rendered DOM after hydration. The only DOM node is:

```html
<body>
  <div id="root"></div>
</body>
```

### 5.2 Expected Elements (from Codebase)

Per `AGENTS.md` and source code, the following UI structures are expected but **not observable** due to the asset failure:

- **Navigation:** Sidebar / topbar with modules (Agenda, Pacientes, Financeiro, etc.)
- **Auth:** Login form with email/password fields and submit button
- **Dashboard:** KPI cards, charts (Recharts), tables
- **Modules:** 39 frontend modules with forms, lists, and detail views
- **Design System:** Radix UI primitives, Tailwind CSS components, Lucide icons

---

## 6. Console Error Log

Playwright captured **19 errors** during page load. All are consequences of the same root cause (missing/stale assets).

### 6.1 Module Loading Errors (Strict MIME Type)

```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html". 
Strict MIME type checking is enforced for module scripts per HTML spec.
```

Affected files:
- `radix-ui-8RNj7o3L.js`
- `index-BPXIgYiM.js` (main entry)
- `react-dom-DxnPb9SV.js`
- `forms-BPsYrWcO.js`
- `charts-DnMbJ-nC.js`
- `rolldown-runtime-Djccxexk.js`
- `textarea-CiWsMm8k.js`
- `button-CswXBS8S.js`
- `card-l9o_-1Mx.js`
- `lucide-C05t08E8.js`
- `table-DZIGPBOV.js`
- `tabs-CxhMhse-.js`
- `badge-6ZIIf9i4.js`
- `date-utils-Df2-USAr.js`
- `PageHeader-BnVEvqTB.js`
- `validation-c4QfdoYn.js`
- `src-CJ4l61u1.js`

### 6.2 Resource Not Found

```
Failed to load resource: the server responded with a status of 404 ()
URL: https://tsiapp.io/OrthoPlus-Enterprise/assets/pdf-DBY3txNg.js
```

### 6.3 JavaScript Execution Errors

No runtime JS errors were emitted after the initial load because the application never executes.

---

## 7. Broken Images / Links Observations

- **Logo (`orthoplus-logo-enterprise.svg`):** Returns HTTP 301 redirect to a trailing-slash version (`…/orthoplus-logo-enterprise.svg/`). This suggests a misconfigured `location` block or Cloudflare Page Rule appending slashes to static files.
- **All `<img>` tags:** None exist in the rendered DOM because React never mounts.
- **Modulepreload links:** 17 of 18 `rel="modulepreload"` links are broken (either 404 or HTML fallback).

---

## 8. Accessibility Observations

Because the application does not render, automated accessibility checks are limited to the static HTML shell.

| Check | Result | Notes |
|-------|--------|-------|
| `<html lang="pt-BR">` | ✅ Pass | Correct language declaration |
| `<meta charset="UTF-8">` | ✅ Pass | Present |
| `<meta name="description">` | ✅ Pass | Present, descriptive |
| `<meta name="viewport">` | ✅ Pass | Responsive viewport set |
| `<title>` | ✅ Pass | "OrthoPlus Enterprise" |
| `<main>` landmark | ❌ Missing | Expected after hydration |
| Heading hierarchy | ❌ Missing | No `<h1>`–`<h6>` in shell |
| Form labels | ❌ N/A | No forms rendered |
| Image alt text | ❌ N/A | No images rendered |
| Focus management | ❌ N/A | Cannot evaluate |
| Color contrast | ❌ N/A | Cannot evaluate |

**Screen-reader impact:** A user with assistive technology would hear only "OrthoPlus Enterprise" and then silence, because the `#root` div is empty.

---

## 9. Responsive Behavior

Tests were executed at three viewports:

| Viewport | Width × Height | Result |
|----------|----------------|--------|
| Desktop | 1920 × 1080 | Blank white screen |
| Tablet | 768 × 1024 | Blank white screen |
| Mobile | 375 × 667 | Blank white screen |

**Assessment:** No responsive layout shifts, breakpoints, or mobile adaptations can be observed because the SPA does not mount. The HTML shell itself is viewport-aware via the `<meta viewport>` tag.

---

## 10. Infrastructure & Deployment Analysis

### 10.1 What Works

| Component | Evidence |
|-----------|----------|
| Nginx (reverse proxy) | Responds to all requests; SSL/TLS via Cloudflare |
| Backend Node.js API | `/api/health` → 200 JSON; uptime ~40h |
| Agent Service | `/api/agents/health` → 401 (service is up but gated) |
| Health endpoint (root) | `/health` → `healthy` |

### 10.2 What Is Broken

| Component | Evidence | Likely Cause |
|-----------|----------|--------------|
| Frontend JS assets | 404 / HTML fallback | Missing files in `/var/www/orthoplus/assets/` |
| Frontend CSS | 404 | Same as above |
| SPA hydration | `#root` has 0 children | Assets fail → React never mounts |
| `/api/*` under subpath | `…/OrthoPlus-Enterprise/api/health` returns HTML | Nginx routes `/api/` only at domain root |

### 10.3 Cloudflare Observations

- `server: cloudflare` header present on all responses.
- `cf-cache-status` varies: `HIT`, `MISS`, `DYNAMIC`, `EXPIRED`.
- Cloudflare may be caching the 404 responses or the stale `index.html`, complicating recovery after a correct deploy.

---

## 11. Comparison: Codebase vs Deployed

### 11.1 Expected Modules (from `AGENTS.md`)

| Module | Frontend Dir | Backend Dir | Deployed Route Status |
|--------|-------------|-------------|----------------------|
| Agenda | `agenda` | `agenda` | ✅ 200 (shell) |
| Pacientes | `pacientes` | `pacientes` | ✅ 200 (shell) |
| Financeiro | `financeiro` | `faturamento` | ✅ 200 (shell) |
| Auth | `auth` | `auth` | ✅ 200 (shell) |
| Dashboard | `dashboard` | `dashboard` | ✅ 200 (shell) |
| Admin | `admin` | `admin_tools` | ✅ 200 (shell) |
| Configurações | `settings` | `configuracoes` | ✅ 200 (shell) |
| Marketing | `marketing-auto` | `marketing` | ✅ 200 (shell) |
| Crypto | `crypto` | `crypto_config` | ✅ 200 (shell) |
| IA Radiografia | `ia-radiografia` | `ai` | ✅ 200 (shell) |
| Inadimplência | `cobranca` / `inadimplencia` | `inadimplencia` | ✅ 200 (shell) |
| Estoque | `estoque` | `inventario` | ✅ 200 (shell) |
| PEP | `pep` | `pep` | ✅ 200 (shell) |
| PDV | `pdv` | `pdv` | ✅ 200 (shell) |
| CRM | `crm` | `crm` | ✅ 200 (shell) |
| Fidelidade | `fidelidade` | `fidelidade` | ✅ 200 (shell) |
| Teleodonto | `teleodonto` | `teleodonto` | ✅ 200 (shell) |
| TISS | `tiss` | `tiss` | ✅ 200 (shell) |
| Orçamentos | `orcamentos` | `orcamentos` | ✅ 200 (shell) |
| Procedimentos | `procedimentos` | `procedimentos` | ✅ 200 (shell) |
| Funcionários | `funcionarios` | `funcionarios` | ✅ 200 (shell) |
| Dentistas | `dentistas` | `dentistas` | ✅ 200 (shell) |
| Contratos | `contratos` | `contratos` | ✅ 200 (shell) |
| BI | `bi` | `bi` | ✅ 200 (shell) |
| Portal Paciente | `portal-paciente` | — | ✅ 200 (shell) |
| Odontograma | `odontograma` | — | ✅ 200 (shell) |
| Tratamentos | `tratamentos` | — | ✅ 200 (shell) |
| Landpage | `landpage` | — | ✅ 200 (shell) |
| LGPD | `lgpd` | `lgpd` | ❌ Not tested |
| Files | `files` | `files` | ❌ Not tested |
| Inventário | `inventario` | `inventario` | ❌ Not tested (frontend uses `/estoque`) |

**Note:** All listed routes exist in Nginx (return 200) but are **non-functional** because the SPA cannot boot.

### 11.2 Missing / Untested Routes

- `/inventario/dashboard` — Not tested (AGENTS.md maps this to backend; frontend uses `/estoque`)
- `/files` — Not tested
- `/lgpd` — Not tested

### 11.3 Backend-Only Modules (No Frontend Route)

| Backend Module | API Route | Accessible? |
|----------------|-----------|-------------|
| `analytics` | `/api/analytics` | Requires auth (401 expected) |
| `comm` | `/api/comm` | Requires auth (401 expected) |
| `notifications` | `/api/notifications` | Requires auth (401 expected) |
| `nfe` | `/api/nfe` | Requires auth (401 expected) |
| `agents` | `/api/agents` | ✅ Up (401 on `/health` = gated, not down) |
| `database_admin` | `/api/database_admin` | ✅ Up (401 on `/health`) |
| `memory_hub` | `/api/memory-hub` | ✅ Up (401 on `/health`) |
| `search_index` | `/api/search_index` | Requires auth |

---

## 12. Security Observations

| Observation | Status | Detail |
|-------------|--------|--------|
| HTTPS enforced | ✅ | TLS 1.2/1.3 via Cloudflare |
| HSTS header | ✅ | `max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | ✅ | `SAMEORIGIN` |
| X-Content-Type-Options | ✅ | `nosniff` |
| CSP header | ✅ | Present (allows `unsafe-inline`/`unsafe-eval` for React/Vite) |
| Rate limiting | ✅ | Configured in Nginx (not tested under load) |
| API auth enforcement | ✅ | `/api/agents/health` returns 401 without JWT |
| CORS policy | ❓ | Not tested (preflight requests not sent) |

---

## 13. Recommendations

### Immediate (Critical)

1. **Fix Asset Deployment**
   - Verify that `apps/web/dist/assets/` contains the hashed JS/CSS files matching the `index.html` references.
   - Re-run `pnpm build` in `apps/web` and confirm the output filenames match.
   - `rsync` the **entire** `dist/` directory (including `assets/`) to `/var/www/orthoplus/` on the VPS.
   - Ensure Nginx `alias /var/www/orthoplus/assets/` points to the correct path.

2. **Purge Cloudflare Cache**
   - The stale `index.html` and 404 responses may be cached. Purge the cache after redeploying.

3. **Verify Backend Accessibility**
   - Confirm that `/api/*` routes are correctly proxied to `127.0.0.1:3005`.
   - The current configuration works for domain-root `/api/health` but **not** for `/OrthoPlus-Enterprise/api/health`. Ensure API client calls use the correct base URL.

### Short-Term

4. **Add Deploy Validation Step**
   - After `rsync`, run a curl check against a known asset (e.g., `index-*.js`) and abort the deploy if it 404s.
   - Add a smoke test to the `deploy-orthoplus-full.sh` script.

5. **Add Frontend Error Boundary / Loading Indicator**
   - If asset loading fails, show a user-friendly error message instead of a blank white screen.
   - Add a `<noscript>` tag for users without JavaScript.

6. **Improve Nginx `try_files` Behavior**
   - Review the `location /OrthoPlus-Enterprise/assets/` block to ensure it returns a hard 404 (not `index.html`) for missing assets, making debugging easier.

### Long-Term

7. **Implement E2E Health Checks in CI/CD**
   - Add a Playwright or curl-based post-deploy gate that verifies the SPA renders at least one interactive element.

---

## Appendix A: Raw Diagnostic Data

- `diagnose-logs.json` — Browser console and network error log (210 entries)
- `page-html.html` — Full HTML source of the landing page
- `body-html.html` — Full `<body>` inner HTML (effectively empty)
- `screenshots/*.png` — 36 full-page screenshots (all blank)

---

*End of Report*
