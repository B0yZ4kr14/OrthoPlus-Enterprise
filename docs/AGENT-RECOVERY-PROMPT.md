# ORTHOPLUS ENTERPRISE — AGENT RECOVERY PROMPT
## Método Socrático-Popperiano de Documentação e Recuperação de Memória

> **Versão:** 1.0.0  
> **Data:** 2026-05-14  
> **Método:** Socrático (elenchus) + Popperiano (falsificabilidade)  
> **Documentação Canônica:** `vault:tsi-vault/orthoplus/canonical/OrthoPlus-Enterprise-Canonical-2026-05-14.md`  
> **Estado OMK:** `orthoplus/state-2026-05-14-final.json`

---

## PRINCÍPIO FUNDAMENTAL (POPPER)

> **"Toda documentação é uma conjectura até ser falsificada pelo sistema real."**

**REGRA DE OURO:** NUNCA confie cegamente na documentação. SEMPRE verifique o sistema real. Uma documentação não testada é uma hipótese não corroborada — e hipóteses não corroboradas podem estar erradas.

---

## FASE 1: RECUPERAÇÃO DE MEMÓRIA (Obrigatória)

### 1.1 Leitura Obrigatória (Sequencial)

ANTES de qualquer ação, leia NA ORDEM:

1. **Estado OMK:** `orthoplus/state-2026-05-14-final.json` — memória persistente mais recente
2. **Documentação Canônica:** `vault:tsi-vault/orthoplus/canonical/OrthoPlus-Enterprise-Canonical-2026-05-14.md` — verdade absoluta do projeto
3. **Plano Ativo:** `vault:tsi-vault/orthoplus/plans/active-plan-2026-05-14.md`
4. **Tarefas:** `vault:tsi-vault/orthoplus/tasks/tasks-2026-05-14.md`
5. **AGENTS.md local:** `~/Projects/OrthoPlus-Enterprise/AGENTS.md` — convenções e estado atual

### 1.2 Diálogo Socrático de Recuperação

Após ler, responda a si mesmo (ou ao usuário) estas perguntas:

**SOCRATES pergunta ao AGENTE:**

1. *"O que você LEU na documentação?"* — Resuma em 3 parágrafos.
2. *"O que você NÃO ENTENDEU?"* — Liste ambiguidades.
3. *"O que parece CONTRADITÓRIO?"* — Documentação vs. outra documentação.
4. *"O que é INVEROSSÍMIL?"* — Afirmações que parecem desatualizadas.

**Se você não consegue responder às 4 perguntas, RELEIA.**

---

## FASE 2: FALSIFICAÇÃO POPPERIANA (Obrigatória)

### 2.1 O Método da Falseabilidade

Para CADA afirmação importante da documentação canônica, execute **PELO MENOS UM** teste de falsificação:

| Afirmação da Doc | Teste de Falsificação | Comando/Verificação |
|---|---|---|
| "Backend v2.5.2 rodando" | `docker ps` no VPS + `curl /health` | `ssh root@100.111.74.69 "docker ps && curl -s http://localhost:3005/health"` |
| "Frontend v2.9.8 rodando" | `docker ps` no VPS + acesso HTTP | `curl -sI https://tsiapp.io/OrthoPlus-Enterprise/` |
| "367 testes passando" | Rodar testes localmente | `cd backend && pnpm test` |
| "0 erros TypeScript" | Rodar type-check | `cd backend && npx tsc --noEmit && cd apps/web && npx tsc --noEmit` |
| "Login funcional" | Testar auth endpoint | `curl -X POST http://localhost:3005/api/auth/token -d '{"email":"admin@orthoplus.com","password":"admin123!"}'` |
| "37 módulos ativos" | Verificar active-modules | `curl -H "Authorization: Bearer $TOKEN" http://localhost:3005/api/clinics/{id}/active-modules` |
| "180 tabelas no banco" | Contar tabelas no PostgreSQL | `psql -U orthoplus -d orthoplus -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');"` |

### 2.2 Regra dos 3 Falsificações Mínimas

**VOCÊ DEVE falsificar no MÍNIMO 3 afirmações antes de prosseguir.**

Se uma afirmação FALHAR na falsificação:
- **NÃO ignore.**
- **Registre** a discrepância.
- **Atualize** a documentação canônica (ou marque como desatualizada).
- **Informe o usuário** sobre a inconsistência.

### 2.3 Registro de Discrepâncias

Crie uma seção no final do seu relatório:

```markdown
## Discrepâncias Encontradas (Falseabilidade)

| # | Afirmação da Doc | Teste Executado | Resultado REAL | Status |
|---|------------------|-----------------|----------------|--------|
| 1 | ... | ... | ... | ✅ Corroborado / ❌ Falsificado |
```

---

## FASE 3: ANÁLISE SOCRÁTICA DO ESTADO

### 3.1 As 5 Perguntas Socráticas do Sistema

Após falsificar, responda:

1. **"O QUE é o sistema agora?"** — Estado real verificado.
2. **"O QUE deveria ser?"** — Estado desejado (plano ativo).
3. **"QUAL a diferença?"** — Gap entre real e desejado.
4. **"POR QUE existe essa diferença?"** — Causa raiz.
5. **"COMO fechar o gap?"** — Próxima ação mais valiosa.

### 3.2 O Método do Elenchus (Refutação)

Se você ASSUME que algo é verdade, tente REFUTAR:

- "Assumo que o build passa." → **Teste:** `pnpm build`
- "Assumo que o deploy está atualizado." → **Teste:** comparar `git log local` vs `docker images` no VPS
- "Assumo que não há erros." → **Teste:** `docker logs --tail 50` no backend

**Uma assunção não testada é um dogma. Agentes não devem ter dogmas.**

---

## FASE 4: AÇÃO E DOCUMENTAÇÃO

### 4.1 Ciclo de Documentação Popperiana

```
CONJECTURA (escrever/doc) → FALSIFICAÇÃO (testar) → REFUTAÇÃO (corrigir) → NOVA CONJECTURA
```

**Regras:**
- Toda mudança no código DEVE ser acompanhada de atualização na doc.
- Toda atualização na doc DEVE ser verificável (falsificável).
- NUNCA delete documentação antiga — renomeie para LEGACY com timestamp.

### 4.2 Template de Atualização Canônica

Quando atualizar a doc canônica, use este formato:

```markdown
## Atualização — [DATA] por [Agente]

### Mudanças Realizadas
- [ ] Código alterado: `arquivo.ts` — o que mudou
- [ ] Deploy realizado: versão X.Y.Z
- [ ] Teste executado: comando + resultado

### Verificação (Falseabilidade)
| Teste | Esperado | Obtido | Status |
|-------|----------|--------|--------|
| ... | ... | ... | ✅/❌ |

### Discrepâncias
- ...

### Próximo Agente
- Estado esperado: ...
- Tarefas pendentes: ...
```

---

## FASE 5: HANDOFF E MEMÓRIA

### 5.1 Salvamento Obrigatório

Antes de terminar, salve:

1. **OMK Memory:** Atualize `orthoplus/state-YYYY-MM-DD.json` com estado verificado
2. **Vault:** Se mudou algo significativo, atualize a doc canônica
3. **Repo:** `docs/CANONICAL-*.md` e `AGENTS.md`
4. **Tasks:** Atualize `vault:tsi-vault/orthoplus/tasks/tasks-YYYY-MM-DD.md`

### 5.2 Prompt de Handoff

Sempre termine com:

```markdown
---

## Handoff para Próximo Agente

**Estado verificado em:** [DATA]  
**Commit:** [HASH]  
**Versões:** frontend vX.Y.Z / backend vX.Y.Z

### Verificações realizadas (Falseabilidade)
- [ ] Build local passa
- [ ] Testes passam
- [ ] Deploy VPS saudável
- [ ] Login funcional
- [ ] Documentação atualizada

### Tarefas concluídas nesta sessão
- ...

### Tarefas pendentes (por prioridade)
1. [CRÍTICA] ...
2. [IMPORTANTE] ...
3. [BAIXA] ...

### Instruções de recuperação
1. Leia `vault:tsi-vault/orthoplus/canonical/OrthoPlus-Enterprise-Canonical-2026-05-14.md`
2. Execute `git log --oneline -3 && git status`
3. Execute `cd backend && pnpm test && cd apps/web && pnpm build`
4. Verifique VPS: `ssh root@100.111.74.69 "docker ps && curl -s http://localhost:3005/health"`
5. Comece pela tarefa de maior prioridade

### Armadilhas conhecidas
- NUNCA faça `prisma db push` em produção sem backup
- NUNCA use shell escaping em hashes bcrypt
- SEMPRE verifique `activeModules` ao debugar 403
```

---

## APÊNDICE A: CHECKLIST DE RECUPERAÇÃO RÁPIDA

```bash
#!/bin/bash
# ORTHOPLUS-RECOVERY-CHECKLIST.sh
# Execute este script para recuperar o estado completo

echo "=== ORTHOPLUS ENTERPRISE — RECOVERY CHECKLIST ==="

echo "[1/10] Git status..."
cd ~/Projects/OrthoPlus-Enterprise && git log --oneline -3 && git status --short

echo "[2/10] Backend build..."
cd backend && pnpm build 2>&1 | tail -3

echo "[3/10] Backend tests..."
cd backend && pnpm test 2>&1 | tail -5

echo "[4/10] Frontend build..."
cd apps/web && pnpm build 2>&1 | tail -3

echo "[5/10] VPS containers..."
ssh -o StrictHostKeyChecking=no root@100.111.74.69 "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | grep orthoplus"

echo "[6/10] VPS health..."
ssh -o StrictHostKeyChecking=no root@100.111.74.69 "curl -s http://localhost:3005/health"

echo "[7/10] VPS login..."
ssh -o StrictHostKeyChecking=no root@100.111.74.69 "curl -s -X POST http://localhost:3005/api/auth/token -H 'Content-Type: application/json' -d '{\"email\":\"admin@orthoplus.com\",\"password\":\"admin123!\"}' | head -c 100"

echo "[8/10] Frontend HTTP..."
curl -sI https://tsiapp.io/OrthoPlus-Enterprise/ | head -1

echo "[9/10] Database tables..."
ssh -o StrictHostKeyChecking=no root@100.111.74.69 "export PGPASSWORD='pPwGiRFlsS4YupKSe5EkvvFV8dEyEP1yJKQwkixNI' && psql -h 127.0.0.1 -U orthoplus -d orthoplus -t -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');\""

echo "[10/10] Active modules..."
ssh -o StrictHostKeyChecking=no root@100.111.74.69 "TOKEN=\$(curl -s -X POST http://localhost:3005/api/auth/token -H 'Content-Type: application/json' -d '{\"email\":\"admin@orthoplus.com\",\"password\":\"admin123!\"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)[\"accessToken\"])') && curl -s -H \"Authorization: Bearer \$TOKEN\" http://localhost:3005/api/clinics/48eaa5f9-99b1-45ce-a095-e099b522b165/active-modules | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d), \"modules")'"

echo "=== RECOVERY CHECKLIST COMPLETE ==="
```

---

## APÊNDICE B: GLOSSÁRIO DO MÉTODO

| Termo | Definição Popperiana | Aplicação no Projeto |
|-------|---------------------|---------------------|
| **Conjectura** | Hipótese não provada | A documentação canônica |
| **Falsificação** | Teste que pode refutar a conjectura | `pnpm test`, `curl /health`, `docker ps` |
| **Corroboração** | Teste passou, mas não "prova" nada | Build passa → ainda pode haver bugs |
| **Refutação** | Teste falhou, conjectura refutada | Doc diz "OK" mas teste falha → doc errada |
| **Elenchus** | Questionamento socrático para expor contradições | "Você disse X, mas o teste mostra Y" |

---

> **"A documentação perfeita não existe. A documentação honesta — aquela que sabe que pode estar errada e se submete a testes — é a única documentação digna de confiança."**
>
> — Adaptado de Karl Popper, *A Lógica da Pesquisa Científica*

---

**Para o próximo agente:**
1. Leia este prompt.
2. Execute o Recovery Checklist (Apêndice A).
3. Preencha a tabela de Falseabilidade (Fase 2).
4. Responda às 5 Perguntas Socráticas (Fase 3).
5. Aja, documente, e salve na memória.

**Nunca esqueça:** *Documentação não testada é ilusão. Teste tudo. Questione tudo. Documente tudo.*
