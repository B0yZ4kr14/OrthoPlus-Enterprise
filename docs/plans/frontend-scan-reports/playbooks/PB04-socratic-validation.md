# Playbook PB04: Validacao pelo Metodo Socratico

## Objetivo
Aplicar questionamento dialetico para extrair conhecimento implicito e identificar inconsistencias no frontend.

## Principios
- **Elenchus**: Refutar atraves de perguntas
- **Maieutica**: Dar a luz ao conhecimento
- **Dialetica**: Confrontar tese e antitese

---

## Nivel 1: Elenchus (Refutacao)

### Perguntas para Componentes

**S1**: "O que este componente faz?"
- Se a resposta tem "e", provavelmente viola SRP
- Exemplo ruim: "Renderiza a tabela e faz a paginacao e filtra os dados"
- Exemplo bom: "Renderiza a tabela de dados"

**S2**: "Por que este componente existe?"
- Se nao houver resposta clara, pode ser dead code
- Se a resposta for "herdado de um projeto antigo", avaliar remocao

**S3**: "Este componente pode ser mais simples?"
- Se sim, refatorar
- Se nao, documentar por que eh complexo

### Perguntas para Modulos

**S4**: "Este modulo tem um proposito claro?"
- Deve ser descrito em 1 frase
- Exemplo: "O modulo pacientes gerencia cadastro e consulta de pacientes"

**S5**: "Este modulo depende de quem? E quem depende dele?"
- Mapear dependencias
- Identificar acoplamentos excessivos

**S6**: "O que acontece se removermos este modulo?"
- Se o sistema quebra completamente: modulo essencial
- Se apenas 1 feature para de funcionar: modulo bem isolado
- Se nada acontece: modulo morto

---

## Nivel 2: Maieutica (Extracao)

### Perguntas para Estado

**S7**: "Quais estados este componente gerencia que nao estao documentados?"
- Estados implicitos:
  - Loading (geralmente documentado)
  - Error (geralmente documentado)
  - Empty (frequentemente esquecido)
  - Partial (dados incompletos, raramente documentado)
  - Stale (cache expirado, raramente documentado)

**S8**: "Quais combinacoes de estado sao possiveis?"
- Exemplo: `loading=true + error=true` → possivel?
- Se nao for possivel, usar maquina de estados

**S9**: "Qual o estado inicial? E qual o estado final?"
- Se nao ha estado final (estado absorvente), pode haver loop infinito

### Perguntas para Props

**S10**: "Quais props sao realmente necessarias?"
- Para cada prop, perguntar: "Sem esta prop, o componente funciona?"
- Se sim, a prop eh opcional ou desnecessaria

**S11**: "Quais valores de props sao invalidos?"
- Documentar constraints
- Exemplo: `pageSize` deve ser > 0

**S12**: "Ha props que se contradizem?"
- Exemplo: `disabled=true` + `required=true` em um input

---

## Nivel 3: Dialetica (Confronto)

### Confrontar Componentes Similares

**S13**: "Componente A e Componente B fazem a mesma coisa?"
- Se sim, extrair componente compartilhado
- Se nao, documentar a diferenca

**S14**: "Componente A contradiz Componente B?"
- Exemplo: A usa `bg-primary`, B usa `bg-blue-500` para a mesma funcao

### Confrontar Estado Local e Global

**S15**: "Este estado deveria ser local ou global?"
- Local: usado por 1 componente
- Global: usado por >1 componente nao relacionado
- Se global: usar Zustand/React Query
- Se local: usar useState

### Confrontar Implementacao e Spec

**S16**: "O codigo implementa o que o spec diz?"
- Comparar `spec.md` com codigo
- Identificar drift

**S17**: "O codigo implementa MAIS do que o spec diz?"
- Identificar feature creep
- Documentar ou remover

**S18**: "O codigo implementa MENOS do que o spec diz?"
- Identificar features faltantes
- Criar tasks

---

## Template de Questionamento Socratico

```markdown
## Socratic Review: [Componente/Modulo]

### Elenchus (Refutacao)
| # | Pergunta | Resposta | Acao |
|---|----------|----------|------|
| S1 | Responsabilidade unica? | Sim/Nao | [Acao] |
| S2 | Por que existe? | [Resposta] | [Acao] |
| S3 | Pode ser mais simples? | Sim/Nao | [Acao] |
| S4 | Proposito claro? | Sim/Nao | [Acao] |
| S5 | Dependencias claras? | Sim/Nao | [Acao] |
| S6 | Impacto da remocao? | [Descricao] | [Acao] |

### Maieutica (Extracao)
| # | Pergunta | Estado Encontrado | Acao |
|---|----------|-------------------|------|
| S7 | Estados nao documentados? | [Lista] | Documentar |
| S8 | Combinacoes possiveis? | [Lista] | Validar |
| S9 | Estado inicial/final? | [Descricao] | Validar |
| S10 | Props necessarias? | [Lista] | Refinar |
| S11 | Props invalidas? | [Lista] | Validar |
| S12 | Props contraditorias? | [Lista] | Corrigir |

### Dialetica (Confronto)
| # | Pergunta | Tese | Antitese | Sintese |
|---|----------|------|----------|---------|
| S13 | Duplicacao? | Comp A | Comp B | Extrair shared |
| S14 | Inconsistencia? | A faz X | B faz Y | Padronizar |
| S15 | Local vs Global? | Local | Global | Decidir |
| S16 | Alinhado com spec? | Spec diz X | Codigo faz Y | Corrigir drift |
| S17 | Feature creep? | Spec | Codigo | Documentar/remover |
| S18 | Feature missing? | Spec | Codigo | Criar task |
```

---

## Exemplo Completo

### Componente: PatientStatusBadge

```tsx
export function PatientStatusBadge({ status }: { status: string }) {
  const color = status === 'active' ? 'green' : 'red'
  return <span className={`text-${color}-500`}>{status}</span>
}
```

### Elenchus
- **S1**: "O que este componente faz?"
  - Resposta: "Renderiza um badge com cor baseada no status"
  - Avaliacao: SRP ✓

- **S2**: "Por que existe?"
  - Resposta: "Para padronizar a exibicao de status de pacientes"
  - Avaliacao: Justificado ✓

- **S3**: "Pode ser mais simples?"
  - Resposta: "Nao, ja eh simples"
  - Avaliacao: ✓

### Maieutica
- **S7**: "Estados nao documentados?"
  - Encontrado: Nao lida com `status=undefined`
  - Acao: Adicionar fallback

- **S10**: "Props necessarias?"
  - `status` eh obrigatoria
  - Mas nao ha validacao
  - Acao: Adicionar validacao

- **S11**: "Valores invalidos?"
  - `status='unknown'` → `text-unknown-500` (classe invalida)
  - Acao: Usar mapa de cores

### Dialetica
- **S14**: "Ha inconsistencia com outros badges?"
  - `StatusBadge` em `modules/agenda` usa `bg-blue-500`
  - `PatientStatusBadge` usa `text-green-500`
  - Inconsistencia: um usa bg, outro usa text
  - Sintese: Criar componente `StatusBadge` compartilhado

- **S16**: "Alinhado com design system?"
  - Spec diz: "Badges devem usar componente `<Badge>` do design system"
  - Codigo usa `<span>` manual
  - Drift identificado
  - Acao: Refatorar para usar `<Badge>`

### Resultado
- Issue SMALL: Adicionar fallback para status undefined
- Issue MEDIUM: Criar componente `StatusBadge` compartilhado
- Issue MEDIUM: Refatorar para usar `<Badge>` do design system
