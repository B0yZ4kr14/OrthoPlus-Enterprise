# @orthoplus/core-ui

Componentes UI compartilhados para aplicações OrthoPlus.

## Descrição

Este pacote fornece componentes React reutilizáveis e estilizados usando Tailwind CSS, Radix UI e Class Variance Authority (CVA). Os componentes são projetados para serem acessíveis, responsivos e consistentes em toda a aplicação.

## Componentes Exportados

| Componente | Descrição | Exports |
|------------|-----------|---------|
| **Button** | Botão interativo com variantes | `Button`, `buttonVariants` |
| **Card** | Container de conteúdo | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`, `cardVariants` |
| **Input** | Campo de entrada de texto | `Input` |
| **Label** | Rótulo para formulários | `Label` |
| **Tabs** | Sistema de abas | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |

### Utilitários

- `cn()` - Função utilitária para mesclar classes Tailwind

## Instalação

```bash
npm install @orthoplus/core-ui
```

## Exemplo de Uso

### Button

```tsx
import { Button } from "@orthoplus/core-ui";

function App() {
  return (
    <Button variant="default" size="default">
      Clique aqui
    </Button>
  );
}
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@orthoplus/core-ui";

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
      </CardHeader>
      <CardContent>
        Conteúdo do card aqui
      </CardContent>
    </Card>
  );
}
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@orthoplus/core-ui";

function Example() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Conteúdo da aba 1</TabsContent>
      <TabsContent value="tab2">Conteúdo da aba 2</TabsContent>
    </Tabs>
  );
}
```

### Input com Label

```tsx
import { Input, Label } from "@orthoplus/core-ui";

function Form() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="exemplo@email.com" />
    </div>
  );
}
```

## Dependências

```json
{
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "react": "^18.3.1",
  "tailwind-merge": "^2.6.0"
}
```

## Scripts

- `npm run lint` - Executa ESLint
- `npm run type-check` - Verifica tipos com TypeScript

## Estrutura de Exports

```
@orthoplus/core-ui         → Todos os componentes
@orthoplus/core-ui/button  → Apenas Button
@orthoplus/core-ui/card    → Apenas Card
@orthoplus/core-ui/input   → Apenas Input
@orthoplus/core-ui/label   → Apenas Label
@orthoplus/core-ui/tabs    → Apenas Tabs
@orthoplus/core-ui/utils   → Utilitários (cn)
```
