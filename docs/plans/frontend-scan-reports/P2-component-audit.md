# Component Audit Report — Frontend Scan

**Generated**: 2026-05-19  
**Scope**: `apps/web/src/components/` (31 trees) + `apps/web/src/modules/*/ui/`  
**Method**: Socratico (3 niveis) + Popperiano (5 experimentos) + heuristica de tamanho  

---

## Summary

| Categoria | Encontrado | Severidade |
|-----------|-----------|------------|
| Componentes gigantes (>400 linhas) | 10 em components/ + 20 em modules/ | MEDIUM |
| Falta de acessibilidade (ARIA) | DataTable (0 labels), varios outros | MEDIUM |
| console.log em componentes | 5 ocorrencias | LOW |
| Estados vazios nao tratados | DataTable, outros shared | MEDIUM |
| Hardcoded fetch() em UI | 18 ocorrencias (ja reportado em P1) | MEDIUM |

---

## Socratic Review

### Nivel 1: Elenchus (Refutacao)

#### SR-001: DataTable — Responsabilidade Unica?
**Arquivos**: `components/shared/data-table/` (4 arquivos, 251 linhas)  
**Q1**: "O que DataTable faz?"  
**Resposta**: Renderiza tabela com paginacao, busca, ordenacao  
**Avaliacao**: SRP ✓ (251 linhas distribuidas em 4 arquivos)  

**Q2**: "Por que existe?"  
**Resposta**: Componente compartilhado para todas as listagens do sistema  
**Avaliacao**: Justificado ✓  

**Q3**: "Pode ser mais simples?"  
**Resposta**: Nao, ja esta bem decomposto  
**Avaliacao**: ✓

---

### Nivel 2: Maieutica (Extracao)

#### SR-002: DataTable — Estados Nao Documentados?
**Q7**: "Quais estados este componente gerencia?"  
- `paginatedData` ✓ (documentado)
- `totalPages` ✓ (documentado)
- `currentPage` ✓ (documentado)
- `pageSize` ✓ (documentado)
- `searchTerm` ✓ (documentado)
- `sortColumn` ✓ (documentado)
- `sortDirection` ✓ (documentado)
- **Faltando**: `loading`, `error`, `empty`

**Q8**: "Todos os estados possiveis estao cobertos?"  
- Loading: **NAO** — nao ha skeleton nem spinner
- Error: **NAO** — nao ha tratamento de erro
- Empty: **NAO** — nao ha mensagem "Nenhum resultado"
- Success: ✓

**Q9**: "Ha props contraditorias?"  
- `searchable=true` + `searchKeys=[]` → busca ativa mas sem campos → comportamento indefinido

---

### Nivel 3: Dialetica (Confronto)

#### SR-003: DataTable vs Outras Tabelas
**Q13**: "Ha componentes similares?"  
- `components/shared/data-table/` — compartilhado
- `modules/*/ui/` — varios modulos criam tabelas proprias

**Q14**: "Ha inconsistencia?"  
- DataTable usa paginacao interna
- Algumas tabelas em modulos usam paginacao do servidor
- Nao ha padrao unico

**Q15**: "Este estado deveria ser local ou global?"  
- Estado de paginacao/busca: **local** ✓ (useDataTable hook)
- Estado de ordenacao: **local** ✓

---

## Popperian Falsification

### PF-001: DataTable sem dados
**H0**: "DataTable renderiza corretamente com dados vazios"  
**Experimento**: `<DataTable data={[]} columns={columns} />`  
**Expected**: Mensagem "Nenhum dado encontrado"  
**Actual**: Tabela vazia com header e footer (sem conteudo, sem mensagem)  
**Contradicao?**: SIM  
**Fix**: Adicionar EmptyState quando `data.length === 0`

### PF-002: DataTable sem ARIA
**H0**: "DataTable eh acessivel"  
**Experimento**: Verificar ARIA labels  
**Resultado**: 0 ocorrencias de `aria-` ou `role=` em todos os 4 arquivos  
**Contradicao?**: SIM  
**Fix**: Adicionar `aria-label`, `role="table"`, `scope="col"` nos headers

### PF-003: Componente gigante (UserManagementTab)
**H0**: "UserManagementTab eh manutenivel"  
**Experimento**: Contar linhas  
**Resultado**: 552 linhas  
**Contradicao?**: SIM (limiar SRP = 200-300 linhas)  
**Fix**: Extrair sub-componentes (UserTable, UserForm, PermissionModal)

---

## Componentes Gigantes (>400 linhas)

### components/ (>400 linhas)

| # | Componente | Linhas | Severidade | Issue |
|---|-----------|--------|------------|-------|
| 1 | `settings/UserManagementTab.tsx` | 552 | MEDIUM | Violacao SRP — mistura tabela, form, modal |
| 2 | `settings/BackupRestoreDialog.tsx` | 519 | MEDIUM | Violacao SRP — logica de backup + UI |
| 3 | `pdv/IntegracaoContabilConfig.tsx` | 500 | MEDIUM | Violacao SRP |
| 4 | `crypto/ExchangeConfigForm.tsx` | 484 | MEDIUM | Violacao SRP |
| 5 | `settings/AIModelConfig.tsx` | 478 | MEDIUM | Violacao SRP |
| 6 | `crypto/ConversionSimulator.tsx` | 443 | MEDIUM | Violacao SRP |
| 7 | `crypto/DCABacktesting.tsx` | 420 | MEDIUM | + fetch() direto (P1) |
| 8 | `patients/form-tabs/MedicalHistoryTab.tsx` | 414 | MEDIUM | Violacao SRP |
| 9 | `patients/tabs/AnamneseTab.tsx` | 410 | MEDIUM | Violacao SRP |
| 10 | `crypto/CryptoCalculator.tsx` | 404 | MEDIUM | + fetch() direto (P1) |

### modules/ (>500 linhas)

| # | Componente | Linhas | Severidade | Issue |
|---|-----------|--------|------------|-------|
| 1 | `dashboard/ui/pages/DashboardUnified.tsx` | 636 | MEDIUM | Dashboard monolitico |
| 2 | `funcionarios/components/FuncionarioForm.tsx` | 606 | MEDIUM | Formulario gigante |
| 3 | `dentistas/components/DentistaForm.tsx` | 574 | MEDIUM | Formulario gigante |
| 4 | `estoque/components/FornecedorForm.tsx` | 546 | MEDIUM | Formulario gigante |
| 5 | `estoque/ui/pages/EstoqueIntegracoes.tsx` | 543 | MEDIUM | Pagina monolitica |
| 6 | `estoque/ui/pages/EstoqueAnalisePedidos.tsx` | 537 | MEDIUM | Pagina monolitica |
| 7 | `crypto/components/CryptoAnalysisDashboard.tsx` | 531 | MEDIUM | Dashboard monolitico |
| 8 | `pep/ui/pages/AssinaturaICP.tsx` | 527 | MEDIUM | Pagina monolitica |
| 9 | `estoque/ui/pages/EstoqueInventarioDashboard.tsx` | 524 | MEDIUM | Dashboard monolitico |
| 10 | `bi/ui/pages/ReportTemplates.tsx` | 510 | MEDIUM | Pagina monolitica |

**Total**: 30 componentes >400 linhas (10 em components/ + 20 em modules/)

---

## console.log em Componentes

| # | Arquivo | Linha | Conteudo |
|---|---------|-------|----------|
| 1 | `contexts/AuthContext.tsx` | 178 | `console.error("Error fetching user metadata:", error)` |
| 2 | `contexts/AuthContext.tsx` | 190 | `console.error("Error fetching active modules:", error)` |
| 3 | `components/shared/AvatarUpload.tsx` | 171 | `console.error("Erro no upload:", error)` |
| 4 | `components/shared/AvatarUpload.tsx` | 204 | `console.error("Erro ao remover:", error)` |
| 5 | `modules/marketing-auto/components/programa-fidelidade/useProgramaFidelidade.ts` | 31 | `console.debug(...)` |

---

## Acessibilidade (ARIA)

| Componente | ARIA Labels | Role | Keyboard Nav | Status |
|-----------|-------------|------|--------------|--------|
| `DataTable` | 0 | Nenhum | Nao verificado | ✗ FALHA |
| `ModuleCard` | Nao verificado | Nao verificado | Nao verificado | ? PENDENTE |
| `PatientForm` | Nao verificado | Nao verificado | Nao verificado | ? PENDENTE |

**Recomendacao**: Rodar `axe-core` em todos os componentes compartilhados.

---

## Recomendacoes

| Prioridade | Acao | Componentes | Esforco |
|------------|------|-------------|---------|
| 1 | Adicionar EmptyState ao DataTable | 1 | XS |
| 2 | Adicionar ARIA ao DataTable | 1 | XS |
| 3 | Remover console.log (exceto AuthContext) | 3 | XS |
| 4 | Extrair sub-componentes (UserManagementTab) | 1 | M |
| 5 | Extrair sub-componentes (DashboardUnified) | 1 | M |
| 6 | Rodar axe-core em shared/ | 10+ | S |
| 7 | Refatorar forms gigantes (FuncionarioForm, DentistaForm) | 2 | L |

---

## Cross-References

- **P1**: `docs/plans/frontend-scan-reports/P1-architecture-violations.md`
- **Playbook**: `PB01-component-scan.md`, `PB04-socratic-validation.md`, `PB05-popperian-falsification.md`
- **Project Profile**: `P0-project-profile.md`
