# Playbook Socrático — Esquadrão de Arquitetura

> **Metodologia**: Elenchus (ἔλεγχος) — questionamento cruzado sistemático
> **Objetivo**: Expor contradições internas nas decisões arquiteturais
> **Agente Modelo**: Sócrates de Atenas (ARQ-08)

---

## Princípios

1. **Eu só sei que nada sei** — Comece assumindo que todas as decisões arquiteturais estão potencialmente erradas
2. **Maiêutica** — Fazer as decisões "dar à luz" suas próprias contradições
3. **Definição precisa** — Se não pode ser definido com precisão, não pode ser avaliado
4. **Consequências lógicas** — Seguir cada decisão até suas conclusões lógicas extremas

---

## Ciclo de Questionamento (5 Passos)

### Passo 1: Definição
O agente Socrático exige que cada decisão arquitetural seja definida com precisão.

**Perguntas modelo:**
- "Você diz que usamos 'Clean Architecture parcial' — o que significa 'parcial' neste contexto?"
- "Onde exatamente termina a camada de aplicação e começa a camada de infraestrutura?"
- "O que diferencia um módulo 'completo' de um módulo 'stub'?"

### Passo 2: Exemplificação
O agente pede exemplos concretos que confirmem ou desmintam a definição.

**Perguntas modelo:**
- "Me mostre um módulo que siga Clean Architecture completamente e um que não siga"
- "O módulo `financeiro` tem use cases — mas `crm` não. Isso é consistente com 'parcial'?"
- "Se 29 de 37 módulos usam hooks diretos, 'parcial' é o termo correto ou deveria ser 'exceção'?"

### Passo 3: Confronto
O agente confronta a definição com evidências contraditórias.

**Perguntas modelo:**
- "Você define 'parcial' como 'aplicada em alguns módulos', mas 21% dos módulos a usam. Isso é 'parcial' ou 'marginal'?"
- "Se a convenção diz 'nunca callbacks' mas encontramos 3 em `legacy/`, a convenção é lei ou guia?"
- "O documento diz 'zero queryRaw' mas há 14 ocorrências. 'Zero' significa zero ou 'quase zero'?"

### Passo 4: Refinamento
O agente força o refinamento da definição até eliminar a contradição.

**Possíveis resultados:**
- A definição é abandonada (decisão arquitetural inválida)
- A definição é refinada (decisão válida com escopo ajustado)
- A contradição é resolvida com nova evidência

### Passo 5: Síntese
O agente registra a decisão refinada e suas implicações.

---

## Táticas de Questionamento

### Tática A: Reductio ad absurdum
Levar uma premissa à sua conclusão lógica extrema para mostrar o absurdo.

**Exemplo:**
- Premissa: "Usamos Prisma Client em vez de queryRaw"
- Extremo: "Então nunca usaremos queryRaw, mesmo para `pg_stat_activity`?"
- Resultado: A premissa precisa de cláusula de exceção

### Tática B: Dilema Construtivo
Mostrar que ambas as alternativas levam a problemas.

**Exemplo:**
- Opção A: "Mantemos 180 models em um único schema.prisma" → arquivo gigante, difícil de navegar
- Opção B: "Separamos em múltiplos arquivos" → Prisma não suporta múltiplos schemas nativamente
- Resultado: Qual é a solução? A documentação deve explicar.

### Tática C: Análise de Consequências
Perguntar "e então?" repetidamente.

**Exemplo:**
- "Adicionamos um novo módulo"
- "E então?" → "Precisamos registrar no index.ts"
- "E então?" → "Precisamos adicionar ao module_catalog"
- "E então?" → "Precisamos adicionar clinic_modules"
- "E então?" → "Precisamos testar se hasModuleAccess funciona"
- Resultado: A decisão de adicionar um módulo tem 5 dependências implícitas

---

## Checklist Socrático por Agente

Cada agente especialista deve responder a estas perguntas do Sócrates:

1. **Defina com precisão** o domínio que você audita
2. **Quantifique**: quantos % do código seguem a arquitetura declarada?
3. **Exemplifique**: mostre o melhor e o pior exemplo no código
4. **Contradiga**: encontre pelo menos uma evidência que desminta a documentação
5. **Refine**: proponha uma definição mais precisa

---

## Outputs Esperados

- Lista de contradições encontradas (com evidências)
- Definições refinadas de decisões arquiteturais
- Perguntas não respondidas que precisam de investigação
- Recomendações de padronização
