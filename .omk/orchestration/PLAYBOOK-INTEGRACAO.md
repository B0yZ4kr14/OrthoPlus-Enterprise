# PLAYBOOK-INTEGRACAO.md
# Consolidacao de Achados e Geracao de Relatorio

## Fase 4: Integracao

### Passo 1: Coletar todos os outputs
```bash
cat .omk/orchestration/frontend/*.json > /tmp/all-findings.json
cat .omk/orchestration/backend/*.json >> /tmp/all-findings.json
# ... etc
```

### Passo 2: Deduplicar
```python
# Agrupar por (arquivo, linha, tipo)
from collections import defaultdict
by_key = defaultdict(list)
for finding in all_findings:
    key = (finding["arquivo"], finding["linha"], finding["tipo"])
    by_key[key].append(finding)
```

### Passo 3: Calcular metricas
- Total de afirmacoes testadas
- Taxa de falsificacao
- Severidade distribuida
- Falsos positivos (apos verificacao)

### Passo 4: Gerar RELATORIO-FINAL.md

## Estrutura do Relatorio Final

```markdown
# RELATORIO-FINAL.md

## 1. Resumo Executivo
- Data da revisao
- Commit analisado
- Numero de agentes executados
- Metricas de qualidade

## 2. Achados por Dominio
### 2.1 Frontend
### 2.2 Backend
### 2.3 Database
### 2.4 DevOps
### 2.5 Seguranca

## 3. Achados por Severidade
### 3.1 CRITICAL
### 3.2 HIGH
### 3.3 MEDIUM
### 3.4 LOW

## 4. Padroes Sistemicos
Padroes que afetam multiplos dominios.

## 5. Acoes Recomendadas
Lista priorizada de acoes corretivas.

## 6. Metricas da Orquestracao
- Cobertura de afirmacoes
- Taxa de falsificacao
- Evidencias reprodutiveis
- Falsos positivos
- Tempo total

## 7. Evidencias
Referencias para os arquivos em evidencias/

## 8. Anexos
- Logs de execucao
- Outputs de comandos
- Screenshots (se aplicavel)
```

## Fase 5: Atualizacao de Documentacao

Se achados afetam CANONICAL.md ou AGENTS.md:
1. Corrigir os documentos
2. Commitar com mensagem apropriada
3. Sincronizar TSi-Vault
4. Atualizar OMK memory
