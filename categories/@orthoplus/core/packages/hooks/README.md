# @orthoplus/core-hooks

Hooks React compartilhados para aplicações OrthoPlus.

## Descrição

Este pacote fornece hooks React customizados e reutilizáveis para funcionalidades comuns em toda a aplicação OrthoPlus. Os hooks são tipados com TypeScript e projetados para serem fáceis de usar e testar.

## Hooks Disponíveis

| Hook | Descrição |
|------|-----------|
| **useToast** | Gerenciamento de notificações toast (sucesso, erro, info) |

## Instalação

```bash
npm install @orthoplus/core-hooks
```

## useToast

Hook para exibir notificações toast usando a biblioteca `sonner`.

### API

```typescript
interface ToastOptions {
  description?: string;
  duration?: number;
}

function useToast(): {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  toast: typeof toast; // Exportação direta do sonner
}
```

### Exemplo de Uso

```tsx
import { useToast } from "@orthoplus/core-hooks";

function MyComponent() {
  const { showSuccess, showError, showInfo } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("Dados salvos com sucesso!", {
        description: "As alterações foram persistidas no banco de dados.",
      });
    } catch (error) {
      showError("Erro ao salvar dados", {
        description: "Verifique sua conexão e tente novamente.",
        duration: 5000,
      });
    }
  };

  const handleInfo = () => {
    showInfo("Processo iniciado", {
      description: "Isso pode levar alguns segundos...",
    });
  };

  return (
    <button onClick={handleSave}>
      Salvar
    </button>
  );
}
```

### Configurações Padrão

| Método | Duração Padrão | Ícone |
|--------|----------------|-------|
| `showSuccess` | 3000ms | ✅ |
| `showError` | 5000ms | ❌ |
| `showInfo` | 3000ms | ℹ️ |

### Uso Direto do Sonner

Se precisar de mais controle, pode usar o `toast` diretamente:

```tsx
import { useToast } from "@orthoplus/core-hooks";

function AdvancedExample() {
  const { toast } = useToast();

  const showCustomToast = () => {
    toast("Mensagem personalizada", {
      icon: "🎉",
      duration: 4000,
      action: {
        label: "Desfazer",
        onClick: () => console.log("Desfeito!"),
      },
    });
  };

  return <button onClick={showCustomToast}>Mostrar Toast</button>;
}
```

## Dependências

```json
{
  "react": "^18.3.1",
  "sonner": "^1.7.4"
}
```

## Scripts

- `npm run lint` - Executa ESLint
- `npm run type-check` - Verifica tipos com TypeScript

## Requisitos

- React >= 18.0.0
- O componente `<Toaster />` do sonner deve estar montado na raiz da aplicação

```tsx
// App.tsx ou layout principal
import { Toaster } from "sonner";

function App() {
  return (
    <>
      {/* seus componentes */}
      <Toaster position="top-right" />
    </>
  );
}
```

## Estrutura de Exports

```
@orthoplus/core-hooks          → Todos os hooks
@orthoplus/core-hooks/useToast → Apenas useToast
```
