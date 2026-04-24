# Draft: Banco de Dados Descentralizado por Categoria

## Requisitos Confirmados
- **Objetivo**: Cada categoria modular possui gerenciamento de banco de dados e backup isolados
- **UI**: Painel "Banco de Dados Avançado" por categoria com 6 abas + seção separada "Backup Local"

---

## Estrutura da Página (CONFIRMADA via imagens)

A página de gerenciamento de banco de dados tem **2 seções principais**, empilhadas:

### Seção 1 — "Banco de Dados Avançado" (collapsible card)
- Header: ícone DB azul (`Database`) + **"Banco de Dados Avançado"** amarelo/dourado + botão `∧` (collapse)
- Subtítulo: "Configure o motor e conexão do banco de dados"
- Contém as **6 abas** (Motor, Config, Reparo, Migração, Templates, Docs)
- **Estado de engine selecionada** global ao painel — afeta todas as abas

### Seção 2 — "Backup Local" (collapsible card separado)
- Header: ícone `HardDrive` + **"Backup Local"** amarelo/dourado + botões `?` e `∨/∧`
- Subtítulo: "Criar e restaurar backups do banco de dados"
- Componente independente, não aninhado em "Banco de Dados Avançado"

---

## UI — "Banco de Dados Avançado" (6 abas, engine-aware)

### Estado Global: Engine Selecionada
O painel mantém estado `selectedEngine: 'PostgreSQL' | 'SQLite' | 'MariaDB' | 'Firebird'` (default: `'PostgreSQL'`).
Todas as 6 abas renderizam conteúdo **específico por engine** baseado neste estado.

---

### Aba "Motor" — Engine Selector

**Cards de engine** (grid 2x2):
| Engine | Porta padrão | Descrição | Selecionado |
|--------|-------------|-----------|-------------|
| SQLite | — | "Banco de dados leve em arquivo único, ideal para instalações single-node" | borda branca |
| PostgreSQL | 5432 | "Banco de dados robusto e escalável para ambientes corporativos" | borda dourada + ✓ (OrthoPlus default) |
| MariaDB | 3306 | "Fork do MySQL com melhor performance e compatibilidade" | borda branca |
| Firebird | 3050 | "Banco de dados legado multiplataforma com modo embedded" | borda dourada + ✓ (quando selecionado) |

**Seção de detalhes** (aparece abaixo dos cards quando engine está selecionada):

#### PostgreSQL — Detalhes (default)
- ✅ Quando usar: lista bullets (ambientes corporativos, alta disponibilidade, etc.)
- ⚠️ Limitações: lista bullets
- 🚀 Recursos: chips — `JSON/JSONB nativo`, `Full-text search avançado`, `Replicação síncrona/assíncrona`, `Extensões (PostGIS, etc)`, `MVCC robusto`

#### Firebird — Detalhes
- ✅ Quando usar: `Sistemas legados existentes`, `Aplicações desktop standalone`, `Compatibilidade com Interbase`, `Embedded database com servidor`
- ⚠️ Limitações: `Comunidade menor`, `Menos ferramentas modernas`, `Documentação menos extensa`
- 🚀 Recursos: chips — `Modo embedded e servidor`, `Stored procedures`, `Triggers avançados`, `Instalação pequena`, `Suporte a eventos`

#### SQLite — Detalhes (inferido)
- ✅ Quando usar: single-node, desenvolvimento local, embeds
- ⚠️ Limitações: sem multi-user concorrente
- 🚀 Recursos: chips — `Zero config`, `Arquivo único`, `Sem servidor`

#### MariaDB — Detalhes (inferido)
- ✅ Quando usar: workloads MySQL, compatibilidade legada
- ⚠️ Limitações: menos nativo no ecossistema Node/Prisma
- 🚀 Recursos: chips — `MySQL compatible`, `Performance melhorada`, `Galera Cluster`

---

### Aba "Config" — Connection Form (engine-specific)

**Campos comuns a todas as engines**: Host, Porta, Usuário, Senha (com 🔑 reveal)

**Campo variável por engine**:
| Engine | Campo 3 | Label do campo | Valor padrão porta |
|--------|---------|---------------|-------------------|
| PostgreSQL | Nome do Banco | "Banco de Dados" | 5432 |
| Firebird | Caminho do banco | "Caminho do Banco" | 3050 |
| MariaDB | Nome do Banco | "Banco de Dados" | 3306 |
| SQLite | Caminho do arquivo | "Caminho do Arquivo" | — (sem porta) |

**Usuário padrão por engine**:
- PostgreSQL: `postgres`
- Firebird: `SYSDBA`
- MariaDB: `root`
- SQLite: N/A

**Botão de ação**: `"Testar Conexão <EngineName>"` (ex: "Testar Conexão Firebird")

**Banner amarelo fixo**: `"⚠ Modo Demo: Conexão será simulada"`

---

### Aba "Reparo" — Maintenance Tools (engine-specific)

**Subtítulo**: `"Ferramentas de manutenção e reparo para <EngineName>"`

**Grid 2x2 de tool cards** (nome, descrição, snippet de comando, botão ▶):

#### PostgreSQL
| Tool | Descrição | Comando |
|------|-----------|---------|
| VACUUM FULL | Compacta e recupera espaço | `VACUUM FULL;` |
| ANALYZE | Atualiza estatísticas | `ANALYZE;` |
| REINDEX DATABASE | Reconstrói índices | `REINDEX DATABASE jukebox;` |
| pg_checksums | Verifica checksums das páginas | `pg_checksums --check` |

#### Firebird
| Tool | Descrição | Comando |
|------|-----------|---------|
| gfix -sweep | Remove versões antigas de registros | `gfix -sweep jukebox.fdb` |
| gfix -validate | Valida estrutura do banco | `gfix -validate -full jukebox.fdb` |
| gfix -mend | Repara erros encontrados | `gfix -mend jukebox.fdb` |
| gstat | Estatísticas do banco | `gstat -h jukebox.fdb` |

#### MariaDB
| Tool | Descrição | Comando |
|------|-----------|---------|
| OPTIMIZE TABLE | Desfragmenta tabelas | `OPTIMIZE TABLE nome;` |
| CHECK TABLE | Verifica erros | `CHECK TABLE nome;` |
| REPAIR TABLE | Repara erros | `REPAIR TABLE nome;` |
| ANALYZE TABLE | Atualiza stats | `ANALYZE TABLE nome;` |

#### SQLite
| Tool | Descrição | Comando |
|------|-----------|---------|
| VACUUM | Compacta e recria arquivo | `VACUUM;` |
| INTEGRITY CHECK | Verifica integridade | `PRAGMA integrity_check;` |
| ANALYZE | Atualiza índices | `ANALYZE;` |
| REINDEX | Reconstrói índices | `REINDEX;` |

**Seção de histórico** (abaixo do grid):
- Estado vazio: ícone activity-wave + "Nenhum histórico de conexão disponível" + "Execute um teste de conexão para começar"
- Quando preenchido: lista de operações executadas com timestamp

---

### Aba "Migração"

**Subtítulo**: "Exporte e importe dados entre diferentes motores de banco"

**Dois cards de ação** (lado a lado, borda sutil):
- `⬇ Exportar Dados` + "JSON/SQL"
- `⬆ Importar Dados` + "De outro banco"

**Caixa "Migração Assistida"** (borda amarela):
- Texto: "Transfira dados automaticamente de um motor para outro mantendo integridade referencial."
- Seletor: `<EngineAtual>` ⇄ `<EngineDestino ▼>` (dropdown)
  - Ex com Firebird selecionado: `Firebird ⇄ PostgreSQL ▼`
  - Ex com PostgreSQL selecionado: `PostgreSQL ⇄ SQLite ▼`
- Botão full-width cinza: `"Iniciar Migração"`

**Adaptação OrthoPlus**: Exportar = pg_dump por schema da categoria, Migração Assistida = export para arquivo (demo mode aceitável)

---

### Aba "Templates"

**Subtítulo**: `"Templates de tabelas para <EngineName>"`

**Botão topo-direita**: `📄 Exportar Schema`

**Lista de template cards** (scrollável), cada um:
- Ícone tabela azul + nome da tabela + descrição
- Bloco `CREATE TABLE` com syntax highlight (dark)
- Botão `Copiar`

**Conteúdo real por categoria** (usando tabelas reais do schema da categoria):
- CORE: `patients`, `appointments`, `profiles`, `recalls`, `dentist_schedules`
- FINANCEIRO: `financial_transactions`, `contas_pagar`, `contas_receber`, `nfe_records`
- OPERACIONAL: `produtos`, `movimentacoes_estoque`, `estoque_alertas`
- COMERCIAL: `crm_leads`, `campanhas_marketing`, `fidelidade_pontos`
- CLINICO: `teleconsultas`, `tiss_guides`, `analises_radiograficas`
- ADMINISTRATIVO: `clinic_modules`, `audit_logs`, `scheduled_backups`

**Backend**: `GET /db/templates` retorna DDL via `information_schema.tables` + pg_get_tabledef

---

### Aba "Docs" — Estática, engine-specific

**Subtítulo**: `"Documentação oficial e recursos para <EngineName>"`

**Links** (ícone livro + ícone externo ↗):

#### PostgreSQL
- "PostgreSQL Docs" → https://www.postgresql.org/docs/
- "Tutorial Iniciante" → https://www.postgresql.org/docs/current/tutorial.html
- "PostgreSQL Wiki" → https://wiki.postgresql.org/
- Dicas instalação: `sudo pacman -S postgresql` / `sudo apt install postgresql`

#### Firebird
- "Firebird Docs" → https://firebirdsql.org/en/documentation/
- "Firebird FAQ" → https://firebirdsql.org/en/faq/
- Dicas instalação: `yay -S firebird` (Arch) / `firebirdsql.org/downloads` (outros)

#### MariaDB
- "MariaDB Docs" → https://mariadb.com/kb/en/
- "MariaDB Blog" → https://mariadb.com/kb/en/mariadb-blog/
- Dicas instalação: `sudo pacman -S mariadb` / `sudo apt install mariadb-server`

#### SQLite
- "SQLite Docs" → https://www.sqlite.org/docs.html
- "SQLite Tutorial" → https://www.sqlitetutorial.net/
- Dicas instalação: `sudo pacman -S sqlite` / `sudo apt install sqlite3`

**Caixa "Dicas de Instalação"** (borda azul/teal): contém OS variants como code blocks

> **Nota**: aba 100% estática — zero chamadas API

---

## UI — "Backup Local" (seção separada)

### Header do Card
- Ícone `HardDrive` azul + título **"Backup Local"** amarelo
- Subtítulo: "Criar e restaurar backups do banco de dados"
- Botões: `?` (ajuda/tooltip) + `∨/∧` (collapse/expand)

### Conteúdo (quando expandido)

**Caixa educativa "O que são Backups?"** (borda sutil, fundo levemente diferente):
1. Backup é uma 'cópia de segurança' dos seus dados - como tirar uma foto do sistema.
2. Se algo der errado (computador quebrar, vírus, etc.), você pode restaurar tudo usando essa cópia.
3. BACKUP COMPLETO: Copia TUDO. Leva mais tempo, mas é a forma mais segura.
4. BACKUP INCREMENTAL: Copia apenas o que mudou desde o último backup. É mais rápido!

**Dicas** (3 linhas com ícone 💡, fundo amarelo/âmbar escuro):
- 💡 Faça backup completo toda semana
- 💡 Faça backup incremental todo dia
- 💡 Guarde cópias em lugares diferentes (pen drive, nuvem)

**Alerta** (fundo vermelho escuro):
- ⚠ `Sem backup, se o computador quebrar, você perde TUDO! Não arrisque.`

**3 sub-tabs**: `Local` | `Nuvem` | `Distribuído`

**2 botões de tipo de backup** (toggle-style):
- `⬇ Backup Completo` (ativo — fundo teal/azul)
- `⬇ Incremental`

**Lista de backups** (abaixo dos botões):
- Estado vazio: "Nenhum backup encontrado" (centralizado)
- Quando preenchido: lista de arquivos com data, tamanho, ações

**"📅 Agendamento Automático"** toggle (switch off por padrão)
- Quando ativado: mostra campos de frequência/horário

---

## Componentes Frontend Necessários (COMPLETO)

### Arquivo principal
`apps/web/src/modules/settings/ui/pages/DatabaseManagementPage.tsx`
- Renderiza: `<DatabaseAdvancedPanel />` + `<BackupLocalCard />`

### DatabaseAdvancedPanel
`apps/web/src/modules/settings/ui/components/database/DatabaseAdvancedPanel.tsx`
- Estado: `selectedEngine: EngineType`, `selectedTab: TabType`
- Props: `category: CategoryKey`, `categorySchemas: string[]`
- Renderiza: 6 tabs com conteúdo engine-aware

### Tabs (engine-aware)
- `MotorTab.tsx` — engine cards + details panel por engine
- `ConfigTab.tsx` — form dinâmico por engine + TestConnection + DemoModeBanner
- `RepairTab.tsx` — grid tools por engine + RepairHistory
- `MigrationTab.tsx` — Export/Import cards + Migração Assistida
- `TemplatesTab.tsx` — DDL templates da categoria + ExportSchema button
- `DocsTab.tsx` — links e install tips por engine (100% estático)

### BackupLocalCard
`apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx`
- Collapsible card independente
- Sub-tabs: Local / Nuvem / Distribuído
- Toggle: Backup Completo / Incremental
- Toggle: Agendamento Automático
- Caixa educativa, tips, alerta

### Componentes auxiliares
- `EngineCard.tsx` — card selecionável (borda dourada + ✓ quando ativo)
- `EngineDetails.tsx` — painel de detalhes (Quando usar / Limitações / Recursos)
- `RepairToolCard.tsx` — card com snippet + botão ▶
- `TemplateCard.tsx` — card CREATE TABLE + botão Copiar
- `DocLinkItem.tsx` — linha de link externo ↗
- `InstallationTips.tsx` — caixa de dicas de instalação por OS

### Hook
`apps/web/src/hooks/useCategoryDatabase.ts`
- useQuery para health + stats (30s cache)
- mutations para backup + maintenance

---

## Endpoints Backend Necessários (COMPLETO)
- `GET  /db/health` → status + schemas + latência
- `GET  /db/stats` → tableCount, sizeBytes, sizeHuman, lastBackup
- `POST /db/backup` → pg_dump por schema, retorna filePath
- `GET  /db/backups` → lista de backups existentes
- `POST /db/maintenance` → VACUUM FULL, ANALYZE, REINDEX
- `GET  /db/repair/history` → histórico de operações
- `POST /db/test-connection` → testa conexão (demo mode)
- `POST /db/export` → exporta dados (JSON ou SQL)
- `POST /db/import` → importa dados de arquivo
- `POST /db/migrate` → inicia migração assistida (demo mode)
- `GET  /db/templates` → DDL CREATE TABLE das tabelas do schema

---

## Categorias e Schemas
- CORE: core, pacientes, pep
- FINANCEIRO: financeiro, pdv, faturamento, crypto_config
- OPERACIONAL: operacional, inventario
- COMERCIAL: comercial
- CLINICO: clinico
- ADMINISTRATIVO: administrativo, configuracoes, database_admin, backups

---

## Notas de Implementação

### Engine Selection — Comportamento OrthoPlus
- OrthoPlus **usa exclusivamente PostgreSQL** na prática
- A seleção de engine é **cosmética/informacional** — mostra detalhes de cada engine
- Config/Reparo para engines não-PostgreSQL funcionam em **"Modo Demo"** (conexão simulada)
- Apenas PostgreSQL tem endpoints reais de backup/maintenance no backend
- A seleção padrão ao abrir o painel sempre é **PostgreSQL**

### Backup Local — Integração com Backend
- Sub-tab "Local": usa `GET /db/backups` e `POST /db/backup` do category backend
- Sub-tab "Nuvem": demo mode (banner "Em breve")
- Sub-tab "Distribuído": demo mode (banner "Em breve")
- Agendamento Automático: conecta ao categoryBackupScheduler (T12) via nova rota ou demo mode

### Templates — Fonte de Dados Real
- `GET /db/templates` executa query em `information_schema.tables` + `pg_get_tabledef()`
  ou constrói DDL via `information_schema.columns` para cada tabela do schema
- Exibir apenas tabelas do schema da categoria (não todas as 178)
