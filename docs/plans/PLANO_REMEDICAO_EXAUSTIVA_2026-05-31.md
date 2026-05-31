# Plano de Remediação Exaustiva — OrthoPlus Enterprise

**Data**: 2026-05-31  
**Baseado em**: Análise GitNexus + SpecKit + OMK + Documentações  
**Status**: Em execução

---

## 1. ANÁLISE EXECUTIVA

### Quality Gates Atuais
| Gate | Status |
|------|--------|
| Frontend lint | 0 errors, 55 warnings |
| Backend lint | 0 errors, ~560 warnings |
| Frontend type-check | ✅ PASS |
| Backend build | ✅ PASS |
| Frontend tests | 1165/113 suites ✅ |
| Backend tests | 755/52 suites ✅ |
| VPS health | 9/9 PASS |

### Métricas do Projeto (GitNexus)
- 32.738 nodes | 67.750 edges | 688 clusters | 279 flows
- 39 módulos frontend | 38 módulos backend

---

## 2. FINDINGS CATEGORIZADOS

### 🔴 P0 — CRÍTICO (Segurança/Disponibilidade)
1. **Nenhum encontrado** — todos os gates de segurança estão passando

### 🟠 P1 — ALTO (Bugs, Inconsistências)
1. **Rotas órfãs sem sidebar**: `/dashboard`, `/assinatura-icp`, `/memory-hub`, `/fluxo-digital`, `/help`
2. **Sub-rotas admin sem sidebar**: `/admin/adrs`, `/admin/api-docs`, `/admin/audit-trail`, `/admin/logs`
3. **TODOs ativos**: 3 TODOs reais de funcionalidade pendente
4. **Cores dark: hardcoded**: 130 ocorrências (reduzido de ~400+)

### 🟡 P2 — MÉDIO (Dead Code, Entropia)
1. **Console.logs frontend**: 9 em arquivos de logger (intencionais)
2. **Exports não utilizados**: identificados via ts-prune
3. **Documentação archived**: 100+ arquivos legados em docs/.archived/
4. **CI continue-on-error**: 9 blocos em 5 workflows

### 🟢 P3 — BAIXO (Melhorias)
1. **Refatoração any types**: ~560 warnings backend
2. **Otimização de chunks**: bundle size pode ser reduzido
3. **Specs pendentes**: 12 features unspecced

---

## 3. PLANO DE EXECUÇÃO

### Fase A: Correções Rápidas (Seguras)
- [ ] Adicionar rotas órfãs à sidebar
- [ ] Remover dead code identificado
- [ ] Limpar TODOs resolvidos
- [ ] Atualizar AGENTS.md com métricas atuais

### Fase B: Configurações e Paridade
- [ ] Verificar .env.example vs .env.production.example
- [ ] Validar docker-compose configs
- [ ] Verificar nginx.conf vs VPS

### Fase C: Validação Final
- [ ] Rodar todos os quality gates
- [ ] VPS health check
- [ ] Commit e push
