# PLAYBOOK-FIX.md
# Como Executar Correcoes

## Regra de Ouro

> Faca a MUDANCA MINIMA que resolve o problema. Nada mais.

## Procedimento Padrao

### Passo 1: Isolar
```bash
# Criar branch para o fix (se git flow)
git stash || true
git checkout -b fix/nome-do-problema
```

### Passo 2: Backup
```bash
# Fazer backup do arquivo antes de editar
cp arquivo.ts arquivo.ts.bak
```

### Passo 3: Aplicar
- Editar o arquivo com a mudanca minima
- Preferir `StrReplaceFile` (patch) sobre `WriteFile` (overwrite total)
- Se usar `sed`, testar primeiro com `sed -n '...p'` para confirmar linha

### Passo 4: Verificar Sintaxe
```bash
# TypeScript
npx tsc --noEmit arquivo.ts

# Build do modulo
cd backend && pnpm run build
cd apps/web && pnpm run build
```

### Passo 5: Testar Funcional
```bash
# Rodar testes relevantes
npx jest arquivo.test.ts

# Verificar se o comportamento nao mudou
```

### Passo 6: Limpar
```bash
# Remover backup
rm arquivo.ts.bak
```

### Passo 7: Documentar
- Se a delacao era de inconsistencia doc-codigo, atualizar o doc
- Commit convencional: `fix(dominio): descricao`

## Anti-Padroes a Evitar

- NAO refatore durante um fix
- NAO mude formatacao (prettier) no mesmo commit
- NAO adicione funcionalidade nova
- NAO remova codigo comentado (a menos que seja o fix)
- NAO altere arquivos nao relacionados

## Templates de Commit

```
fix(backend): resolve TS6133 unused parameter in 5 router files

- Renamed req -> _req in lgpd, pep, split_pagamento, terminal, tiss routers
- These are stub/API-only modules with placeholder handlers
- No functional change; purely type-level fix

Refs: findings-2026-05-15 BE-002
```

```
fix(frontend): type ApiProdutoRepository envelope unwrapping

- Replace unsafe `as any` with proper type narrowing
- ApiResponse<T> now correctly unwraps to T

Refs: findings-2026-05-15 FE-001
```

```
docs(agents): update queryRaw statement to reflect reality

- AGENTS.md claimed "zero queryRaw" but 15 occurrences exist
- Documented legitimate use cases: admin stats, analytics, inventory alerts
- Added note about CI gate to prevent uncontrolled growth

Refs: findings-2026-05-15 BE-001
```
