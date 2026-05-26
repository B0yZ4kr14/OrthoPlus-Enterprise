# Changelog — OrthoPlus Enterprise



## [UI Premium Redesign — Fase 2 Base Components] - 2026-05-25

### Added
- **Input**: `state` prop (`default` | `error` | `success` | `warning`) with colored borders, focus rings, and subtle background tints
- **Badge**: `dot` prop for status indicator dot; softer background colors for status variants (success/warning/error/info)
- **Tabs**: `variant` prop (`default` | `underline`) with animated underline active indicator
- **Skeleton**: `variant` prop (`default` | `shimmer`) with shimmer animation via gradient sweep
- **Sonner**: per-type accent borders (left border) and tinted backgrounds for success/error/warning/info toasts

### Changed
- **Dialog**: softer overlay (`bg-black/40` + `backdrop-blur-sm`); content uses `backdrop-blur-xl`, `rounded-2xl`, refined shadow
- **Sheet**: softer overlay (`bg-black/40` + `backdrop-blur-sm`); content uses `backdrop-blur-xl`, `rounded-l-2xl`, refined shadow
- **Badge**: status variants now use translucent backgrounds (`bg-*/15`) instead of solid fills
- **Sonner**: toast border-radius increased to `rounded-xl`, title/description font hierarchy refined

### Quality Gates
- Type-check: 0 errors
- Build: frontend + backend passing
- Lint: 0 errors

## [UI Premium Redesign — Fase 1 Chrome/Layout] - 2026-05-25

### Added
- `generate-css-vars.ts` — automates CSS variable generation from `tokens-v3.ts`
- `DropdownMenuLabel` and `DropdownMenuSeparator` in QuickActions dropdown
- Icon containers with `bg-interactive/10` and colored icons in QuickActions items
- Descriptions below each QuickActions item for better UX

### Changed
- **Sidebar**: fully migrated to CSS variables (`--interactive`, `--accent`, `--sidebar-foreground`)
  - `SidebarMenuItem`: active/hover states use `hsl(var(--interactive))` and `hsl(var(--accent))`
  - `SidebarHeader`: "Enterprise" badge uses gradient from `--interactive` to `--interactive-hover`
- **Header**: `DashboardHeader` dropdowns use `glass-card border-border/50`
- **GlobalSearch trigger**: redesigned as accessible `<button>` with kbd shortcut indicator
- **QuickActions**: dropdown items now have 2-line layout (title + description) with icon circles
- **AppLayout**: focus mode banner uses `glass-card`

### Fixed
- Removed hardcoded emerald/teal hex values from sidebar components
- Consistent `glass-card` usage across header dropdowns and modals

### Quality Gates
- Type-check: 0 errors
- Build: frontend + backend passing

## [VPS Deploy + Lint Fix] - 2026-05-25

### Added
- Nginx redirect: `/` → `/OrthoPlus-Enterprise/`
- Nginx redirect: `/orthoplus-enterprise` (lowercase) → `/OrthoPlus-Enterprise/`
- Security headers re-declared in SPA location (HSTS, X-Frame-Options, CSP, etc.)
- Static assets caching for SPA (`public, immutable`, 1 year)

### Changed
- Nginx alias: `/OrthoPlus-Enterprise/` now points directly to `/home/tsi/OrthoPlus-Enterprise/apps/web/dist/`
- Deploy script: `~/.ssh/config` → `$HOME/.ssh/config` for non-interactive shells

### Fixed
- Converted 20 `require()` statements to ES module `import` in backend
- Fixed broken import blocks caused by automated insertion
- Fixed `new (ClassName)()` syntax → `new ClassName()`

### DevOps
- Deployed frontend v2.9.9 + backend v2.5.4 to VPS
- Prisma migrate deploy: no pending migrations
- Redis container: already running (port 6379)
- Backend PM2: `orthoplus-backend` online

### Quality Gates
- Lint: 0 errors, ~490 warnings (reduced from 20 errors)
- Build: frontend + backend passing
- Tests: 636/636 unit tests passing
- Type-check: 0 errors

### E2E Tests
- Auth tests: 1 suite passed (1.1m) across 5 browsers
  - Chromium: 6/6 tests passed
  - Firefox: 6/6 tests passed
  - WebKit: 6/6 tests passed
  - Mobile Chrome: 6/6 tests passed
  - Mobile Safari: 6/6 tests passed

## [IA Radiografia] - 2026-05-24

### Added
- AI-powered dental radiograph analysis with local Ollama/llava vision model
- LGPD consent management (register, check, revoke) with immutable audit trail
- Upload flow with DICOM/EXIF metadata stripping and PII validation
- Dentist review workflow with digital signature and observations
- Aggregated insights dashboard with KPIs and charts
- Side-by-side radiograph comparison with trend analysis
- Patient radiography timeline with Recharts visualization
- PDF export for comparative analyses via jsPDF
- Prometheus metrics emission for ia_radiografia module
- Redis-backed rate limiting (10/hr per dentist, 100/day per clinic)
- Environment feature flag gating (`ENABLE_AI_RADIOGRAPHY`)
- `withTiming()` shared helper for metrics-instrumented async operations
- Grafana dashboards for Agenda and Pacientes modules

### Changed
- Unified rate limiter from in-memory to Redis-backed (`iaRateLimiter.ts`)
- Frontend Zod schemas synced with Prisma enum definitions

### Fixed
- Removed hardcoded dev encryption fallback in `IAEncryptionService`
- Fixed `user-agent` undefined crash in audit logging
- Aligned mock expectations with `LocalAIService.analyzeRadiografia` response shape

### Technical Notes
- Storage uses local filesystem (`uploads/ia-radiografia/`) — MinIO/S3 migration planned
- AI analysis is synchronous — background worker (BullMQ) deferred to post-MVP
- Problem normalization into dedicated table deferred to post-MVP (GAP-005)
- Model versioning and A/B testing support deferred to post-MVP

---

## [OMK Governance Integration] - 2026-05-19

### Added
- GitNexus CI workflow for automatic code intelligence re-indexing
- SpecKit compliance CI workflow for PR spec validation
- OMK Squad agents (Planner, Implementer, Reviewer, Verifier)
- OMK Quality gates (lint, type-check, test, build)
- VPS health check script with full endpoint validation
- Governance metrics exporter (Prometheus/OpenMetrics format)
- VPS topology and services documentation
- Security, staff, and ripple review reports

### Changed
- AGENTS.md with active feature governance pointer
- WIKI.md with governance tools reference section
- README-orthoplus-deploy.md with current production endpoints

### Fixed
- Nginx symlink configuration for tsiapp-https
- Duplicate credentials section in deploy docs
- GitNexus dependency version pinning
- spec.md status inconsistency (Draft → Completed)

### Technical Notes
- 33.916 GitNexus nodes indexed (100% monorepo coverage)
- Metrics compliant with constitution INF-2 (`orthoplus_governance_*` prefix)
- Zero application code changes (pure infrastructure/tooling)
- Human-in-the-loop gates at plan and implement phases
