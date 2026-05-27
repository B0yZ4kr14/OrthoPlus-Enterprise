# Plano Orquestrado — 12 Horas Autônomas

> Criado: 2026-05-27 | Modo: Autônomo (sem interrupções) | Framework: Speckit

## Estado Atual
- Deploy VPS estável (backend online, Redis OK, nginx OK)
- 29/29 specs com spec.md + plan.md + tasks.md
- Tasks MISSING pendentes: 008-pdv (1), 009-faturamento (2), 012-tiss (5)
- Brownfield drift: 0 fails, 2 minor items (legacy tests, DevOps)

## Objetivo
Implementar features MISSING de forma contínua em 12h, com deploy automático na VPS ao final de cada fase.

## Fases

### Fase 1: 008-PDV — Dedução Automática de Estoque (0-3h)
**Scope**: T320-T325 — dedução automática de inventário na venda + alerta de estoque baixo
**Backend**:
- [ ] Modelo `pdv_venda_itens` com vinculação a `produtos`
- [ ] Trigger/service de dedução de estoque ao criar venda
- [ ] Endpoint `GET /pdv/estoque-alerta` para produtos abaixo do mínimo
**Frontend**:
- [ ] Badge de alerta no PDV quando produto está abaixo do mínimo
- [ ] Toast/alerta pós-venda se dedução deixou estoque crítico
**Migration**: `add_pdv_estoque_deducao`
**Deploy**: VPS deploy ao final

### Fase 2: 009-Faturamento — Configuração Fiscal (3-6h)
**Scope**: T310-T315 — certificado A1, série, ambiente (homolog/prod)
**Backend**:
- [ ] Modelo `faturamento_config` (schema faturamento)
- [ ] CRUD endpoints `/faturamento/config`
- [ ] Validação de certificado A1 (upload .pfx)
- [ ] Toggle ambiente (homologação/produção)
**Frontend**:
- [ ] Tela de configuração fiscal com upload de certificado
- [ ] Campos: série, ambiente, CNPJ emitente
- [ ] Visualizador de status do certificado (vencimento)
**Migration**: `add_faturamento_config`
**Deploy**: VPS deploy ao final

### Fase 3: 009-Faturamento — Relatório Fiscal (6-9h)
**Scope**: T330-T335 — relatório fiscal com CSV/Excel export e totais de impostos
**Backend**:
- [ ] Endpoint `GET /faturamento/relatorio` com filtros (período, tipo)
- [ ] Agregação de totais: ICMS, IPI, PIS, COFINS
- [ ] Export CSV e Excel (usar exceljs existente)
**Frontend**:
- [ ] Tela de relatório fiscal com filtros
- [ ] Tabela de resumo + gráfico de evolução
- [ ] Botões de export CSV/Excel
**Deploy**: VPS deploy ao final

### Fase 4: 012-TISS — Convênio Management (9-12h)
**Scope**: T300-T305 — CRUD de convênios + vinculação a pacientes
**Backend**:
- [ ] Modelo `tiss_convenios` (schema clinico)
- [ ] CRUD endpoints `/tiss/convenios`
- [ ] Vinculação paciente-convênio (modelo `paciente_convenios`)
**Frontend**:
- [ ] Tela de gestão de convênios
- [ ] Vinculação de convênio no cadastro de paciente
- [ ] Busca de convênio no formulário TISS
**Migration**: `add_tiss_convenios`
**Deploy**: VPS deploy ao final

## Checklist Global
- [x] Fase 1 completa + deploy
- [x] Fase 2 completa + deploy
- [x] Fase 3 completa + deploy
- [x] Fase 4 completa + deploy
- [x] Backend build 0 erros
- [x] Frontend type-check 0 erros (exceto pré-existentes)
- [x] Todos os commits em `main`
- [x] tasks.md atualizados

## Resumo de Commits
| Commit | Fase | Descrição |
|--------|------|-----------|
| `7728fc749` | Fase 1 | PDV: pdv_venda_itens, stock rollback, frontend alerts |
| `f24fca0a9` | Fase 2+3 | Faturamento: config endpoint fix + RelatorioFiscalPage |
| `aa82bf3d6` | Fase 4 | TISS: paciente_convenios CRUD + vinculacao no PatientDetail |

## Decisões Arquiteturais (pré-tomadas)
1. **Multi-tenancy**: Todos os modelos têm `clinic_id` obrigatório
2. **Prisma**: Migrations manuais (shadow DB não suporta multiSchema)
3. **Frontend**: Componentes em `@orthoplus/core-ui`, hooks React Query
4. **API**: Todos os endpoints com `clinicGuard`
5. **Deploy**: `deploy-orthoplus-full.sh` ao final de cada fase
6. **Erros pré-existentes**: Não corrigir `IAInsightsDashboard.tsx` (drift conhecido)
