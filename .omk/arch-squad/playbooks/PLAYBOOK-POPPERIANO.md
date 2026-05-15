# Playbook Popperiano — Esquadrão de Arquitetura

> **Metodologia**: Falsificacionismo Crítico — Karl Popper
> **Objetivo**: Tentar PROVAR que as hipóteses arquiteturais estão ERRADAS
> **Agente Modelo**: Karl Popper (ARQ-09)

---

## Princípios

1. **Não se pode provar uma teoria, apenas refutá-la** — A melhor arquitetura é aquela que sobrevive às tentativas de refutação
2. **Critério de demarcação** — Uma decisão arquitetural só é científica (válida) se for falsificável
3. **Conjecturas e refutações** — Propor hipóteses audazes, depois tentar destruí-las
4. **Mundos 1, 2 e 3** — O código (Mundo 1), nossas teorias sobre ele (Mundo 2), e a documentação/objetivação (Mundo 3) devem estar alinhados

---

## Framework de Hipóteses Falsificáveis

Cada hipótese arquitetural deve ser formulada como uma declaração que pode ser PROVADA FALSA.

### Formato de Hipótese

```
HIPÓTESE [ID]: "[Declaração universal]"
FALSA SE: [Condição que invalida a declaração]
SEVERIDADE: [CRITICAL/HIGH/MEDIUM/LOW]
EVIDÊNCIA REQUERIDA: [Como provar que é falsa]
```

### Exemplos

```
HIPÓTESE BE-ARCH-001: "Todo router backend possui clinicGuard aplicado"
FALSA SE: Qualquer router em backend/src/index.ts que não use clinicGuard
SEVERIDADE: CRITICAL
EVIDÊNCIA: grep -n "clinicGuard" backend/src/index.ts

HIPÓTESE FE-ARCH-001: "O frontend usa Clean Architecture em todos os módulos"
FALSA SE: Qualquer módulo em apps/web/src/modules/ sem camada domain/ ou application/
SEVERIDADE: HIGH
EVIDÊNCIA: ls apps/web/src/modules/*/domain/ apps/web/src/modules/*/application/

HIPÓTESE DB-ARCH-001: "Prisma schema possui 180 models mapeados para 180 tabelas"
FALSA SE: COUNT(models) != COUNT(tables) no PostgreSQL
SEVERIDADE: HIGH
EVIDÊNCIA: psql -c "SELECT COUNT(*) FROM information_schema.tables ..."
```

---

## Ciclo Popperiano (4 Passos)

### Passo 1: Conjectura
O agente especialista propõe uma hipótese audaz sobre a arquitetura.

**Exemplo:**
> "A arquitetura modular do backend permite adicionar novos módulos sem modificar código existente"

### Passo 2: Derivação de Predições
A partir da hipótese, derivar predições testáveis.

**Predições:**
- P1: Adicionar um novo módulo não quebra builds existentes
- P2: Adicionar um novo módulo não requer alteração em index.ts além do registro
- P3: O módulo pode ser desativado sem afetar outros módulos

### Passo 3: Teste de Falsificação
Tentar PROVAR que as predições estão erradas.

**Testes:**
- T1: Verificar se index.ts precisa de alterações além de `app.use()`
- T2: Verificar se module_catalog precisa ser atualizado manualmente
- T3: Verificar se clinic_modules precisa ser inserido no DB
- T4: Verificar se hasModuleAccess precisa reconhecer o novo módulo

### Passo 4: Avaliação
- Se alguma predição falha → Hipótese REFUTADA → Documentar a refutação
- Se nenhuma predição falha → Hipótese CORROBORADA (mas NÃO PROVADA) → Registrar evidências

---

## Táticas de Falsificação

### Tática A: Teste de Fronteira
Levar o sistema ao limite para verificar se a arquitetura resiste.

**Exemplos:**
- "E se criarmos o módulo 38? O que quebra?"
- "E se removermos o schema `public`? O Prisma ainda funciona?"
- "E se o Redis cair? O backend ainda responde?"

### Tática B: Contra-exemplo Único
Basta UM contra-exemplo para refutar uma universal.

**Exemplo:**
- Hipótese: "Todos os controllers usam ApiError"
- Contra-exemplo: Um único controller com `throw new Error()` genérico
- Resultado: HIPÓTESE REFUTADA

### Tática C: Teste de Invariante
Verificar se invariantes arquiteturais são sempre mantidos.

**Invariantes a testar:**
- Todo model Prisma tem um schema explicitamente definido
- Todo router tem um prefixo único
- Todo módulo com Prisma tem ao menos uma tabela no DB
- Todo controller retorna ApiResponse com `success` boolean

### Tática D: Stress Arquitetural
Simular mudanças extremas e verificar a resiliência.

**Exemplos:**
- "E se dobrarmos o número de models (360)? O build ainda passa?"
- "E se adicionarmos 100 rotas novas? O bundle do frontend ainda é razoável?"
- "E se migrarmos de PostgreSQL para MySQL? Quanto código precisa mudar?"

---

## Checklist Popperiano por Agente

Cada agente deve formular e testar pelo menos 5 hipóteses:

1. **Hipótese sobre consistência**: "A arquitetura declarada é consistente com a implementada"
2. **Hipótese sobre completude**: "Todos os componentes necessários estão presentes"
3. **Hipótese sobre isolamento**: "Mudanças em um módulo não afetam outros"
4. **Hipótese sobre escalabilidade**: "A arquitetura suporta crescimento"
5. **Hipótese sobre manutenibilidade**: "A arquitetura facilita manutenção"

Para cada hipótese:
- [ ] Formulada como declaração universal
- [ ] Identificada condição de falsificação
- [ ] Coletada evidência de teste
- [ ] Registrado resultado (CORROBORADA / REFUTADA)
- [ ] Documentada implicação da refutação

---

## Outputs Esperados

- Lista de hipóteses formuladas (mínimo 5 por agente)
- Evidências de falsificação (comandos, outputs, hashes SHA-256)
- Hipóteses refutadas e suas implicações
- Hipóteses corroboradas (ainda provisórias)
- Recomendações arquiteturais baseadas em refutações
