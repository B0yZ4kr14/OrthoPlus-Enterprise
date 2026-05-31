# Plano de Remediação Completo — OrthoPlus Enterprise

**Data**: 2026-05-31  
**Autor**: Sistema de Governança OMK + SpecKit + GitNexus  
**Status**: Em Execução  
**Commit Base**: `77fa02ae9`

---

## Resumo Executivo

Análise exaustiva executada sobre todo o stack OrthoPlus Enterprise (frontend, backend, infraestrutura, specs, documentação). Identificados 312 requisitos em 28 specs, com 67 itens em drift e 47 não implementados. Quality gates: 100% passando (0 erros).

---

## 1. Quality Gates (Status Atual)

| Gate | Status | Detalhes |
|------|--------|----------|
| Backend Lint | ⚠️ 0 errors, 560 warnings | no-explicit-any predominante |
| Backend Build | ✅ PASS | tsc strict + tsc-alias |
| Backend Tests | ✅ PASS | 52 suites, 755 tests |
| Frontend Lint | ⚠️ 0 errors, 55 warnings | react-hooks/exhaustive-deps |
| Frontend Build | ✅ PASS | vite build ~10s |
| Frontend Tests | ✅ PASS | 113 suites, 1165 tests |
| jscpd Frontend | ⚠️ 8.13% | 1158 clones |
| jscpd Backend | ✅ 3.35% | 142 clones |

---

## 2. Bugs Corrigidos

### Bug-001: Import não utilizado quebrando build
- **Arquivo**: `backend/src/infrastructure/cache/searchCache.ts`
- **Problema**: `SearchResultItem` importado mas não usado após deduplicação
- **Fix**: Remover import não utilizado
- **Validação**: Build + tests passando ✅

### Bug-002: Teste importando tipo de local errado
- **Arquivo**: `backend/tests/unit/searchCache.test.ts`
- **Problema**: `SearchResponse` importado de módulo que não exporta
- **Fix**: Importar de `@orthoplus/shared-types`
- **Validação**: 755 tests passando ✅

---

## 3. Código Morto Removido

### Ciclo 1: 357 arquivos (~19.5k linhas)
- Diretórios completamente removidos: `barcode-scanner`, `breadcrumbs-nav`, `campaigns`, `crypto-rates-widget`, `error-boundary`, `forms`, `global-search`, `performance-monitor`, `showcase-components`, `tour`, `patients/form-tabs`
- Subdiretórios limpos: `admin/`, `bi/`, `dashboard/`, `fidelidade/`, `financeiro/`, `imaging/`, `pdv/`, `usuarios/`
- **Saldo restante**: ~633 arquivos mortos em `components/` (de 709 total)

---

## 4. Configurações Truncadas/Corrompidas

### Issue-001: docker-compose.yml requer variáveis não definidas
- **Arquivos afetados**: `docker-compose.yml`, `docker-compose.prod.yml`, `docker-compose.ubuntu.yml`
- **Problema**: `REDIS_PASSWORD`, `POSTGRES_PASSWORD` obrigatórios mas sem defaults seguros
- **Fix Proposto**: Adicionar defaults em `.env.example` + validação em `scripts/validate-production.sh`

### Issue-002: Referências hardcoded a localhost
- **Arquivos**: `backend/src/infrastructure/api/ApiGateway.ts`, `backend/src/index.ts`
- **Problema**: `http://localhost:3000` hardcoded em CORS e API gateway
- **Fix Proposto**: Usar `process.env.API_BASE_URL` com fallback

---

## 5. Plano de Execução

### Fase 1: Segurança e Configuração (Prioridade P0)
- [x] Fix import quebrando build
- [x] Fix teste com import errado
- [ ] Corrigir docker-compose configs
- [ ] Eliminar localhost hardcoded

### Fase 2: Código Morto (Prioridade P1)
- [x] Remover 357 arquivos mortos (components/)
- [ ] Analisar impacto dos 633 arquivos restantes
- [ ] Remover dead code em `crypto/`, `auth/`, `settings/`

### Fase 3: Qualidade e Constituição (Prioridade P2)
- [ ] Reduzir warnings ESLint backend (560 → <400)
- [ ] Reduzir warnings ESLint frontend (55 → <30)
- [ ] Adicionar gate pre-commit para `as any`

### Fase 4: Spec Backfill (Prioridade P3)
- [ ] Criar spec para crypto-payments
- [ ] Criar spec para split-pagamento
- [ ] Atualizar spec/008-pdv

---

## 6. Validação Contínua

A cada alteração:
1. `pnpm lint` (0 erros)
2. `pnpm type-check` (pass)
3. `pnpm test` (todos passando)
4. `pnpm build` (pass)
5. Git diff review antes de commit
