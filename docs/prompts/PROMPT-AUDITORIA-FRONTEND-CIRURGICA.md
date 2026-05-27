# Prompt de Auditoria Cirurgica do Frontend — OrthoPlus Enterprise

> **Versao**: 1.0
> **Data**: 2026-05-27
> **Framework**: Engenharia de Prompts — Chain-of-Thought + Tree-of-Thought
> **Objetivo**: Investigar o frontend de forma cirurgica, confrontar codigo-fonte × VPS × specs, e validar fidelidade ao tema Premium v3.

---

## 1. Persona e Papel

Voce e um **Engenheiro de Software Senior especializado em Auditoria de Frontend e Design Systems**. Sua funcao e realizar uma investigacao forense no frontend do OrthoPlus Enterprise, comparando tres fontes de verdade:

1. **Codigo-fonte** (`apps/web/src/`) — estado atual do repositorio
2. **Ambiente de Producao (VPS)** — URL da VPS — o que os usuarios realmente veem
3. **Especificacoes tecnicas** (`.specify/`, `docs/`, `AGENTS.md`) — o que deveria ser

Voce deve ser meticuloso, metodico e documentar TODAS as divergencias encontradas com evidencias concretas (caminhos de arquivo, linhas de codigo, screenshots quando possivel).

---

## 2. Contexto do Projeto

### 2.1 Stack Tecnologico
- **Frontend**: React 18.3 + Vite 8 + TypeScript 5.8 + Tailwind CSS 3.4
- **Gerenciamento de Estado**: TanStack Query (server) + Zustand (client, modulos selecionados)
- **Roteamento**: React Router v6 (lazy-loaded)
- **UI Library**: Componentes customizados em `@orthoplus/core-ui` (Radix + CVA + Tailwind)
- **Animacoes**: Framer Motion
- **Icones**: Lucide React
- **Graficos**: Recharts
- **Temas**: CSS Variables HSL — tema Premium v3 (Light-first, Sage Green CTAs)

### 2.2 Estrutura de Diretorios do Frontend
```
apps/web/src/
├── main.tsx                    # Entry point (StrictMode, providers)
├── App.tsx                     # QueryClient, ThemeProvider, AuthProvider, ModulesProvider
├── routes/AppRoutes.tsx        # 328 linhas, lazy-loaded routes, moduleKey guards
├── index.css                   # CSS Variables Premium v3 (Light-first · Sage Green)
├── components/                 # ~46 pastas de componentes compartilhados
│   ├── modules/sidebar-preview/# Sidebar com AdminSection, ModuleCategory, etc.
│   ├── shared/                 # LoadingState, PageHeader, EmptyState, StatusBadge, etc.
│   └── AppLayout.tsx           # Layout principal da aplicacao
├── contexts/                   # AuthContext, ModulesContext, ThemeContext
├── hooks/                      # Hooks globais + hooks de API
├── lib/                        # apiClient, utils, adapters, schemas
├── modules/                    # 43 modulos de dominio (faturamento, tiss, pep, etc.)
│   └── {modulo}/
│       ├── ui/pages/           # Paginas do modulo
│       ├── application/hooks/  # React Query hooks
│       └── presentation/       # Componentes de apresentacao
└── types/database.ts           # ~8929 linhas, AUTOGENERADO pelo Prisma
```

### 2.3 Tema Premium v3 — Variaveis CSS (Fonte de Verdade)
```css
:root {
  --background:        210 40% 98%;   /* slate-50 */
  --foreground:        222 47% 6%;    /* slate-950 */
  --interactive:       160 84% 30%;   /* sage-600 — CTA primario */
  --interactive-hover: 160 84% 25%;   /* sage-700 */
  --accent:            151 55% 95%;   /* sage-50 */
  --ring:              160 84% 30%;   /* sage-600 */
  --module-blue:       217 91% 60%;
  --module-purple:     270 60% 65%;
  --module-yellow:     45 93% 47%;
  /* ... */
}
```
- **Fonte**: Plus Jakarta Sans (400, 500, 600, 700)
- **Mono**: JetBrains Mono
- **Design**: Flat design, cards com bordas sutis, sombras leves
- **CTAs**: Verde sage (`--interactive`) em todos os botoes primarios

### 2.4 Sistema de Modulos e Guards
- Cada rota protegida por `moduleKey` (ex: `FATURAMENTO`, `AGENDA`, `PEP`)
- `ModulesContext` gerencia quais modulos estao ativos por clinica
- `SidebarPreview` exibe apenas modulos habilitados

### 2.5 Specs Existentes
- 29 specs com `spec.md` + `plan.md` + `tasks.md`
- Constitution em `.specify/memory/constitution.md`
- Architecture views em `.specify/memory/architecture-*.md`

---

## 3. Objetivo da Auditoria

> **Investigar cirurgicamente o frontend do OrthoPlus Enterprise e validar se ele reflete fielmente como fonte de verdade: (1) as especificacoes tecnicas, (2) o tema Premium v3, e (3) o que esta deployado na VPS. Identificar qualquer uso de temas legados, componentes obsoletos, ou funcionalidades nao alinhadas com as specs.**

---

## 4. Instrucoes de Execucao (Passo a Passo)

### Fase 1: Mapeamento do Estado Atual do Codigo-Fonte

Execute as seguintes investigacoes no repositorio local:

#### 4.1.1 Estrutura de Temas
```
TAREFA: Verificar consistencia do tema Premium v3 em TODO o frontend.
```
- [ ] Ler `apps/web/src/index.css` — verificar se todas as variaveis CSS estao definidas e consistentes
- [ ] Verificar `apps/web/src/contexts/ThemeContext.tsx` — modo dark existe? E usado? E necessario?
- [ ] Buscar por `bg-blue-`, `bg-green-`, `text-blue-` hardcoded em componentes (deve usar `hsl(var(--interactive))`)
- [ ] Verificar se ha classes Tailwind legadas (ex: `bg-gray-`, `text-gray-` em vez de `bg-muted`, `text-muted-foreground`)
- [ ] Contar quantos componentes ainda usam cores hardcoded vs. variaveis CSS
- [ ] Verificar se `framer-motion` esta sendo usado conforme padrao (animacoes sutis, nao exageradas)

#### 4.1.2 Sistema de Sidebar e Navegacao
```
TAREFA: Auditar a sidebar e menus de navegacao.
```
- [ ] Ler `apps/web/src/components/modules/sidebar-preview/` — todos os componentes
- [ ] Verificar se a sidebar reflete TODOS os 43 modulos existentes em `apps/web/src/modules/`
- [ ] Verificar se ha rotas em `AppRoutes.tsx` que NAO aparecem na sidebar
- [ ] Verificar se ha itens na sidebar que apontam para rotas inexistentes (404)
- [ ] Validar se o `moduleKey` de cada rota corresponde ao modulo correto
- [ ] Verificar se a sidebar usa os icones corretos do Lucide (consistentes com o proposito do modulo)
- [ ] Verificar se a sidebar respeita o `ModulesContext` (esconde modulos desabilitados)

#### 4.1.3 Paginas e Cards
```
TAREFA: Auditar componentes de pagina e card em todos os modulos.
```
- [ ] Para cada modulo em `apps/web/src/modules/`, listar as paginas existentes
- [ ] Verificar se todas as paginas usam `PageHeader` do componente compartilhado
- [ ] Verificar se os cards usam o componente `Card` do `@orthoplus/core-ui`
- [ ] Verificar se ha uso de componentes de UI legados (ex: Material-UI, Ant Design, componentes inline nao padronizados)
- [ ] Verificar se o padding, spacing e tipografia seguem o padrao do projeto (consistente com `index.css`)
- [ ] Identificar paginas que ainda usam layout legado (sem `AppLayout` ou com estrutura diferente)

#### 4.1.4 Efeitos Premium e Animacoes
```
TAREFA: Verificar uso de efeitos premium e animacoes.
```
- [ ] Listar todos os componentes que usam `framer-motion`
- [ ] Verificar se as animacoes seguem o padrao do projeto (sutis, profissionais)
- [ ] Verificar se ha animacoes excessivas ou nao performaticas
- [ ] Verificar se o `ProductTour` esta atualizado e reflete as funcionalidades atuais
- [ ] Verificar se ha efeitos de glassmorphism, neon, ou gradientes nao autorizados pelo tema

#### 4.1.5 Funcoes e Hooks por Modulo
```
TAREFA: Mapear hooks e funcoes de cada modulo.
```
- [ ] Para cada modulo, listar os hooks em `application/hooks/`
- [ ] Verificar se os hooks usam `apiClient` (padronizado) vs. `axios` direto ou `fetch`
- [ ] Verificar se os hooks tem tratamento de erro adequado
- [ ] Verificar se ha hooks duplicados entre modulos (DRY violation)
- [ ] Verificar se os hooks usam `useAuth` para obter `clinicId` (multi-tenancy)

### Fase 2: Confronto com Especificacoes Tecnicas

#### 4.2.1 Validacao contra Specs
```
TAREFA: Confrontar implementacao atual com specs documentadas.
```
- [ ] Para cada spec em `.specify/features/`, verificar se as funcionalidades descritas estao implementadas
- [ ] Identificar funcionalidades em specs que NAO existem no codigo (gap analysis)
- [ ] Identificar funcionalidades no codigo que NAO estao em specs (scope creep)
- [ ] Verificar se os modulos implementados (`faturamento`, `tiss`, `pep`, etc.) seguem a arquitetura definida em `constitution.md`
- [ ] Verificar se o Clean Architecture parcial esta sendo respeitado (domain -> application -> infrastructure -> ui)

#### 4.2.2 Validacao de Rotas
```
TAREFA: Verificar se todas as rotas documentadas existem e funcionam.
```
- [ ] Listar TODAS as rotas em `AppRoutes.tsx`
- [ ] Verificar se cada rota tem um `moduleKey` valido
- [ ] Verificar se ha rotas duplicadas ou conflitantes
- [ ] Verificar se ha rotas que deveriam existir segundo as specs mas nao existem

### Fase 3: Confronto com Ambiente de Producao (VPS)

#### 4.3.1 Verificacao de Deploy
```
TAREFA: Comparar codigo-fonte com o que esta na VPS.
```
- [ ] Acessar a VPS via browser e verificar se o build atual reflete o codigo mais recente
- [ ] Verificar se ha funcionalidades na VPS que nao existem no codigo (deploy manual esquecido)
- [ ] Verificar se ha funcionalidades no codigo que nao aparecem na VPS (deploy falhou ou nao foi feito)
- [ ] Verificar se o tema na VPS corresponde ao tema no codigo (cores, fontes, espacamentos)
- [ ] Verificar se a sidebar na VPS mostra os mesmos modulos que o codigo-fonte indica

#### 4.3.2 Testes de Funcionalidade Critica
```
TAREFA: Testar funcionalidades criticas na VPS.
```
- [ ] Login e autenticacao funcionam?
- [ ] Sidebar carrega corretamente?
- [ ] Navegacao entre modulos funciona?
- [ ] Paginas de erro (404) estao personalizadas?
- [ ] O tema persiste entre recarregamentos?

### Fase 4: Identificacao de Legados e Obsolescencias

#### 4.4.1 Componentes Legados
```
TAREFA: Identificar e catalogar componentes legados.
```
- [ ] Listar todos os componentes que ainda usam `className` com cores hardcoded (ex: `bg-blue-500`, `text-green-600`)
- [ ] Listar componentes que importam de bibliotecas obsoletas (se houver)
- [ ] Identificar componentes `Any` (uso de `as any`) — ja existem ~38 no Financeiro, nao adicionar mais
- [ ] Identificar uso de `@ts-ignore` ou `@ts-expect-error` inuteis

#### 4.4.2 Temas Legados
```
TAREFA: Identificar vestigios de temas antigos.
```
- [ ] Verificar se existe codigo de tema dark nao utilizado
- [ ] Verificar se ha referencias a cores antigas (ex: `primary` em vez de `interactive`)
- [ ] Verificar se ha CSS inline ou `<style>` tags em componentes
- [ ] Verificar se ha arquivos `.css` ou `.scss` adicionais alem de `index.css`

#### 4.4.3 Frontend Legado
```
TAREFA: Identificar arquivos ou pastas de frontend legado.
```
- [ ] Verificar se existe pasta `frontend/` na raiz (ha uma!) — esta sendo usada? Deveria ser removida?
- [ ] Verificar se ha componentes duplicados entre `apps/web/src/components/` e outras pastas
- [ ] Verificar se ha imports que apontam para caminhos legados

---

## 5. Formato de Saida Esperado

Ao final da auditoria, produza um relatorio estruturado em Markdown:

```markdown
# Relatorio de Auditoria Cirurgica — Frontend OrthoPlus Enterprise

## Resumo Executivo
- **Status Geral**: [✅ Alinhado / ⚠️ Divergencias Menores / ❌ Divergencias Criticas]
- **Nota de Conformidade**: X/100
- **Items Criticos**: N
- **Items de Atencao**: N
- **Items Informativos**: N

## 1. Tema Premium v3
### 1.1 Variaveis CSS
| Variavel | Esperado | Atual | Status |
|----------|----------|-------|--------|
| --interactive | sage-600 | ... | ✅/❌ |

### 1.2 Cores Hardcoded Encontradas
```
[Arquivo]:[Linha] -> [Classe] -> [Deveria ser]
```

## 2. Sidebar e Navegacao
### 2.1 Modulos Mapeados
| Modulo | Rota Existe | Sidebar Item | moduleKey | Status |
|--------|-------------|--------------|-----------|--------|
| Faturamento | ✅ | ✅ | FATURAMENTO | ✅ |

### 2.2 Rotas Orfas (sem sidebar item)
- `/rota/x` -> nao aparece na sidebar

### 2.3 Itens Orfas (sem rota)
- "Menu Y" -> aponta para rota inexistente `/rota/y`

## 3. Paginas e Cards
### 3.1 Paginas Auditadas
| Modulo | Pagina | PageHeader | Card padrao | Tema correto | Status |
|--------|--------|------------|-------------|--------------|--------|

### 3.2 Componentes Nao-Padronizados
- `[caminho]` -> usa componente inline em vez de `@orthoplus/core-ui`

## 4. Efeitos e Animacoes
### 4.1 Uso de Framer Motion
| Componente | Tipo de Animacao | Adequado? |
|------------|------------------|-----------|

## 5. Confronto com Specs
### 5.1 Funcionalidades em Specs -> NAO Implementadas
| Spec | Funcionalidade | Prioridade |
|------|----------------|------------|

### 5.2 Funcionalidades Implementadas -> NAO em Specs
| Modulo | Funcionalidade | Acao Sugerida |
|--------|----------------|---------------|

## 6. Confronto com VPS
### 6.1 Divergencias Codigo × VPS
| Funcionalidade | Codigo | VPS | Acao |
|----------------|--------|-----|------|

## 7. Legados e Obsolescencias
### 7.1 Componentes Legados
### 7.2 Temas Legados
### 7.3 Arquivos/Folders a Remover

## 8. Plano de Remediacao Priorizado
### Prioridade 1 (Critico — Semana 1)
### Prioridade 2 (Importante — Semana 2)
### Prioridade 3 (Desejavel — Backlog)

## 9. Evidencias
[Links para arquivos, linhas de codigo, screenshots]
```

---

## 6. Criterios de Sucesso

A auditoria sera considerada completa quando:

1. **100% dos modulos** em `apps/web/src/modules/` forem auditados
2. **Todas as rotas** em `AppRoutes.tsx` forem verificadas contra a sidebar
3. **Todas as variaveis CSS** do tema forem validadas
4. **Todas as specs ativas** forem confrontadas com o codigo
5. **A VPS** for acessada e comparada com o codigo-fonte
6. Um **plano de remediacao priorizado** for gerado com estimativas de esforco

---

## 7. Restricoes e O que NAO Fazer

- ❌ **NAO modificar codigo** durante a auditoria — apenas investigar e documentar
- ❌ **NAO corrigir bugs** encontrados — criar tasks separadas
- ❌ **NAO remover arquivos** — apenas catalogar para remocao futura
- ❌ **NAO alterar specs** — apenas validar conformidade
- ❌ **NAO fazer deploy** — a auditoria e read-only
- ✅ **Documentar TUDO** — mesmo divergencias que parecam obvias

---

## 8. Contexto Adicional para o Agente

### 8.1 Arquivos-Chave para Leitura Inicial
```
apps/web/src/index.css                    # Tema CSS Variables
apps/web/src/App.tsx                       # Providers e layout global
apps/web/src/routes/AppRoutes.tsx          # Todas as rotas
apps/web/src/contexts/ThemeContext.tsx     # Logica de tema
apps/web/src/contexts/ModulesContext.tsx   # Logica de modulos
apps/web/src/components/AppLayout.tsx      # Layout principal
apps/web/src/components/modules/sidebar-preview/  # Sidebar
```

### 8.2 Estrutura de Specs
```
.specify/features/
├── index.md                    # Indice de todas as specs
├── 002-agenda/
├── 003-pep/
├── 004-financeiro/
├── 006-orcamentos/
├── 007-procedimentos/
├── 008-pdv/
├── 009-faturamento/
├── 010-funcionarios/
├── 011-inventario/
├── 012-tiss/
├── 013-crm/
├── 014-notificacoes/
└── 017-omk-governance/
```

### 8.3 Constitution e Arquitetura
```
.specify/memory/constitution.md            # Regras arquiteturais
.specify/memory/architecture.md            # Visao arquitetural
.specify/memory/architecture-logical-view.md
.specify/memory/architecture-development-view.md
```

### 8.4 VPS
```
Consulte o AGENTS.md raiz para URLs e credenciais de acesso.
Health endpoint disponivel para verificacao de status.
Backend gerenciado via PM2.
```

---

## 9. Instrucao Final

> **INICIE a auditoria lendo os arquivos-chave listados na secao 8.1, depois processe modulo por modulo seguindo as fases 1-4. Produza o relatorio final na pasta `docs/auditoria/` com nome `auditoria-frontend-YYYY-MM-DD.md`. Se encontrar divergencias CRITICAS (seguranca, dados incorretos, quebra de funcionalidade), sinalize imediatamente no inicio do relatorio.**
