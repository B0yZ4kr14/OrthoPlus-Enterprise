# Arquitetura do OrthoPlus Enterprise

## Visão Geral

O OrthoPlus Enterprise adota uma arquitetura de **categorias descentralizadas** implementada através de um monorepo gerenciado com pnpm workspaces e Turbo Repo.

---

## Princípios Arquiteturais

### 1. Categorias como Pacotes Independentes

Cada categoria de negócio é um pacote npm autônomo com:
- Código fonte independente
- Dependências próprias
- Build separado
- Testes isolados
- Versionamento semântico

### 2. Shared Kernel (Pacotes Core)

Componentes compartilhados centralizados em `@orthoplus/core`:

```
categories/@orthoplus/core/
├── ui/           # Componentes UI (Button, Card, Input, Tabs)
├── hooks/        # Hooks reutilizáveis (useToast)
├── types/        # Tipos TypeScript globais
└── utils/        # Utilitários (formatDate, formatCurrency)
```

### 3. Comunicação Entre Categorias

As categorias se comunicam apenas através de:
- Pacotes core compartilhados
- API REST (backend)
- Eventos globais (quando necessário)

**NÃO** há imports diretos entre categorias.

---

## Estrutura do Monorepo

```
orthoplus-enterprise/
├── package.json              # Root configuration
├── pnpm-workspace.yaml       # Workspace definition
├── turbo.json                # Build pipeline
├── tsconfig.base.json        # TypeScript base config
│
├── categories/@orthoplus/
│   ├── core/                 # Shared kernel
│   │   └── packages/
│   │       ├── ui/
│   │       ├── hooks/
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── [categoria]/          # Categoria de negócio
│   │   ├── package.json
│   │   └── packages/
│   │       └── [modulo]/
│   │           ├── src/
│   │           │   ├── components/
│   │           │   ├── pages/
│   │           │   ├── hooks/
│   │           │   └── types/
│   │           └── package.json
│   │
├── apps/
│   └── web/                  # Aplicação web principal
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── backend/                  # API backend
└── docs/                     # Documentação
```

---

## Fluxo de Desenvolvimento

### Criando Nova Categoria

```bash
# 1. Criar estrutura
mkdir -p categories/@orthoplus/minha-categoria/packages

# 2. Criar package.json
cat > categories/@orthoplus/minha-categoria/package.json << 'EOF'
{
  "name": "@orthoplus/minha-categoria",
  "version": "1.0.0",
  "workspaces": ["packages/*"],
  "dependencies": {
    "@orthoplus/core-ui": "workspace:*"
  }
}
EOF

# 3. Desenvolver módulos
# ...

# 4. Exportar na sidebar
# Atualizar sidebar.config.ts
```

### Criando Novo Módulo

```bash
# 1. Criar estrutura
mkdir -p categories/@orthoplus/[categoria]/packages/me-modulo/src

# 2. Criar package.json
cat > categories/@orthoplus/[categoria]/packages/me-modulo/package.json << 'EOF'
{
  "name": "@orthoplus/[categoria]-me-modulo",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./pages": "./src/pages/index.ts"
  }
}
EOF
```

---

## Build e Deploy

### Pipeline de Build (Turbo)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Ordem de Build

1. Pacotes core (sem dependências)
2. Categorias (dependem de core)
3. App web (depende de tudo)

### Deploy Independente

```bash
# Deploy de categoria específica
cd categories/@orthoplus/admin-devops
pnpm run build
pnpm run deploy

# Deploy completo
pnpm run build
```

---

## Padrões de Código

### Estrutura de Módulo

```typescript
// src/index.ts - Barrel export
export { MyPage } from './pages/MyPage';
export { useMyHook } from './hooks/useMyHook';
export type { MyType } from './types';

// src/pages/MyPage.tsx
import { Button, Card } from '@orthoplus/core-ui';
import { useToast } from '@orthoplus/core-hooks';

export function MyPage() {
  const { showSuccess } = useToast();
  // ...
}

// src/hooks/useMyHook.ts
import { useState } from 'react';

export function useMyHook() {
  const [state, setState] = useState();
  // ...
  return { state, setState };
}
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (Button, UserCard)
- **Hooks**: camelCase com prefixo `use` (useAuth, useForm)
- **Tipos**: PascalCase com sufixo (UserProps, ApiResponse)
- **Constantes**: UPPER_SNAKE_CASE

---

## Segurança

### Isolamento de Categorias

Cada categoria:
- Tem seu próprio escopo de dependências
- Não pode importar diretamente de outras categorias
- Deve usar apenas pacotes core e APIs

### Autenticação e Autorização

- Auth global no app shell
- Permissões por módulo (moduleKey)
- Rotas protegidas no react-router

---

## Performance

### Lazy Loading

Categorias e módulos podem usar lazy loading:

```typescript
const MyModule = lazy(() => import('@orthoplus/categoria-modulo'));

<Suspense fallback={<Loading />}>
  <MyModule />
</Suspense>
```

### Code Splitting

Cada categoria gera bundles separados:

```
dist/
├── core-ui.js
├── core-hooks.js
├── admin-devops-database-config.js
└── web-app.js
```

---

## Evolução da Arquitetura

### Fase 1: Core (Concluído)
- ✅ Pacotes core implementados
- ✅ App shell criado
- ✅ Sistema de build configurado

### Fase 2: Primeira Categoria (Concluído)
- ✅ Admin-DevOps implementada
- ✅ Database Config como prova de conceito

### Fase 3: Expansão (Em Planejamento)
- 🔄 Atendimento Clínico
- 🔄 Gestão Financeira
- 🔄 Operações

### Fase 4: Completude (Futuro)
- 🔄 Todas as 10 categorias
- 🔄 Integrações completas
- 🔄 Mobile app

---

## Referências

- [Turbo Repo](https://turbo.build/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Categorias](CATEGORIES.md)
- [Contribuição](CONTRIBUTING.md)
