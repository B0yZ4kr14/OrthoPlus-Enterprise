# AGENTS.md — @orthoplus/core-ui

> Pacote de design system compartilhado. Não repete o root AGENTS.md.
> **Atualizado:** 2026-04-25

---

## Identidade

- Package: `@orthoplus/core-ui`
- Path: `categories/@orthoplus/core/packages/ui/`
- Importado como workspace dep em `apps/web` e outros pacotes

---

## Componentes Exportados

Exports via `src/index.ts`:

| Componente | Sub-exports | Notas |
|------------|-------------|-------|
| `Button` | `buttonVariants` | CVA variants: default, destructive, outline, secondary, ghost, link |
| `Card` | `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`, `cardVariants` | — |
| `Input` | — | Controlled/uncontrolled |
| `Label` | — | Radix UI Label |
| `Tabs` | `TabsList`, `TabsTrigger`, `TabsContent` | Radix UI Tabs |
| `cn` | — | `clsx` + `tailwind-merge` |

Import por sub-path:
```ts
import { Button } from '@orthoplus/core-ui'            // tudo
import { Button } from '@orthoplus/core-ui/button'     // tree-shakeable
import { cn } from '@orthoplus/core-ui/utils'
```

---

## Stack do Pacote

- Radix UI (`@radix-ui/react-label`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`)
- Class Variance Authority (CVA) para variants
- `clsx` + `tailwind-merge` via `cn()`
- Tailwind CSS (peer dep)

---

## Regras ao Modificar

1. **Nunca quebrar exports existentes** — consumers dependem de sub-paths
2. Novos componentes: arquivo próprio em `src/` + export em `src/index.ts` + sub-path em `package.json#exports`
3. Usar CVA para componentes com variants (`buttonVariants` como referência)
4. Acessibilidade: sempre usar primitivas Radix UI quando disponível
5. Sem lógica de negócio — apenas apresentação e comportamento UI genérico

---

## Verificação

```bash
# Na raiz do pacote:
pnpm run type-check   # tsc --noEmit
pnpm run lint         # ESLint
```

Após mudança, verificar se `apps/web` ainda compila: `cd apps/web && npx tsc --noEmit`.
