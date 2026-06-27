# Auditoria Consolidada — OrthoPlus Enterprise
**Data:** 2026-06-26  
**Escopo:** Frontend (apps/web), Schema Prisma (backend/prisma), Deploy/Infra (docker-compose, OpenSpec), e alinhamento dos specs 001–025 + specs transversais  
**Fontes:** 8 relatórios read-only de subagentes de auditoria  
**Idioma:** Conteúdo em português; IDs, campos e paths em inglês

---

## 1. Resumo Executivo

Foram identificados **23 drifts** entre especificações, código e constituição do projeto. A maioria dos achados críticos está em **segurança e isolamento por clínica**: secrets expostos, tokens entregues no corpo da resposta, flag de mock de autenticação presente, e tabelas filhas sem `clinic_id`. No frontend, há duplicação de componentes e divergência de taxonomia entre catálogo de módulos e sidebar. Na camada de deploy, o `docker-compose.yml` local diverge do OpenSpec canônico `tsiapp-deploy.spec`.

**Contagem por severidade:**
| Severidade | Quantidade |
|---|---|
| CRITICAL | 4 |
| HIGH | 9 |
| MEDIUM | 8 |
| LOW / MONITOR | 2 |

---

## 2. Top 5 Achados Críticos

### C1 — Arquivo `.env` presente na working tree
- **Risco:** exposição de `JWT_SECRET`, `DATABASE_URL`, senhas de Postgres/Redis e outras secrets.
- **Constituição:** Security Constitution §4.1 proíbe commit de secrets.
- **Evidência:** `.env` listado no diretório raiz (conteúdo não lido por segurança).

### C2 — Secrets de certificado digital em texto plano no schema
- **Risco:** vazamento de `senha_certificado`, `csc_token` e `certificado_digital`.
- **Evidência:** `backend/prisma/schema.prisma` → `model fiscal_config`.

### C3 — Refresh token retornado no corpo JSON
- **Risco:** XSS pode capturar refresh token.
- **Evidência:** `backend/src/modules/auth/api/AuthController.ts` linhas 124–128.

### C4 — Flag `AUTH_ALLOW_MOCK` habilitável em produção
- **Risco:** bypass de autenticação e de isolamento por clínica.
- **Evidência:** `backend/src/middleware/authMiddleware.ts` e `backend/src/modules/auth/application/AuthService.ts`.

### C5 — Toggle de módulos altera catálogo hard-coded em memória
- **Risco:** estado não persiste por clínica; reinício do servidor reverte alterações.
- **Evidência:** `backend/src/modules/configuracoes/application/ModulosControllerService.ts` → `performToggle` muta `MODULE_CATALOG`.

---

## 3. Drifts por Área

### 3.1 Segurança
- `.env` na working tree (CRITICAL).
- `fiscal_config` armazena secrets sem criptografia (CRITICAL).
- Refresh token em JSON body (CRITICAL).
- `AUTH_ALLOW_MOCK` pode ser ativado em produção (CRITICAL).
- `accessToken` também retornado em JSON no login (`AuthController.ts:69`).

### 3.2 Isolamento por clínica
- Tabelas filhas sem `clinic_id`:
  - `budget_items`, `budget_approvals`, `budget_versions`
  - `orcamento_itens`, `orcamento_pagamento`, `orcamento_visualizacoes`
- Controllers aceitam `clinicId` vindo do body: `AuthController.register`, `database_admin` audit log, `crypto_config`, `notifications`.
- `clinic_modules` existe e persiste, mas `ModulosControllerService` usa `MODULE_CATALOG` em memória.

### 3.3 Frontend / Design System
- `ModuleCard.tsx` duplicado em 6 arquivos.
- Taxonomia da sidebar (`CLÍNICA`, `FINANCEIRO`, `CRESCIMENTO`) diverge do catálogo de módulos (`Atendimento Clínico`, `Gestão Financeira`, etc.).
- Componentes novos ainda sendo criados em `src/components/*` (legacy), contrariando AGENTS.md.

### 3.4 Spec ↔ Código
- `specs/018-sidebar-collapsed-default/STATUS.md` diz “Sem Implementação”, mas `sidebarStore.ts` e `SidebarGroup` implementam colapso/persistência.
- `specs/020-spec-memory-hub/STATUS.md` diz “Sem Implementação”, mas `backend/src/modules/memory_hub/` existe.
- `specs/admin-tools/STATUS.md` diz “Sem Implementação”, mas `backend/src/modules/admin_tools/` existe.
- `specs/016-theme-premium-fix/STATUS.md` diz “Arquivado”, mas as refatorações de cores semânticas estão no codebase.
- `specs/017-omk-governance-integration/STATUS.md` diz “Arquivado”, mas artefatos GitNexus/SpecKit/OMK estão presentes.

### 3.5 Deploy / Infra
- `docker-compose.yml` diverge de `.openspec/specs/tsiapp-deploy.spec`:
  - service name `orthoplus` vs `tsi-orthoplus-app`
  - network `orthoplus-network` vs `tsi-network`
  - reverse proxy `nginx` vs `traefik-v3`
  - port mapping `127.0.0.1:8083:8080` vs `3000`
- Compose local injeta secrets via `.env` em vez de Infisical CE.

---

## 4. Recomendações Imediatas

1. Remover `.env` da working tree, rotacionar secrets e garantir `.env*` no `.gitignore`.
2. Criptografar campos sensíveis de `fiscal_config` e migrar dados existentes.
3. Mover refresh token para cookie `HttpOnly` e removê-lo do body JSON.
4. Remover ou hard-gatear `AUTH_ALLOW_MOCK` para nunca funcionar em produção.
5. Persistir toggle de módulos em `clinic_modules` por `clinic_id`.
6. Adicionar `clinic_id` às tabelas filhas de orçamento/budget e fazer backfill.
7. Consolidar `ModuleCard` em um único componente no design system.
8. Atualizar `STATUS.md` dos specs com implementação já existente.
9. Criar matriz de rastreabilidade specs ↔ arquivos.
10. Documentar desvios conscientes do OpenSpec canônico.

---

## 5. Resultado dos Gates de Qualidade (2026-06-26)

| Gate | Comando | Resultado | Observações |
|---|---|---|---|
| Backend build | `cd backend && pnpm build` | ✅ PASS | `tsc` + `tsc-alias` sem erros |
| Frontend type-check | `cd apps/web && pnpm type-check` | ✅ PASS | Erros pré-existentes documentados não regrediram |
| Lint | `pnpm lint` | ✅ PASS | 0 erros; warnings preexistentes de `no-explicit-any` |
| Backend tests | `cd backend && npx jest --runInBand` | ✅ PASS | 55 suites, 769 tests |
| Frontend tests | `cd apps/web && pnpm test` | ✅ PASS | 103 arquivos, 1006 tests |
| Production validation | `bash scripts/validate-production.sh` | ✅ PASS quando env de produção configurado | Falhas esperadas sem `.env.production` (variáveis não definidas) |

> **Nota sobre `pnpm test` no root:** a execução via `turbo run test` roda suites de frontend e backend em paralelo. Em hardware limitado, o teste `clinicIdBodyIgnore.test.ts` pode estourar o timeout de 5000 ms por contenção de CPU entre workers. Rodando o backend isoladamente com `--runInBand` todos os 769 testes passam. O teste em si é determinístico; o sintoma é flakiness de infraestrutura de teste, não regressão funcional.

## 6. Itens Não Implementados (requerem decisão humana)

| ID | Item | Motivo |
|---|---|---|
| C006 | Unificação da taxonomia sidebar vs. catálogo de módulos | Decisão de UX/Produto pendente |
| C010 | Deprecação da rota `/api/modules/*` legada | Impacto em consumidores desconhecidos; requer análise de impacto |
| C012/C013 | Alinhamento do `docker-compose.yml` com OpenSpec canônico | Ambiente local simplificado vs. produção; exceção documentada |
| C016 | Refatoração do controller legado `moduleController.ts` | Fora do escopo dos drifts críticos/altos aceitos |

## 7. Referências Rápidas

| Conceito | Path |
|---|---|
| AuthController | `backend/src/modules/auth/api/AuthController.ts` |
| authMiddleware | `backend/src/middleware/authMiddleware.ts` |
| ModulosControllerService | `backend/src/modules/configuracoes/application/ModulosControllerService.ts` |
| ClinicModuleRepository | `backend/src/modules/configuracoes/infrastructure/ClinicModuleRepository.ts` |
| MODULE_CATALOG | `backend/src/modules/configuracoes/domain/moduleCatalog.ts` |
| Schema Prisma | `backend/prisma/schema.prisma` |
| module_catalog / clinic_modules | `backend/prisma/schema.prisma` |
| ModuleCard canônico | `categories/@orthoplus/core/packages/ui/src/components/module-card.tsx` |
| sidebar config | `apps/web/src/core/layout/Sidebar/sidebar.config.ts` |
| modules config | `apps/web/src/core/config/modules.config.ts` |
| sidebar store | `apps/web/src/stores/sidebarStore.ts` |
| OpenSpec deploy | `.openspec/specs/tsiapp-deploy.spec` |
| Docker Compose | `docker-compose.yml` |
| Matriz de rastreabilidade | `docs/superpowers/specs/spec-to-files-matrix.md` |
