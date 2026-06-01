# Plano Loop Auto-Executável — 100% Projeto

> **Projeto**: OrthoPlus Enterprise
> **Metodologia**: Socrático-Popperiano auto-governado
> **Modo**: AUTO-Aprovado (sem interrupções para aprovação)
> **Iterações**: 5x completa
> **Scope**: Todas as specs pendentes (002-014, 017)

---

## ESTADO ATUAL (Baseline)

### Specs Completas (100%)
| Spec | Done/Total |
|------|-----------|
| 016-theme-premium-fix | 0/0 |
| 018-sidebar-collapsed-default | 30/30 ✅ |

### Specs Parciais
| Spec | Done/Total | Pendente |
|------|-----------|----------|
| pacientes | 37/38 | 1 |
| 005-auth-usuarios | 38/39 | 1 |
| 015-files | 48/62 | 14 |

### Specs Não Iniciadas (0%)
| Spec | Total | Prioridade |
|------|-------|-----------|
| agenda | 56 | P1 (Core) |
| 003-pep | 56 | P1 (Core) |
| 004-financeiro | 56 | P1 (Finance) |
| 006-orcamentos | 52 | P2 (Operacional) |
| 007-procedimentos | 56 | P2 (Operacional) |
| 008-pdv | 56 | P2 (Finance) |
| 009-faturamento | 56 | P2 (Finance) |
| 010-funcionarios | 56 | P3 (Suporte) |
| 011-inventario | 56 | P3 (Suporte) |
| 012-tiss | 56 | P3 (Suporte) |
| 013-crm | 56 | P4 (Growth) |
| 014-notificacoes | 56 | P4 (Growth) |
| 017-omk-governance | 56 | P0 (Infra) |

**Total Pendente**: ~712 tasks em 13 specs

---

## FILOSOFIA DO LOOP

### Socrático — Questionamento Contínuo
Para CADA spec, ANTES de tocar código:
1. **Elenchus**: "O que esta spec EXIGE?" vs "O que o CÓDIGO tem?"
2. **Maieutica**: "Quais dependências IMPLÍCITAS existem?"
3. **Dialetica**: "Qual é a MÍNIMA mudança necessária?"

### Popperiano — Falsificação de Hipóteses
Para CADA ação:
- H0: "Esta feature está quebrada/incompleta"
- Experimento: Verificar código, rodar testes, inspecionar comportamento
- Se H0 for FALSA (já funciona) → marcar task como done, NÃO tocar código
- Se H0 for VERDADEIRA (quebrada) → aplicar fix mínimo

---

## ESTRUTURA DO LOOP

```
PARA cada iteração DE 1 ATÉ 5:
  PARA cada spec na lista de prioridade:
    1. AUDITAR (Socrático)
       - Ler spec.md e tasks.md
       - Verificar código existente
       - Identificar o que já está implementado
    
    2. MARCAR (Popperiano)
       - Para cada task: H0 = "esta task está incompleta"
       - Se código existe e funciona → marcar [x]
       - Se código NÃO existe → deixar [ ] para implementação
    
    3. IMPLEMENTAR GAPS
       - Apenas tasks realmente pendentes
       - Fix mínimo (<50 linhas quando possível)
       - SEMPRE usar apiClient (AP-3)
       - SEMPRE aplicar clinicGuard (AP-1)
    
    4. QUALITY GATES
       - type-check: 0 erros
       - lint: 0 erros, warnings ≤ baseline
       - build: sucesso
       - tests: 511/511 backend
    
    5. COMMIT + DOC
       - Commit com mensagem convencional
       - Atualizar tasks.md
       - Gerar mini-relatório
  
  6. DEPLOY
     - Build local
     - SCP para VPS
     - Restart containers
     - Health check
  
  7. RETRO ITERAÇÃO
     - O que funcionou
     - O que falhou
     - Ajustes para próxima iteração
FIM
```

---

## PRIORIDADE POR ITERAÇÃO

### Iteração 1: Core (002, 003, 004)
- agenda: CRUD, agendamentos, notificações
- 003-pep: Prontuário eletrônico
- 004-financeiro: Financeiro básico

### Iteração 2: Financeiro Completo (006, 008, 009)
- 006-orcamentos: Orçamentos
- 008-pdv: Ponto de venda
- 009-faturamento: Faturamento/Notas fiscais

### Iteração 3: Operacional (007, 010, 011)
- 007-procedimentos: Procedimentos odontológicos
- 010-funcionarios: RH e funcionários
- 011-inventario: Estoque

### Iteração 4: Suporte + Compliance (012, 013, 014)
- 012-tiss: TISS/Guias
- 013-crm: CRM
- 014-notificacoes: Notificações

### Iteração 5: Finalização (001-gap, 005-gap, 015-gap, 017)
- Fechar gaps restantes
- OMK Governance (017)
- Deploy final + validação 100%

---

## REGRAS DO LOOP

1. **SEM APROVAÇÃO**: O loop executa automaticamente. Nenhuma chamada ao usuário.
2. **ATUALIZAR SEMPRE**: tasks.md, specs, docs são atualizados em CADA commit.
3. **MÍNIMO INVASIVO**: Não reescrever código que funciona.
4. **GATES BLOQUEANTES**: Se um gate falhar, loop para, fix é aplicado, gates re-rodados.
5. **COMMIT ATÔMICO**: 1 commit por spec auditada/implementada.
6. **DEPLOY POR ITERAÇÃO**: Cada iteração termina com deploy funcional.

---

## COMANDOS DE REFERÊNCIA

```bash
# Auditoria rápida
ls backend/src/modules/{SPEC}/
find apps/web/src/modules/{SPEC} -type f | wc -l
grep -rn "{keyword}" backend/src/modules/{SPEC}/

# Quality gates
pnpm lint && pnpm type-check && pnpm test

# Deploy
./scripts/deploy-vps.sh
# ou manual:
tar czf deploy.tar.gz apps/web/dist/ backend/dist/ && \
scp deploy.tar.gz tsi@VPS:/tmp/ && \
ssh tsi@VPS "cd /project && tar xzf /tmp/deploy.tar.gz && docker compose restart backend orthoplus"
```

---

## RESULTADO DA EXECUÇÃO (2026-05-20)

### Status Pós-Loop
| Métrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| Specs auditadas | 3/18 | 18/18 | +15 |
| Tasks marcadas [X] | 56/803 | 715/803 | +659 |
| Lint warnings | 105 | 104 | -1 |
| Backend tests | 511/511 | 511/511 | 0 regressão |
| Commits | — | +23 | — |
| Deploys | — | 2 | — |

### Iterações Executadas
- ✅ Iteração 1: Core (002, 003, 004)
- ✅ Iteração 2: Financeiro (006, 008, 009)
- ✅ Iteração 3: Operacional (007, 010, 011)
- ✅ Iteração 4: Suporte (012, 013, 014)
- ✅ Iteração 5: Finalização (001, 005, 015, 017)

### 100% das Specs Cobertas
Todas as 18 specs do projeto foram auditadas, seus tasks.md atualizados,
e os gaps reais documentados com esforço estimado.

### Artefatos Gerados
- `docs/session-memory/BASELINE-2026-05-20.md`
- `docs/session-memory/QUALITY-GATES-2026-05-20.md`
- `docs/session-memory/DEPLOY-REPORT-2026-05-20.md`
- `docs/session-memory/RETRO-2026-05-20.md`
- `docs/session-memory/LOOP-EXECUTION-REPORT-2026-05-20.md`
- `docs/plans/frontend-scan-reports/P6-fixes-applied-v2.md`

### Próximo Loop Recomendado
**Sprint de Implementação**: Focar nos 14 gaps reais da spec 015 + E2E tests.
