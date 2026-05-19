# Playbook PB02: Varredura de Modulo

## Objetivo
Auditar um modulo de dominio completo (feature-based) no frontend.

## Pre-requisitos
- Modulo identificado no escopo
- Estrutura Clean Architecture esperada: `domain/`, `application/`, `infrastructure/`, `ui/`

---

## Fase 1: Estrutura (2 min)

### 1.1 Verificar Diretorios
```bash
MODULE="apps/web/src/modules/pacientes"
ls -la $MODULE/
```

**Estrutura Esperada**:
```
modules/pacientes/
├── domain/           # Entidades, value objects
├── application/      # Use cases, handlers
├── infrastructure/   # Repos, mappers, API clients
├── ui/              # Components, pages, hooks
├── types/           # TypeScript types
└── hooks/           # Custom hooks
```

**Pergunta Socratica**: "Este modulo segue a estrutura definida?"

### 1.2 Verificar Arquivos Orfaos
```bash
find $MODULE/ -type f | sort
# Verificar se ha arquivos fora das pastas esperadas
```

---

## Fase 2: Rotas (2 min)

### 2.1 Verificar Registro de Rotas
```bash
grep -rn "pacientes" apps/web/src/routes/AppRoutes.tsx
```

**Pergunta Socratica**: "Todas as rotas do modulo estao registradas?"
- [ ] Listagem
- [ ] Detalhe
- [ ] Formulario (create)
- [ ] Formulario (edit)
- [ ] Configuracoes

### 2.2 Verificar Lazy Loading
```tsx
// Esperado:
const PacientesPage = lazy(() => import('@/modules/pacientes/ui/pages/PacientesPage'))
```

**Pergunta**: "O modulo usa lazy loading?"

---

## Fase 3: Dependencias (3 min)

### 3.1 Imports Internos
```bash
grep -rn "from.*pacientes" apps/web/src/ --include="*.tsx" | grep -v "modules/pacientes"
```

**Pergunta Socratica**: "Quem depende deste modulo?"
- [ ] Lista de modulos dependentes
- [ ] Nenhum import ciclico

### 3.2 Imports Externos
```bash
grep -rn "from.*modules/" $MODULE/ --include="*.tsx" | grep -v "modules/pacientes"
```

**Pergunta**: "Este modulo depende de quem?"
- [ ] Lista de dependencias
- [ ] Nenhum import ciclico

### 3.3 Detectar Circular Dependencies
```bash
# Usar madge ou analise manual
npx madge --circular --extensions ts,tsx apps/web/src/modules/pacientes/
```

**Hipose Popperiana**: "Nao ha imports ciclicos neste modulo"
- Se madge encontrar ciclo → H0 rejeitada → Fix necessario

---

## Fase 4: Estado e API (3 min)

### 4.1 Verificar React Query Hooks
```bash
grep -rn "useQuery\|useMutation\|useInfiniteQuery" $MODULE/ --include="*.tsx"
```

**Pergunta Socratica**: "O estado esta bem gerenciado?"
- [ ] Cache keys consistentes
- [ ] Invalidacao de cache correta
- [ ] Retry configurado
- [ ] Stale time definido

### 4.2 Verificar apiClient
```bash
grep -rn "apiClient" $MODULE/ --include="*.tsx"
```

**Pergunta**: "Todas as chamadas usam apiClient?"
- [ ] Nenhuma chamada fetch/axios direta
- [ ] Erros tratados via interceptor

### 4.3 Verificar Tipagem
```bash
grep -rn ": any\|as any" $MODULE/ --include="*.tsx"
```

**Hipose Popperiana**: "Este modulo nao usa `any`"
- Se encontrar `any` → H0 rejeitada → Refatorar tipagem

---

## Fase 5: Componentes UI (5 min)

### 5.1 Verificar Componentes Principais
```bash
find $MODULE/ui -name "*.tsx" | sort
```

Para cada componente:
- [ ] Nome descritivo (ex: `PacienteForm`, nao `Form`)
- [ ] Props tipadas
- [ ] Estados de erro/loading/empty
- [ ] Usa design system (tokens Tailwind)

### 5.2 Verificar Forms
```bash
grep -rn "react-hook-form\|zod" $MODULE/ui --include="*.tsx"
```

**Pergunta**: "Os formularios tem validacao?"
- [ ] Schema Zod definido
- [ ] Mensagens de erro traduzidas
- [ ] Campos obrigatorios marcados

### 5.3 Verificar Tables/Lists
```bash
grep -rn "DataTable\|Table" $MODULE/ui --include="*.tsx"
```

**Pergunta**: "As listas tem paginacao/filtros?"
- [ ] Paginacao configurada
- [ ] Filtros funcionando
- [ ] Sort configurado

---

## Fase 6: Testes (2 min)

### 6.1 Verificar Testes
```bash
find $MODULE/ -name "*.test.{ts,tsx}" | wc -l
```

**Hipose Popperiana**: "Este modulo tem testes"
- Se 0 testes → H0 rejeitada → Criar tasks para testes

### 6.2 Verificar Cobertura
```bash
# Se houver testes, verificar o que cobrem
grep -rn "render\|screen\." $MODULE/ --include="*.test.tsx"
```

---

## Fase 7: Configuracoes (3 min)

### 7.1 Verificar Configs Truncadas
```bash
# Procurar props passadas como undefined ou parciais
grep -rn "={undefined}\|={null}" $MODULE/ui --include="*.tsx"
```

### 7.2 Verificar Hardcoded Values
```bash
grep -rn "'http://\|'https://\|localhost\|127.0.0.1" $MODULE/ --include="*.tsx"
```

### 7.3 Verificar TODOs/FIXMEs
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" $MODULE/ --include="*.tsx"
```

---

## Template de Relatorio

```markdown
## Modulo: [Nome]

### Estrutura
- [x] domain/ presente
- [x] application/ presente
- [x] infrastructure/ presente
- [x] ui/ presente
- [ ] Outros arquivos orfaos: [lista]

### Rotas
- [x] Listagem registrada
- [x] Detalhe registrada
- [x] Formulario create
- [ ] Formulario edit (ausente)

### Dependencias
- Depende de: [modulo1, modulo2]
- Dependencias dele: [modulo3]
- Circular: [nao/sim: lista]

### Estado
- [x] React Query hooks configurados
- [ ] Cache invalidation incompleta
- [x] apiClient usado corretamente
- [ ] 3 ocorrencias de `any`

### Componentes
- Total: 15 componentes
- Com SRP: 12
- Sem tratamento de erro: 3
- Sem design system: 2

### Testes
- Total: 0 testes
- Cobertura: N/A

### Issues
- CRITICAL: 0
- LARGE: 1 (circular dep com financeiro)
- MEDIUM: 3 (falta testes, cache invalidation, any types)
- SMALL: 5 (TODOs, hardcoded values)
```
