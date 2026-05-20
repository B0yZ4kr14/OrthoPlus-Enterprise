# Plano Massivo Orquestrado — 6 Horas

> **Projeto**: OrthoPlus Enterprise (Monorepo Full-Stack)
> **Data**: 2026-05-20
> **Metodologia**: Socratico + Popperiano
> **Orquestracao**: speckit + gitnexus + omk
> **Scope**: Frontend + Backend + Infra + Deploy

---

## 0. Estado Baseline

### 0.1 Backend Health
| Gate | Resultado |
|------|-----------|
| Tests | 24 suites, 511 tests — TODOS PASSANDO |
| Build | tsc passa (0 erros) |
| Lint | 0 erros, ~105 warnings pre-existentes |

### 0.2 Frontend Health
| Gate | Resultado |
|------|-----------|
| Type-check | tsc --noEmit passa (0 erros) |
| Lint | 0 erros, 105 warnings pre-existentes |
| Build | vite build passa (~10s local) |

### 0.3 Inventario de Specs (18 specs, ~803 tasks, ~7% concluido)
| Spec | Feature | Tasks | Done | Status |
|------|---------|-------|------|--------|
| 001 | Pacientes | 54 | 0/54 | Nao iniciada |
| 002 | Agenda | 56 | 0/56 | Nao iniciada |
| 003 | PEP | 56 | 0/56 | Nao iniciada |
| 004 | Financeiro | 56 | 0/56 | Nao iniciada |
| 005 | Auth | 57 | 0/57 | Nao iniciada |
| 006 | Orcamentos | 52 | 0/52 | Nao iniciada |
| 007 | Procedimentos | 56 | 0/56 | Nao iniciada |
| 008 | PDV | 56 | 0/56 | Nao iniciada |
| 009 | Faturamento | 56 | 0/56 | Nao iniciada |
| 010 | Funcionarios | 56 | 0/56 | Nao iniciada |
| 011 | Inventario | 56 | 0/56 | Nao iniciada |
| 012 | TISS | 56 | 0/56 | Nao iniciada |
| 013 | CRM | 56 | 0/56 | Nao iniciada |
| 014 | Notificacoes | 56 | 0/56 | Nao iniciada |
| 015 | Files | 14 | 0/14 | Nao iniciada |
| 016 | Theme Premium Fix | 0 | 0/0 | IMPLEMENTADA (fora de spec) |
| 017 | OMK Governance | 56 | 56/56 | COMPLETA |
| 018 | Sidebar Collapsed | 30 | 0/30 | Parcialmente implementada |

### 0.4 Frontend Deep Scan (Ja Executado — 2026-05-19)
8 SMALL fixes aplicados. **Pendentes**: 38 MEDIUM tasks, 7 LARGE tasks.

---

## 1. Filosofia de Execucao

### Metodo Socratico (3 Niveis)
- Nivel 1 — Elenchus: "O que a SPEC diz?" vs "O que o CODIGO faz?"
- Nivel 2 — Maieutica: Extrair conhecimento implicito
- Nivel 3 — Dialetica: Conciliar especificacao e implementacao

### Metodo Popperiano (Falsificacao)
- H0: "Esta implementacao esta correta"
- Experimento: Buscar any, fetch(), imports ciclicos, hardcoded colors, console.*
- Se contradicao encontrada -> H0 rejeitada -> aplicar fix

### Loop Continuo
SCAN -> ANALYZE -> FIX -> VALIDATE -> (loop se falhar)

---

## 2. Orquestracao de Agentes

| Agente | Funcao | Horas |
|--------|--------|-------|
| Oracle | Validacao final, drift detection | 1.0 |
| Architecture Guard | Violacoes de constituicao | 1.0 |
| Fix Squad | Fixes minimos | 2.0 |
| Module Implementer | Implementar specs criticas | 2.0 |
| QA Validator | Quality gates, regressao | 1.0 |
| Deploy Ops | Deploy VPS, nginx reload | 0.5 |

---

## 3. Fases de Execucao (6 Horas)

### FASE 0: Preparacao e Sincronizacao (30 min)

| # | Acao | Output |
|---|------|--------|
| 0.1 | Atualizar indice GitNexus | Indice sincronizado com HEAD |
| 0.2 | Verificar estado Git | Working tree limpo |
| 0.3 | Commit mudancas pendentes | Commit de estado inicial |
| 0.4 | Rodar quality gate baseline | Snapshot de saude |
| 0.5 | Verificar VPS health | Containers rodando |
| 0.6 | Carregar memory OMK | Contexto carregado |

**Deliverable**: docs/session-memory/BASELINE-2026-05-20.md

---

### FASE 1: Consolidacao Frontend Deep Scan (90 min)

**Contexto**: Scan P0-P7 ja executado. Faltam 38 MEDIUM + 7 LARGE tasks.

#### 1.1 LARGE Tasks (7) — Prioridade Maxima

| ID | Task | Modulo | Risco |
|----|------|--------|-------|
| TD005 | Resolver 7 circular dependencies | crypto, pacientes, pep | ALTO |
| TD004 | Refatorar 18 fetch() para apiClient | crypto, dashboard, settings | ALTO |
| TD003 | Extrair sub-componentes DashboardUnified | dashboard | MEDIO |
| TD002 | Extrair sub-componentes UserManagementTab | settings | MEDIO |

**Metodo**: Para cada LARGE task:
1. Rodar gitnexus_impact no simbolo-alvo
2. Documentar blast radius
3. Aplicar refatoracao minima
4. Validar com type-check + lint
5. Commit atomico

#### 1.2 MEDIUM Tasks Selecionados (10 de 38)

| ID | Task | Esforco |
|----|------|---------|
| TD001 | Add EmptyState ao DataTable | S |
| TD006 | Add tests ao modulo auth | M |
| TD007 | Add tests ao modulo pacientes | M |
| TD008 | Add tests ao modulo agenda | M |
| - | Criar cryptoPriceClient.ts | S |
| - | Criar useCryptoTransaction() | S |
| - | Add lint rule anti-fetch | XS |
| - | Extrair componentes >400 linhas | M |
| - | Add React.memo a listas pesadas | S |
| - | Normalizar imports de modulos | S |

**Metodo**: Socratico (responsabilidade unica) + Popperiano (como provar que funciona) + fix <50 linhas + commit.

#### 1.3 SMALL Fixes (Scout Rule)
- Remover console.log/debug/warn
- Remover imports nao usados
- Corrigir typos em JSDoc

**Deliverable**: docs/plans/frontend-scan-reports/P6-fixes-applied-v2.md

---

### FASE 2: Implementacao Specs Criticas (120 min)

**Prioridade de Negocio**:
- T1 (Core): 005-auth, 001-pacientes, 002-agenda
- T2 (Financeiro): 004-financeiro, 008-pdv, 009-faturamento
- T3 (Operacional): 003-pep, 007-procedimentos, 006-orcamentos
- T4-T5: demais modulos

**Realidade de 6h**: Implementar ~2-3 specs completas.

#### 2.1 Spec 005 — Auth (45 min)

| Batch | Tasks | Foco |
|-------|-------|------|
| 005-A | T001-T010 | clinicGuard, roles, permissoes |
| 005-B | T011-T020 | User management UI, form validation |
| 005-C | T021-T030 | Session management, token refresh |

**Socratico**: Cada rota tem clinicGuard? Frontend verifica permissao?
**Popperiano**: Simular token expirado, acesso nao autorizado.

#### 2.2 Spec 001 — Pacientes (45 min)

| Batch | Tasks | Foco |
|-------|-------|------|
| 001-A | T001-T010 | CRUD basico, validacao |
| 001-B | T011-T020 | Busca rapida, filtros, paginacao |
| 001-C | T021-T030 | Integracao com agenda |

#### 2.3 Spec 018 — Sidebar Collapsed (30 min)

Codigo ja implementado. Acao: verificar, marcar tasks [X], adicionar testes.

**Deliverables**:
- specs/005-auth-usuarios/tasks.md atualizado
- specs/001-pacientes/tasks.md atualizado
- specs/018-sidebar-collapsed-default/tasks.md atualizado

---

### FASE 3: Quality Gates (60 min)

| # | Gate | Threshold | Popperiano |
|---|------|-----------|------------|
| 3.1 | Lint | 0 erros, warnings ≤105 | H0: "Nenhum erro novo" |
| 3.2 | Type Check | 0 erros | H0: "Tipos consistentes" |
| 3.3 | Frontend Tests | ≥90% passando | H0: "Componentes funcionam" |
| 3.4 | Backend Tests | 511/511 passando | H0: "API funcional" |
| 3.5 | Backend Build | 0 erros | H0: "Backend compilavel" |
| 3.6 | Frontend Build | 0 erros | H0: "Bundle saudavel" |
| 3.7 | Security Audit | 0 criticas | H0: "Sem vulnerabilidades" |

**Se falhar**: Abortar deploy, voltar a FASE 1/2, fix minimo, re-rodar.

**Deliverable**: docs/session-memory/QUALITY-GATES-2026-05-20.md

---

### FASE 4: Deploy e Consolidacao (60 min)

#### 4.1 Pre-Deploy
- Validar .env (sem placeholders)
- Verificar secrets (nenhum hardcoded)
- Validar nginx.conf
- Backup DB (pg_dump)
- Verificar espaco em disco

#### 4.2 Build e Deploy Pipeline
1. Build frontend local (pnpm build)
2. Build backend local (pnpm build)
3. Empacotar (tar czf)
4. SCP para VPS
5. Extrair no VPS
6. Prisma migrate deploy
7. Restart containers
8. Health check local
9. Nginx reload
10. Verificar endpoint publico

#### 4.3 Post-Deploy Validation
- Frontend HTTP 200
- Backend /health 200
- Tema light/dark funcionando
- Sidebar colapsa/expandida
- Auth funciona
- Sem erros no console

#### 4.4 Git Consolidation
- Commit de deploy
- Tag de versao (v2.9.10)
- Push para GitHub
- Atualizar CHANGELOG

**Deliverables**:
- docs/session-memory/DEPLOY-REPORT-2026-05-20.md
- docs/CHANGELOG.md atualizado
- Tag no GitHub

---

### FASE 5: Documentacao e Loop Continuo (30 min)

#### 5.1 Retrospectiva
| Pergunta | Resposta Esperada |
|----------|-------------------|
| O que funcionou bem? | Gates passando, backend saudavel |
| O que melhorar? | Velocidade de deploy |
| Dividas tecnicas? | 738 ts-ignore, 7 circular deps, 18 fetch() |
| Proxima prioridade? | Specs 002-agenda, 004-financeiro |

#### 5.2 Atualizar Artefatos
- specs/*/tasks.md -> marcar [X]
- docs/session-memory/ -> novo relatorio
- AGENTS.md -> atualizar data

#### 5.3 Pipeline Proxima Sessao
```
PROXIMA SESSAO (6h):
  FASE 1: Spec 002-Agenda (90 min)
  FASE 2: Spec 004-Financeiro (90 min)
  FASE 3: Spec 003-PEP (60 min)
  FASE 4: Quality Gates (60 min)
  FASE 5: Deploy + Docs (60 min)
```

**Deliverable**: docs/session-memory/RETRO-2026-05-20.md

---

## 4. Matriz de Risco

| Risco | Prob | Impacto | Mitigacao |
|-------|------|---------|-----------|
| Deploy quebra producao | Baixa | Critico | Backup DB, rollback Docker |
| Type-check falha | Media | Alto | Gate a cada commit |
| Circular dep crash | Baixa | Alto | gitnexus_impact antes de editar |
| Spec grande demais | Alta | Medio | Priorizar T1 |
| VPS indisponivel | Baixa | Medio | Retry com backoff |
| Git conflito | Baixa | Medio | Feature branch + PR |

---

## 5. Checklist de Aceitacao

- [ ] Fase 0: Baseline documentado, gates passando
- [ ] Fase 1: ≥50% MEDIUM tasks do scan aplicados
- [ ] Fase 2: ≥2 specs criticas com tasks [X]
- [ ] Fase 3: Todos quality gates passando
- [ ] Fase 4: Deploy no VPS, health check 200
- [ ] Fase 5: Documentacao atualizada, retro feita
- [ ] Git: main sincronizado com GitHub, tag criada
- [ ] Nenhum erro critico introduzido

---

## 6. Comandos Rapidos

```bash
# Quality Gates
pnpm lint && pnpm type-check && pnpm test

# Frontend
cd apps/web && pnpm lint && pnpm type-check && pnpm build

# Backend
cd backend && pnpm lint && pnpm build && pnpm test

# GitNexus
gitnexus_impact --target "symbolName" --direction upstream
gitnexus_detect_changes

# Deploy
./scripts/deploy-vps.sh
```

---

> **Total estimado**: 5h 30min efetivo + 30min buffer = 6h
> **Metodologia**: Socratico-Popperiano com loop SCAN->ANALYZE->FIX->VALIDATE
