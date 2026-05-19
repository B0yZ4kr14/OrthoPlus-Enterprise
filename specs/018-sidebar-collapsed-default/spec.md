# Feature Specification: Sidebar com Categorias Recolhidas por Padrão

**Short Name**: `sidebar-collapsed-default`
**Feature Branch**: `[018-sidebar-collapsed-default]`
**Created**: 2026-05-19
**Status**: In Progress
**Project**: OrthoPlus Enterprise
**Priority**: P2 — UX Enhancement

---

## 1. Overview / Context

A sidebar atual do OrthoPlus Enterprise exibe todas as categorias de módulos sempre expandidas, ocupando espaço vertical significativo e dificultando a navegação em telas menores. Usuários com acesso a muitos módulos precisam scrollar extensivamente para encontrar a seção desejada.

### Motivation
- Melhorar a densidade de informação na sidebar
- Reduzir o scroll vertical necessário para navegação
- Dar controle ao usuário sobre quais categorias expandir
- Criar uma experiência visual mais limpa e premium

### Scope
**Inclui:**
- Estado de colapso/expansão por categoria (MenuGroup) na sidebar
- Persistência do estado por usuário/clínica no localStorage
- Comportamento padrão: todas as categorias recolhidas ao carregar
- Animações premium de transição (colapsar/expandir) com Framer Motion
- Indicador visual de categoria ativa mesmo quando recolhida
- Acessibilidade: suporte a teclado (Enter/Espaço para toggle)

**Exclui:**
- Alteração do comportamento global de colapso da sidebar (Ctrl+B)
- Reorganização das categorias ou itens do menu
- Alteração nas permissões de módulo ou acesso
- Modificações no mobile drawer (Sheet)

---

## 2. User Stories

### Story 1 — Categorias Recolhidas por Padrão (P1)
**As a** usuário logado
**I want** que todas as categorias da sidebar iniciem recolhidas
**So that** eu veja um resumo limpo de todas as seções disponíveis e escolha qual expandir

**Acceptance Criteria:**
- Ao carregar a aplicação, todas as categorias (MenuGroup) aparecem recolhidas
- O usuário vê apenas o título/ícone da categoria e a seta de expandir
- A categoria que contém a rota ativa é automaticamente expandida
- O estado é persistido entre navegações e recarregamentos

### Story 2 — Toggle Individual por Categoria (P1)
**As a** usuário logado
**I want** clicar no cabeçalho de uma categoria para expandi-la ou recolhê-la
**So that** eu tenha controle total sobre quais seções estão visíveis

**Acceptance Criteria:**
- Clique no cabeçalho da categoria alterna entre expandido/recolhido
- Apenas uma categoria pode estar expandida por vez (modo acordeão opcional)
- A transição é animada e suave
- Ícone de seta (chevron) gira 180° ao expandir

### Story 3 — Animações Premium (P2)
**As a** usuário logado
**I want** ver animações elegantes ao expandir/recolher categorias
**So that** a experiência seja fluida e profissional

**Acceptance Criteria:**
- Animação de fade + slide down ao expandir
- Animação de fade + slide up ao recolher
- Duração da animação: 300ms com easing ease-out
- Stagger de 40ms entre itens filhos ao expandir
- Sem jank ou layout shift durante a animação

### Story 4 — Persistência de Estado (P2)
**As a** usuário logado
**I want** que meu último estado de categorias expandidas seja lembrado
**So that** eu não precise reconfigurar a cada sessão

**Acceptance Criteria:**
- Estado salvo no localStorage com chave `orthoplus:sidebar:groups:{userId}`
- Se não houver estado salvo, usa o padrão (todas recolhidas)
- A categoria ativa sempre se expande independentemente do estado salvo
- Estado é limpo ao logout

---

## 3. Functional Requirements

### FR-001: Estado de Colapso por Categoria
**Description**: Cada categoria (MenuGroup) na sidebar deve ter seu próprio estado de colapso/expansão independente.
**Priority**: Must Have
**Acceptance Criteria**:
- Estado gerenciado via React Context ou Zustand store
- Inicialização padrão: todas as categorias recolhidas
- Exceção: categoria contendo a rota ativa é expandida automaticamente

### FR-002: Toggle de Categoria
**Description**: O usuário deve poder expandir/recolher categorias clicando no cabeçalho.
**Priority**: Must Have
**Acceptance Criteria**:
- Clique no cabeçalho da categoria alterna o estado
- Ícone chevron indica o estado atual
- Cursor pointer no cabeçalho
- Suporte a teclado (Enter/Espaço)

### FR-003: Animações de Transição
**Description**: Transições entre estados devem ser animadas com Framer Motion.
**Priority**: Should Have
**Acceptance Criteria**:
- AnimatePresence para montagem/desmontagem do conteúdo
- Variantes de animação definidas em lib/animations.ts
- Duração 300ms, staggerChildren 40ms
- Easing: `[0, 0, 0.2, 1]`

### FR-004: Persistência localStorage
**Description**: O estado das categorias deve persistir no localStorage do navegador.
**Priority**: Should Have
**Acceptance Criteria**:
- Chave: `orthoplus:sidebar:groups:{userId}`
- Valor: array de strings com os boundedContext expandidos
- Atualizado em tempo real a cada toggle
- Carregado na inicialização do context

### FR-005: Categoria Ativa Auto-Expand
**Description**: A categoria que contém a rota atual deve sempre estar expandida.
**Priority**: Must Have
**Acceptance Criteria**:
- Detecta a rota ativa via useLocation
- Compara com os urls dos items da categoria
- Expande automaticamente sem afetar o estado persistente
- Não colapsa automaticamente ao navegar para outra categoria

---

## 4. Non-Functional Requirements

### Performance
- Tempo de inicialização do estado < 50ms
- Animações a 60fps (sem layout thrashing)
- Sem re-renderizações desnecessárias (memoização adequada)

### Accessibility
- Suporte a teclado completo (Tab, Enter, Espaço)
- ARIA attributes: `aria-expanded`, `aria-controls`
- Focus visible nos cabeçalhos de categoria
- Screen reader anuncia "expandido" / "recolhido"

### Usability
- Feedback visual imediato ao clicar
- Estados hover e active nos cabeçalhos
- Indicador sutil de categoria com itens ativos mesmo quando recolhida

---

## 5. Success Criteria

### SC-001: Redução de Scroll
**Description**: Usuários precisam scrollar 50% menos na sidebar para acessar qualquer categoria
**Target**: 50% reduction in average scroll distance
**Measurement**: Analytics de scroll depth na sidebar

### SC-002: Tempo de Navegação
**Description**: Tempo médio para navegar entre módulos distantes deve reduzir
**Target**: < 3 segundos para encontrar e clicar em qualquer módulo
**Measurement**: Session recordings + heatmaps

### SC-003: Adoção do Toggle
**Description**: Usuários ativamente expandem/recolhem categorias
**Target**: 70% dos usuários usam o toggle pelo menos uma vez por sessão
**Measurement**: Event tracking no toggle de categoria

---

## 6. User Scenarios & Testing

### Scenario 1: Primeiro Acesso
**Given** um usuário loga pela primeira vez após o deploy
**When** a sidebar é carregada
**Then** todas as categorias aparecem recolhidas, exceto a que contém a rota atual

### Scenario 2: Expandir Categoria
**Given** o usuário está na dashboard e todas as categorias estão recolhidas
**When** ele clica em "CLÍNICA"
**Then** a categoria expande com animação suave, mostrando Pacientes, Agenda, PEP

### Scenario 3: Persistência entre Sessões
**Given** o usuário expandiu "FINANCEIRO" e "OPERAÇÕES"
**When** ele recarrega a página
**Then** as categorias "FINANCEIRO" e "OPERAÇÕES" permanecem expandidas

### Scenario 4: Navegação para Categoria Recolhida
**Given** o usuário está em "PACIENTES" (categoria CLÍNICA expandida)
**When** ele navega para "ESTOQUE" (categoria OPERAÇÕES recolhida)
**Then** a categoria OPERAÇÕES expande automaticamente para mostrar o item ativo

---

## 7. Edge Cases

### EC-001: Categoria Sem Itens Visíveis
**Condition**: Todos os itens de uma categoria estão ocultos por falta de permissão
**Expected Behavior**: A categoria inteira é ocultada (comportamento existente)

### EC-002: Única Categoria Visível
**Condition**: Apenas uma categoria tem itens visíveis para o usuário
**Expected Behavior**: A categoria é expandida automaticamente, toggle desabilitado visualmente

### EC-003: localStorage Indisponível
**Condition**: Modo privado/incognito onde localStorage é limitado
**Expected Behavior**: Funciona normalmente com estado em memória, sem erros no console

### EC-004: Estado Corrompido no localStorage
**Condition**: A chave do localStorage contém JSON inválido
**Expected Behavior**: Ignora o valor corrompido e usa o padrão (todas recolhidas)

---

## 8. Key Entities

### Entity: SidebarCategoryState
**Attributes**:
- expandedGroups: string[] (lista de boundedContext expandidos)
- userId: string (identificador para chave do localStorage)
- defaultState: "collapsed" | "expanded"

---

## 9. Dependencies & Assumptions

### Dependencies
- `@orthoplus/core-ui/sidebar` — componentes base da sidebar
- `framer-motion` — animações (já instalado)
- `lucide-react` — ícones (já instalado)
- React Router v6 — detecção de rota ativa (já instalado)

### Assumptions
- O usuário prefere ver menos informação de uma vez (paradigma recolhido)
- A categoria ativa é sempre a mais relevante no momento
- localStorage é suficiente para persistência (não precisa de backend)

---

## 10. Out of Scope

- Reorganização física dos itens do menu
- Drag-and-drop de categorias
- Personalização de cores por categoria
- Integração com backend para persistência
- Alteração no layout mobile (Sheet drawer)

---

## 11. Notes

- O componente `SidebarGroup` já existe e renderiza categorias — será o ponto principal de modificação
- O `SidebarNav` itera `menuGroups` do `sidebar.config.ts` — precisará do context de estado
- Framer Motion já é usado em `SidebarNav` e `SidebarGroup` para stagger animations — estender o padrão
- A estrutura `boundedContext` no `MenuGroup` pode servir como chave única para o estado
