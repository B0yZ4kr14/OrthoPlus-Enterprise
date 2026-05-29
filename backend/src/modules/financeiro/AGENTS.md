# AGENTS.md — backend/src/modules/financeiro/

> Módulo financeiro — o maior e mais complexo do backend. Não repete backend/AGENTS.md.
> **Atualizado:** 2026-05-24

---

## Estrutura

```
financeiro/
├── api/
│   ├── router.ts                  # Express router (clinicGuard aplicado)
│   ├── dbRouter.ts                # Router auxiliar para operações de DB
│   └── FinanceiroController.ts    # 1277 linhas — 38 métodos públicos
├── application/
│   └── commands/
│       └── CreateTransactionCommand.ts
├── domain/
│   ├── entities/
│   │   └── Transaction.ts
│   ├── events/
│   │   └── TransactionCreatedEvent.ts
│   └── repositories/
│       └── ITransactionRepository.ts
└── infrastructure/
    ├── FinanceiroBackupService.ts
    ├── FinanceiroDatabaseManager.ts
    └── repositories/
        └── TransactionRepositoryPostgres.ts
```

---

## Controller — Grupos de Métodos

`FinanceiroController` (1277 linhas) acessa Prisma diretamente — **exceção arquitetural conhecida**. Não expandir esse padrão.

| Grupo          | Métodos                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Transactions   | `listTransactions`, `getTransaction`, `createTransaction`, `updateTransaction`, `deleteTransaction`, `markTransactionAsPaid` |
| Categories     | `listCategories`, `getCategory`, `createCategory`, `updateCategory`, `deleteCategory`                                        |
| Cash Registers | `listCashRegisters`, `getCashRegister`, `createCashRegister`, `updateCashRegister`, `deleteCashRegister`                     |
| Movimentos     | `listMovimentos`, `getMovimento`, `createMovimento`, `updateMovimento`, `deleteMovimento`                                    |
| Incidentes     | `listIncidentes`, `getIncidente`, `createIncidente`, `updateIncidente`, `deleteIncidente`                                    |
| Contas Receber | `listContasReceber`, `createContaReceber`, `updateContaReceber`, `deleteContaReceber`                                        |
| Contas Pagar   | `listContasPagar`, `createContaPagar`, `updateContaPagar`, `deleteContaPagar`                                                |
| Notas Fiscais  | `listNotasFiscais`, `createNotaFiscal`, `updateNotaFiscal`, `deleteNotaFiscal`                                               |
| PDV / Extrato  | `listVendasPDV`, `listExtratos`, `updateExtrato`                                                                             |
| Reports        | `getResumo`, `getCashFlow`                                                                                                   |

---

## Regras ao Modificar

1. **Novos endpoints**: criar método em `FinanceiroController`, registrar rota em `router.ts` — **nunca** lógica inline na rota
2. **Validação de input**: usar `zod` (padrão já presente — ver `createTransactionSchema` como referência)
3. **Não expandir o controller**: se o grupo precisar de >3 novos métodos, extrair para `FinanceiroService` e injetar
4. **Relação faltante**: `contas_receber` não tem FK para `patients` no schema Prisma — não assumir que a relação existe; fazer join manual ou aguardar fix de schema
5. **`as any`**: 38 ocorrências existentes — **não adicionar novas**; tipar explicitamente qualquer código novo

---

## Domínio

- `Transaction` entity: encapsula criação de transação, validação de valor não-negativo
- `ITransactionRepository`: interface contrato; implementação concreta em `infrastructure/repositories/TransactionRepositoryPostgres.ts`
- `TransactionCreatedEvent`: evento de domínio (atualmente não publicado em event bus — registrar se implementar)
- `CreateTransactionCommand`: command object para criação (não usado pelo controller atual — path alternativo)

---

## Infrastructure

- `FinanceiroBackupService`: backup dedicado do schema financeiro — chamado por `categoryBackupScheduler`
- `FinanceiroDatabaseManager`: operações de manutenção de DB (vacuum, analyze, stats) — exposto via `dbRouter.ts`

---

## Pendências Conhecidas

- `contas_receber ↔ patients`: relação Prisma faltante (rastreado em root AGENTS.md)
- Controller acessa Prisma diretamente (bypass do `ITransactionRepository`) — inconsistência arquitetural
- Zero unit tests neste módulo — cobrir `FinanceiroService` antes de expandir
