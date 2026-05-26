# Relatório Consolidado de Análise Profunda — OrthoPlus Enterprise

**Data da Análise:** 2026-05-26  
**Commit Base:** e3f69a5e3  
**GitNexus:** 41.002 nodes, 83.326 edges, 288 flows (reindexado)  
**Metodologia:** speckit + gitnexus + análise manual frontend/backend/docs  

---

## 1. Resumo Executivo

| Dimensão | Nota | Issues Críticas | Issues Médias | Issues Baixas |
|----------|------|----------------|---------------|---------------|
| **Frontend** | B | 0 | 7 | 12 |
| **Backend** | B- | 3 | 8 | 15 |
| **Specs/Docs** | C+ | 2 | 5 | 8 |
| **Segurança** | B | 2 | 3 | 4 |
| **Arquitetura** | B | 1 | 4 | 6 |

**Issues Críticas (13):**
1. `/api/modules/*` sem `clinicGuard` — alto risco de isolamento multi-tenant
2. 140 handlers `res.status(500).json({error:...})` — vazamento de info + não-RFC 7807
3. `dbRouters` expõem `e.message` raw em 6 módulos
4. 105 models Prisma não usados no backend (60% do schema é dead code)
5. 686 `@ts-expect-error` no frontend — quality gate quebrado
6. 206 `as any` no frontend — type safety comprometida
7. 509 `as any` no backend — incluindo novos (viola CQ-2)
8. Specs 001-018, 021-025: 0% tasks marcadas como done, mas código já existe (brownfield)
9. 21 módulos backend sem service layer (controller → prisma/repository direto)
10. 3 eventos órfãos sem handler (Inventario.ProdutoCriado, Faturamento.NFeEmitida, Financeiro.TransactionCreated)
11. `iaRadiografiaWorker.ts` não registrado em workers/index.ts
12. 16 hooks duplicados no frontend (ex: useGlobalSearch em 3 lugares)
13. AuthContext monolítico (443 linhas, 10 estados) — viola separação de concerns

---

## 2. Frontend Deep Analysis

### 2.1 Inventário de Componentes
- **1.064** arquivos em `apps/web/src/components/`
- **903** arquivos em `apps/web/src/modules/` (39 módulos)
- **54** componentes no design system `@orthoplus/core-ui`
- **30** componentes órfãos (não importados por ninguém)
- **16** componentes do design system nunca usados (accordion, carousel, drawer, etc.)

### 2.2 Hooks e State Management
- **43** hooks globais, **27** hooks de API
- **104** `useQuery`, **103** `useMutation` (TanStack Query)
- **1** Zustand store (minimal usage)
- **4** Contexts: AuthContext (443 linhas!), ModulesContext, ThemeContext
- **16 hooks duplicados**: `useGlobalSearch`, `useDebounce`, `useAuth`, etc. aparecem em múltiplos lugares

### 2.3 Rotas
- **56** rotas mapeadas, **32** lazy-loaded
- **2** imports diretos (não lazy) — inconsistência
- **8** módulos sem barrel export (`index.ts`)

### 2.4 TypeScript Health
- **686** `@ts-expect-error` (muito alto, objetivo deve ser < 100)
- **206** `as any` no frontend
- Piores arquivos: `CryptoComparativeDashboard.tsx` (31), `OrcamentoRepositoryApi.ts` (25)

### 2.5 Design System Adoption
- **2.592** imports de `@orthoplus/core-ui` — adoção boa
- **52** botões HTML nativos ainda existem
- **14** selects nativos
- **Zero** imports diretos de Radix/CVA fora do design system

### 2.6 Performance
- Vite com `manualChunks` configurado ✅
- **58** imports de `recharts` — avaliar lazy loading
- `fabric`, `jspdf`, `exceljs` no package.json mas sem uso no código

---

## 3. Backend Deep Analysis

### 3.1 Module Inventory (41 módulos)
- **40** módulos têm router
- **21** módulos têm router mas NÃO têm service/application layer
- **13** módulos têm router mas NÃO têm repository layer
- Módulos sem router: `crypto`, `relatorios`

### 3.2 API Surface
- **44** rotas mapeadas (incluindo aliases)
- **6** rotas duplicadas/alias: `/fiscal`→`/faturamento`, `/payments`→`/financeiro`, etc.
- **1** rota órfã de alto risco: `/api/modules/*` (legacy, sem clinicGuard)
- **2** health checks: `/health` e `/api/health`

### 3.3 Middleware Coverage
- `authMiddleware`: global (exceto `/health`, `/metrics`, `/api/auth`)
- `clinicGuard`: **38/40** routers (faltando apenas `auth` e `modulesRouter`)

### 3.4 Database Schema Drift
- **173** models no schema.prisma
- **68** models usados no backend
- **105** models NÃO usados (60% dead code!)
- **Zero** tabelas no código que não estejam no schema

### 3.5 Error Handling
- **140** ocorrências de `res.status(500).json({ error: ... })`
- **5** arquivos usam `ApiError` + `errorHandler` (RFC 7807)
- **6** `dbRouters` expõem `e.message` raw

### 3.6 Event Bus
- **7** módulos emitem eventos
- **4** módulos consomem eventos
- **3** eventos órfãos (emitidos sem handler)

### 3.7 Workers
- **14** workers identificados
- **1** não registrado: `iaRadiografiaWorker.ts`

### 3.8 Security
- **SQL Injection**: 3 usos de `$queryRawUnsafe` em search_index (risco baixo, hardcoded)
- **Secrets**: memory_hub rotate-key endpoint aceita apiKey no body
- **Info Disclosure**: dbRouters expõem mensagens de erro

---

## 4. Specs & Documentation Analysis

### 4.1 Spec Completeness (25 specs)
- **100%** possuem spec.md + plan.md + tasks.md
- **1** spec com tasks.md vazio: `016-theme-premium-fix`
- **23/25** specs têm 0% tasks concluídas (código brownfield já existe!)
- **020-spec-memory-hub**: 96% implementado (49/51 tasks)
- **019-ia-radiografia**: 2% implementado (1/45 tasks)

### 4.2 Implementation Drift
- **Specs 001-018, 021-025**: Descrevem funcionalidades brownfield que JÁ EXISTEM no código
- **21 módulos backend** e **17 módulos frontend** não têm spec correspondente
- Exemplos sem spec: `agents`, `analytics`, `search_index`, `landpage`, `ui`

### 4.3 Constitution Drift
| Princípio | Status | Evidência |
|-----------|--------|-----------|
| CQ-2 (no new as any) | ❌ HIGH | 509 as any + 686 ts-expect-error |
| Arch §3.2 (Controller→Prisma) | ⚠️ MEDIUM | SearchIndexController chama prisma direto |
| Arch §5.3 (Repository) | ⚠️ MEDIUM | 16 módulos sem repository layer |
| FE-2 (date-fns) | ⚠️ LOW | 117 imports diretos date-fns |
| GP-1 (clinicGuard) | ✅ LOW | 39/40 routers protegidos |

### 4.4 Documentação Stale
- `docs/ARCHITECTURE.md`: Descreve categorias como pacotes npm autônomos; realidade é diferente
- `docs/README-orthoplus-deploy.md`: Rodapé diz 2026-04-05 vs cabeçalho 2026-05-19
- `docs/CONTINUOUS-REFACTOR-PLAN.md`: Pode estar desatualizado sobre migração localStorage→cookies

### 4.5 Queue Status
- queue-001: Item de schema PostgreSQL obsoleto (SQLite usado no memory hub)
- queue-002: Parcial — items pendentes já resolvidos ou obsoletos
- queue-003, 004, 005: ✅ Concluídos

---

## 5. Recomendações Priorizadas

### Críticas (P0) — Fazer imediatamente
1. **Adicionar clinicGuard em `/api/modules/*`** ou deprecar rota
2. **Migrar dbRouters** para não expor `e.message` raw
3. **Backfill tasks specs brownfield** (001-018, 021-025) — marcar como done o que já existe
4. **Reduzir `@ts-expect-error`** para < 100 em 30 dias (frontend)

### Altas (P1) — Próxima sprint
5. Criar service layer para 21 módulos backend sem service
6. Consolidar 16 hooks duplicados no frontend
7. Quebrar AuthContext monolítico em contexts menores
8. Remover/documentar 105 models Prisma não usados
9. Registrar `iaRadiografiaWorker.ts` em workers/index.ts

### Médias (P2) — Backlog
10. Migrar 140 handlers raw 500 para ApiError + errorHandler
11. Adicionar barrel exports aos 8 módulos frontend
12. Migrar 52 botões nativos para `<Button />`
13. Criar specs para 21 módulos backend não documentados
14. Atualizar docs/ARCHITECTURE.md para refletir arquitetura real

---

## 6. Métricas de Saúde do Projeto

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Backend tests | 689 passando | > 600 | ✅ |
| Frontend build | 0 erros | 0 | ✅ |
| Backend build | 0 erros | 0 | ✅ |
| as any (backend) | 509 | 0 novos | ❌ |
| as any (frontend) | 206 | 0 novos | ❌ |
| ts-expect-error | 686 | < 100 | ❌ |
| Spec coverage | 25/46 módulos | 100% | ⚠️ |
| Service layer coverage | 20/41 módulos | 100% | ❌ |
| clinicGuard coverage | 39/40 routers | 100% | ✅ |

