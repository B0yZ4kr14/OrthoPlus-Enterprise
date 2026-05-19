# Playbook PB01: Varredura de Componente Individual

## Objetivo
Auditar um componente React/TSX individual aplicando metodos socratico e popperiano.

## Pre-requisitos
- Componente identificado no escopo da varredura
- Acesso ao codigo fonte (`apps/web/src/components/` ou `apps/web/src/modules/`)
- Indice GitNexus atualizado (para queries de contexto)

---

## Fase 1: Contexto (2 min)

### 1.1 Identificar o Componente
```bash
# Exemplo
COMPONENT="apps/web/src/components/shared/DataTable.tsx"
```

### 1.2 Query no GitNexus
```bash
# Obter contexto de chamadores e callees
npx gitnexus query "DataTable component usage"
```

### 1.3 Verificar Imports
```bash
grep -n "^import" $COMPONENT
```

---

## Fase 2: Metodo Socratico (5 min)

### Q1: Responsabilidade Unica
```bash
# Contar linhas da funcao principal
npx wc -l $COMPONENT
# Se >200 linhas, provavelmente viola SRP
```

**Pergunta**: "Este componente faz mais de uma coisa?"
- Renderiza UI? ✓
- Gerencia estado? ⚠️
- Faz chamadas API? ✗ (deve estar no hook)
- Tem logica de negocio? ✗ (deve estar no use-case)

### Q2: Props Interface
```typescript
// Verificar se a interface de props esta definida
interface DataTableProps {
  data: T[]
  columns: ColumnDef<T>[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyState?: ReactNode
}
```

**Pergunta**: "Todas as props sao necessarias?"
- Props obrigatorias: `data`, `columns`
- Props opcionais: `onRowClick`, `loading`, `emptyState`
- Props sem uso: Marcar como dead code

### Q3: Estados de Erro
```typescript
// Verificar se ha tratamento de erro
{error && <ErrorState error={error} />}
{!data.length && <EmptyState />}
{loading && <LoadingSkeleton />}
```

**Pergunta**: "Todos os 4 estados estao cobertos?"
- [ ] Loading
- [ ] Error
- [ ] Empty
- [ ] Success

### Q4: Acessibilidade
```bash
# Verificar ARIA
grep -n "aria-" $COMPONENT
grep -n "role=" $COMPONENT
```

**Pergunta**: "Este componente eh acessivel?"
- [ ] ARIA labels em elementos interativos
- [ ] Keyboard navigation (tabindex, onKeyDown)
- [ ] Color contrast (verificar com axe-core)
- [ ] Screen reader friendly

### Q5: Design System
```bash
# Verificar tokens Tailwind
grep -o "bg-\|text-\|border-\|shadow-" $COMPONENT | sort | uniq
```

**Pergunta**: "Este componente usa tokens do design system?"
- [ ] Cores: `bg-primary`, `text-destructive` (nao hex codes)
- [ ] Spacing: `p-4`, `gap-2` (nao px/rem arbitrarios)
- [ ] Tipografia: `text-sm`, `font-semibold`
- [ ] Bordas: `rounded-lg`, `border-border`

---

## Fase 3: Metodo Popperiano (5 min)

### Hipose H0: "Este componente esta correto"

### Experimento 1: Props Invalidas
```typescript
// Tentar renderizar com props invalidas
<DataTable data={null} columns={[]} />
<DataTable data={[]} columns={undefined} />
<DataTable data={[1,2,3]} columns="invalid" />
```

**Resultado esperado**: Nao crashar, mostrar ErrorState
**Se crashar**: H0 rejeitada → Fix necessario

### Experimento 2: Dados Vazios
```typescript
// Dados vazios
<DataTable data={[]} columns={columns} />
```

**Resultado esperado**: Mostrar EmptyState
**Se mostrar nada ou erro**: H0 rejeitada → Fix necessario

### Experimento 3: Dados Grandes
```typescript
// Dados grandes (performance)
<DataTable data={Array(10000).fill({})} columns={columns} />
```

**Resultado esperado**: Nao travar, usar virtualizacao
**Se travar**: H0 rejeitada → Fix necessario

### Experimento 4: Mobile
```bash
# Testar em 320px e 768px
# Verificar overflow-x, scroll, layout quebrado
```

**Resultado esperado**: Layout responsivo
**Se quebrar**: H0 rejeitada → Fix necessario

### Experimento 5: Tema Escuro
```bash
# Verificar se cores sao tematicas
grep -n "dark:" $COMPONENT
```

**Resultado esperado**: Suporte a dark mode
**Se nao tiver**: H0 rejeitada → Fix necessario

---

## Fase 4: Documentar Achados

```markdown
## Componente: DataTable

### Socratico
- Q1 (SRP): ✓ (150 linhas, responsabilidade unica)
- Q2 (Props): ⚠️ (prop `onSort` nao documentada)
- Q3 (Estados): ✓ (4 estados cobertos)
- Q4 (A11y): ✗ (falta aria-label no header)
- Q5 (Design): ✓ (usa tokens Tailwind)

### Popperiano
- E1 (Props invalidas): ✓ (nao crasha)
- E2 (Dados vazios): ✓ (mostra EmptyState)
- E3 (Dados grandes): ✗ (trava sem virtualizacao)
- E4 (Mobile): ✓ (layout responsivo)
- E5 (Tema): ⚠️ (parcial, faltam alguns dark:)

### Issues
- SMALL: Adicionar aria-label no header
- MEDIUM: Adicionar virtualizacao para >1000 linhas
- SMALL: Completar dark mode
```

---

## Fase 5: Aplicar Fixes (se aplicavel)

### Fix SMALL: Aria-label
```tsx
// Antes
<th>{column.header}</th>

// Depois
<th aria-label={column.header}>{column.header}</th>
```

### Fix MEDIUM: Virtualizacao
```tsx
// Adicionar react-window ou similar
import { FixedSizeList } from 'react-window'
```

---

## Checklist Final

- [ ] Componente identificado e contexto obtido
- [ ] 5 perguntas socraticas respondidas
- [ ] 5 experimentos popperianos executados
- [ ] Issues classificadas (SMALL/MEDIUM/LARGE)
- [ ] Fixes aplicados (se SMALL)
- [ ] Linter passando
- [ ] Type-check passando
- [ ] Documentado no relatorio

---

## Comandos Rapidos

```bash
# Contar linhas
wc -l $COMPONENT

# Verificar imports
head -30 $COMPONENT | grep "^import"

# Verificar ARIA
grep -n "aria-\|role=" $COMPONENT

# Verificar tokens
grep -o "[a-z]*-[a-z0-9-]*" $COMPONENT | sort | uniq

# Verificar console.log
grep -n "console\." $COMPONENT

# Verificar any
grep -n "as any\|: any" $COMPONENT

# Verificar ts-ignore
grep -n "@ts-ignore\|@ts-expect-error" $COMPONENT
```
