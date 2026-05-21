# Version Currency — Plano de Migração Major Upgrades

> **Status**: Draft | **Autor**: OMK Orchestration | **Data**: 2026-05-21
> **Escopo**: React 18→19, Prisma 6→7, Express 4→5, Tailwind 3→4, TypeScript 5→6

---

## 1. Resumo Executivo

| Upgrade | Versão Atual | Versão Alvo | Impacto | Esforço Est. | Ordem |
|---------|-------------|-------------|---------|-------------|-------|
| TypeScript | 5.8.3 (root), 5.6.3 (backend), 5.3.0 (shared-types) | 6.x | Medio | 4–6h | **1** |
| Express | 4.18.2 | 5.x | Baixo | 2–4h | **2** |
| React | 18.3.1 | 19.x | Medio | 6–10h | **3** |
| Tailwind CSS | 3.4.17 | 4.x | Medio | 4–8h | **4** |
| Prisma | 6.19.3 | 7.x | Alto | 12–20h | **5** |

**Total estimado**: 28–48h de trabalho focado (nao inclui regressao testing)

---

## 2. Analise por Upgrade

### 2.1 TypeScript 5 → 6

**Rationale para 1**: TS6 eh a base de todas as outras migracoes.

#### Breaking Changes

| # | Change | Impacto | Acao |
|---|--------|---------|------|
| 1 | types defaults to [] | Backend e shared-types nao definem types. Build pode falhar. | Adicionar types: ["node"] em todos tsconfigs. |
| 2 | baseUrl deprecated | Backend (baseUrl: ".") e Frontend (baseUrl: ".") usam path aliases. | Remover baseUrl; reescrever paths com caminhos relativos completos. |
| 3 | moduleResolution node → bundler | Backend usa moduleResolution: "node". | Migrar para bundler + module: commonjs (TS6 permite). |
| 4 | strict: true default | Ja esta true em todos. | Nenhuma acao. |
| 5 | esModuleInterop: false deprecated | Verificar se ha false explicito. | Remover se existir. |

### 2.2 Express 4 → 5

**Rationale para 2**: Codigo backend ja esta limpo de APIs deprecadas.

#### Estado Atual (Bom)
- Nao ha app.del() — usa app.delete()
- Nao ha express-async-handler
- Nao ha res.json(obj, status)
- Nao ha req.param(name)

#### Breaking Changes

| # | Change | Impacto | Acao |
|---|--------|---------|------|
| 1 | req.body nao inicializado como {} | Middleware que assume req.body pode falhar. | Buscar e ajustar. |
| 2 | urlencoded default extended: false | Form data complexo pode quebrar. | Verificar uso de express.urlencoded(). |
| 3 | Promise rejection nativo | Async handlers agora capturam erros. | Beneficio; verificar se ha hacks. |

### 2.3 React 18 → 19

**Rationale para 3**: Depende do TS6 estavel.

#### Estado Atual (Bom)
- main.tsx ja usa createRoot
- Nao ha propTypes, defaultProps, ReactDOM.render
- Nao ha Legacy Context

#### Breaking Changes

| # | Change | Impacto | Acao |
|---|--------|---------|------|
| 1 | Strict mode em testes | Spies podem falhar por call count. | Ajustar expectations. |
| 2 | forwardRef nao mais necessario | Oportunidade de refatoracao. | Opcional. |
| 3 | Types do React 19 | @types/react pode ter breaking. | Atualizar e rodar type-check. |

### 2.4 Tailwind CSS 3 → 4

**Rationale para 4**: Depende do React 19 estavel.

#### Breaking Changes

| # | Change | Impacto | Acao |
|---|--------|---------|------|
| 1 | PostCSS plugin renomeado | tailwindcss → @tailwindcss/postcss | Atualizar postcss.config.js. |
| 2 | @tailwind directives removidas | @tailwind base → @import "tailwindcss" | Atualizar index.css. |
| 3 | Config JS → CSS-first | tailwind.config.ts → @theme em CSS | Rodar upgrade tool; revisar. |
| 4 | theme() function deprecated | theme(colors.red.500) → var(--color-red-500) | Buscar uso no CSS/TSX. |
| 5 | Browser requirements | Safari 16.4+, Chrome 111+, Firefox 128+ | Avaliar dispositivos da clinica. |

### 2.5 Prisma 6 → 7

**Rationale para 5**: Maior impacto estrutural.

#### Breaking Changes

| # | Change | Impacto | Acao |
|---|--------|---------|------|
| 1 | Provider renomeado | prisma-client-js → prisma-client | Atualizar schema. |
| 2 | output obrigatorio | Nao gera em node_modules | Adicionar output path. |
| 3 | url no schema deprecated | Remover url do schema | Criar prisma.config.ts. |
| 4 | Driver adapters obrigatorios | new PrismaClient() → com adapter | Instalar @prisma/adapter-pg. |
| 5 | Import path muda | @prisma/client → ./generated/prisma/client | Atualizar todos imports. |
| 6 | previewFeatures multiSchema | Verificar se ainda preview | Remover se estabilizado. |
| 7 | Seed automatico removido | migrate dev nao roda seed | Atualizar scripts. |
| 8 | CLI flags removidas | --skip-generate, --schema, etc | Atualizar CI. |

---

## 3. Matriz de Compatibilidade

| | TS6 | Express 5 | React 19 | Tailwind 4 | Prisma 7 |
|---|:---:|:---:|:---:|:---:|:---:|
| Node.js 20 | OK | OK (min 18) | OK | OK (min 20) | OK (min 20.19) |
| Vite 8 | OK | N/A | OK | OK (plugin) | N/A |
| TypeScript 6 | — | OK | OK | OK | OK |

---

## 4. Plano de Fases

### Fase 1: Fundacao (TS6 + Express 5) — Est. 8–12h
1. TS6 migration: ajustar tsconfigs, rodar type-check, corrigir erros
2. Express 5 migration: atualizar dep, verificar req.body, rodar testes

### Fase 2: Frontend Core (React 19) — Est. 8–14h
1. Atualizar React + types
2. Verificar compatibilidade de deps (react-query, framer-motion)
3. Rodar testes unitarios + E2E

### Fase 3: Styling (Tailwind 4) — Est. 6–10h
1. Rodar upgrade tool
2. Revisar manualmente
3. Verificar temas premium
4. Build + visual regression

### Fase 4: Database (Prisma 7) — Est. 14–22h
1. Criar prisma.config.ts
2. Atualizar schema e client
3. Migrar para driver adapter
4. Atualizar imports em todo backend
5. Testes + migrate deploy em staging
6. Regenerar database.ts no frontend

---

## 5. Riscos e Mitigacoes

| Risco | Prob | Impacto | Mitigacao |
|-------|------|---------|-----------|
| Prisma 7 quebra multi-schema (18 schemas) | Medio | Alto | Testar em staging com DB clone. Manter branch v6 rollback. |
| Tailwind 4 quebra temas premium | Medio | Alto | Testar visualmente ambos temas. Manter snapshot CSS. |
| React 19 quebra E2E | Baixo | Medio | Rodar E2E completo em CI. |
| TS6 quebra build backend | Medio | Medio | Usar ignoreDeprecations: "6.0" como escape hatch. |

---

## 6. Rollback Strategy

- Branch dedicada por fase: feature/<upgrade>-migration
- DB staging clone: nunca testar Prisma em prod
- VPS staging: usar Docker do TSiAPP para smoke test
- Revert commits: cada fase eh PR independente

---

## 7. Proximos Passos

1. Aprovar este plano com stakeholders
2. Criar milestone "Version Currency Q3 2026"
3. Agendar Fase 1 (TS6 + Express 5) para sprint imediata
4. Deixar Prisma 7 para ultimo — maior risco
5. Manter SA-1/SS-3 (Security Review AI) em paralelo
