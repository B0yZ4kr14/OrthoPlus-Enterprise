# Plano Orquestrado: Varredura Profunda do Frontend

> **Projeto**: OrthoPlus Enterprise — Frontend (React 18 + Vite + TailwindCSS)  
> **Scope**: `apps/web/src/` (~17.739 linhas, 2.136 arquivos, 31 component trees, 39 modulos)  
> **Metodos**: Socratico (questionamento dialetico) + Popperiano (falsificacao de hipoteses)  
> **Data**: 2026-05-19  

---

## 1. Visao Geral e Objetivos

### 1.1 Contexto
O frontend do OrthoPlus Enterprise eh um monorepo React SPA com arquitetura hibrida (Clean Architecture parcial + feature-based modules). Possui 39 modulos de dominio, 31 arvores de componentes compartilhados, e integracao com 37 modulos de backend.

### 1.2 Objetivos Primarios

| # | Objetivo | Metrica de Sucesso |
|---|----------|-------------------|
| 1 | Identificar configuracoes truncadas e inconsistencias de UI | ≥95% dos componentes validados |
| 2 | Detectar bugs em cards, modulos e formularios | Zero regressoes apos fix |
| 3 | Mapear violacoes arquiteturais no frontend | Relatorio com evidencias |
| 4 | Validar consistencia de design system (tokens, spacing, tipografia) | Checklist 100% coberto |
| 5 | Aplicar fixes com minima regressao | Testes passando ≥98% |

### 1.3 Metodos de Validacao

**Metodo Socratico** — Questionamento dialetico em 3 niveis:
- **Nivel 1 (Elenchus)**: Interrogar cada componente
- **Nivel 2 (Maieutica)**: Extrair conhecimento implicito
- **Nivel 3 (Dialetica)**: Confrontar opostos

**Metodo Popperiano** — Falsificacao de hipoteses:
- **Hipose nula (H0)**: "Este componente esta correto e consistente"
- **Experimento de falsificacao**: Tentar provar que H0 eh falsa
- **Criterio de demarcacao**: Se encontrarmos contradicao, aplicar fix

---

## 2. Estrutura do Frontend (Baseline)

```
apps/web/src/
├── components/              # 31 arvores de componentes compartilhados
│   ├── admin/
│   ├── agenda/
│   ├── auth/
│   ├── bi/
│   ├── crm/
│   ├── crypto/
│   ├── dashboard/
│   ├── financeiro/
│   ├── forms/
│   ├── layout/
│   ├── patients/
│   ├── pdv/
│   ├── settings/
│   ├── shared/
│   └── ... (outros 17)
├── modules/                 # 39 modulos de dominio
│   ├── agenda/
│   ├── auth/
│   ├── financeiro/
│   ├── pacientes/
│   └── ... (outros 35)
├── contexts/
├── hooks/
├── lib/
├── routes/
├── types/
└── domain/
```

### 2.1 Hotspots Conhecidos

| Arquivo | Problema Conhecido |
|---------|-------------------|
| `agenda/api/agendaController.ts` | 4 erros de mismatch Prisma |
| `auth/api/AuthController.ts` | 1 erro de import |
| `crypto-pagamentos` | Multiplos aliases nao mapeados |
| `marketing-auto/IndicacoesTab.tsx` | Variant string incompativel |
| `financeiro/ConciliacaoBancaria.tsx` | `@ts-expect-error` inutil |
| `auth/Auth.tsx`, `pacientes/PacientesListPage.tsx` | Variant `cta` nao existe no Button |

---

## 3. Fases da Varredura Orquestrada

### Fase 0: Preparacao e Contexto (P0)
**Duracao estimada**: 30 min  
**Skills**: `speckit-brownfield-scan`, `gitnexus-exploring`  
**Agente**: Context Builder

| # | Acao | Skill | Output |
|---|------|-------|--------|
| 0.1 | Scan da estrutura frontend | `speckit-brownfield-scan` | Project Profile |
| 0.2 | Query no GitNexus: "frontend auth flow" | `gitnexus-exploring` | Execution flows |
| 0.3 | Query no GitNexus: "module loading" | `gitnexus-exploring` | Dependency graph |
| 0.4 | Verificar indice GitNexus | `gitnexus-exploring` | Staleness report |

**Checkpoint**: Indice GitNexus atualizado? Se nao, executar `npx gitnexus analyze`.

---

### Fase 1: Varredura Arquitetural (P1)
**Duracao estimada**: 45 min  
**Skills**: `speckit-architecture-guard-violation-detection`, `gitnexus-exploring`  
**Agente**: Architecture Guard

| # | Acao | Metodo | Foco |
|---|------|--------|------|
| 1.1 | Detectar violacoes de boundary | Socratico+Popperiano | Componentes acessando API diretamente |
| 1.2 | Detectar tight coupling | Socratico+Popperiano | Imports ciclicos entre modulos |
| 1.3 | Detectar boundary erosion | Socratico+Popperiano | Business logic em componentes UI |
| 1.4 | Detectar contract drift | Socratico+Popperiano | Inconsistencia entre DTOs |
| 1.5 | Detectar missing abstractions | Socratico+Popperiano | Repeticao de logica |

**Hipoteses Popperianas a falsificar**:
- H1: "Todos os modulos seguem Clean Architecture"
- H2: "Nao ha imports ciclicos entre modulos"
- H3: "Todos os componentes usam o design system consistentemente"

**Deliverable**: `docs/plans/frontend-scan-reports/P1-architecture-violations.md`

---

### Fase 2: Varredura de Componentes e Design (P2)
**Duracao estimada**: 60 min  
**Skills**: `speckit-cleanup-run`, `omk-multimodal-ui-review`  
**Agente**: UI/UX Inspector

#### 2.1 Componentes Compartilhados (31 arvores)

| Subfase | Componentes | Foco |
|---------|-------------|------|
| 2.1.1 | `admin/`, `settings/` | Configuracoes truncadas |
| 2.1.2 | `forms/`, `shared/` | Validacoes, inputs, data-table |
| 2.1.3 | `dashboard/`, `bi/` | Cards, graficos, metricas |
| 2.1.4 | `patients/`, `agenda/` | Formularios complexos |
| 2.1.5 | `crypto/`, `financeiro/` | Pagamentos, wallets |
| 2.1.6 | `layout/`, `auth/` | Sidebar, header, navegacao |

#### 2.2 Metodo Socratico para Componentes

Para cada componente:
- Q1: "Qual eh a responsabilidade unica deste componente?"
- Q2: "Quais props sao obrigatorias vs opcionais?"
- Q3: "Como este componente lida com estados de erro?"
- Q4: "Este componente eh reutilizavel ou monolitico?"
- Q5: "Ha duplicacao de logica com outros componentes?"

#### 2.3 Metodo Popperiano para Design

- H0: "Este componente segue o design system"
- Experimento: Verificar tokens de cor, spacing, tipografia
- Se encontrar: hardcoded colors, spacing arbitrario
  → H0 rejeitada → Criar fix

**Deliverable**: `docs/plans/frontend-scan-reports/P2-component-audit.md`

---

### Fase 3: Varredura de Modulos e Configuracoes (P3)
**Duracao estimada**: 60 min  
**Skills**: `speckit-drift`, `speckit-cleanup-run`  
**Agente**: Module Auditor

#### 3.1 Modulos por Prioridade

| Tier | Modulos | Razao |
|------|---------|-------|
| T1 (Alta) | `auth`, `pacientes`, `agenda`, `financeiro` | Core do negocio |
| T2 (Media) | `crypto`, `pdv`, `crm`, `estoque`, `orcamentos` | Funcionalidade critica |
| T3 (Baixa) | `marketing-auto`, `teleodonto`, `tiss`, `landpage` | Modulos menores |

#### 3.2 Checklist por Modulo

- [ ] Configuracoes truncadas: Props passadas parcialmente
- [ ] Inconsistencias de estado: Local vs global
- [ ] Bugs visuais: Overflows, z-index, animacoes
- [ ] Acessibilidade: ARIA labels, keyboard nav
- [ ] Performance: Re-renders, lazy loading
- [ ] Tipagem: `any`, `@ts-ignore`, `@ts-expect-error`

**Deliverable**: `docs/plans/frontend-scan-reports/P3-module-audit.md`

---

### Fase 4: Varredura de Contextos e Estado Global (P4)
**Duracao estimada**: 30 min  
**Skills**: `gitnexus-exploring`  
**Agente**: State Inspector

| # | Contexto | Foco |
|---|----------|------|
| 4.1 | `AuthContext.tsx` | Roles, permissoes, session |
| 4.2 | `ModulesContext.tsx` | Ativacao de modulos |
| 4.3 | React Query hooks | Cache invalidation |
| 4.4 | Zustand stores | Estado global |

**Deliverable**: `docs/plans/frontend-scan-reports/P4-state-audit.md`

---

### Fase 5: Validacao Cruzada e Drift (P5)
**Duracao estimada**: 45 min  
**Skills**: `speckit-drift`, `speckit-analyze`  
**Agente**: Consistency Validator

| # | Acao | Descricao |
|---|------|-----------|
| 5.1 | Comparar specs vs implementacao | `speckit-drift` |
| 5.2 | Validar consistencia cross-module | `speckit-analyze` |
| 5.3 | Verificar plan.md vs codigo | Manual review |
| 5.4 | Identificar codigo "orfa" | `gitnexus_query` |

**Deliverable**: `docs/plans/frontend-scan-reports/P5-drift-report.md`

---

### Fase 6: Fixes e Cleanup (P6)
**Duracao estimada**: Variavel  
**Skills**: `speckit-cleanup-run`, `speckit-fix-findings-run`  
**Agente**: Fix Squad

#### 6.1 Classificacao de Issues

| Severidade | Criterio | Acao |
|------------|----------|------|
| **CRITICAL** | Seguranca, crash, dados corrompidos | Fix imediato |
| **LARGE** | Arquitetura, circular deps | Analise + task |
| **MEDIUM** | Qualidade, duplicacao | Task para sprint |
| **SMALL** | Console.log, unused imports | Fix imediato (Scout Rule) |

#### 6.2 Workflow de Fix

1. Selecionar issue
2. Metodo Socratico: "Por que este codigo esta assim?"
3. Metodo Popperiano: "Como provar que o fix funciona?"
4. Escrever fix minimo (<50 linhas)
5. Rodar linter + type-check
6. Rodar testes
7. Commit com mensagem convencional

**Deliverable**: `docs/plans/frontend-scan-reports/P6-fixes-applied.md`

---

### Fase 7: Quality Gates e Verificacao (P7)
**Duracao estimada**: 30 min  
**Skills**: `speckit-verify-run`, `omk-quality-gate`  
**Agente**: QA Validator

| Gate | Comando | Threshold |
|------|---------|-----------|
| Lint | `cd apps/web && pnpm lint` | 0 erros |
| Type Check | `cd apps/web && pnpm type-check` | Erros pre-existentes apenas |
| Tests | `cd apps/web && pnpm test` | ≥90% passando |
| Build | `cd apps/web && pnpm build` | Sem erros |
| Security | `cd apps/web && pnpm audit` | 0 criticas |

**Deliverable**: `docs/plans/frontend-scan-reports/P7-quality-gates.md`

---

## 4. Orquestracao de Agentes

### 4.1 Squad de Varredura

| Agente | Skill Principal | Foco | Output |
|--------|-----------------|------|--------|
| **Context Builder** | `speckit-brownfield-scan` | Mapeamento inicial | Project Profile |
| **Architecture Guard** | `speckit-architecture-guard-violation-detection` | Violacoes arquiteturais | Violation Report |
| **UI/UX Inspector** | `speckit-cleanup-run` | Componentes e design | Component Audit |
| **Module Auditor** | `speckit-drift` | Modulos e configs | Module Audit |
| **State Inspector** | `gitnexus-exploring` | Contextos e estado | State Audit |
| **Consistency Validator** | `speckit-analyze` | Drift e consistencia | Drift Report |
| **Fix Squad** | `speckit-fix-findings-run` | Aplicacao de fixes | Fixes Applied |
| **QA Validator** | `omk-quality-gate` | Quality gates | Gate Report |

### 4.2 Sequencia de Execucao

```
P0 (Context Builder)
  → P1 (Architecture Guard) || P2 (UI/UX Inspector)
    → P3 (Module Auditor)
      → P4 (State Inspector)
        → P5 (Consistency Validator)
          → P6 (Fix Squad) [iterativo]
            → P7 (QA Validator)
```

**Nota**: P1 e P2 podem rodar em paralelo. P6 eh iterativo.

---

## 5. Playbooks

### 5.1 Playbook: Varredura de Componente

```bash
# 1. Identificar componente
COMPONENT="apps/web/src/components/shared/DataTable.tsx"

# 2. Aplicar metodo Socratico
# Q: responsabilidade unica, props, estados

# 3. Aplicar metodo Popperiano
# Hipose: "Este componente esta correto"
# Tentar falsificar: props invalidas, estados vazios

# 4. Verificar design system
#   - Cores: tokens Tailwind
#   - Spacing: scale Tailwind
#   - Tipografia: classes Tailwind

# 5. Verificar acessibilidade
#   - ARIA labels
#   - Keyboard navigation
#   - Color contrast

# 6. Verificar performance
#   - React.memo
#   - useMemo/useCallback
#   - Lazy loading
```

### 5.2 Playbook: Varredura de Modulo

```bash
# 1. Identificar modulo
MODULE="apps/web/src/modules/pacientes"

# 2. Verificar estrutura
ls $MODULE/

# 3. Verificar rotas
grep -r "pacientes" apps/web/src/routes/AppRoutes.tsx

# 4. Verificar imports ciclicos
grep -r "from.*pacientes" apps/web/src/ --include="*.tsx"

# 5. Verificar estado global
grep -r "useQuery\|useMutation" $MODULE/ --include="*.tsx"

# 6. Verificar testes
find $MODULE/ -name "*.test.{ts,tsx}" | wc -l
```

### 5.3 Playbook: Fix Rapido (Scout Rule)

```bash
# 1. Identificar issue pequena
# 2. Aplicar fix
# 3. Validar: pnpm lint, pnpm type-check
# 4. Commit: git add + git commit -m "fix: ..."
```

---

## 6. Checklist de Validacao Socratica

| # | Pergunta | Criterio |
|---|----------|----------|
| S1 | Responsabilidade unica? | Documentada em JSDoc |
| S2 | Props necessarias? | Nenhuma prop sem uso |
| S3 | Estados de erro? | Loading, error, empty, success |
| S4 | Acessivel? | ARIA, keyboard, contrast |
| S5 | Design system? | Tokens Tailwind |
| S6 | Testes? | ≥1 teste |
| S7 | Performatico? | Sem re-renders |
| S8 | Codigo duplicado? | Reutilizar shared |
| S9 | Tipagens? | Zero `any` |
| S10 | Reutilizavel? | Props genericas |

---

## 7. Checklist de Falsificacao Popperiana

| # | Hipose | Experimento |
|---|--------|-------------|
| P1 | "Modulo completo" | Verificar rotas registradas |
| P2 | "Componente consistente" | Multiplos breakpoints |
| P3 | "Formulario sem bugs" | Dados invalidos, edge cases |
| P4 | "Estado bem gerenciado" | Race conditions |
| P5 | "Design responsivo" | 320px, 768px, 1440px |
| P6 | "Sem memory leaks" | Monitorar heap |
| P7 | "API bem integrada" | Simular 500, 404 |
| P8 | "Permissoes funcionam" | ADMIN, MEMBER, sem login |

---

## 8. Artefatos de Entrega

| Artefato | Local |
|----------|-------|
| Project Profile | `docs/plans/frontend-scan-reports/P0-project-profile.md` |
| Architecture Violations | `docs/plans/frontend-scan-reports/P1-architecture-violations.md` |
| Component Audit | `docs/plans/frontend-scan-reports/P2-component-audit.md` |
| Module Audit | `docs/plans/frontend-scan-reports/P3-module-audit.md` |
| State Audit | `docs/plans/frontend-scan-reports/P4-state-audit.md` |
| Drift Report | `docs/plans/frontend-scan-reports/P5-drift-report.md` |
| Fixes Applied | `docs/plans/frontend-scan-reports/P6-fixes-applied.md` |
| Quality Gates | `docs/plans/frontend-scan-reports/P7-quality-gates.md` |
| Master Report | `docs/plans/frontend-scan-reports/MASTER-REPORT.md` |

---

## 9. Criterios de Aceitacao

- [ ] Todas as 8 fases executadas
- [ ] 31 component trees auditados
- [ ] 39 modulos auditados
- [ ] Relatorio de violacoes arquiteturais
- [ ] Relatorio de drift
- [ ] Fixes aplicados (≥80% dos SMALL)
- [ ] Quality gates passando
- [ ] Master Report consolidado
- [ ] Metodo Socratico em ≥50 componentes
- [ ] Metodo Popperiano em ≥20 hipoteses

---

## 10. Proximos Passos

1. Aprovar plano
2. Iniciar Fase 0 — Context Builder scan
3. Orquestrar agentes
4. Executar varredura
5. Consolidar resultados
6. Aplicar fixes
7. Validar

---

> Nota: Este plano eh orquestrado, nao linear. Fases podem ser paralelizadas.
