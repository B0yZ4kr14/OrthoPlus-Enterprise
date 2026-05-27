# Relatorio de Auditoria Cirurgica — Frontend OrthoPlus Enterprise

> **Data da Auditoria**: 2026-05-27
> **Auditor**: Agente de IA — Engenheiro de Software Senior
> **Fontes**: Codigo-fonte (apps/web/src/), VPS (100.111.74.69), Specs (.specify/)
> **Metodologia**: Chain-of-Thought + Tree-of-Thought — 4 fases estruturadas

---

## Resumo Executivo

- **Status Geral**: ⚠️ Divergencias Menores
- **Nota de Conformidade**: 78/100
- **Items Criticos**: 2
- **Items de Atencao**: 12
- **Items Informativos**: 8

### Sinalizacao de Divergencias Criticas

1. **CRITICO**: 594 ocorrencias de cores Tailwind hardcoded (bg-blue-500, text-green-600, etc.) espalhadas por ~45 arquivos — violam o tema Premium v3 que exige uso de variaveis CSS.
2. **CRITICO**: Fonte do body definida como 'Inter' em index.css (linha 225) em vez de 'Plus Jakarta Sans' — inconsistencia com a fonte oficial do projeto.

---

## 1. Tema Premium v3

### 1.1 Variaveis CSS

| Variavel | Esperado | Atual | Status |
|----------|----------|-------|--------|
| --background | slate-50 | 210 40% 98% | ✅ |
| --foreground | slate-950 | 222 47% 6% | ✅ |
| --interactive | sage-600 | 160 84% 30% | ✅ |
| --interactive-hover | sage-700 | 160 84% 25% | ✅ |
| --accent | sage-50 | 151 55% 95% | ✅ |
| --ring | sage-600 | 160 84% 30% | ✅ |
| --sidebar-background | white | 0 0% 100% | ✅ |
| --sidebar-primary | sage-600 | 160 84% 30% | ✅ |
| --radius | 0.5rem | 0.5rem | ✅ |
| Fonte body | Plus Jakarta Sans | Inter | ❌ |

**Observacoes**:
- Tema dark (.premium-dental-dark) existe e esta funcional via ThemeContext.tsx
- Tema legado (light, dark, professional-dark, high-contrast) tem migracao automatica para premium equivalente
- Variaveis de sombra bem definidas (--shadow-card, --shadow-card-hover, --shadow-interactive)
- Classes utilitarias customizadas (.bg-interactive, .text-interactive, etc.) funcionam corretamente

### 1.2 Cores Hardcoded Encontradas

**Total: 594 ocorrencias em ~45 arquivos**

Categorias mais frequentes:
- `text-green-500` / `bg-green-500` — 45 ocorrencias (status de sucesso, indicadores de forca de senha)
- `text-blue-500` / `bg-blue-500` — 28 ocorrencias (status de webhook, CRM, crypto)
- `text-red-500` / `bg-red-500` — 22 ocorrencias (erros, status cancelado)
- `text-gray-400` / `bg-gray-500` — 67 ocorrencias (estados neutros, desabilitados)
- `text-orange-500` / `bg-orange-500` — 15 ocorrencias (crypto, status de alerta)
- `text-purple-500` / `bg-purple-500` — 12 ocorrencias (crypto, modulos)
- `dark:bg-*` / `dark:text-*` — 129 ocorrencias (dark mode hardcoded inline)

**Arquivos mais problematicos**:
```
components/auth/password-strength-indicator/PasswordStrengthIndicator.tsx
  -> bg-red-500, bg-orange-500, bg-yellow-500, bg-lime-500, bg-green-500
  -> Deveria usar: badge-error, badge-warning, badge-success

components/crypto/bitcoin-info-card/AdvantagesGrid.tsx
  -> text-blue-500, text-yellow-500, text-green-500, text-purple-500
  -> Deveria usar: variaveis CSS de modulo (module-blue, module-green, etc.)

modules/agenda/ui/components/AppointmentCard.tsx
  -> bg-gray-500/10 text-gray-700 border-gray-200
  -> Deveria usar: text-muted-foreground, bg-muted, border-border

modules/estoque/ui/pages/EstoqueInventario.tsx
  -> bg-gray-500 (fallback de status)
  -> Deveria usar: bg-muted ou badge-neutral
```

### 1.3 Fonte Tipografica

**PROBLEMA**: `apps/web/src/index.css` linha 225:
```css
body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Esperado**: Plus Jakarta Sans (ja importada no topo do arquivo)
**Impacto**: A fonte display (h1-h4) usa Plus Jakarta Sans corretamente, mas o body usa Inter. Isso cria inconsistencia tipografica.
**Correcao**: Alterar para `font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;`

---

## 2. Sidebar e Navegacao

### 2.1 Modulos Mapeados

| Grupo | Modulos na Sidebar | Rotas Correspondentes | Status |
|-------|-------------------|----------------------|--------|
| VISAO GERAL | Dashboard Executivo (/) | / | ✅ |
| CLINICA | Agenda, Pacientes, PEP, Odontograma, Tratamentos, Orcamentos, Contratos, Procedimentos | /agenda, /pacientes, /pep, /odontograma, /tratamentos, /orcamentos, /contratos, /procedimentos | ✅ |
| FINANCEIRO | Fluxo de Caixa, Contas a Receber, Inadimplencia, PDV, Split, Notas Fiscais, Crypto | /financeiro, /financeiro/receber, /inadimplencia, /pdv, /split-pagamento, /financeiro/fiscal/notas, /crypto-payment | ✅ |
| CRESCIMENTO | CRM, Fidelidade, Marketing, Portal Paciente, BI, Dashboard Comercial | /crm, /fidelidade, /marketing-auto, /portal-paciente, /bi, /dashboards/comercial | ✅ |
| OPERACOES | Estoque, Diagnostico IA, Teleodontologia, TISS, LGPD | /estoque, /ia-radiografia, /teleodonto, /faturamento-tiss, /lgpd | ✅ |
| CONFIGURACOES | Configuracoes Gerais, Dentistas, Funcionarios, Usuarios, Meus Modulos, Bancos por Categoria | /configuracoes, /dentistas, /funcionarios, /usuarios, /configuracoes/modulos, /configuracoes/database | ✅ |
| ADMIN | Admin DB, Backups, Terminal, GitHub, Crypto Config, Wiki, Audit Logs, Monitoramento | /admin/database, /admin/backups, /admin/terminal, /admin/github, /admin/crypto-config, /admin/wiki, /admin/audit, /admin/monitoring | ✅ |

### 2.2 Rotas Orfas (nao aparecem na sidebar)

Total: 26 rotas sem item na sidebar

```
/403                          -> Pagina de erro (esperado, nao precisa)
/admin/adrs                   -> Sem item na sidebar
/admin/api-docs               -> Sem item na sidebar
/admin/audit-trail            -> Sem item na sidebar
/admin/logs                   -> Sem item na sidebar
/assinatura-icp               -> Sem item (sub-pagina de PEP)
/auth                         -> Pagina publica (esperado)
/dashboard                    -> Duplicata de /
/demo                         -> Pagina de demo
/estoque/scanner              -> Sub-pagina de estoque
/faturamento/nfes             -> NOVA ROTA (recém adicionada)
/faturamento/relatorio        -> NOVA ROTA (recém adicionada)
/files                        -> Sem item na sidebar
/files/upload                 -> Sub-pagina
/financeiro/conciliacao       -> Sub-pagina de financeiro
/fluxo-digital                -> Sub-pagina de PEP
/help                         -> Sem item
/memory-hub                   -> Sem item
/orcamentos/editar/:id        -> Sub-pagina de orcamentos
/orcamentos/novo              -> Sub-pagina de orcamentos
/pacientes/busca              -> Sub-pagina de pacientes
/pacientes/:id                -> Sub-pagina de pacientes
/pacientes/novo               -> Sub-pagina de pacientes
/pdv/dashboard                -> Sub-pagina de PDV
/pdv/metas                    -> Sub-pagina de PDV
/pep/:patientId               -> Sub-pagina de PEP
/recall                       -> Sem item na sidebar
```

**Analise**: A maioria das rotas orfas sao sub-paginas (detalhe, edicao, criacao) ou paginas publicas. Isso e aceitavel. As novas rotas `/faturamento/nfes` e `/faturamento/relatorio` precisam ser adicionadas a sidebar.

**Items de Atencao**:
- `/faturamento/nfes` — nova rota, precisa ser adicionada a sidebar
- `/faturamento/relatorio` — nova rota, precisa ser adicionada a sidebar
- `/recall` — rota orfa, precisa de item na sidebar ou remocao
- `/files` — rota orfa, precisa de item na sidebar
- `/memory-hub` — rota orfa, precisa de item na sidebar

### 2.3 Itens Orfas da Sidebar (apontam para rotas inexistentes)

**Resultado**: NENHUM item da sidebar aponta para rota inexistente. ✅

---

## 3. Paginas e Cards

### 3.1 Paginas Auditadas

| Modulo | Paginas | PageHeader | Card padrao | Status |
|--------|---------|------------|-------------|--------|
| estoque | 20 | 23 usos | ✅ | ⚠️ |
| admin | 15 | 14 usos | ✅ | ✅ |
| settings | 11 | 9 usos | ✅ | ⚠️ |
| financeiro | 10 | 11 usos | ✅ | ✅ |
| bi | 9 | 6 usos | ✅ | ⚠️ |
| pacientes | 8 | 2 usos | ✅ | ❌ |
| pdv | 6 | 3 usos | ✅ | ❌ |
| pep | 5 | 3 usos | ✅ | ❌ |
| core | 5 | 1 uso | ✅ | ❌ |
| marketing-auto | 4 | 5 usos | ✅ | ✅ |
| faturamento | 4 | 1 uso | ✅ | ❌ |
| procedimentos | 3 | 1 uso | ✅ | ❌ |
| orcamentos | 3 | 2 usos | ✅ | ⚠️ |
| agenda | 3 | 1 uso | ✅ | ❌ |
| tratamentos | 2 | 1 uso | ✅ | ⚠️ |
| split-pagamento | 2 | 1 uso | ✅ | ⚠️ |
| portal-paciente | 2 | 0 usos | ✅ | ❌ |
| lgpd | 2 | 0 usos | ✅ | ❌ |
| landpage | 2 | 0 usos | ✅ | ❌ |
| files | 2 | 0 usos | ✅ | ❌ |
| crm | 2 | 2 usos | ✅ | ✅ |
| auth | 2 | 0 usos | N/A | N/A |
| tiss | 1 | 1 uso | ✅ | ✅ |
| teleodonto | 1 | 1 uso | ✅ | ✅ |
| odontograma | 1 | 0 usos | ✅ | ❌ |
| inventario | 1 | 0 usos | ✅ | ❌ |
| ia-radiografia | 1 | 0 usos | ✅ | ❌ |
| funcionarios | 1 | 0 usos | ✅ | ❌ |
| dentistas | 1 | 0 usos | ✅ | ❌ |
| dashboards | 1 | 0 usos | ✅ | ❌ |
| dashboard | 1 | 0 usos | ✅ | ❌ |
| crypto | 1 | 0 usos | ✅ | ❌ |
| contratos | 1 | 0 usos | ✅ | ❌ |

**Analise**:
- 98 paginas usando PageHeader (boa adocao nos modulos principais)
- 518 arquivos importando Card do @orthoplus/core-ui (excelente adocao)
- Modulos com BAIXA adocao de PageHeader (<50% das paginas):
  - pacientes (2/8 = 25%)
  - pdv (3/6 = 50%)
  - pep (3/5 = 60%)
  - faturamento (1/4 = 25%)
  - agenda (1/3 = 33%)
  - odontograma (0/1)
  - portal-paciente (0/2)
  - lgpd (0/2)
  - files (0/2)
  - ia-radiografia (0/1)
  - funcionarios (0/1)
  - dentistas (0/1)

### 3.2 Componentes Nao-Padronizados

**Bibliotecas legadas**: 0 imports de Material-UI, Ant Design, Semantic UI. ✅

**Componentes inline nao padronizados**:
- `components/modules/sidebar-preview/` — componente antigo de sidebar preview, ainda existe mas pode estar obsoleto (AppSidebar em core/layout/ e o principal)
- `components/modules/SidebarPreview.tsx` — duplicata/versao antiga do sidebar preview

---

## 4. Efeitos e Animacoes

### 4.1 Uso de Framer Motion

Total: 18 arquivos usando framer-motion

| Componente | Tipo de Animacao | Adequado? |
|------------|------------------|-----------|
| components/dashboard/ChartCardMemo.tsx | fade-in, stagger | ✅ Sim |
| components/dashboard/DashboardChartsMemo.tsx | fade-in, stagger | ✅ Sim |
| components/dashboard/EmptyChartCard.tsx | fade-in | ✅ Sim |
| components/dashboard/WelcomeBanner.tsx | fade-in, blur, glow | ⚠️ Excessivo |
| components/onboarding/OnboardingWizard.tsx | slide-in, fade | ✅ Sim |
| core/layout/Sidebar/SidebarGroup.tsx | expand/collapse | ✅ Sim |
| core/layout/Sidebar/SidebarMenuItem.tsx | hover scale | ✅ Sim |
| core/layout/Sidebar/SidebarNav.tsx | stagger children | ✅ Sim |
| modules/dashboard/ui/pages/DashboardUnified.tsx | fade-in-up | ✅ Sim |
| modules/landpage/ui/pages/Landpage.tsx | scroll reveal | ✅ Sim |

**Observacoes**:
- Animacoes sao majoritariamente sutis e profissionais
- `WelcomeBanner.tsx` tem glow excessivo (`drop-shadow-[0_0_4px_hsl(var(--interactive)/0.3)]`)
- `DashboardSkeleton.tsx` usa animacao shimmer customizada (aceitavel)
- Uso de `useReducedMotion` em 4 componentes (acessibilidade ✅)

### 4.2 Efeitos Glassmorphism/Gradient/Blur

Total: 77 ocorrencias

**Destaques**:
- `.glass-card` — usado em 12+ componentes, efeito cristal aceitavel
- `.glass-premium` — backdrop-blur(20px), efeito mais intenso
- `.gradient-hero-premium` — gradiente sutil de background para accent
- `.page-header-premium` — gradiente decorativo no header
- `.stat-card-premium` — barra superior gradiente (primary -> interactive -> primary)
- `.btn-premium-glow` — glow nos botoes (aceitavel)
- `animate-neon-pulse` — usado para indicador de sidebar recolhida (aceitavel)

**Veredito**: Os efeitos premium estao presentes e bem implementados. Nenhum efeito neon nao-autorizado ou glassmorphism excessivo.

### 4.3 ProductTour

- Usa `react-joyride` (biblioteca de terceiros)
- Steps basicos: Boas-vindas, Sidebar, Dashboard, Modulos
- **Problema**: Parece nao refletir todas as funcionalidades atuais (apenas 4-5 steps)
- Sugestao: Atualizar steps para incluir novos modulos (TISS, Faturamento, etc.)

---

## 5. Confronto com Specs

### 5.1 Estado das Specs

**Descoberta IMPORTANTE**: Nao existem specs individuais por feature em `.specify/features/`.

O que existe:
- `.specify/features/index.md` — lista de modulos (checkboxes nao marcadas)
- `.specify/memory/spec.md` — especificacao geral do projeto (GitNexus, SpecKit, OMK, VPS)

O que NAO existe:
- Specs por modulo (002-agenda, 003-pep, etc. mencionados no prompt)
- `spec.md` + `plan.md` + `tasks.md` por feature

**Impacto**: Impossivel fazer gap analysis completo specs vs. codigo sem specs detalhadas.

### 5.2 Funcionalidades Implementadas -> NAO Documentadas em Specs

| Modulo | Funcionalidade | Acao Sugerida |
|--------|----------------|---------------|
| faturamento | Relatorio Fiscal com CSV/Excel export, grafico Recharts | Criar spec |
| faturamento | Listagem de NFes (NFePage, useNFes hook) | Criar spec |
| tiss | PacienteConvenios (CRUD vinculo paciente-convenio) | Criar spec |
| pdv | Dedução automatica de estoque, rollback no cancelamento | Criar spec |
| financeiro | Conciliacao bancaria, contas a receber | Criar spec |

---

## 6. Confronto com VPS

### 6.1 Status do Deploy

- Health check: HTTP 200 (backend online)
- PM2: orthoplus-backend online (pid 1220071)
- Ultimo deploy: 2026-05-27 14:42:24 (commit bdaa3401b)

### 6.2 Limitacoes da Auditoria na VPS

- Browser (Playwright) nao disponivel no ambiente — impossivel tirar screenshots
- curl nao retornou HTML da SPA (possivel redirect ou carregamento JS)
- Auditoria visual da VPS sera manual ou requer ambiente com browser

### 6.3 Divergencias Potenciais

| Funcionalidade | Codigo | VPS | Acao |
|----------------|--------|-----|------|
| /faturamento/nfes | Existe no codigo | ??? | Verificar manualmente |
| /faturamento/relatorio | Existe no codigo | ??? | Verificar manualmente |
| Tema Premium v3 | Existe no codigo | ??? | Verificar manualmente |
| Sidebar com TISS | Existe no codigo | ??? | Verificar manualmente |

---

## 7. Legados e Obsolescencias

### 7.1 Componentes Legados

**Pasta frontend/ na raiz**:
- `frontend/src/components/` — 1 arquivo
- `frontend/src/index.css` — 1 arquivo
- `frontend/src/theme/` — 1 arquivo
- Total: 3 arquivos (praticamente vazia)
- **Acao**: Remover pasta `frontend/` — nao e mais usada

**Componentes duplicados/obsoletos**:
- `components/modules/sidebar-preview/` — componente antigo, `AppSidebar` em `core/layout/Sidebar/` e o atual
- `components/modules/SidebarPreview.tsx` — versao antiga do sidebar
- `components/tour/ProductTour.tsx` — wrapper antigo (react-joyride)
- `components/tour/product-tour/ProductTour.tsx` — versao atual

**Classes CSS legadas** (index.css linhas 542-548):
```css
.badge-cyan   { @apply badge-info; }     /* Legado -> Mapeado */
.badge-amber  { @apply badge-warning; }  /* Legado -> Mapeado */
.alert-amber  { @apply alert-warning; }  /* Legado -> Mapeado */
```
- Estas classes sao mantidas para compatibilidade — aceitavel

**Uso de `as any`**: 0 ocorrencias no frontend ✅ (backend tem ~38)

**Uso de `@ts-ignore` / `@ts-expect-error`**: 0 ocorrencias no frontend ✅

### 7.2 Temas Legados

- Tema `light`, `dark`, `professional-dark`, `high-contrast` tem migracao automatica para premium
- ThemeContext.tsx linha 24-30: LEGACY_THEME_MAP converte temas antigos
- Nao ha CSS inline ou `<style>` tags em componentes ✅
- Apenas 1 arquivo CSS: `index.css` ✅

### 7.3 Arquivos/Folders a Remover

| Arquivo/Pasta | Motivo | Risco |
|---------------|--------|-------|
| `frontend/` | Pasta legada, nao usada | Baixo |
| `components/modules/sidebar-preview/` | Componente antigo, AppSidebar e o atual | Medio (verificar se algum import ainda existe) |
| `components/modules/SidebarPreview.tsx` | Duplicata do sidebar | Medio |
| `components/tour/ProductTour.tsx` | Wrapper antigo | Baixo |

---

## 8. Arquitetura e Hooks

### 8.1 Clean Architecture Parcial

| Modulo | Domain | Application | Infrastructure | UI | Status |
|--------|--------|-------------|----------------|-----|--------|
| Total modulos | 12 | 18 | 10 | 43 | — |

- 12 modulos com pasta `domain/` (28%)
- 18 modulos com pasta `application/` (42%)
- 10 modulos com pasta `infrastructure/` (23%)
- 43 modulos com UI (100%)

**Analise**: A arquitetura Clean esta parcialmente implementada. Muitos modulos tem apenas UI sem camadas de domain/application. Isso e aceitavel para um projeto brownfield em transicao.

### 8.2 Hooks por Modulo

Total: ~113 hooks em 35 modulos

| Modulo | Hooks | Observacao |
|--------|-------|------------|
| estoque | 13 | Bem coberto |
| financeiro | 11 | Bem coberto |
| pacientes | 7 | Bem coberto |
| pep | 9 | Bem coberto |
| agenda | 6 | Bem coberto |
| tiss | 6 | Bem coberto |
| faturamento | 1 | INSUFICIENTE (apenas useNFes) |
| odontograma | 0 | AUSENTE |
| contratos | 0 | AUSENTE |
| funcionarios | 0 | AUSENTE |
| dentistas | 0 | AUSENTE |

### 8.3 Uso de apiClient vs. axios/fetch

- **apiClient**: ~95% dos hooks (padrao correto) ✅
- **axios direto**: 1 arquivo (`lib/api/cryptoMarketApi.ts`) ⚠️
- **fetch direto**: 3 arquivos (`useCEPLookup.ts`, `BinanceAdapter.ts`, `CoinbaseAdapter.ts`) ⚠️

### 8.4 Multi-tenancy (clinicId)

- 26 hooks usando `useAuth` para obter `clinicId` ✅
- 5 hooks sem tratamento de estado (`isLoading`/`isError`):
  - `useContasReceberController.ts`
  - `useContasReceber.ts`
  - `useFinanceiro.ts`
  - `useTeleodontologia.ts`
  - `useTISSStatistics.ts`

---

## 9. Plano de Remediacao Priorizado

### Prioridade 1 (Critico — Semana 1)

1. **[Tema] Corrigir fonte do body** (index.css:225)
   - De `font-family: 'Inter', ...` para `font-family: 'Plus Jakarta Sans', ...`
   - Esforco: 5 minutos

2. **[Sidebar] Adicionar rotas novas**
   - `/faturamento/nfes` -> item "NF-e" no grupo FINANCEIRO
   - `/faturamento/relatorio` -> item "Relatorio Fiscal" no grupo FINANCEIRO
   - Esforco: 15 minutos

3. **[Sidebar] Revisar rotas orfas**
   - `/recall` -> adicionar ao grupo CRESCIMENTO ou remover
   - `/files` -> adicionar ao grupo OPERACOES ou CONFIGURACOES
   - `/memory-hub` -> adicionar ao grupo ADMIN ou remover
   - Esforco: 30 minutos

4. **[Tema] Criar plano de migracao das 594 cores hardcoded**
   - Automatizar com script de substituicao
   - Priorizar modulos mais visiveis (auth, dashboard, agenda)
   - Esforco: 4-6 horas

### Prioridade 2 (Importante — Semana 2)

5. **[Specs] Criar specs para features implementadas**
   - Faturamento (NF-e, Relatorio, Config)
   - TISS (Convenios, Guias)
   - PDV (Estoque deducao)
   - Esforco: 4 horas

6. **[Paginas] Adicionar PageHeader em modulos com baixa adocao**
   - pacientes (falta em 6 paginas)
   - pdv (falta em 3 paginas)
   - pep (falta em 2 paginas)
   - faturamento (falta em 3 paginas)
   - Esforco: 2 horas

7. **[Arquitetura] Adicionar hooks aos modulos sem cobertura**
   - odontograma, contratos, funcionarios, dentistas
   - Esforco: 3 horas

8. **[Hooks] Adicionar tratamento de estado (isLoading/isError)**
   - useContasReceberController, useContasReceber, useFinanceiro, useTeleodontologia, useTISSStatistics
   - Esforco: 1 hora

9. **[API] Refatorar axios/fetch direto para apiClient**
   - cryptoMarketApi.ts, useCEPLookup.ts
   - Esforco: 1 hora

### Prioridade 3 (Desejavel — Backlog)

10. **[Cleanup] Remover pasta frontend/ legada**
    - Esforco: 10 minutos

11. **[Cleanup] Remover componentes duplicados de sidebar**
    - `components/modules/sidebar-preview/`
    - `components/modules/SidebarPreview.tsx`
    - Esforco: 30 minutos

12. **[ProductTour] Atualizar steps para refletir modulos atuais**
    - Adicionar TISS, Faturamento, IA Radiografia
    - Esforco: 1 hora

13. **[VPS] Auditoria visual manual**
    - Acessar VPS via browser e comparar tema/cores/sidebar
    - Esforco: 30 minutos

14. **[Dark mode] Revisar 129 ocorrencias de dark: hardcoded**
    - Substituir por variaveis CSS ou remover se desnecessario
    - Esforco: 2 horas

---

## 10. Evidencias

### Arquivos-chave analisados
- `apps/web/src/index.css` — Tema CSS Variables (776 linhas)
- `apps/web/src/contexts/ThemeContext.tsx` — Logica de tema (119 linhas)
- `apps/web/src/contexts/ModulesContext.tsx` — Gestao de modulos (78 linhas)
- `apps/web/src/core/layout/Sidebar/sidebar.config.ts` — Configuracao da sidebar (382 linhas)
- `apps/web/src/core/layout/Sidebar/index.tsx` — AppSidebar (37 linhas)
- `apps/web/src/routes/AppRoutes.tsx` — Todas as rotas (328 linhas)
- `apps/web/src/components/AppLayout.tsx` — Layout principal (140 linhas)

### Comandos de auditoria executados
```bash
# Cores hardcoded
grep -rn "bg-blue-5\|bg-green-5\|text-blue-5\|text-green-5" --include="*.tsx"

# Rotas vs Sidebar
comm -23 <(grep -oP 'path="\K[^"]+' routes/AppRoutes.tsx | sort) <(grep -oP 'url: "\K[^"]+' core/layout/Sidebar/sidebar.config.ts | sort)

# Hooks por modulo
for d in modules/*/; do echo "=== $d ==="; find "$d" -maxdepth 3 -name "use*.ts" | wc -l; done

# PageHeader por modulo
grep -rn "PageHeader" modules/ --include="*.tsx" | sed 's/modules\/\([^/]*\).*/\1/' | sort | uniq -c
```

### Dados quantitativos
- Total de modulos: 43
- Total de paginas: ~140
- Total de hooks: ~113
- Total de componentes: ~1116
- Rotas mapeadas: 62
- Itens na sidebar: 36 + 8 admin
- Rotas orfas: 26
- Cores hardcoded: 594
- Usos corretos de variaveis CSS: 26
- Arquivos com framer-motion: 18
- Testes frontend: 1157/1157 passando
- Build frontend: 0 erros
