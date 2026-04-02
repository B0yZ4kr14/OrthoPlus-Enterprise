# Índice de Módulos Backend

## Estrutura

Cada módulo segue a arquitetura em camadas:

```
modules/
├── [modulo]/
│   ├── api/              # Controllers e Routes
│   ├── application/      # Services, Commands, Queries
│   ├── domain/           # Entities, Repositories (interfaces)
│   └── infrastructure/   # Repositories (impl), Persistence
```

## Módulos (34 total)

### Core
- auth - Autenticação e autorização
- usuarios - Gerenciamento de usuários
- configuracoes - Configurações do sistema

### Clínica
- pacientes - Cadastro de pacientes
- dentistas - Cadastro de dentistas
- funcionarios - Funcionários da clínica
- procedimentos - Procedimentos odontológicos

### Agenda
- agenda - Agendamentos e consultas
- pep - Prontuário Eletrônico do Paciente

### Financeiro
- financeiro - Gestão financeira
- faturamento - Faturamento e NF
- contas_receber - Contas a receber
- contas_pagar - Contas a pagar
- pdv - Ponto de venda
- crypto_config - Configurações de cripto

### CRM & Marketing
- crm - Gestão de relacionamento
- marketing - Campanhas de marketing
- fidelidade - Programa de fidelidade

### Estoque
- inventario - Controle de estoque
- estoque - Gestão de estoque

### Relatórios
- bi - Business Intelligence
- analytics - Análises e relatórios
- relatorios - Relatórios diversos

### Compliance
- lgpd - LGPD e privacidade
- backups - Gestão de backups
- audit - Auditoria e logs

### Integrações
- tiss - Integração TISS
- comm - Comunicações
- files - Arquivos e documentos

### Outros
- admin_tools - Ferramentas administrativas
- contratos - Gestão de contratos
- notifications - Notificações
- orcamentos - Orçamentos
- terminal - Terminal PDV
