# Esquadrao Canonico de Agentes — OrthoPlus Enterprise

> Versao: 1.0.0 | Data: 2026-05-15 | Metodologia: Socratica + Popperiana + Forense

---

## 1. Filosofia de Operacao

### 1.1 Principio Popperiano da Falseabilidade

Karl Popper: uma teoria cientifica so e valida se for falseavel — se puder ser refutada por evidencias empiricas.

Aplicacao a engenharia de software:
- Toda afirmacao arquitetural DEVE ser testavel
- O agente NAO confirma premissas; BUSCA EVIDENCIAS DE FALSIDADE
- "O modulo X tem clinicGuard" -> agente verifica se esta ausente
- "Existem 37 modulos" -> agente conta e reporta discrepancias

### 1.2 Metodo Socratico (Maieutica)

Socrates: "Eu sei que nada sei."

Aplicacao:
- SOCRATES nunca assume conhecimento; sempre QUESTIONA
- Perguntas de elenco (elenchus) expoem contradicoes
- Dialogo dialetico: tese -> antitese -> sintese

### 1.3 Rigor Forense

- Evidencias REPRODUTIVEIS e RASTREAVEIS
- Todo achado: arquivo, linha, comando, output real
- Chain of custody: timestamp -> agente -> evidencia -> veredito

---

## 2. Estrutura do Esquadrao

```
SQUADRAO-CANONICO/
├── SQUADRAO-CANONICO.md          <- Definicao do esquadrao
├── PLANO-ORQUESTRACAO.md         <- Plano mestre
├── PLAYBOOK-SOCRATICO.md         <- Modo Socratico
├── PLAYBOOK-POPPERIANO.md        <- Modo Popperiano
├── PLAYBOOK-FORENSE.md           <- Revisao forense
├── PLAYBOOK-INTEGRACAO.md        <- Consolidacao
│
├── frontend/
│   ├── AGENTE-SOCRATES-FE.md
│   ├── AGENTE-POPPER-FE.md
│   ├── AGENTE-ARQUITETO-FE.md
│   └── PLAYBOOK-FE.md
│
├── backend/
│   ├── AGENTE-SOCRATES-BE.md
│   ├── AGENTE-POPPER-BE.md
│   ├── AGENTE-ARQUITETO-BE.md
│   └── PLAYBOOK-BE.md
│
├── database/
│   ├── AGENTE-SOCRATES-DB.md
│   ├── AGENTE-POPPER-DB.md
│   ├── AGENTE-ARQUITETO-DB.md
│   └── PLAYBOOK-DB.md
│
├── devops/
│   ├── AGENTE-SOCRATES-DEV.md
│   ├── AGENTE-POPPER-DEV.md
│   ├── AGENTE-ARQUITETO-DEV.md
│   └── PLAYBOOK-DEV.md
│
├── security/
│   ├── AGENTE-SOCRATES-SEC.md
│   ├── AGENTE-POPPER-SEC.md
│   ├── AGENTE-ARQUITETO-SEC.md
│   └── PLAYBOOK-SEC.md
│
└── qa/
    ├── AGENTE-INTEGRADOR.md
    ├── AGENTE-VERIFICADOR.md
    └── RELATORIO-FINAL.md
```

---

## 3. Agentes Definidos

### 3.1 AGENTE-SOCRATES

Funcao: Questionador dialetico.

Modo de operacao:
1. Recebe afirmacao sobre o projeto
2. Formula perguntas de elenco
3. Executa comandos para verificar
4. Reporta contradicoes FACTUAIS

### 3.2 AGENTE-POPPER

Funcao: Falsificador.

Modo de operacao:
1. Recebe teoria/hipotese
2. Formula experimento de falsificacao
3. Executa o experimento
4. Se falsificado -> reporta com evidencia
5. Se nao falsificado -> reporta "nao-falsificado" (NAO "confirmado")

### 3.3 AGENTE-ARQUITETO

Funcao: Especialista senior por dominio.

Modo de operacao:
1. Conhece melhores praticas atuais
2. Compara estado atual com praticas recomendadas
3. Identifica gaps e devedores tecnicos
4. Prioriza por impacto

---

## 4. Ciclo de Orquestracao

FASE 0: PREPARACAO
  - Extrair afirmacoes de AGENTS.md e CANONICAL.md
  - Catalogar teorias arquiteturais

FASE 1: SOCRATICO
  - SOCRATES questiona cada afirmacao
  - Gera lista de hipoteses a testar

FASE 2: POPPERIANO
  - POPPER falsifica cada hipotese
  - Gera evidencias de falsificacao

FASE 3: ARQUITETURAL
  - ARQUITETO compara com melhores praticas
  - Identifica gaps tecnicos

FASE 4: INTEGRACAO
  - INTEGRADOR consolida achados
  - VERIFICADOR re-testa criticos

FASE 5: RELATORIO
  - RELATORIO-FINAL.md
  - Atualizacao de CANONICAL.md se necessario

---

## 5. Definicoes Canonicas

| Termo | Definicao |
|-------|-----------|
| Afirmacao | Declaracao factual sobre o projeto |
| Hipotese | Afirmacao testavel |
| Teoria | Conjunto de hipoteses coerentes |
| Falsificacao | Evidencia que prova hipotese falsa |
| Nao-falsificado | Sem evidencia de falsificacao |
| Evidencia | Output reprodutivel de comando |
| Contradicao | Duas afirmacoes incompativeis |

---

## 6. Metricas de Qualidade

| Metrica | Alvo |
|---------|------|
| Afirmacoes testadas | 100% do CANONICAL + AGENTS.md |
| Taxa de falsificacao | maior que 0% (se 0%, suspeito) |
| Evidencias reprodutiveis | 100% |
| Falsos positivos | menor que 5% |
| Tempo por dominio | menor que 15 min |

---

## 7. Ativacao

```bash
python3 .omk/orchestration/scripts/preparar.py
python3 .omk/orchestration/scripts/executar-socratico.py --dominio=frontend
python3 .omk/orchestration/scripts/executar-popperiano.py --dominio=backend
python3 .omk/orchestration/scripts/integrar.py
python3 .omk/orchestration/scripts/relatorio.py
```

---

"A verdadeira funcao do cientista e buscar a verdade, mas saber que nunca a
possuira completamente. O melhor que pode fazer e aproximar-se dela
eliminando erros." — Karl Popper
