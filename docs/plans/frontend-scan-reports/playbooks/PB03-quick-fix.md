# Playbook PB03: Fix Rapido (Scout Rule)

## Objetivo
Aplicar fixes pequenos (SMALL issues) rapidamente, seguindo a regra do escoteiro.

## Regra do Escoteiro
"Sempre deixe o codigo mais limpo do que voce o encontrou."

---

## Tipos de Fixes SMALL

| Tipo | Exemplo | Acao |
|------|---------|------|
| console.log | `console.log('debug')` | Remover |
| Unused import | `import { unused } from 'x'` | Remover |
| Comentado | `// codigo antigo` | Remover se >3 linhas |
| Formatacao | Espacos extras, ponto-e-virgula | Prettier |
| Typo | `recieve` → `receive` | Corrigir |
| Hardcoded string | `'Admin'` | Usar constante |
| Missing key | `.map(item => <div>)` | Adicionar `key` |
| == vs === | `==` | Mudar para `===` |

---

## Workflow de Fix

### Passo 1: Identificar
```bash
# Procurar console.log
grep -rn "console\.log\|console\.debug\|console\.info" \
  apps/web/src/ --include="*.tsx" --include="*.ts"

# Procurar unused imports (via ESLint)
cd apps/web && pnpm lint -- --rule "@typescript-eslint/no-unused-vars: error"

# Procurar @ts-ignore inuteis
grep -rn "@ts-ignore\|@ts-expect-error" apps/web/src/ --include="*.tsx"
```

### Passo 2: Verificar Intencionalidade
```bash
# Verificar se o console.log tem contexto de debug
# Se estiver junto de um TODO ou comentario explicativo, NAO remover
# Se for apenas `console.log(data)`, remover
```

**Pergunta Socratica**: "Este codigo foi deixado intencionalmente?"
- Comentario explicativo acima? → Manter
- TODO referenciando ticket? → Manter
- Sem contexto? → Remover

### Passo 3: Aplicar Fix
```bash
# Exemplo: remover console.log
sed -i '/console\.log/d' apps/web/src/components/shared/DataTable.tsx

# Exemplo: remover unused import
# Manual ou via ESLint --fix
```

### Passo 4: Validar
```bash
cd apps/web
pnpm lint        # Deve passar sem erros novos
pnpm type-check  # Deve passar
pnpm test        # Testes devem passar
```

### Passo 5: Commit
```bash
git add apps/web/src/components/shared/DataTable.tsx
git commit -m "cleanup(shared): remove console.log and unused import

- Remove debugging artifacts from DataTable
- Clean up unused lodash import
- Apply Scout Rule

Refs: #frontend-scan"
```

---

## Checklist Antes de Fix

- [ ] Issue eh realmente SMALL (1 arquivo, <20 linhas)
- [ ] Nao eh intencional (sem comentario explicativo)
- [ ] Arquivo nao tem mudancas nao commitadas
- [ ] Fix nao altera comportamento
- [ ] Testes existentes ainda passam

---

## Checklist Depois de Fix

- [ ] Linter passa
- [ ] Type-check passa
- [ ] Testes passam
- [ ] Build passa
- [ ] Commit feito
- [ ] Issue marcada como resolvida

---

## Exemplos de Fixes

### Exemplo 1: Remover console.log
```typescript
// Antes
const handleClick = () => {
  console.log('clicked', data)
  onRowClick(data)
}

// Depois
const handleClick = () => {
  onRowClick(data)
}
```

### Exemplo 2: Remover unused import
```typescript
// Antes
import { useState, useEffect, useCallback } from 'react'
// useCallback nao eh usado

// Depois
import { useState, useEffect } from 'react'
```

### Exemplo 3: Adicionar key em map
```tsx
// Antes
items.map(item => <div>{item.name}</div>)

// Depois
items.map(item => <div key={item.id}>{item.name}</div>)
```

### Exemplo 4: Usar === em vez de ==
```typescript
// Antes
if (role == 'ADMIN') { ... }

// Depois
if (role === 'ADMIN') { ... }
```

### Exemplo 5: Usar constante em vez de hardcoded
```typescript
// Antes
if (user.role === 'ADMIN') { ... }

// Depois
import { ADMIN_ROLE } from '@/lib/constants'
if (user.role === ADMIN_ROLE) { ... }
```

---

## Ferramentas

| Ferramenta | Comando | Uso |
|-----------|---------|-----|
| ESLint | `pnpm lint --fix` | Auto-fix de estilo |
| Prettier | `pnpm format` | Formatacao |
| grep | `grep -rn "console\."` | Procurar padroes |
| sed | `sed -i '/pattern/d'` | Remover linhas |
