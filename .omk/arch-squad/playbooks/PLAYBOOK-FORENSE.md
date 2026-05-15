# Playbook Forense — Esquadrão de Arquitetura

> **Metodologia**: Cadeia de Custódia de Evidências
> **Objetivo**: Garantir que toda alegação arquitetural seja verificável e rastreável
> **Agente Modelo**: Sherlock Holmes (ARQ-10)

---

## Princípios

1. **Evidência física não mente** — O código é a única verdade; a documentação é uma teoria sobre o código
2. **Cadeia de custódia** — Toda evidência deve ter: origem, coleta, preservação, análise, apresentação
3. **Reprodutibilidade** — Qualquer agente deve poder replicar a evidência
4. **Imparcialidade** — O agente forense não defende a arquitetura; ele investiga

---

## Ciclo Forense (5 Passos)

### Passo 1: Identificação
Identificar o que precisa ser investigado.

**Fontes de investigação:**
- Documentação canônica (AGENTS.md, CANONICAL.md, PROMPT-CANONICO-CONTINUIDADE.md)
- Código-fonte (backend/src/, apps/web/src/)
- Configurações (Dockerfile, docker-compose, nginx)
- Ambientes (Local, VPS, GitHub)
- Memória persistente (TSi-Vault, OMK)

### Passo 2: Coleta
Coletar evidências com métodos forenses.

**Regras de coleta:**
- Sempre usar comandos que possam ser replicados
- Sempre capturar timestamp
- Sempre calcular hash SHA-256 da evidência
- Sempre documentar o contexto (commit, branch, ambiente)

**Formato de evidência:**
```
EVIDÊNCIA [ID]
Origem: [arquivo/ambiente]
Data/hora: [ISO 8601]
Commit: [hash]
Comando: [comando exato]
Output: [output completo ou trecho relevante]
Hash SHA-256: [hash do output]
Analista: [agente]
```

### Passo 3: Preservação
Preservar evidências para análise futura.

**Métodos:**
- Salvar outputs em arquivos textuais
- Tirar screenshots de interfaces
- Exportar configurações
- Documentar estado de containers

### Passo 4: Análise
Analisar evidências em busca de padrões e anomalias.

**Técnicas:**
- Comparação (diff entre documentação e código)
- Estatística (contagens, porcentagens, distribuições)
- Timeline (quando cada decisão foi tomada)
- Correlation (relações entre componentes)

### Passo 5: Apresentação
Apresentar conclusões de forma imparcial.

**Formato de conclusão:**
```
CONCLUSÃO [ID]
Hipótese: [o que foi testado]
Evidências: [lista de IDs de evidência]
Análise: [interpretação das evidências]
Conclusão: [CONFIRMADA / REFUTADA / INCONCLUSIVA]
Confiança: [0-100%]
Recomendação: [ação sugerida]
```

---

## Checklist de Validação Cruzada

### A. Documentação vs Código
- [ ] Cada número em AGENTS.md pode ser reproduzido por um comando no código?
- [ ] Cada módulo listado em CANONICAL.md existe em backend/src/modules/?
- [ ] Cada rota listada existe em AppRoutes.tsx?
- [ ] Cada worker listado existe em backend/src/workers/jobs/?

### B. Local vs GitHub
- [ ] Commits idênticos?
- [ ] Arquivos não commitados documentados?
- [ ] Builds passam em ambos?

### C. Local vs VPS
- [ ] Código sincronizado?
- [ ] Containers rodando com mesmas versões?
- [ ] Health checks retornam 200 em ambos?
- [ ] Login funcional em ambos?

### D. Código vs Banco
- [ ] Models Prisma == Tabelas PostgreSQL?
- [ ] Schemas Prisma == Schemas PostgreSQL?
- [ ] module_catalog == Módulos backend?
- [ ] clinic_modules == Associações ativas?

### E. Documentação vs Documentação
- [ ] AGENTS.md e CANONICAL.md têm os mesmos números?
- [ ] TSi-Vault checkpoint reflete o commit atual?
- [ ] OMK memory reflete o commit atual?
- [ ] PROMPT-CANONICO-CONTINUIDADE.md lista todas as fontes?

---

## Ferramentas Forenses

### Comandos padrão
```bash
# Hash de arquivo
sha256sum arquivo.txt

# Timestamp
TZ=UTC date -Iseconds

# Contagem verificável
find backend/src/modules -maxdepth 1 -type d | wc -l
grep -c '^model ' backend/prisma/schema.prisma
ls backend/src/workers/jobs/*.ts | wc -l

# Diff forense
git diff HEAD~1 --stat
git diff origin/main --stat

# Container forense
docker inspect --format='{{.Config.Image}}' container_name
docker inspect --format='{{.State.Health.Status}}' container_name
```

### Scripts de automação
- `scripts/orquestrar.py` (forense geral)
- `scripts/executar-fixes.py` (aplicação de correções)
- `scripts/check-errors.py` (verificação de erros)

---

## Outputs Esperados

- Diretório `evidencias/` com arquivos numerados (EV-001.txt, EV-002.txt, ...)
- Relatório `qa/RELATORIO-FORENSE-ARQUITETURAL-YYYY-MM-DD.md`
- JSON `qa/findings-arch-YYYY-MM-DD.json`
- Checklist assinado por cada agente
