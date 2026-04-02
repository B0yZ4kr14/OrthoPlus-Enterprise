# Mapeamento de Rotas - Ortho+ V5.1

## Visão Geral

Este documento mapeia todas as rotas públicas e protegidas do sistema Ortho+, organizadas por Bounded Context.

## Estrutura de Rotas

### 🔓 Rotas Públicas (Não Autenticadas)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/auth` | `Auth.tsx` | Login e cadastro |
| `/reset-password` | `ResetPassword.tsx` | Recuperação de senha |
| `/demo` | `Demo.tsx` | Demo pública |
| `*` | `NotFound.tsx` | 404 - Página não encontrada |

---

### 🔒 Rotas Protegidas (Requerem Autenticação)

## 1. VISÃO GERAL

| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/` | `DashboardUnified.tsx` | Dashboard principal (4 abas) | N/A |
| `/bi` | `BusinessIntelligence.tsx` | Business Intelligence | `BI` |

---

## 2. ATENDIMENTO CLÍNICO

### Pacientes
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/pacientes` | `Pacientes.tsx` | Lista de pacientes | `PEP` |
| `/pacientes/novo` | `PatientForm.tsx` | Cadastro de novo paciente | `PEP` |
| `/pacientes/editar/:id` | `PatientForm.tsx` | Edição de paciente | `PEP` |
| `/pacientes/:id` | `PatientDetail.tsx` | Ficha completa (7 abas) | `PEP` |

### Agendamento
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/agenda` | `AgendaPage.tsx` | Agenda de consultas | `AGENDA` |

### Prontuário e Clínica
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/pep` | `PEP.tsx` | Prontuário Eletrônico | `PEP` |
| `/recall` | `RecallPage.tsx` | Gestão de recalls | `PEP` |
| `/teleodontologia` | `Teleodontologia.tsx` | Teleconsultas | `TELEODONTO` |
| `/historico-teleconsultas` | `HistoricoTeleconsultas.tsx` | Histórico | `TELEODONTO` |

### IA e Imagens
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/ia-radiografia` | `IARadiografia.tsx` | Análise de radiografias | `IA` |
| `/radiografia` | `RadiografiaPage.tsx` | Gestão de radiografias | `IA` |

---

## 3. FINANCEIRO & FISCAL

### Financeiro Core
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/financeiro` | `FinanceiroPage.tsx` | Dashboard financeiro | `FINANCEIRO` |
| `/financeiro/transacoes` | `Transacoes.tsx` | Todas as transações | `FINANCEIRO` |
| `/financeiro/contas-receber` | `ContasReceber.tsx` | Contas a receber | `FINANCEIRO` |
| `/financeiro/contas-pagar` | `ContasPagar.tsx` | Contas a pagar | `FINANCEIRO` |

### Criptomoedas ✨ V5.1
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/financeiro/crypto` | `CryptoPagamentos.tsx` | **Pagamentos em cripto** | `CRYPTO_PAYMENTS` |
| `/crypto-payment` | `CryptoPaymentPage.tsx` | Gateway de pagamento | `CRYPTO_PAYMENTS` |

### PDV e Vendas
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/pdv` | `PDV.tsx` | Ponto de Venda | `PDV` |
| `/pdv/metas` | `MetasGamificacao.tsx` | Metas e gamificação | `PDV` |
| `/financeiro/dashboard-vendas` | `DashboardVendasPDV.tsx` | Dashboard de vendas | `PDV` |

### Fiscal
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/financeiro/notas-fiscais` | `NotasFiscais.tsx` | NFe/NFCe | `FISCAL` |
| `/financeiro/conciliacao-bancaria` | `ConciliacaoBancaria.tsx` | Conciliação | `FISCAL` |
| `/tiss` | `TISSPage.tsx` | Faturamento TISS | `TISS` |

### Orçamentos
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/orcamentos` | `OrcamentosPage.tsx` | Gestão de orçamentos | `ORCAMENTOS` |

---

## 4. OPERAÇÕES

### Estoque
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/estoque` | `EstoquePage.tsx` | Gestão de estoque | `ESTOQUE` |
| `/estoque/inventario/historico` | `EstoqueInventarioHistorico.tsx` | Histórico de inventários | `ESTOQUE` |
| `/estoque/inventario/dashboard` | `EstoqueInventarioDashboard.tsx` | Dashboard executivo | `ESTOQUE` |

### Procedimentos e Equipe
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/procedimentos` | `Procedimentos.tsx` | Cadastro de procedimentos | N/A |
| `/templates-procedimentos` | `TemplatesProcedimentosPage.tsx` | Templates | N/A |
| `/dentistas` | `Dentistas.tsx` | Cadastro de dentistas | N/A |
| `/funcionarios` | `Funcionarios.tsx` | Cadastro de funcionários | N/A |

### Fluxo Digital
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/fluxo-digital` | `FluxoDigital.tsx` | Integração CAD/CAM | `FLUXO_DIGITAL` |

---

## 5. CAPTAÇÃO & FIDELIZAÇÃO

### CRM
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/crm` | `CRM.tsx` | Gestão de leads | `CRM` |
| `/crm-funil` | `CRMFunil.tsx` | Funil de vendas | `CRM` |

### Marketing
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/marketing-auto` | `MarketingAutoPage.tsx` | Automação de marketing | `MARKETING_AUTO` |
| `/marketing-automation` | `MarketingAuto.tsx` | Campanhas automáticas | `MARKETING_AUTO` |

### Comunicação
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/comunicacao` | `Comunicacao.tsx` | SMS/WhatsApp bidirecional | N/A |

### Fidelização
| Rota | Componente | Descrição | Módulo DB |
|------|-----------|-----------|-----------|
| `/fidelidade` | `ProgramaFidelidade.tsx` | Programa de fidelidade | N/A |
| `/inadimplencia` | `InadimplenciaPage.tsx` | Gestão de inadimplência | `INADIMPLENCIA` |
| `/cobranca` | `Cobranca.tsx` | Cobrança automatizada | `INADIMPLENCIA` |
| `/split-pagamento` | `SplitPagamentoPage.tsx` | Split de pagamentos | `SPLIT_PAGAMENTO` |

---

## 6. CONFIGURAÇÕES

### Administração
| Rota | Componente | Descrição | Acesso |
|------|-----------|-----------|--------|
| `/usuarios` | `Usuarios.tsx` | Gestão de usuários | ADMIN |
| `/configuracoes` | `Configuracoes.tsx` | Configurações gerais | ADMIN |
| `/configuracoes/modulos` | `ModulesPage.tsx` | Gestão de módulos | ADMIN |
| `/configuracoes/modulos-simple` | `ModulesSimple.tsx` | Interface simplificada | ADMIN |
| `/configuracoes/modulos-admin` | `ModulesAdmin.tsx` | Interface avançada | ADMIN |

### Segurança e Compliance
| Rota | Componente | Descrição | Acesso |
|------|-----------|-----------|--------|
| `/lgpd` | `LGPDCompliance.tsx` | Conformidade LGPD | ADMIN |
| `/audit-trail` | `AuditTrailViewer.tsx` | Trilha de auditoria | ADMIN |
| `/audit-logs` | `AuditLogs.tsx` | Logs de acesso | ADMIN |
| `/seguranca` | `Seguranca.tsx` | Configurações de segurança | ADMIN |
| `/assinatura-icp` | `AssinaturaICP.tsx` | Assinatura digital | N/A |

### Analytics e Relatórios
| Rota | Componente | Descrição | Acesso |
|------|-----------|-----------|--------|
| `/relatorios` | `Relatorios.tsx` | Relatórios gerenciais | ADMIN |
| `/report-templates` | `ReportTemplates.tsx` | Templates de relatórios | ADMIN |
| `/analise-comportamental` | `UserBehaviorAnalytics.tsx` | Analytics de usuário | ADMIN |
| `/onboarding-analytics` | `OnboardingAnalytics.tsx` | Analytics de onboarding | ADMIN |
| `/quick-chart` | `QuickChart.tsx` | Gráficos rápidos | N/A |

### Backups
| Rota | Componente | Descrição | Acesso |
|------|-----------|-----------|--------|
| `/configuracoes/backups` | `ScheduledBackupsManagement.tsx` | Agendamento de backups | ADMIN |
| `/configuracoes/backup-dashboard` | `BackupExecutivePage.tsx` | Dashboard executivo | ADMIN |

---

## Rotas Obsoletas (Removidas no V5.1)

| Rota | Status | Motivo |
|------|--------|--------|
| `/dashboard` | ❌ Removida | Duplicada com `/` |
| `/agenda-clinica` | ❌ Removida | Duplicada com `/agenda` |
| `/pacientes/:patientId` | ❌ Removida | Padronizada para `/pacientes/:id` |
| `/resumo` | ❌ Removida | Página órfã |
| `/contratos` | ❌ Removida | Página órfã |
| `/portal-paciente` | ❌ Removida | Página órfã |
| `/dashboards/clinica` | ❌ Removida | Consolidado no `/` (aba Clínico) |
| `/dashboards/financeiro` | ❌ Removida | Consolidado no `/` (aba Financeiro) |
| `/dashboards/comercial` | ❌ Removida | Consolidado no `/` (aba Comercial) |

---

## Convenções de Nomenclatura

### Padrões de URL
```
/[contexto]/[módulo]/[funcionalidade]
```

### Exemplos
- ✅ `/financeiro/crypto` (CORRETO)
- ❌ `/crypto-payments` (ERRADO - não segue hierarquia)

### Parâmetros de Rota
- **IDs de Entidade:** `:id` (ex: `/pacientes/:id`)
- **Tabs/Abas:** Query params (ex: `/pacientes/:id?tab=prontuario`)

---

## Integração com Sidebar

Cada rota está mapeada em `sidebar.config.ts` com:
- `moduleKey`: Chave do módulo no `module_catalog`
- `icon`: Ícone Lucide React
- `badge`: Contador dinâmico (opcional)

---

**Última Atualização:** V5.1 (2024)  
**Total de Rotas:** 73 protegidas + 4 públicas = **77 rotas**  
**Conformidade:** 100% alinhado com DDD e arquitetura modular
