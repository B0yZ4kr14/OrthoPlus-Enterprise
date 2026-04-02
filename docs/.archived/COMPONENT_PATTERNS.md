# Guia de Padrões de Componentes - Ortho+

## Visão Geral

Este guia define os padrões visuais e de interação para componentes do sistema Ortho+, garantindo consistência e qualidade em toda a aplicação.

## Card Variants

### Quando Usar Cada Variant

#### `default`
```tsx
<Card variant="default">
  {/* Conteúdo padrão */}
</Card>
```
**Uso:** Listagens simples, formulários básicos, conteúdo secundário
**Características:** Bordas sutis, sem sombra elevada, fundo card padrão

#### `elevated`
```tsx
<Card variant="elevated">
  {/* Conteúdo importante */}
</Card>
```
**Uso:** Stats cards, métricas principais, cards de destaque
**Características:** Sombra profunda, efeito 3D, maior contraste
**Exemplo:** Cards de estatísticas no Dashboard

#### `interactive`
```tsx
<Card variant="interactive">
  {/* Conteúdo clicável */}
</Card>
```
**Uso:** Action cards, itens selecionáveis, cards navegáveis
**Características:** Hover states pronunciados, cursor pointer, animações
**Exemplo:** Action cards de ações rápidas

#### `gradient`
```tsx
<Card variant="gradient">
  {/* Seção de destaque */}
</Card>
```
**Uso:** Seções importantes, headers de módulos, calls-to-action
**Características:** Gradiente de fundo, contraste elevado, visual premium
**Exemplo:** Seção de ações rápidas no Dashboard

## Loading States

### LoadingState Component

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

// Spinner padrão
<LoadingState size="md" variant="spinner" />

// Com mensagem
<LoadingState 
  size="lg" 
  variant="spinner" 
  message="Carregando dados..."
/>

// Pulse variant
<LoadingState variant="pulse" size="md" />
```

### Skeleton Loaders

Use skeleton loaders para conteúdo estruturado:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Card>
  <CardHeader>
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-4 w-64" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-[200px] w-full" />
  </CardContent>
</Card>
```

### Quando Usar Cada Loading State

| Estado | Uso |
|--------|-----|
| Spinner | Ações assíncronas (salvar, deletar) |
| Skeleton | Carregamento inicial de páginas |
| Pulse | Indicadores sutis de processamento |
| Progress | Upload de arquivos, processos longos |

## Feedback Visual

### Success Actions

```tsx
import { toast } from 'sonner';

// Sucesso
toast.success('Paciente salvo com sucesso!');

// Com ação
toast.success('Item criado', {
  action: {
    label: 'Visualizar',
    onClick: () => navigate('/item')
  }
});
```

### Error Handling

```tsx
// Erro simples
toast.error('Erro ao salvar dados');

// Erro com detalhes
toast.error('Falha na operação', {
  description: 'Tente novamente em alguns instantes'
});
```

### Loading com Feedback

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
    toast.success('Salvo com sucesso!');
  } catch (error) {
    toast.error('Erro ao salvar');
  } finally {
    setIsLoading(false);
  }
};

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Salvar
</Button>
```

## Confirmação de Ações Destrutivas

```tsx
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const [confirmOpen, setConfirmOpen] = useState(false);

<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  onConfirm={handleDelete}
  title="Confirmar Exclusão"
  description="Esta ação não pode ser desfeita. Deseja continuar?"
  confirmText="Excluir"
  cancelText="Cancelar"
  variant="destructive"
/>
```

---

## Reusable Components (FASE 3)

The following reusable components provide consistent, production-ready patterns across the application. For detailed documentation and examples, see `docs/REUSABLE_COMPONENTS.md`.

### DataTable
Generic table with sorting, filtering, pagination, and empty states built-in.

### EmptyState
Consistent empty state displays with multiple variants (default, search, error, no-data).

### FormField
Enhanced form fields with visual validation (error/success icons), helper text, and Zod integration.

### LoadingState (Expanded)
Now supports 6 variants: spinner, pulse, skeleton, table, grid, and list for context-appropriate loading states.

---

## Animações

### Fade In (Entrada de Elementos)

```tsx
<div className="animate-fade-in">
  {/* Conteúdo */}
</div>
```

### Stagger Effect (Entrada Progressiva)

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Item */}
  </div>
))}
```

### Ripple Effect (Click Feedback)

```tsx
const [isRippling, setIsRippling] = useState(false);

const handleClick = () => {
  setIsRippling(true);
  setTimeout(() => setIsRippling(false), 600);
  // Ação
};

<div className="relative overflow-hidden">
  {isRippling && (
    <span className="absolute inset-0 animate-ripple bg-primary/20" />
  )}
  {/* Conteúdo */}
</div>
```

### Hover States

```tsx
// Scale up
<Card className="transition-transform hover:scale-105" />

// Shadow elevado
<Card className="transition-shadow hover:shadow-2xl" />

// Border highlight
<Card className="transition-all hover:border-primary/50" />

// Combinado
<Card className="transition-all hover:scale-105 hover:shadow-2xl hover:border-primary/50" />
```

## Acessibilidade

### Focus Management

```tsx
// Focus visível
<Button className="focus-visible:ring-2 focus-visible:ring-primary" />

// Skip navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para conteúdo principal
</a>

// Aria labels
<Button aria-label="Fechar modal">
  <X className="h-4 w-4" />
</Button>
```

### Keyboard Navigation

```tsx
// Atalhos de teclado
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Responsividade

### Grid Layouts

```tsx
// Dashboard grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>

// Action cards
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Actions */}
</div>

// Conteúdo principal
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Gráficos */}
</div>
```

### Mobile-First Approach

```tsx
// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">

// Texto responsivo
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Esconder em mobile
<div className="hidden md:block">

// Mostrar apenas em mobile
<div className="block md:hidden">
```

## Cores Semânticas

### Sempre Use Tokens CSS

```tsx
// ❌ ERRADO - Cores hardcoded
<div className="bg-blue-500 text-white">

// ✅ CORRETO - Tokens semânticos
<div className="bg-primary text-primary-foreground">

// ❌ ERRADO - HSL direto
<div style={{ color: 'hsl(220, 70%, 50%)' }}>

// ✅ CORRETO - Variável CSS
<div className="text-primary">
```

### Tokens Disponíveis

| Token | Uso |
|-------|-----|
| `background` | Fundo principal da aplicação |
| `foreground` | Texto principal |
| `primary` | Ações principais, CTAs |
| `secondary` | Ações secundárias |
| `muted` | Texto secundário, placeholders |
| `accent` | Destaques, hover states |
| `destructive` | Ações destrutivas, erros |
| `success` | Confirmações, sucessos |
| `warning` | Avisos, alertas |

## Performance

### Lazy Loading

```tsx
// Rotas pesadas
const BusinessIntelligence = lazy(() => import('@/pages/BusinessIntelligence'));
const Relatorios = lazy(() => import('@/pages/Relatorios'));

// Uso
<Suspense fallback={<LoadingState />}>
  <BusinessIntelligence />
</Suspense>
```

### Memoização

```tsx
// Componentes pesados
const ExpensiveComponent = memo(({ data }) => {
  // Renderização pesada
});

// Callbacks
const handleClick = useCallback(() => {
  // Ação
}, [dependencies]);

// Valores computados
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);
```

## Checklist de Implementação

Ao criar novos componentes, verifique:

- [ ] Usa variant correto do Card
- [ ] Tem loading state apropriado
- [ ] Feedback visual em ações async
- [ ] Confirmação para ações destrutivas
- [ ] Animações suaves (não excessivas)
- [ ] Acessibilidade (aria-labels, focus)
- [ ] Responsivo (mobile-first)
- [ ] Usa tokens semânticos de cor
- [ ] Performance otimizada (memo, lazy)
- [ ] Toast notifications apropriadas

---

**Desenvolvido por TSI Telecom**
