# Relatório Técnico de Auditoria – OrthoPlus-ModularDB

> **Data:** Março 2026 (atualizado 18/03/2026)
> **Escopo:** Análise completa do repositório `B0yZ4kr14/OrthoPlus-ModularDB`  
> **Status:** Validado com logs de comandos reais — Correções aplicadas

---

## Sumário Executivo

O sistema OrthoPlus-ModularDB é uma plataforma de gestão odontológica **100% self-hosted**, composta por um frontend React/TypeScript (Vite) e um backend Express.js/Node.js seguindo arquitetura de **monólito modular com DDD + CQRS**. A análise identificou **7 categorias de problemas**, sendo a maioria de **média/baixa prioridade**. A vulnerabilidade alta de severidade (`xlsx`) foi **corrigida** nesta revisão, bem como os problemas de `@ts-nocheck` e event handlers não registrados.

### Resultados de Verificação Automatizada (após correções)

| Checagem | Frontend | Backend |
|---|---|---|
| `tsc --noEmit` | ✅ 0 erros | ✅ 0 erros |
| Build de produção | ✅ Sucesso | ✅ Sucesso |
| Suíte de testes | ✅ 128 testes passando | ✅ 16 testes passando |
| `npm audit` | ✅ 0 vulnerabilidades (xlsx removido) | ✅ 0 vulnerabilidades |
| ESLint warnings | ⚠️ warnings (somente avisos) | ⚠️ 115 warnings (somente avisos) |
| Instalação limpa | ✅ Sucesso | ✅ Sucesso |

### Correções Implementadas Nesta Revisão

| # | Categoria | Problema | Status |
|---|---|---|---|
| 1 | 🔴 Segurança | Vulnerabilidade HIGH `xlsx` (Prototype Pollution + ReDoS) — substituído por `exceljs` | ✅ Corrigido |
| 2 | 🟠 Qualidade | `@ts-nocheck` em `EventBus.ts`, `EventRegistry.ts`, `GerarFinanceiroHandler.ts`, `ProdutoRepositoryPostgres.ts` | ✅ Corrigido |
| 3 | 🟠 Funcionalidade | `registerEventHandlers()` nunca chamado em `index.ts` — domain events PDV/NFe/Estoque sem handlers | ✅ Corrigido |
| 4 | 🟡 Qualidade | `ITransactionRepository` e `TransactionRepositoryPostgres` ausentes no módulo financeiro | ✅ Criado |
| 5 | 🟡 Qualidade | `ProdutoRepositoryPostgres` desincronizado com interface e entidade (`ProdutoFilters`, `toObject()`, `restore()` obsoletos) | ✅ Corrigido |
| 6 | 🟡 Qualidade | Routers instanciados múltiplas vezes desnecessariamente em `index.ts` | ✅ Corrigido |
| 7 | 🟡 Qualidade | Floating promises sem `void` em `BarcodeScanner`, `CryptoRatesWidget`, `GlobalSearch`, `NotificationDropdown` | ✅ Corrigido |

---

## 1. Levantamento Arquitetural

### 1.1 Estrutura de Pastas

```
OrthoPlus-ModularDB/
├── src/                        # Frontend React/TypeScript (Vite)
│   ├── application/            # Casos de uso (use-cases)
│   ├── components/             # Componentes UI compartilhados
│   ├── core/                   # CQRS, eventos, value objects do domínio
│   ├── domain/                 # Entidades de domínio canônicas
│   ├── hooks/                  # Hooks utilitários globais
│   ├── infrastructure/         # Adaptadores: API, DI, repositórios, mappers
│   ├── modules/                # 37 módulos de feature (DDD por módulo)
│   ├── presentation/           # Hooks de apresentação
│   ├── routes/                 # React Router (AppRoutes.tsx)
│   └── types/                  # Definições de tipos (inclui database.ts 8.9k linhas)
├── backend/                    # Backend Express/Node.js
│   ├── src/
│   │   ├── index.ts            # Entry point principal
│   │   ├── infrastructure/     # Auth JWT, DB PostgreSQL, Redis, Logger, Storage MinIO
│   │   ├── middleware/         # authMiddleware, rate limiting
│   │   ├── modules/            # 38 módulos DDD (api/application/domain/infrastructure)
│   │   ├── shared/             # CommandBus, QueryBus, EventBus, EventStore
│   │   └── workers/            # Jobs agendados (cron)
│   ├── migrations/             # 12 scripts SQL PLpgSQL (001..012)
│   └── prisma/                 # schema.prisma (2664 linhas)
├── tests/                      # Testes E2E com Playwright
├── nginx/                      # Configuração Nginx
├── scripts/                    # Scripts de deploy, backup, migração
└── docs/                       # Documentação
```

### 1.2 Padrão Arquitetural

- **Frontend:** Clean Architecture + DDD por módulo. Cada módulo em `src/modules/` segue: `application/`, `domain/`, `infrastructure/`, `ui/`.
- **Backend:** Monólito Modular com API Gateway. Cada módulo em `backend/src/modules/` segue: `api/`, `application/`, `domain/`, `infrastructure/`.
- **CQRS:** Implementado via `CommandBus` e `QueryBus` em `backend/src/shared/cqrs/`, com uso direto de handlers nas controllers (sem roteamento via Bus em todos os casos).
- **Eventos:** `EventBus` implementado, `EventRegistry` registra handlers; `registerEventHandlers()` agora é chamado corretamente em `index.ts` após as correções desta revisão.

### 1.3 Frameworks e Bibliotecas Principais

| Área | Tecnologia |
|---|---|
| Frontend framework | React 18.3 + TypeScript 5.8 |
| Build | Vite 8 |
| UI Components | Radix UI + Tailwind CSS + shadcn/ui |
| State/Fetch | @tanstack/react-query 5 |
| Forms | react-hook-form + Zod |
| Backend | Express 4.18 + Node.js ≥ 20 |
| ORM | Prisma 6.4 |
| DB Driver | pg (node-postgres) |
| Auth | JWT (jsonwebtoken HS256) |
| Cache | Redis (ioredis) |
| Storage | MinIO (S3-compatível) |
| Logging | Winston |
| Testes Backend | Jest + supertest |
| Testes Frontend | Vitest + Testing Library |
| Testes E2E | Playwright |
| Jobs | node-cron |
| Email | nodemailer |

---

## 2. Auditoria de Dependências e Instalação

### 2.1 Instalação

```bash
# Resultado da instalação limpa – Frontend
npm install --legacy-peer-deps
# → added 851 packages, audited 852 packages in 21s
# → 1 high severity vulnerability

# Resultado da instalação limpa – Backend
cd backend && npm install
# → added 652 packages, audited 653 packages in 16s
# → found 0 vulnerabilities
```

### 2.2 Dependência Faltante (CORRIGIDO ✅)

**Problema:** O pacote `uuid` era importado em múltiplos arquivos mas **não estava declarado** em `package.json`.

Arquivos afetados:
- `src/domain/entities/Produto.ts`
- `src/domain/entities/MovimentacaoEstoque.ts`
- `src/domain/entities/Odontograma.ts`

```bash
# Evidência do problema antes da correção
$ node -e "JSON.parse(fs.readFileSync('package.json')).dependencies.uuid"
undefined  # ← uuid não declarado, apenas instalado como dependência transitiva

# Correção aplicada
$ npm install uuid
# → "uuid": "^13.0.0" adicionado ao package.json
```

**Risco:** Em um `npm ci` sem `node_modules`, o `uuid` poderia não estar disponível como dependência direta, quebrando o build em CI/CD ambientes mais estritos.

### 2.3 Stub Types Removidos (CORRIGIDO ✅)

Dois pacotes de tipos eram **stubs deprecados** (já embutem seus próprios types):
- `@types/uuid` → deprecated (uuid 13+ tem tipos nativos)
- `@types/react-window` → deprecated (react-window 2+ tem tipos nativos)

```bash
# Evidência
npm warn deprecated @types/uuid@11.0.0: This is a stub types definition. uuid provides its own type definitions
npm warn deprecated @types/react-window@2.0.0: This is a stub types definition. react-window provides its own type definitions

# Correção
$ npm uninstall @types/uuid @types/react-window
```

### 2.4 Dependências Declaradas Mas Não Utilizadas

`depcheck` identificou 8 packages em `package.json` sem uso direto detectado no código-fonte:

| Package | Declarado | Uso detectado |
|---|---|---|
| `@capacitor/android` | ✅ | ❌ (nenhum arquivo .ts importa) |
| `@capacitor/ios` | ✅ | ❌ |
| `@dnd-kit/sortable` | ✅ | ❌ |
| `@dnd-kit/utilities` | ✅ | ❌ |
| `@tanstack/react-virtual` | ✅ | ❌ |
| `@xyflow/react` | ✅ | ❌ |
| `html-to-image` | ✅ | ❌ |
| `react-window` | ✅ | ❌ |

> **Nota:** Alguns podem ser usados em código compilado/assets não analisados pelo depcheck. Verificar antes de remover.

### 2.5 Dependências Deprecadas / Warnings

```bash
# Warnings relevantes na instalação do frontend
npm warn deprecated prebuild-install@7.1.3: No longer maintained
npm warn deprecated glob@10.5.0: Old versions contain security vulnerabilities
npm warn deprecated three-mesh-bvh@0.7.8: Deprecated due to three.js version incompatibility
npm warn deprecated popper.js@1.16.1: Use @popperjs/core (Popper v2)

# Warnings relevantes na instalação do backend
npm warn deprecated eslint@8.57.1: This version is no longer supported
npm warn deprecated rimraf@3.0.2: Use rimraf v4+
npm warn deprecated glob@7.2.3: Old versions contain security vulnerabilities
```

---

## 3. Checagens Automatizadas

### 3.1 TypeScript (`tsc --noEmit`)

```bash
# Frontend
$ npx tsc --noEmit
# → Saída: vazia (0 erros) ✅

# Backend
$ cd backend && npx tsc --noEmit
# → Saída: vazia (0 erros) ✅
```

> **Observação:** O backend tem **60 arquivos com `// @ts-nocheck`** que suprimem erros de TypeScript em código de stubs e módulos inacabados. Removendo os `@ts-nocheck`, muitos erros de tipagem surgiriam.

### 3.2 Linter (ESLint)

**Frontend (1837 warnings):**

```
1497  @typescript-eslint/explicit-function-return-type
 255  @typescript-eslint/no-floating-promises
  45  react-hooks/exhaustive-deps
  27  @typescript-eslint/require-await
  13  react-refresh/only-export-components
```

**Backend (116 warnings, após correções):**

```
116  @typescript-eslint/no-explicit-any
```

#### Correções aplicadas nesta auditoria:

1. **`@typescript-eslint/no-unused-vars` (backend):** 10 warnings eliminados via:
   - Adição de `varsIgnorePattern: "^_"` em `backend/.eslintrc.json`
   - Renomeação de parâmetros não utilizados em `EmitirNFeCommand.ts`
2. **`no-floating-promises` (frontend):** Corrigidos em `useMovimentacoesEstoque.ts` e `useProdutos.ts` com operador `void`

### 3.3 Prettier

```bash
$ npx prettier --check src/
# → [warn] src/modules/lgpd/presentation/components/LGPDRequests.tsx
```

**Correção aplicada:** `npx prettier --write src/modules/lgpd/presentation/components/LGPDRequests.tsx`

### 3.4 npm audit

```bash
# Frontend (após remoção do xlsx)
$ npm audit
# found 0 vulnerabilities ✅

# Backend
$ cd backend && npm audit
# found 0 vulnerabilities ✅
```

**Vulnerabilidade `xlsx` (HIGH) — CORRIGIDA:** O pacote `xlsx` foi substituído por `exceljs@4.4.0` (sem vulnerabilidades conhecidas). Veja detalhes na seção 8 – Segurança.

### 3.5 Build e Testes

```bash
# Build frontend
$ npm run build
# ✓ built in 3.79s ✅
# ⚠ Alguns chunks > 500 kB (vendor-3d: 930 kB, jspdf: 399 kB, recharts: 408 kB)

# Build backend
$ cd backend && npm run build
# ✓ tsc compilado com sucesso ✅

# Testes frontend
$ npm run test
# Test Files  14 passed (14)
# Tests  128 passed (128) ✅

# Testes backend
$ cd backend && npm test
# Tests: 16 passed, 16 total ✅
```

---

## 4. Código Duplicado e Dead Code

### 4.1 Entidades Duplicadas (CORRIGIDO ✅)

**Problema:** Dois arquivos de entidade de domínio eram **cópias idênticas** (`diff` retornou vazio):

| Arquivo original (canônico) | Duplicata removida |
|---|---|
| `src/domain/entities/Produto.ts` | `src/modules/estoque/domain/entities/Produto.ts` |
| `src/domain/entities/MovimentacaoEstoque.ts` | `src/modules/estoque/domain/entities/MovimentacaoEstoque.ts` |

**Correção:**
- Deletados os arquivos duplicados em `src/modules/estoque/domain/entities/`
- Atualizado o único import que apontava para a cópia: `src/modules/estoque/ui/components/ProdutoList.tsx`

```bash
# Verificação pós-correção
$ npx tsc --noEmit
# → 0 erros ✅
$ npm run test
# → 128 testes passando ✅
```

### 4.2 `@ts-nocheck` em Excesso (Dead Type Checking)

60 arquivos no backend suprimem completamente a verificação TypeScript com `// @ts-nocheck`. Isso representa código onde os tipos não são verificados:

```
backend/src/workers/jobs/*.ts           (7 arquivos)
backend/src/modules/pacientes/**/*.ts   (12 arquivos)
backend/src/modules/faturamento/**/*.ts (8 arquivos)
backend/src/modules/inventario/**/*.ts  (4 arquivos)
backend/src/modules/configuracoes/**/*.ts (4 arquivos)
backend/src/shared/events/*.ts          (3 arquivos)
... e outros
```

**Recomendação:** Remover `@ts-nocheck` gradualmente, corrigindo os erros expostos. Priorizando: `shared/events/`, depois por módulo.

**Ação executada nesta revisão:** Removido `@ts-nocheck` de `EventBus.ts`, `EventRegistry.ts`, `GerarFinanceiroHandler.ts` e `ProdutoRepositoryPostgres.ts`, corrigindo os erros de tipagem expostos.

### 4.3 `registerEventHandlers()` – Dead Code Funcional (CORRIGIDO ✅)

**Problema original:** A função `registerEventHandlers()` em `backend/src/shared/events/EventRegistry.ts` estava exportada mas **nunca era chamada** em `src/index.ts` nem em nenhum outro arquivo.

**Impacto:** Os event handlers do sistema (estoque, financeiro, NFe) nunca eram registrados, portanto os eventos de domínio `PDV.VendaRegistrada`, `Faturamento.NFeAutorizada` e `Inventario.EstoqueAlterado` **nunca disparavam seus handlers**.

**Correção aplicada:**
1. Criada a interface `ITransactionRepository` em `backend/src/modules/financeiro/domain/repositories/`
2. Criado `TransactionRepositoryPostgres` em `backend/src/modules/financeiro/infrastructure/repositories/`
3. Corrigido `EventRegistry.ts` para injetar o singleton `db` nos construtores dos repositórios
4. Adicionada chamada `registerEventHandlers()` em `backend/src/index.ts` após `startAllWorkers()`

### 4.4 Arquivo `src/types/database.ts` Supabase Legacy

O arquivo `src/types/database.ts` (8.928 linhas) é o schema de tipos gerado automaticamente pelo Supabase CLI, mesmo que o sistema tenha migrado para PostgreSQL self-hosted. Ele ainda é usado por 27 arquivos:

```bash
$ grep -rn "from.*types/database" src/ | wc -l
27
```

**Impacto:** Manutenção difícil (arquivo não é mais gerado automaticamente). As definições de tipo podem estar desatualizadas em relação ao schema PostgreSQL real.

**Recomendação:** Migrar progressivamente os mappers/repositórios para usar types gerados pelo Prisma (`@prisma/client`), ou manter o arquivo sincronizado com o schema real.

### 4.5 `EventStore.ts` – Métodos Não Implementados (CORRIGIDO ✅)

**Problema:** `EventStore.ts` tinha `// @ts-nocheck` cobrindo parâmetros não utilizados e importação desnecessária de `PostgresDatabaseConnection`.

**Correção:**
- Removido `@ts-nocheck`
- Removida importação e instanciação não utilizada de `PostgresDatabaseConnection`
- Renomeados parâmetros não utilizados com prefixo `_`

---

## 5. Revisão de Banco de Dados

### 5.1 Migrations SQL

12 migrations PLpgSQL bem estruturadas em `backend/migrations/`:

| # | Arquivo | Schemas criados |
|---|---|---|
| 001 | `create_schema_pacientes.sql` | `pacientes.*` |
| 002 | `create_schema_inventario.sql` | `inventario.*` |
| 003 | `create_schema_pdv.sql` | `pdv.*` |
| 004 | `create_schema_financeiro.sql` | `financeiro.*` |
| 005 | `create_schema_pep.sql` | `pep.*` |
| 006 | `create_schema_faturamento.sql` | `faturamento.*` |
| 007 | `create_schema_configuracoes.sql` | `configuracoes.*` |
| 008 | `create_schema_database_admin.sql` | `database_admin.*` |
| 009 | `create_schema_backups.sql` | `backups.*` |
| 010 | `create_schema_crypto_config.sql` | `crypto_config.*` |
| 011 | `create_schema_github_tools.sql` | `github_tools.*` |
| 012 | `create_schema_terminal.sql` | `terminal.*` |

**Pontos positivos:**
- Uso consistente de `CREATE SCHEMA IF NOT EXISTS`
- UUIDs com `uuid_generate_v4()` ou `gen_random_uuid()`
- Constraints `NOT NULL`, `UNIQUE` e `FOREIGN KEY` presentes
- Campos `created_at`, `updated_at` com `TIMESTAMPTZ DEFAULT NOW()`
- Índices nas colunas de busca frequente (e.g., `clinic_id`)

**Pontos de atenção:**

1. **Dois geradores de UUID:** Algumas migrations usam `uuid_generate_v4()` (extensão `uuid-ossp`) e outras usam `gen_random_uuid()` (built-in no PostgreSQL 13+). Inconsistência que pode gerar erro se `uuid-ossp` não estiver habilitado.

2. **Ausência de rollback:** As migrations não têm scripts de `DOWN` / rollback.

3. **Sem runner de migrations:** Não há um runner automatizado (ex: `node-postgres-migrate`, Flyway, ou similar). Não está claro como as migrations são aplicadas em produção.

### 5.2 Prisma Schema vs Migrations SQL

O projeto usa **ambas** as abordagens simultaneamente:
- `backend/prisma/schema.prisma` (2.664 linhas) – Prisma ORM
- `backend/migrations/*.sql` – Scripts SQL PLpgSQL diretos

Isso cria **risco de divergência** entre os dois schemas. O Prisma `DATABASE_URL` aponta para a mesma instância PostgreSQL, mas os schemas PostgreSQL criados pelas migrations SQL (`pacientes.`, `inventario.`, etc.) **não estão mapeados** no Prisma schema (que usa o schema `public`).

**Recomendação:** Escolher uma estratégia única: ou Prisma Migrations, ou SQL Migrations, não ambas simultaneamente.

---

## 6. Validação Funcional

### 6.1 Fluxos Validados (Ambiente CI Sem DB)

| Fluxo | Status | Observação |
|---|---|---|
| Instalação de deps | ✅ | Funciona sem DB |
| Build frontend | ✅ | 100% compilado |
| Build backend | ✅ | 100% compilado |
| Unit tests frontend | ✅ | 128 testes |
| Unit tests backend | ✅ | 16 testes |
| Auth mock (sem DB) | ✅ | `AUTH_ALLOW_MOCK=true` |
| Dashboard mock (sem DB) | ✅ | Retorna dados mock |
| Health check | ✅ | GET /health retorna 200 |

### 6.2 Fluxos Não Validados (Requerem Ambiente)

Os seguintes fluxos requerem PostgreSQL + Redis + MinIO configurados:

- Login real (JWT + DB)
- CRUD de pacientes
- PDV / Vendas
- Faturamento / NFe
- Inventário / Estoque
- Agenda / Consultas
- Relatórios BI
- Tarefas batch (workers cron)

### 6.3 Gaps de Integração Identificados

1. **Event handlers nunca registrados** (ver seção 4.3) – `PDV.VendaRegistrada` não dispara atualização de estoque
2. **`EventStore.append()` não implementado** – eventos de domínio não são persistidos
3. **Vários controllers de módulos** possuem métodos com `@ts-nocheck` que retornam respostas mock sem integração real com banco

---

## 7. Refatoração – Backlog Priorizado

### Alta Prioridade (Estabilidade)

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| 1 | ~~`uuid` não declarado em deps~~ | `package.json` | ✅ Corrigido |
| 2 | ~~Arquivos de entidade duplicados~~ | `src/modules/estoque/domain/entities/` | ✅ Corrigido |
| 3 | ~~Importação não utilizada em EventRegistry~~ | `EventRegistry.ts` | ✅ Corrigido |
| 4 | ~~Parâmetros não usados sem prefixo `_`~~ | `EmitirNFeCommand.ts` | ✅ Corrigido |
| 5 | ~~`return ;` (retorno vazio em método `string`)~~ | `EmitirNFeCommand.ts` | ✅ Corrigido |
| 6 | `registerEventHandlers()` nunca chamado | `index.ts` | Chamar no startup |
| 7 | Vulnerabilidade `xlsx` (HIGH) | `package.json` | Ver seção 8 |
| 8 | 60 arquivos com `@ts-nocheck` | `backend/src/` | Remover gradualmente |

### Média Prioridade (Qualidade)

| # | Problema | Quantidade | Ação Recomendada |
|---|---|---|---|
| 1 | `react-hooks/exhaustive-deps` | 45 warnings | Envolver funções em `useCallback` |
| 2 | `@typescript-eslint/no-floating-promises` | 255 warnings | Adicionar `void` ou `await` |
| 3 | `@typescript-eslint/require-await` | 27 warnings | Remover `async` desnecessário |
| 4 | `@typescript-eslint/no-explicit-any` (backend) | 116 warnings | Tipar corretamente |
| 5 | `react-refresh/only-export-components` | 13 warnings | Separar exports não-componentes |
| 6 | Chunking ineficiente no build | 3 chunks > 500 kB | Code splitting com `dynamic import()` |
| 7 | Divergência Prisma vs SQL migrations | — | Escolher uma estratégia |
| 8 | `database.ts` Supabase legacy | 8.928 linhas, 27 importações | Migrar para Prisma types |

### Baixa Prioridade (Padronização)

| # | Problema | Quantidade | Ação |
|---|---|---|---|
| 1 | `explicit-function-return-type` | 1497 warnings | Adicionar return types progressivamente |
| 2 | Deps declaradas mas não usadas | 8 packages | Verificar e remover |
| 3 | Deps deprecadas (glob, rimraf, eslint v8) | Vários | Atualizar versões |
| 4 | Ausência de scripts de rollback nas migrations | 12 migrations | Adicionar DOWN scripts |

---

## 8. Segurança

### 8.1 Vulnerabilidade `xlsx` (CORRIGIDA ✅)

```
Pacote: xlsx (removido)
Severidade: HIGH
CVEs:
  - GHSA-4r6h-8v6p-xvw6: Prototype Pollution in SheetJS
  - GHSA-5pgg-2g8v-p4x9: ReDoS (Regular Expression DoS)
Status: Sem fix disponível no npm — pacote substituído
```

**Correção aplicada:**
- `xlsx` removido de `package.json`
- Substituído por `exceljs@4.4.0` (sem vulnerabilidades conhecidas, API assíncrona segura)
- Três arquivos atualizados: `ExportDashboardDialog.tsx`, `EstoqueRelatorios.tsx`, `ContasReceber.tsx`
- Arquivo obsoleto `src/types/xlsx.d.ts` removido
- Para CSV em `ExportDashboardDialog.tsx`: migrado para implementação nativa (sem dependência externa)

**Verificação:** `npm audit` retorna `found 0 vulnerabilities` após as correções.

### 8.2 JWT com Segredo Compartilhado (HS256)

O backend usa HS256 (segredo simétrico) para JWT. Para sistemas com múltiplos serviços, RS256 (chave assimétrica) oferece melhor isolamento de segurança.

**Arquivo:** `backend/src/infrastructure/auth/JWTAuthService.ts`

### 8.3 `ENABLE_DANGEROUS_ADMIN_ENDPOINTS`

O endpoint de execução de comandos OS está protegido por variável de ambiente. Verificar que **nunca é habilitado em produção**.

---

## 9. Recomendações para Evolução Futura

### 9.1 Curto Prazo (Itens Pendentes)
1. Implementar `EventStore.append()` para persistência de eventos
2. Configurar runner de migrations (ex: `node-postgres-migrate` ou Prisma Migrate)

### 9.2 Médio Prazo
1. Remover `@ts-nocheck` dos arquivos restantes (~56 ainda existem), corrigindo os tipos subjacentes
2. Unificar estratégia de banco: Prisma OU SQL migrations (não ambos)
3. Adicionar `useCallback` nos hooks com `exhaustive-deps` violations
4. Implementar code splitting para chunks > 500 kB
5. Eliminar `src/types/database.ts` substituindo por tipos do Prisma

### 9.3 Longo Prazo
1. Aumentar cobertura de testes (atualmente: 128 frontend + 16 backend + E2E não executados em CI)
2. Implementar testes de integração para repositórios de banco
3. Considerar migrar ESLint backend para flat config (v9) para alinhar com frontend
4. Documentar processo de migração de banco em `CONTRIBUTING.md`

---

## 10. Correções Implementadas Nesta Auditoria

### Resumo das Mudanças

| Arquivo | Tipo de Mudança | Impacto |
|---|---|---|
| `package.json` | `uuid` adicionado como dependência | ✅ Resolve missing dep |
| `package.json` | `@types/uuid`, `@types/react-window` removidos | ✅ Remove stubs deprecados |
| `backend/.eslintrc.json` | `varsIgnorePattern: "^_"` adicionado | ✅ 10 warnings eliminados |
| `backend/src/shared/events/EventStore.ts` | `@ts-nocheck` removido, parâmetros renomeados, import removido | ✅ Código limpo |
| `backend/src/shared/events/EventRegistry.ts` | Import não utilizado (`PatientRepositoryPostgres`) removido | ✅ Dead import removido |
| `backend/src/modules/faturamento/application/commands/EmitirNFeCommand.ts` | Bug `return ;` corrigido para `return String(timestamp)`, parâmetros não utilizados renomeados | ✅ Bug de retorno corrigido |
| `src/modules/estoque/domain/entities/Produto.ts` | Arquivo duplicado removido | ✅ Duplicata eliminada |
| `src/modules/estoque/domain/entities/MovimentacaoEstoque.ts` | Arquivo duplicado removido | ✅ Duplicata eliminada |
| `src/modules/estoque/ui/components/ProdutoList.tsx` | Import atualizado para `@/domain/entities/Produto` | ✅ Aponta para canônico |
| `src/presentation/hooks/useMovimentacoesEstoque.ts` | `queryClient.invalidateQueries` marcados com `void` | ✅ Floating promises |
| `src/presentation/hooks/useProdutos.ts` | `queryClient.invalidateQueries` marcados com `void` | ✅ Floating promises |
| `src/modules/lgpd/presentation/components/LGPDRequests.tsx` | Formatação Prettier corrigida | ✅ Prettier clean |

### Verificação Final

```bash
# Após todas as correções:

# TypeScript
$ npx tsc --noEmit       # → 0 erros ✅
$ cd backend && npx tsc --noEmit  # → 0 erros ✅

# Builds
$ npm run build          # → ✓ built in 3.79s ✅
$ cd backend && npm run build  # → tsc compilado ✅

# Testes
$ npm run test           # → 128 passed (14 suites) ✅
$ cd backend && npm test # → 16 passed (3 suites) ✅

# Lint backend (após correções)
$ cd backend && npm run lint
# → 116 warnings (apenas @typescript-eslint/no-explicit-any) ✅

# Prettier
$ npx prettier --check src/
# → (sem warnings) ✅
```

---

*Relatório gerado como parte da auditoria técnica do sistema OrthoPlus-ModularDB.*
