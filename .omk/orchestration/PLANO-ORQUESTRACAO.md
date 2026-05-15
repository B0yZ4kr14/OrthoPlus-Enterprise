# PLANO-ORQUESTRACAO.md
# Plano Mestre de Orquestracao Forense Popperiana-Socratica

> Versao: 1.0.0 | Data: 2026-05-15 | Projeto: OrthoPlus Enterprise

---

## 1. Resumo Executivo

Este plano orquestra um esquadrao de agentes especialistas para realizar
uma revisao forense completa do projeto OrthoPlus Enterprise, aplicando:
- Metodo Socratico (questionamento dialetico)
- Falseabilidade Popperiana (refutacao de teorias)
- Rigor Forense (evidencias reprodutiveis)

## 2. Escopo da Revisao

### 2.1 Documentos Alvo
- AGENTS.md (referencia do projeto)
- docs/CANONICAL-2026-05-14.md (documentacao canonica)
- backend/src/index.ts (registro de routers)
- backend/prisma/schema.prisma (modelos de dados)
- apps/web/src/routes/AppRoutes.tsx (rotas frontend)
- apps/web/src/modules/*/ (modulos frontend)
- backend/src/modules/*/ (modulos backend)
- backend/src/workers/ (cron jobs)
- Docker configs (Dockerfile, docker-compose, nginx)
- .env configs (sem expor secrets)

### 2.2 Afirmacoes a Testar

| # | Afirmacao | Domínio | Tipo |
|---|-----------|---------|------|
| 1 | Existem 37 modulos no backend | Backend | Contagem |
| 2 | Existem 180 models no Prisma | Database | Contagem |
| 3 | Existem 17 schemas no PostgreSQL | Database | Contagem |
| 4 | Existem 60 rotas no frontend | Frontend | Contagem |
| 5 | Todos os routers tem clinicGuard | Backend | Seguranca |
| 6 | Health checks sao publicos | Backend | Seguranca |
| 7 | Auth usa JWT com expiracao 24h | Backend | Seguranca |
| 8 | Rate limiting esta configurado | Backend | Seguranca |
| 9 | Helmet protege headers HTTP | Backend | Seguranca |
| 10 | Frontend build passa sem erros | Frontend | Build |
| 11 | Backend build passa sem erros | Backend | Build |
| 12 | Docker containers estao healthy | DevOps | Infra |
| 13 | DB tem 180 tabelas | Database | Contagem |
| 14 | module_catalog tem 37 entradas | Database | Contagem |
| 15 | clinic_modules tem 37 entradas | Database | Contagem |
| 16 | Login funciona com admin/admin123 | Auth | Funcional |
| 17 | Redis esta autenticado | DevOps | Seguranca |
| 18 | CSP headers estao configurados | Security | Seguranca |
| 19 | Lazy imports resolvem corretamente | Frontend | Funcional |
| 20 | Nao ha rotas duplicadas | Frontend | Qualidade |

## 3. Fases de Execucao

### FASE 0: PREPARACAO (5 min)
- [ ] Extrair afirmacoes de AGENTS.md e CANONICAL.md
- [ ] Catalogar teorias arquiteturais
- [ ] Criar diretorio de evidencias
- [ ] Verificar estado atual do projeto (git, docker, db)

### FASE 1: SOCRATICO (15 min)
- [ ] SOCRATES-FE questiona afirmacoes frontend
- [ ] SOCRATES-BE questiona afirmacoes backend
- [ ] SOCRATES-DB questiona afirmacoes database
- [ ] SOCRATES-DEV questiona afirmacoes devops
- [ ] SOCRATES-SEC questiona afirmacoes seguranca
- [ ] Consolidar hipoteses geradas

### FASE 2: POPPERIANO (20 min)
- [ ] POPPER-FE falsifica hipoteses frontend
- [ ] POPPER-BE falsifica hipoteses backend
- [ ] POPPER-DB falsifica hipoteses database
- [ ] POPPER-DEV falsifica hipoteses devops
- [ ] POPPER-SEC falsifica hipoteses seguranca
- [ ] Consolidar falsificacoes encontradas

### FASE 3: ARQUITETURAL (20 min)
- [ ] ARQUITETO-FE compara com melhores praticas frontend
- [ ] ARQUITETO-BE compara com melhores praticas backend
- [ ] ARQUITETO-DB compara com melhores praticas database
- [ ] ARQUITETO-DEV compara com melhores praticas devops
- [ ] ARQUITETO-SEC compara com melhores praticas seguranca
- [ ] Consolidar gaps tecnicos

### FASE 4: INTEGRACAO (10 min)
- [ ] INTEGRADOR consolida todos os achados
- [ ] VERIFICADOR re-testa achados CRITICAL e HIGH
- [ ] Calcular metricas de qualidade
- [ ] Identificar falsos positivos

### FASE 5: RELATORIO (10 min)
- [ ] Gerar RELATORIO-FINAL.md
- [ ] Atualizar CANONICAL.md se necessario
- [ ] Atualizar AGENTS.md se necessario
- [ ] Commitar mudancas
- [ ] Sincronizar TSi-Vault

## 4. Paralelizacao

```
Fase 1 (Socratico):
  SOCRATES-FE || SOCRATES-BE || SOCRATES-DB || SOCRATES-DEV || SOCRATES-SEC

Fase 2 (Popperiano):
  POPPER-FE || POPPER-BE || POPPER-DB || POPPER-DEV || POPPER-SEC

Fase 3 (Arquitetural):
  ARQUITETO-FE || ARQUITETO-BE || ARQUITETO-DB || ARQUITETO-DEV || ARQUITETO-SEC

Fase 4 (Integracao):
  Sequencial: INTEGRADOR -> VERIFICADOR

Fase 5 (Relatorio):
  Sequencial: Relatorio -> Atualizacao -> Commit
```

## 5. Critérios de Sucesso

| Criterio | Meta | Como Verificar |
|----------|------|----------------|
| Cobertura de afirmacoes | 100% | Contagem / total |
| Taxa de falsificacao | >0% | # falsificacoes / # testes |
| Evidencias reprodutiveis | 100% | Cada achado tem comando |
| Falsos positivos | <5% | Re-verificacao |
| Tempo total | <90 min | Timestamp inicio/fim |
| Relatorio gerado | Sim | RELATORIO-FINAL.md existe |

## 6. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Agentes de pesquisa Firecrawl nao retornam | Media | Baixo | Usar conhecimento interno do projeto |
| Timeout em comandos longos | Media | Baixo | Definir timeouts adequados |
| Estado do projeto muda durante revisao | Baixa | Alto | Congelar estado com git stash |
| Falso positivo em lazy imports | Alta | Baixo | Verificar barrel exports |

## 7. Comandos de Ativacao

```bash
# Preparacao
python3 .omk/orchestration/scripts/preparar.py

# Execucao paralela por fase
python3 .omk/orchestration/scripts/fase1-socratico.py --all
python3 .omk/orchestration/scripts/fase2-popperiano.py --all
python3 .omk/orchestration/scripts/fase3-arquitetural.py --all

# Integracao e relatorio
python3 .omk/orchestration/scripts/fase4-integrar.py
python3 .omk/orchestration/scripts/fase5-relatorio.py
```

## 8. Entregaveis

1. RELATORIO-FINAL.md — achados consolidados
2. evidencias/ — diretorio com evidencias forenses
3. CANONICAL.md atualizado (se necessario)
4. AGENTS.md atualizado (se necessario)
5. Lista de acoes corretivas priorizadas

---

> "Nosso conhecimento so pode ser finito, enquanto nossa ignorancia deve
> necessariamente ser infinita." — Karl Popper
