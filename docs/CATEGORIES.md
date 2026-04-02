# Categorias do OrthoPlus Enterprise

## Visão Geral

O OrthoPlus Enterprise é organizado em **10 categorias** de negócio, cada uma representando um domínio funcional completo. Cada categoria é um pacote independente dentro do monorepo.

---

## Mapa de Categorias

```
┌─────────────────────────────────────────────────────────────────┐
│                        OrthoPlus Enterprise                      │
├─────────────────────────────────────────────────────────────────┤
│  1. VISÃO GERAL                                                  │
│     └── Dashboard                                                │
├─────────────────────────────────────────────────────────────────┤
│  2. ATENDIMENTO CLÍNICO                                          │
│     ├── Agenda │ Pacientes │ PEP │ Odontograma                  │
│     └── Tratamentos │ Orçamentos │ Contratos │ Procedimentos     │
├─────────────────────────────────────────────────────────────────┤
│  3. GESTÃO FINANCEIRA                                            │
│     ├── Fluxo de Caixa │ Contas a Receber │ Inadimplência       │
│     └── Crypto │ PDV │ NFe │ Split de Pagamento                  │
├─────────────────────────────────────────────────────────────────┤
│  4. OPERAÇÕES                                                    │
│     └── Estoque │ Inventário │ Scanner Mobile                     │
├─────────────────────────────────────────────────────────────────┤
│  5. MARKETING & RELACIONAMENTO                                   │
│     └── CRM │ Fidelidade │ Campanhas │ Portal do Paciente        │
├─────────────────────────────────────────────────────────────────┤
│  6. ANÁLISES & RELATÓRIOS                                        │
│     └── BI │ Dashboards │ Relatórios                             │
├─────────────────────────────────────────────────────────────────┤
│  7. CONFORMIDADE & LEGAL                                         │
│     └── LGPD │ Assinatura ICP │ TISS │ Teleodontologia          │
├─────────────────────────────────────────────────────────────────┤
│  8. INOVAÇÃO & TECNOLOGIA                                        │
│     └── IA Radiografia │ Fluxo Digital                           │
├─────────────────────────────────────────────────────────────────┤
│  9. ADMINISTRAÇÃO & DEVOPS  ✅                                   │
│     ├── Database Config ✅ │ Database Maintenance                │
│     ├── Backups │ Crypto Config │ GitHub Tools │ Terminal        │
├─────────────────────────────────────────────────────────────────┤
│ 10. CONFIGURAÇÕES                                                │
│     └── Módulos │ Usuários │ Permissões                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status das Categorias

| # | Categoria | Bounded Context | Módulos | Status |
|---|-----------|-----------------|---------|--------|
| 1 | VISÃO GERAL | DASHBOARD | 1 | 🔄 Planejado |
| 2 | ATENDIMENTO CLÍNICO | CLINICA | 8 | 🔄 Planejado |
| 3 | GESTÃO FINANCEIRA | FINANCEIRO | 7 | 🔄 Planejado |
| 4 | OPERAÇÕES | OPERACOES | 3 | 🔄 Planejado |
| 5 | MARKETING & RELACIONAMENTO | CRESCIMENTO | 4 | 🔄 Planejado |
| 6 | ANÁLISES & RELATÓRIOS | BI | 3 | 🔄 Planejado |
| 7 | CONFORMIDADE & LEGAL | COMPLIANCE | 4 | 🔄 Planejado |
| 8 | INOVAÇÃO & TECNOLOGIA | INOVACAO | 2 | 🔄 Planejado |
| 9 | **ADMINISTRAÇÃO & DEVOPS** | **ADMIN** | **6** | **✅ Implementada** |
| 10 | CONFIGURAÇÕES | CONFIGURACOES | 3 | 🔄 Planejado |

**Total: 10 categorias | 44 módulos | 1 implementada**

---

## Detalhamento por Categoria

### 1. VISÃO GERAL (DASHBOARD)

**Propósito:** Visão executiva consolidada da clínica

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Dashboard | Painel executivo com KPIs principais | 🔄 Planejado |

**Métricas:**
- Faturamento do dia/mês
- Pacientes atendidos
- Taxa de ocupação
- Alertas prioritários

---

### 2. ATENDIMENTO CLÍNICO (CLINICA)

**Propósito:** Gestão completa do atendimento odontológico

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Agenda | Agendamento de consultas | 🔄 Planejado |
| Pacientes | Cadastro e histórico | 🔄 Planejado |
| PEP | Prontuário Eletrônico do Paciente | 🔄 Planejado |
| Odontograma | Visualização 2D/3D da arcada | 🔄 Planejado |
| Tratamentos | Planos de tratamento | 🔄 Planejado |
| Orçamentos | Propostas comerciais | 🔄 Planejado |
| Contratos | Contratos digitais | 🔄 Planejado |
| Procedimentos | Catálogo de procedimentos | 🔄 Planejado |

**Fluxo Principal:**
```
Agenda → Paciente → PEP → Odontograma → Tratamento → Orçamento → Contrato
```

---

### 3. GESTÃO FINANCEIRA (FINANCEIRO)

**Propósito:** Controle financeiro completo da clínica

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Fluxo de Caixa | Movimentação diária | 🔄 Planejado |
| Contas a Receber | Recebimentos | 🔄 Planejado |
| Inadimplência | Cobrança e inadimplência | 🔄 Planejado |
| Pagamentos Crypto | Bitcoin e criptomoedas | 🔄 Planejado |
| PDV | Ponto de venda | 🔄 Planejado |
| Notas Fiscais | NFe/NFCe | 🔄 Planejado |
| Split de Pagamento | Divisão de receitas | 🔄 Planejado |

---

### 4. OPERAÇÕES (OPERACOES)

**Propósito:** Gestão operacional e de recursos

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Estoque | Controle de estoque | 🔄 Planejado |
| Inventário | Inventário periódico | 🔄 Planejado |
| Scanner Mobile | Leitura de códigos de barras | 🔄 Planejado |

---

### 5. MARKETING & RELACIONAMENTO (CRESCIMENTO)

**Propósito:** Captação e retenção de pacientes

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| CRM | Funil de vendas | 🔄 Planejado |
| Fidelidade | Programa de fidelidade | 🔄 Planejado |
| Campanhas | Marketing automation | 🔄 Planejado |
| Portal do Paciente | Área do paciente | 🔄 Planejado |

---

### 6. ANÁLISES & RELATÓRIOS (BI)

**Propósito:** Business Intelligence e analytics

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| BI | Business Intelligence | 🔄 Planejado |
| Dashboards | Dashboards customizáveis | 🔄 Planejado |
| Relatórios | Relatórios gerenciais | 🔄 Planejado |

---

### 7. CONFORMIDADE & LEGAL (COMPLIANCE)

**Propósito:** Conformidade legal e regulamentar

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| LGPD | Compliance LGPD | 🔄 Planejado |
| Assinatura ICP | Assinatura digital ICP-Brasil | 🔄 Planejado |
| TISS | Faturamento de convênios | 🔄 Planejado |
| Teleodontologia | Consultas online | 🔄 Planejado |

---

### 8. INOVAÇÃO & TECNOLOGIA (INOVACAO)

**Propósito:** Tecnologias emergentes

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| IA Radiografia | Análise de radiografias com IA | 🔄 Planejado |
| Fluxo Digital | Integração CAD/CAM | 🔄 Planejado |

---

### 9. ADMINISTRAÇÃO & DEVOPS (ADMIN) ✅

**Propósito:** Gestão técnica e infraestrutura

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Database Config** | **Configuração de banco de dados** | **✅ Implementado** |
| Database Maintenance | Manutenção de banco | 🔄 Planejado |
| Backups | Backup e restore | 🔄 Planejado |
| Configuração Crypto | Wallets e pagamentos cripto | 🔄 Planejado |
| GitHub Tools | Integração com GitHub | 🔄 Planejado |
| Terminal | Terminal web seguro | 🔄 Planejado |

**Database Config - Funcionalidades:**
- ✅ 4 engines suportados (SQLite, PostgreSQL, MariaDB, Firebird)
- ✅ Formulário de conexão com validação
- ✅ Teste de conexão
- ✅ Ferramentas de manutenção (VACUUM, ANALYZE, REINDEX)
- ✅ Migração entre engines
- ✅ Templates de configuração

---

### 10. CONFIGURAÇÕES (CONFIGURACOES)

**Propósito:** Configurações globais do sistema

**Módulos:**
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Módulos | Gestão de módulos | 🔄 Planejado |
| Usuários | Gestão de usuários | 🔄 Planejado |
| Permissões | Controle de acesso | 🔄 Planejado |

---

## Estrutura de Pacotes

```
categories/@orthoplus/
├── core/                          # Pacotes compartilhados
│   ├── ui/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── dashboard/
│   └── packages/
│       └── dashboard-main/
│
├── atendimento-clinico/
│   └── packages/
│       ├── agenda/
│       ├── pacientes/
│       ├── pep/
│       ├── odontograma/
│       ├── tratamentos/
│       ├── orcamentos/
│       ├── contratos/
│       └── procedimentos/
│
├── gestao-financeira/
│   └── packages/
│       ├── fluxo-caixa/
│       ├── contas-receber/
│       ├── inadimplencia/
│       ├── crypto-payments/
│       ├── pdv/
│       ├── nfe/
│       └── split-pagamento/
│
├── operacoes/
│   └── packages/
│       ├── estoque/
│       ├── inventario/
│       └── scanner-mobile/
│
├── marketing/
│   └── packages/
│       ├── crm/
│       ├── fidelidade/
│       ├── campanhas/
│       └── portal-paciente/
│
├── analises/
│   └── packages/
│       ├── bi/
│       ├── dashboards/
│       └── relatorios/
│
├── compliance/
│   └── packages/
│       ├── lgpd/
│       ├── assinatura-icp/
│       ├── tiss/
│       └── teleodontologia/
│
├── inovacao/
│   └── packages/
│       ├── ia-radiografia/
│       └── fluxo-digital/
│
├── admin-devops/                  ✅ IMPLEMENTADA
│   └── packages/
│       ├── database-config/       ✅
│       ├── database-maintenance/
│       ├── backups/
│       ├── crypto-config/
│       ├── github-tools/
│       └── terminal/
│
└── configuracoes/
    └── packages/
        ├── modulos/
        ├── usuarios/
        └── permissoes/
```

---

## Convenções de Nomenclatura

### Categorias
- Nome: `@orthoplus/[categoria]`
- Exemplo: `@orthoplus/admin-devops`

### Módulos
- Nome: `@orthoplus/[categoria]-[modulo]`
- Exemplo: `@orthoplus/admin-devops-database-config`

### Bounded Contexts
- Sempre em MAIÚSCULAS
- Exemplo: `ADMIN`, `CLINICA`, `FINANCEIRO`

---

## Roadmap

### Q1 2026
- ✅ Estrutura do monorepo
- ✅ Pacotes core
- ✅ Categoria Admin-DevOps (Database Config)

### Q2 2026
- 🔄 Atendimento Clínico (Agenda, Pacientes, PEP)
- 🔄 Gestão Financeira (Fluxo de Caixa)

### Q3 2026
- 🔄 Operações (Estoque)
- 🔄 Marketing (CRM)

### Q4 2026
- 🔄 Compliance (LGPD)
- 🔄 Configurações

---

## Referências

- [Arquitetura](ARCHITECTURE.md)
- [Contribuição](CONTRIBUTING.md)
- [Database Config](../categories/@orthoplus/admin-devops/packages/database-config/README.md)
