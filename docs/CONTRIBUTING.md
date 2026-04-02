# Guia de Contribuição - OrthoPlus Enterprise

Obrigado pelo interesse em contribuir com o OrthoPlus Enterprise!

---

## Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade

---

## Como Contribuir

### 1. Configurando o Ambiente

```bash
# Fork o repositório
# Clone seu fork
git clone https://github.com/seu-usuario/orthoplus-enterprise.git
cd orthoplus-enterprise

# Instale as dependências
pnpm install

# Verifique se tudo está funcionando
pnpm run type-check
```

### 2. Criando uma Branch

```bash
# Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# Ou para bugfix
git checkout -b fix/nome-do-bug
```

### 3. Faça suas Alterações

- Siga os padrões de código
- Adicione testes se necessário
- Atualize a documentação

### 4. Commit

```bash
# Adicione as alterações
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"
```

#### Convenção de Commits

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build/ferramentas

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Crie um Pull Request no GitHub
```

---

## Estrutura de Categorias

### Criando Nova Categoria

```bash
# 1. Crie a estrutura
mkdir -p categories/@orthoplus/nome-categoria/packages

# 2. Crie o package.json
cat > categories/@orthoplus/nome-categoria/package.json << 'EOF'
{
  "name": "@orthoplus/nome-categoria",
  "version": "1.0.0",
  "type": "module",
  "workspaces": ["packages/*"],
  "dependencies": {
    "@orthoplus/core-ui": "workspace:*",
    "@orthoplus/core-hooks": "workspace:*"
  }
}
EOF

# 3. Crie o README
cat > categories/@orthoplus/nome-categoria/README.md << 'EOF'
# @orthoplus/nome-categoria

Descrição da categoria.

## Módulos

- modulo-1
- modulo-2

## Instalação

```bash
pnpm install
```
EOF
```

### Criando Novo Módulo

```bash
# 1. Crie a estrutura
mkdir -p categories/@orthoplus/[categoria]/packages/nome-modulo/src/{components,pages,hooks,types}

# 2. Crie o package.json
cat > categories/@orthoplus/[categoria]/packages/nome-modulo/package.json << 'EOF'
{
  "name": "@orthoplus/[categoria]-nome-modulo",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./pages": "./src/pages/index.ts"
  },
  "dependencies": {
    "@orthoplus/core-ui": "workspace:*",
    "react": "^18.3.1"
  }
}
EOF

# 3. Crie o barrel export
cat > categories/@orthoplus/[categoria]/packages/nome-modulo/src/index.ts << 'EOF'
export { MyPage } from './pages/MyPage';
export type { MyType } from './types';
EOF
```

---

## Padrões de Código

### TypeScript

```typescript
// ✅ Use tipos explícitos
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ Evite any
function badGreet(name: any): any {
  return `Hello, ${name}`;
}
```

### React

```typescript
// ✅ Componentes funcionais
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ✅ Hooks personalizados
export function useMyHook() {
  const [state, setState] = useState();
  // ...
  return { state, setState };
}
```

### Estilos

```typescript
// ✅ Use Tailwind com classes consistentes
<button className="bg-primary text-primary-foreground px-4 py-2 rounded">
  Clique
</button>

// ✅ Variantes com class-variance-authority
const buttonVariants = cva(
  "rounded px-4 py-2",
  {
    variants: {
      variant: {
        default: "bg-primary",
        danger: "bg-destructive"
      }
    }
  }
);
```

---

## Testes

### Testes Unitários

```bash
# Rode os testes
pnpm test

# Com watch
pnpm test:watch

# Com cobertura
pnpm test:coverage
```

### Estrutura de Testes

```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Documentação

### README do Módulo

Todo módulo deve ter um README.md com:

```markdown
# @orthoplus/categoria-modulo

Descrição do módulo.

## Instalação

```bash
pnpm install
```

## Uso

```typescript
import { MyComponent } from '@orthoplus/categoria-modulo';
```

## API

### Componentes

#### MyComponent

Props:
- `prop1`: descrição
- `prop2`: descrição

## Exemplos

```tsx
<MyComponent prop1="value" />
```
```

---

## Code Review

Critérios para aprovação de PR:

- [ ] Código segue os padrões
- [ ] Testes passam
- [ ] Type-check passa
- [ ] Documentação atualizada
- [ ] Sem console.logs
- [ ] Sem código comentado

---

## Dúvidas?

- Leia a [Arquitetura](ARCHITECTURE.md)
- Veja as [Categorias](CATEGORIES.md)
- Consulte o [Deploy](DEPLOYMENT.md)

---

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.
