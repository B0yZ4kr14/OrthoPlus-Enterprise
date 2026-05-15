# FIX-SQUADRAO-CANONICO.md
# Esquadrao Canonico de Correcoes — OrthoPlus Enterprise

> Versao: 1.0.0 | Data: 2026-05-15 | Baseado em: findings-2026-05-15.json
> Metodologia: Popperiana aplicada a correcoes (cada fix DEVE ser testavel)

---

## 1. Filosofia de Correcao

### 1.1 Principio do Fix Minimo

> "A correcao mais segura e a mais pequena que resolve o problema."

- NUNCA refatorar durante um fix (a menos que seja o proprio fix)
- NUNCA alterar comportamento nao relacionado
- SEMPRE verificar se o fix nao introduziu novos problemas

### 1.2 Popperiano Aplicado a Correcoes

Para cada delacao do esquadrao forense:
1. **Receber**: Ler o achado e a evidencia
2. **Analisar**: Entender a causa raiz (5 Whys)
3. **Hipotetizar**: "Se eu fizer X, o teste Popperiano passara"
4. **Executar**: Aplicar a correcao minima
5. **Falsificar**: Rodar o mesmo teste que falhou antes. Se ainda falhar -> fix incompleto
6. **Verificar**: Rodar build, testes, lint
7. **Documentar**: Atualizar docs se a delacao era de inconsistencia doc-codigo

### 1.3 Regra de Ouro

> Um fix so esta completo quando o teste Popperiano que antes falhava agora passa.

---

## 2. Estrutura do Esquadrao de Fixes

```
FIX-SQUADRAO/
├── FIX-SQUADRAO-CANONICO.md      <- Este arquivo
├── PLANO-EXECUCAO-FIXES.md       <- Plano de execucao dos fixes
├── PLAYBOOK-FIX.md               <- Como executar correcoes
├── PLAYBOOK-VERIFICACAO.md       <- Como verificar pos-fix
│
├── frontend/
│   ├── FIX-FE.md                 <- Agente executor frontend
│   ├── DELACOES-FE.md            <- Delacoes recebidas do forense
│   └── VERIFICADO-FE.md          <- Resultado pos-fix
│
├── backend/
│   ├── FIX-BE.md
│   ├── DELACOES-BE.md
│   └── VERIFICADO-BE.md
│
├── database/
│   ├── FIX-DB.md
│   ├── DELACOES-DB.md
│   └── VERIFICADO-DB.md
│
├── devops/
│   ├── FIX-DEV.md
│   ├── DELACOES-DEV.md
│   └── VERIFICADO-DEV.md
│
├── security/
│   ├── FIX-SEC.md
│   ├── DELACOES-SEC.md
│   └── VERIFICADO-SEC.md
│
├── qa/
│   ├── FIX-INTEGRADOR.md         <- Consolida fixes de todos os dominios
│   ├── FIX-VERIFICADOR.md        <- Re-testa tudo apos fixes
│   └── RELATORIO-FIXES.md        <- Relatorio final de correcoes
│
└── scripts/
    ├── executar-fixes.py         <- Motor de execucao de fixes
    └── verificar-pos-fix.py      <- Motor de verificacao
```

---

## 3. Agentes de Correcao Definidos

### 3.1 FIX-[DOMINIO] (Executor)

Funcao: Receber uma delacao e executar a correcao.

Modo de operacao:
1. Ler a delacao (hipotese falsificada + evidencia + comando)
2. Identificar o arquivo/linha exatos
3. Determinar a correcao minima
4. Aplicar a correcao
5. Salvar diff da mudanca
6. Reportar: DELACAO -> ACAO -> RESULTADO

Prompt base:
Voce e FIX-[DOMINIO], o executor de correcoes. Sua funcao e resolver
problemas encontrados pelo esquadrao forense. Para cada delacao:
1. Nao invente solucoes — use a evidencia como guia
2. Faca a mudanca MINIMA necessaria
3. Nao altere comportamentos nao relacionados
4. Se o fix envolver documentacao, atualize-a
5. Reporte: o que foi mudado, por que, e o resultado

### 3.2 FIX-INTEGRADOR

Funcao: Orquestrar a execucao de fixes em ordem correta.

Regras de dependencia:
- Fixes de database antes de backend (se mudar schema)
- Fixes de backend antes de frontend (se mudar API)
- Fixes de devops por ultimo (se reiniciar containers)
- Fixes independentes podem rodar em paralelo

### 3.3 FIX-VERIFICADOR

Funcao: Rodar os mesmos testes Popperianos apos os fixes.

Criterio de sucesso:
- Se antes era FALSIFICADO -> agora deve ser NAO-FALSIFICADO
- Build deve passar
- Testes devem passar
- Lint deve passar

---

## 4. Ciclo de Execucao de Fixes

```
FASE 0: TRIAGEM
  - Ler findings.json do esquadrao forense
  - Classificar fixes por: severidade, dependencia, esforco
  - Atribuir a agentes por dominio

FASE 1: ANALISE (5 Whys)
  - Para cada delacao, perguntar "por que?" 5 vezes
  - Identificar causa raiz (nao so sintoma)
  - Definir fix minimo

FASE 2: EXECUCAO
  - FIX-[DOMINIO] aplica a correcao
  - Salva diff
  - Marca como PENDENTE_VERIFICACAO

FASE 3: VERIFICACAO POPPERIANA
  - FIX-VERIFICADOR roda o mesmo teste que falhou
  - Se passar -> fix confirmado
  - Se falhar -> retorna para FASE 2

FASE 4: TESTES DE REGRESSAO
  - Build completo (frontend + backend)
  - Testes unitarios
  - Lint
  - Type check

FASE 5: DOCUMENTACAO
  - Se a delacao era de inconsistencia doc-codigo -> atualizar docs
  - Atualizar AGENTS.md, CANONICAL.md se necessario
  - Commit com mensagem convencional

FASE 6: RELATORIO
  - RELATORIO-FIXES.md com todas as correcoes
  - Metricas: fixes aplicados, falsos positivos, tempo
```

---

## 5. Metricas de Qualidade do Fix

| Metrica | Alvo | Como medir |
|---------|------|------------|
| Fixes confirmados | 100% dos HIGH/CRITICAL | Teste Popperiano pos-fix |
| Regressoes introduzidas | 0 | Build + testes + lint |
| Tempo medio por fix | < 10 min | Timestamp inicio/fim |
| Documentacao atualizada | 100% dos doc-related | Verificacao manual |

---

## 6. Ativacao

```bash
# Fase 0: Triagem
python3 .omk/fix-squad/scripts/executar-fixes.py --fase=triagem

# Fases 1-3: Analise + Execucao + Verificacao
python3 .omk/fix-squad/scripts/executar-fixes.py --fase=execucao --dominio=backend

# Fases 4-6: Regressao + Documentacao + Relatorio
python3 .omk/fix-squad/scripts/executar-fixes.py --fase=finalizacao
```
