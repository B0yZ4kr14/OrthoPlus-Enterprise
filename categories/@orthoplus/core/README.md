# @orthoplus/core

Pacotes compartilhados (shared kernel) para todas as categorias do OrthoPlus Enterprise.

---

## Pacotes

### @orthoplus/core-ui
Componentes UI reutilizáveis.

```bash
pnpm add @orthoplus/core-ui
```

```tsx
import { Button, Card, Input } from '@orthoplus/core-ui';
```

[Ver documentação](./packages/ui/README.md)

---

### @orthoplus/core-hooks
Hooks reutilizáveis.

```bash
pnpm add @orthoplus/core-hooks
```

```tsx
import { useToast } from '@orthoplus/core-hooks';

const { showSuccess } = useToast();
showSuccess('Operação realizada!');
```

[Ver documentação](./packages/hooks/README.md)

---

### @orthoplus/core-types
Tipos TypeScript globais.

```bash
pnpm add @orthoplus/core-types
```

```typescript
import type { ApiResponse } from '@orthoplus/core-types';
```

---

### @orthoplus/core-utils
Utilitários e helpers.

```bash
pnpm add @orthoplus/core-utils
```

```typescript
import { formatDate, formatCurrency } from '@orthoplus/core-utils';

formatDate(new Date()); // "01/04/2026"
formatCurrency(1000); // "R$ 1.000,00"
```

---

## Instalação

```bash
# Instalar todos os pacotes core
pnpm install

# Ou instalar individualmente
pnpm add @orthoplus/core-ui
pnpm add @orthoplus/core-hooks
```

---

## Desenvolvimento

```bash
# Type-check
pnpm run type-check

# Build
pnpm run build
```

---

## Licença

Copyright © 2025 TSI Telecom. Todos os direitos reservados.
