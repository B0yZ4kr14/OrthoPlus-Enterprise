# Plano Contínuo de Refatoração — OrthoPlus Enterprise

> Gerado em: 2026-05-25
> Status: Orquestrado — execução sem pausas

---

## Contexto

A primeira onda de refatoração eliminou todos os 13 fat controllers (>300 linhas).
Restam 3 frentes críticas da Architecture Constitution:

1. **Security Constitution §2.1**: Tokens em `localStorage` (violação crítica)
2. **Architecture Constitution §EP-2**: 23 módulos sem repository layer
3. **Frontend**: Inline API calls em componentes de página

---

## Fase 1: Segurança Crítica — Eliminar localStorage Tokens

**Prioridade: P0 — BLOQUEANTE para produção**

A `security_constitution.md` §2.1 é explicita:
- MUST NOT: Store auth tokens in `localStorage` / `sessionStorage`
- MUST: Use HttpOnly, Secure, SameSite=Strict cookies
- MUST: Use `useAuth()` — never access storage APIs directly

O backend já emite cookies (`AuthController` → `res.cookie("access_token", ...)`).
O `apiClient` já envia cookies (`withCredentials: true`).
O problema é que o request interceptor ainda injeta `localStorage.getItem("accessToken")`
no header `Authorization`, e o `AuthContext` usa localStorage como source-of-truth.

### T1.1 — Remover token injection do apiClient
**Arquivo**: `apps/web/src/lib/api/apiClient.ts`  
**Ação**: Eliminar o request interceptor que lê `localStorage.getItem("accessToken")`.
Os cookies HttpAlready são enviados automaticamente via `withCredentials: true`.

### T1.2 — Migrar AuthContext de localStorage para cookie-only
**Arquivo**: `apps/web/src/contexts/AuthContext.tsx`  
**Ação**:
- Remover `localStorage.getItem/setItem/removeItem("accessToken")`
- Remover `localStorage.getItem/setItem/removeItem("refreshToken")`
- `checkSession()` deve chamar `/auth/me` sem verificar localStorage primeiro
- `logout()` deve chamar `/auth/logout` (backend limpa o cookie)
- Manter compatibilidade com mock mode (`AUTH_ALLOW_MOCK`)

### T1.3 — Remover localStorage token de useProcedimentos
**Arquivo**: `apps/web/src/components/fidelidade/recompensa-form/useProcedimentos.ts`
**Ação**: Substituir `localStorage.getItem("accessToken")` por `useAuth()`.

### T1.4 — Validar auth flow E2E
**Testes**: Playwright E2E (`tests/e2e/`)  
**Verificar**: login → cookie set → page reload → session still valid → logout → cookie cleared

---

## Fase 2: Repository Layer — Módulos Críticos (top 8)

**Prioridade: P1**

A `architecture_constitution.md` §EP-2 exige repository abstraction.
Módulos com maior churn e complexidade:

| Rank | Módulo | Arquivos | Motivação | Status |
|------|--------|----------|-----------|--------|
| 1 | `auth` | 7 | Autenticação — core de segurança | ✅ **CONCLUÍDO** |
| 2 | `financeiro` | 17 | Financeiro — dados sensíveis, audit obrigatório | ✅ **CONCLUÍDO** |
| 3 | `pdv` | 16 | PDV — transações críticas | ✅ **CONCLUÍDO** |
| 4 | `agenda` | 10 | Agenda — alto volume de acessos | ✅ **CONCLUÍDO** |
| 5 | `faturamento` | 18 | Faturamento/NFe — compliance fiscal | ✅ **CONCLUÍDO** |
| 6 | `pacientes` | 27 | Pacientes — LGPD, dados pessoais | ✅ **CONCLUÍDO** |
| 7 | `inventario` | 21 | Inventário — controle de estoque | ✅ **CONCLUÍDO** |
| 8 | `contratos` | 10 | Contratos — dados financeiros | ✅ **CONCLUÍDO** |
| — | `usuarios` | 3 | Usuários — gestão de perfis | ✅ **CONCLUÍDO** |
| — | `relatorios` | 2 | Relatórios — export/import | ✅ **CONCLUÍDO** |
| — | `orcamentos` | 4 | Orçamentos — 13 chamadas inline | ✅ **CONCLUÍDO** |
| — | `teleodonto` | 7 | Teleodontologia — 9 chamadas inline | ✅ **CONCLUÍDO** |
| — | `marketing` | 3 | Marketing — 22 chamadas inline | ✅ **CONCLUÍDO** |

### T2.1 — auth (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IUserRepository.ts` (interface com tipos Prisma)
- [x] Atualizar `infrastructure/UserRepository.ts` para implementar `IUserRepository`
- [x] Injetar `IUserRepository` em `AuthService`, `AuthenticateUserUseCase`, `RegisterUserUseCase`
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `165189d92`

### T2.2 — financeiro (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IFinanceiroRepository.ts` (interface com tipos Prisma para 8 entidades)
- [x] Atualizar `infrastructure/FinanceiroRepository.ts` para implementar `IFinanceiroRepository`
- [x] Injetar `IFinanceiroRepository` em `FinanceiroService`, `CreateTransactionUseCase`, `GetCashFlowUseCase`, `GetResumoFinanceiroUseCase`, `ProcessarPagamentoUseCase`
- [x] Corrigir acessos strict-null em aggregates (`_sum?._amount`, `_count as any`)
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `a34e1594c`

### T2.3 — pdv (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IPdvRepository.ts` (interface com tipos Prisma)
- [x] Atualizar `infrastructure/PdvRepository.ts` para implementar `IPdvRepository`
- [x] Injetar `IPdvRepository` em `PdvController`
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `65ffe8a52`

### T2.4 — agenda (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IAgendaRepository.ts` (interface com tipos Prisma para 4 entidades)
- [x] Atualizar `infrastructure/AgendaRepository.ts` para implementar `IAgendaRepository`
- [x] Injetar `IAgendaRepository` em `AgendaService`
- [x] Re-exportar tipos de filtro do domain para compatibilidade
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `0f21af1a3`

### T2.5 — faturamento (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IFaturamentoRepository.ts` (interface com tipos Prisma)
- [x] Atualizar `infrastructure/FaturamentoRepository.ts` para implementar `IFaturamentoRepository`
- [x] Injetar `IFaturamentoRepository` em `FaturamentoControllerService`
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `e3b63ddd5`

### T2.6 — pacientes (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IPacientesSearchRepository.ts` (interface para busca)
- [x] Criar `infrastructure/PacientesSearchRepository.ts` (implementação Prisma)
- [x] Refatorar `PacienteSearchService` para depender de `IPacientesSearchRepository`
  em vez de chamadas diretas ao Prisma
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `ccf98983e`

### T2.7 — inventario (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IInventarioRepository.ts` (interface com tipos Prisma)
- [x] Atualizar `infrastructure/InventarioRepository.ts` para implementar `IInventarioRepository`
- [x] Injetar `IInventarioRepository` em `InventarioController` e `InventarioControllerService`
- [x] Corrigir `router.ts` para nova assinatura do construtor
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `f724aed7a`

### T2.8 — contratos (CONCLUÍDO ✅)
- [x] Criar `domain/repositories/IContratosRepository.ts` (interface com tipos Prisma)
- [x] Criar `infrastructure/ContratosRepository.ts` (implementação Prisma)
- [x] Refatorar `ContratosController` para depender de `IContratosRepository`
  em vez de 7 chamadas diretas `(prisma as any).contratos`
- [x] Eliminar 7 comentários `eslint-disable-line @typescript-eslint/no-explicit-any`
- [x] Build passa (0 erros TypeScript)
- [x] 636/636 unit tests passam
- [x] Commit: `35322c839`

### Extensão eficiente — módulos com chamadas inline (CONCLUÍDO ✅)

| Módulo | Chamadas Inline | Ação | Status |
|--------|----------------|------|--------|
| `usuarios` | 0 (centralizado) | Criar IUsuariosRepository, DI | ✅ |
| `relatorios` | 0 (centralizado) | Criar IReportRepository, DI | ✅ |
| `orcamentos` | 13 | Criar IOrcamentoRepository + OrcamentoRepository, refatorar service | ✅ |
| `teleodonto` | 9 | Criar ITeleodontoRepository + TeleodontoRepository, refatorar service | ✅ |
| `marketing` | 22 | Criar IMarketingRepository + MarketingRepository, refatorar controller | ✅ |

| Módulo | Chamadas Inline | Ação | Status |
|--------|----------------|------|--------|
| `usuarios` | 0 (centralizado) | Criar IUsuariosRepository, DI | ✅ |
| `relatorios` | 0 (centralizado) | Criar IReportRepository, DI | ✅ |
| `orcamentos` | 13 | Criar IOrcamentoRepository + OrcamentoRepository, refatorar service | ✅ |
| `teleodonto` | 9 | Criar ITeleodontoRepository + TeleodontoRepository, refatorar service | ✅ |
Para cada módulo:
1. Criar `domain/repositories/I{Entidade}Repository.ts` (interface)
2. Criar `infrastructure/{Entidade}Repository.ts` (implementação Prisma)
3. Refatorar controller para depender da interface (inversão de dependência)
4. Mover queries inline do controller para o repository
5. Garantir que use-cases existentes também usem o repository

---

## Fase 3: Frontend — Eliminar Inline API Calls

**Prioridade: P2**

### T3.1 — Inventariar e consolidar
**Arquivos com inline fetch/axios** (encontrados):
- `src/modules/admin/ui/pages/ApiDocsPage.tsx` (exemplos de fetch)
- `src/components/settings/BackendSelector.tsx` (fetch health)
- `src/modules/Auth.tsx` (fetch para /api/orthoplus/auth/token)

**Ação**:
- `BackendSelector.tsx` → usar `apiClient` ou hook dedicado
- `Auth.tsx` → usar `useAuth()` hook existente
- `ApiDocsPage.tsx` → código de exemplo, não é runtime (pode ignorar)

### T3.2 — Criar hooks de módulo
Para cada página que faz chamada direta, criar hook em `src/hooks/` ou `src/modules/{modulo}/hooks/`.

---

## Fase 4: Completeness — Módulos Restantes

**Prioridade: P3**

Módulos sem `domain/repositories/` (16 restantes após Fase 2):
`ai`, `analytics`, `backups`, `bi`, `comm`, `crm`, `crypto`, `dashboard`, `fidelidade`, `files`, `funcionarios`, `inadimplencia`, `lgpd`, `marketing`, `notifications`, `orcamentos`, `procedimentos`, `relatorios`, `split_pagamento`, `teleodonto`, `tiss`, `usuarios`

**Regra**: Módulos com <5 entidades OU sem mudanças nos últimos 3 meses
são excluídos da migração obrigatória (Brownfield exclusion).

---

## Sequência de Execução Contínua

```
T1.1 → T1.2 → T1.3 → T1.4   (Fase 1: Segurança — ~2-3h)
   │
   ▼
T2.1 → T2.2 → T2.3 → T2.4   (Fase 2: Top 4 módulos — ~4-6h)
   │
   ▼
T2.5 → T2.6 → T2.7 → T2.8   (Fase 2: Top 4 restantes — ~4-6h)
   │
   ▼
T3.1 → T3.2                  (Fase 3: Frontend — ~2h)
   │
   ▼
T4.1 (filtrado por brownfield)  (Fase 4: ~variável)
```

## Critérios de Aceitação por Tarefa

- [ ] `pnpm build` passa (0 erros TypeScript)
- [ ] `pnpm test` passa (636/636 unit tests)
- [ ] Sem novos `@ts-ignore` ou `as any`
- [ ] Sem regressão nos testes E2E (se aplicável)
- [ ] Commits atômicos com mensagem convencional

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| AuthContext break → login não funciona | Testar mock mode E DB mode; manter fallback cookie |
| Repository migration → testes quebram | Atualizar testes de integração; mock repository interface |
| Frontend hooks → cache inválido | Invalidar React Query cache após mudanças de auth |

