# PROMPT PROFISSIONAL - KIMI + OPENSQUAD

## Validação Completa OrthoPlus Enterprise v2

> **Versão**: 1.0  
> **Data**: 2026-04-05  
> **Escopo**: Validação multi-agente de módulos, banco de dados, navegação frontend, CRUDs e sincronização VPS

---

## 🎯 OBJETIVO

Orquestrar 5 agentes especializados via OpenSquad para realizar validação completa do OrthoPlus Enterprise v2, cobrindo:

- ✅ Módulo Banco de Dados Avançado (SQLite, PostgreSQL, MariaDB, Firebird)
- ✅ Navegação frontend com tema v2 (cyan/amber)
- ✅ CRUDs: Clientes, Serviços, Produtos, Funcionários, Dentistas, Permissões
- ✅ Catálogo de módulos por categoria
- ✅ VPS como source of truth

---

## 🏗️ AGENTES DO SQUAD

### 1. **database-validator**

**Skill**: `orthoplus-database-architect`  
**Objetivo**: Validar módulo Banco de Dados Avançado e conexões PostgreSQL

**Tarefas**:

- [ ] Validar conexão PostgreSQL na VPS (porta 5432)
- [ ] Verificar schemas existentes (public, pacientes, financeiro, pep, inventario, pdv, faturamento, configuracoes)
- [ ] Validar suporte a SQLite, PostgreSQL, MariaDB, Firebird
- [ ] Testar ferramentas de reparo (VACUUM, ANALYZE, REINDEX)
- [ ] Verificar funcionalidade de migração entre bancos
- [ ] Validar templates de tabelas
- [ ] Testar backup local (completo/incremental)
- [ ] Verificar agendamento automático de backup

**Outputs**:

- `output/database-report.json` - Status de conexões e schemas
- `output/database-screenshots/` - Screenshots das validações

---

### 2. **module-navigator**

**Skill**: `orthoplus-frontend-auditor`  
**Objetivo**: Validar navegação nos cards e tema v2 no frontend

**Tarefas**:

- [ ] Acessar https://100.111.74.69/ via browser (Playwright)
- [ ] Realizar login com credenciais de teste
- [ ] Validar tema v2 (cyan #06B6D4 / amber #F59E0B) em todos os cards
- [ ] Testar navegação nos módulos:
  - Dashboard
  - Agenda
  - Pacientes
  - PEP (Prontuário Eletrônico)
  - Financeiro
  - Estoque
  - Configurações
- [ ] Verificar se frontend reflete configurações do backend
- [ ] Validar responsividade dos cards (mobile, tablet, desktop)
- [ ] Testar interações (hover, clicks, modais)

**Outputs**:

- `output/navigation-report.json` - Status de navegação por módulo
- `output/navigation-screenshots/` - Screenshots de cada módulo

---

### 3. **crud-tester**

**Skill**: `orthoplus-backend-refactorer`  
**Objetivo**: Testar cadastros de clientes, serviços, produtos, funcionários e dentistas

**Tarefas**:

- [ ] Obter token JWT via POST /api/auth/login
- [ ] Testar cadastro de CLIENTES/PACIENTES:
  - POST /api/pacientes
  - GET /api/pacientes
  - PATCH /api/pacientes/:id
  - DELETE /api/pacientes/:id (soft delete)
- [ ] Testar cadastro de SERVIÇOS/PROCEDIMENTOS
- [ ] Testar cadastro de PRODUTOS com controle de estoque
- [ ] Testar cadastro de FUNCIONÁRIOS
- [ ] Testar cadastro de DENTISTAS com especialidades
- [ ] Testar PERMISSÕES EDITÁVEIS por módulo

**Outputs**:

- `output/crud-report.json` - Matriz de testes CRUD
- `output/crud-test-data.json` - Dados criados durante os testes

---

### 4. **module-catalog-analyzer**

**Skill**: `orthoplus-database-architect`  
**Objetivo**: Analisar estrutura de módulos por categoria e mapear tabelas

**Tarefas**:

- [ ] Analisar estrutura de módulos por categoria:
  - Dashboard
  - Atendimento (agenda, pacientes, pep)
  - Financeiro (contas, faturamento, split)
  - Operações (estoque, pdv, funcionarios)
  - Marketing
  - Compliance (lgpd, audit)
  - Admin (configuracoes, usuarios)
- [ ] Verificar se existe módulo de configuração para cada categoria
- [ ] Mapear tabelas do banco por categoria/schema
- [ ] Validar se configurações estão em `configuracoes.*` schema
- [ ] Verificar integridade referencial entre módulos

**Outputs**:

- `output/module-catalog.json` - Mapeamento completo de módulos
- `output/module-matrix.md` - Tabela de módulos x categorias

---

### 5. **vps-sync-validator**

**Skills**: `devops-pipelines`, `homelab-automation`  
**Objetivo**: Validar VPS como fonte de verdade e executar health checks

**Tarefas**:

- [ ] Comparar código local com VPS (`/home/tsi/OrthoPlus-Enterprise/`)
- [ ] Verificar se build está atualizado (`/var/www/orthoplus/`)
- [ ] Confirmar que banco está sincronizado
- [ ] Validar que usuários criados estão na VPS
- [ ] Executar health check completo (`/home/tsi/OrthoPlus-Enterprise/scripts/vps/dashboard.sh`)
- [ ] Verificar logs de sincronização
- [ ] Confirmar backup automático funcionando
- [ ] Validar SSL certificado (válido até Apr 2027)

**Outputs**:

- `output/vps-sync-report.json` - Status de sincronização
- `output/health-check-log.txt` - Log do health check

---

## 🔄 WORKFLOW

```yaml
phases:
  - name: Database Validation
    agent: database-validator
    checkpoint: PostgreSQL respondendo e schemas verificados

  - name: Module Navigation
    agent: module-navigator
    depends_on: [] # Pode rodar em paralelo com Database
    checkpoint: Todos os módulos navegáveis com tema v2

  - name: CRUD Testing
    agent: crud-tester
    depends_on: [Database Validation] # Precisa do banco
    checkpoint: Todos os cadastros funcionais

  - name: Module Catalog Analysis
    agent: module-catalog-analyzer
    depends_on: [Database Validation]
    checkpoint: Módulos mapeados por categoria

  - name: VPS Sync Validation
    agent: vps-sync-validator
    depends_on: [Module Navigation, CRUD Testing]
    checkpoint: VPS sincronizada e health check passando

final_checkpoint:
  name: Validation Complete
  require_all: true
  actions:
    - Gerar VALIDATION-REPORT-COMPLETE.md
    - Consolidar todos os relatórios JSON
    - Apresentar resumo executivo
```

---

## 📊 CRITÉRIOS DE SUCESSO

| Critério             | Métrica                 | Threshold  |
| -------------------- | ----------------------- | ---------- |
| Conectividade DB     | Latência                | < 100ms    |
| Navegação Frontend   | Módulos acessíveis      | 100%       |
| CRUDs Funcionais     | Endpoints testados      | 100%       |
| Cobertura de Módulos | Módulos mapeados        | 33+        |
| Sincronização VPS    | Diff local vs VPS       | 0 arquivos |
| Health Check         | Status                  | PASS       |
| Tema v2              | Componentes atualizados | 100%       |

---

## 🚀 COMANDOS DE EXECUÇÃO

```bash
# 1. Navegar para o diretório OpenSquad
cd ~/opensquad

# 2. Executar o squad completo
/opensquad run orthoplus-complete-validation

# Ou executar agentes específicos:
/opensquad run orthoplus-complete-validation --agent database-validator
/opensquad run orthoplus-complete-validation --agent module-navigator
/opensquad run orthoplus-complete-validation --agent crud-tester
/opensquad run orthoplus-complete-validation --agent module-catalog-analyzer
/opensquad run orthoplus-complete-validation --agent vps-sync-validator

# 3. Ver resultados
ls ~/opensquad/squads/orthoplus-complete-validation/output/
```

---

## 📁 ESTRUTURA DE OUTPUT

```
opensquad/squads/orthoplus-complete-validation/output/
├── database-report.json
├── database-screenshots/
│   ├── schema-list.png
│   └── connection-test.png
├── navigation-report.json
├── navigation-screenshots/
│   ├── dashboard.png
│   ├── agenda.png
│   ├── pacientes.png
│   └── ...
├── crud-report.json
├── crud-test-data.json
├── module-catalog.json
├── module-matrix.md
├── vps-sync-report.json
├── health-check-log.txt
└── VALIDATION-REPORT-COMPLETE.md
```

---

## 🔧 CONFIGURAÇÃO PRÉVIA

Antes de executar, garantir:

1. **OpenSquad instalado**:

   ```bash
   cd ~/opensquad && npm list opensquad
   ```

2. **Acesso à VPS configurado**:

   ```bash
   ssh tsi@100.111.74.69 "echo 'VPS OK'"
   ```

3. **Credenciais de teste disponíveis**:
   - Usuários: admin@orthoplus.com, dentista1@orthoplus.com, funcionario1@orthoplus.com
   - Local: `~/.env` ou `backend/.env`

4. **Skills instaladas**:
   ```bash
   opensquad skills  # Verificar se todas as skills necessárias estão instaladas
   ```

---

## 🛡️ TRATAMENTO DE ERROS

| Erro                        | Ação                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| Falha de conexão PostgreSQL | Verificar se VPS está online, tentar reconectar em 30s            |
| Auth required (401)         | Obter novo token JWT, verificar credenciais                       |
| Timeout na navegação        | Aumentar timeout do Playwright, verificar performance do frontend |
| Divergência VPS             | Executar sync manual, verificar último deploy                     |
| Build falhando              | Executar `pnpm build` localmente antes de validar                 |

---

## 📄 TEMPLATE DE RELATÓRIO FINAL

O relatório `VALIDATION-REPORT-COMPLETE.md` deve conter:

```markdown
# Relatório de Validação OrthoPlus Enterprise v2

**Data**: {{date}}  
**Squad**: orthoplus-complete-validation  
**Status**: {{PASS/FAIL}}

## Resumo Executivo

- Total de módulos validados: {{X}}/33
- CRUDs testados: {{X}}/6
- Frontend navegável: {{SIM/NÃO}}
- VPS sincronizada: {{SIM/NÃO}}

## Resultados por Agente

### database-validator

- Status: {{PASS/FAIL}}
- Schemas verificados: {{lista}}
- Latência média: {{X}}ms

### module-navigator

...

## Recomendações

- {{lista de ações se necessário}}

## Anexos

- [database-report.json](output/database-report.json)
- [navigation-report.json](output/navigation-report.json)
  ...
```

---

## 📝 NOTAS

- Este prompt deve ser usado em conjunto com o OpenSquad framework
- Os agentes executam em paralelo onde possível, seguindo as dependências do workflow
- Todos os outputs são persistidos no Obsidian vault automaticamente via `register-pending-doc.py`
- Para debug, usar `opensquad run <squad> --verbose`

---

**Mantenha este prompt versionado e atualizado conforme o sistema evolui.**
