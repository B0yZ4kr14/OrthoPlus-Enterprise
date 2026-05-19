# Sistema de Efeito 3D na Sidebar - OrthoPlus Enterprise

## Visão Geral
A sidebar do OrthoPlus Enterprise implementa um sistema completo de efeito 3D com profundidade visual através de cards elevados, sombras profundas, títulos em negrito e divisões visuais entre grupos de menu. Este sistema está aplicado e funciona em **todos os temas** (light, dark, professional-dark, high-contrast, high-contrast-dark).

## Características do Design 3D

### 1. **Cards de Grupo com Efeito 3D**
Cada grupo de menu está envolvido em um card com efeito de profundidade:

```tsx
<div className="rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-lg backdrop-blur-sm border border-sidebar-border/50 p-2">
```

**Elementos do Efeito:**
- `rounded-2xl`: Bordas super arredondadas (1rem)
- `bg-gradient-to-br`: Gradiente diagonal sutil
- `from-sidebar-accent/50 to-sidebar-accent/30`: Gradiente com opacidade variável
- `shadow-lg`: Sombra profunda
- `backdrop-blur-sm`: Efeito de desfoque no fundo
- `border border-sidebar-border/50`: Borda sutil com opacidade

### 2. **Títulos de Seção em Negrito com Sombras**
Os títulos de cada seção (Visão Geral, Cadastros, Clínica, etc.) têm estilo destacado:

```tsx
<SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
  <span className="tracking-wide">{group.label}</span>
</SidebarGroupLabel>
```

**Características:**
- `text-sm`: Tamanho de fonte aumentado (de xs para sm)
- `font-bold`: Negrito forte
- `drop-shadow-md`: Sombra de texto para profundidade
- `tracking-wide`: Espaçamento entre letras aumentado
- `py-2`: Padding vertical para mais presença visual

### 3. **Itens de Menu Interativos**
Cada item de menu tem hover states e estados ativos com efeito 3D:

```tsx
<SidebarMenuButton 
  className="group/button my-1 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:border-l-4 data-[active=true]:border-l-primary data-[active=true]:shadow-lg transition-all duration-200 min-h-[44px]"
>
```

**Estados Visuais:**
- **Normal**: Fundo transparente
- **Hover**: `hover:shadow-md` - sombra ao passar o mouse
- **Ativo**: `shadow-lg` + `border-l-4` - sombra profunda + borda esquerda colorida

### 4. **Ícones com Tamanho Aumentado**
Os ícones dos menus foram aumentados para maior visibilidade:

```tsx
<item.icon className="h-5 w-5 shrink-0" />
```

- Tamanho: `h-5 w-5` (anteriormente h-4 w-4)
- Melhor proporção visual com os textos em negrito

### 5. **Badges com Sombras**
Os badges (Novo, Beta, IA) também receberam efeito 3D:

```tsx
<Badge className="text-[10px] px-2 py-0.5 shadow-sm">
  {item.badge}
</Badge>
```

- `shadow-sm`: Sombra sutil para destacar
- `px-2`: Padding aumentado para melhor legibilidade

### 6. **Logo com Drop Shadow**
A logo da clínica no header tem sombra intensa:

```tsx
<img src="/src/assets/ortho-logo-full.png" alt="Ortho +" className="h-24 w-auto object-contain transition-all duration-200 drop-shadow-2xl" />
```

- `drop-shadow-2xl`: Sombra máxima para valorizar a marca

## Estrutura de Cards por Seção

### Seções Padrão
```
┌─────────────────────────────┐
│  VISÃO GERAL (Bold + Shadow)│
│  ┌─────────────────────────┐│
│  │ Dashboard               ││
│  └─────────────────────────┘│
└─────────────────────────────┘

┌─────────────────────────────┐
│  CADASTROS (Bold + Shadow)  │
│  ┌─────────────────────────┐│
│  │ Pacientes               ││
│  │ Dentistas    (Ativo)    ││
│  │ Funcionários            ││
│  │ Procedimentos           ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Seções Colapsáveis
```
┌─────────────────────────────┐
│  ESTOQUE ▼ (Bold + Shadow)  │
│  ┌─────────────────────────┐│
│  │ Dashboard               ││
│  │ Cadastros               ││
│  │ Requisições             ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

## Espaçamento e Hierarquia

### Espaçamento entre Cards
```tsx
<div className="space-y-3 px-2">
```

- `space-y-3`: 12px de espaço entre cada card de grupo
- `px-2`: 8px de padding lateral para criar "canal" visual

### Padding Interno dos Cards
```tsx
<div className="...p-2">
```

- `p-2`: 8px de padding interno nos cards para criar "moldura"

## Variáveis CSS para Todos os Temas

### Light Theme (Root)
```css
--sidebar-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--sidebar-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--sidebar-shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.5);
--sidebar-shadow-xl: 0 12px 28px rgba(0, 0, 0, 0.6);
```

### Dark Theme
```css
--sidebar-shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.5);
--sidebar-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.6);
--sidebar-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.7);
--sidebar-shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.8);
```

### Professional Dark Theme
```css
--sidebar-shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.6);
--sidebar-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.7);
--sidebar-shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.8);
--sidebar-shadow-xl: 0 12px 36px rgba(0, 0, 0, 0.9);
```

### High Contrast Theme
```css
--sidebar-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.4);
--sidebar-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--sidebar-shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.6);
--sidebar-shadow-xl: 0 12px 28px rgba(0, 0, 0, 0.7);
```

### High Contrast Dark Theme
```css
--sidebar-shadow-sm: 0 2px 8px rgba(255, 255, 255, 0.1);
--sidebar-shadow-md: 0 4px 16px rgba(255, 255, 255, 0.15);
--sidebar-shadow-lg: 0 8px 24px rgba(255, 255, 255, 0.2);
--sidebar-shadow-xl: 0 12px 32px rgba(255, 255, 255, 0.25);
```

## Transições e Animações

Todas as interações têm transições suaves:

```tsx
className="transition-all duration-200"
className="transition-all duration-300"
```

- **duration-200**: Para mudanças de hover (200ms)
- **duration-300**: Para animações de colapso (300ms)

## Estado Ativo

O item de menu ativo recebe destaque visual máximo:

```css
data-[active=true]:bg-primary/20       /* Fundo com cor primária */
data-[active=true]:text-primary        /* Texto na cor primária */
data-[active=true]:border-l-4          /* Borda esquerda larga */
data-[active=true]:border-l-primary    /* Borda na cor primária */
data-[active=true]:shadow-lg           /* Sombra profunda */
```

## Footer com Efeito 3D

O rodapé também recebe tratamento visual:

```tsx
<SidebarFooter className="border-t border-sidebar-border p-3 shadow-lg">
  <p className="text-xs text-sidebar-foreground/80 font-semibold drop-shadow">Ortho + v1.0</p>
  <p className="text-[10px] text-sidebar-foreground/60 font-medium">© 2025 TSI Telecom</p>
</SidebarFooter>
```

- `shadow-lg`: Sombra no topo do footer
- `font-semibold` e `font-medium`: Textos com peso visual
- `drop-shadow`: Sombra de texto para legibilidade

## Acessibilidade

O design 3D mantém todos os requisitos de acessibilidade:

- **Touch Targets**: Todos os botões têm `min-h-[44px]` (44px mínimo)
- **Contraste**: Mantido em todos os temas (WCAG AA/AAA)
- **Navegação por Teclado**: Focus states preservados
- **Screen Readers**: Estrutura semântica mantida

## Responsividade

### Desktop (collapsed = false)
- Largura: `w-64` (256px)
- Todos os textos visíveis
- Cards completos com padding

### Mini Sidebar (collapsed = true)
- Largura: `w-16` (64px)
- Apenas ícones visíveis
- Cards mantêm visual mas sem textos

### Mobile
- Renderiza como Sheet/Drawer
- Mantém todos os efeitos 3D quando aberto

## Manutenção

Para adicionar novo grupo de menu com efeito 3D:

```tsx
<div className="rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 shadow-lg backdrop-blur-sm border border-sidebar-border/50 p-2">
  <SidebarGroup>
    <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
      {!collapsed && <span className="tracking-wide">Nome do Grupo</span>}
    </SidebarGroupLabel>
    <SidebarGroupContent className="mt-1">
      {/* Itens do menu */}
    </SidebarGroupContent>
  </SidebarGroup>
</div>
```

## Código Completo de Referência

O código completo está em:
- **Componente:** `src/components/AppSidebar.tsx`
- **Estilos:** `src/index.css` (variáveis de tema)
- **Variantes:** Cards usam `rounded-2xl`, `shadow-lg`, `backdrop-blur-sm`

## Comparação Visual

### Antes (Flat Design)
```
Visão Geral          ← Texto pequeno, sem sombra
  Dashboard          ← Sem profundidade
Cadastros            ← Sem destaque
  Pacientes          ← Flat
  Dentistas          ← Sem efeito
```

### Depois (Design 3D)
```
╔═══════════════════════════════╗
║ VISÃO GERAL (Bold + Shadow) ║
║ ┌───────────────────────────┐ ║
║ │ 🏠 Dashboard             │ ║
║ └───────────────────────────┘ ║
╚═══════════════════════════════╝
     ↓ (espaço)
╔═══════════════════════════════╗
║ CADASTROS (Bold + Shadow)   ║
║ ┌───────────────────────────┐ ║
║ │ 👥 Pacientes             │ ║
║ │ 🦷 Dentistas   [ATIVO]   │ ║ ← Com sombra + borda
║ │ 👔 Funcionários          │ ║
║ └───────────────────────────┘ ║
╚═══════════════════════════════╝
```

## Notas Finais

- **Profundidade Consistente**: Todos os cards têm o mesmo nível de profundidade para hierarquia visual uniforme
- **Gradientes Sutis**: Usam opacidade baixa (30-50%) para não competir com conteúdo
- **Sombras Adaptativas**: Intensidade varia por tema (mais fortes no dark, sutis no light)
- **Performance**: Backdrop blur usa GPU acceleration para suavidade
- **Tema-Agnóstico**: Usa variáveis CSS (`--sidebar-*`) para funcionar em todos os temas automaticamente
