# LEGACY.md — Código Legado para Remoção Futura

> Este documento lista código que não é utilizado em produção mas ainda possui
> dependências em testes ou está mantido temporariamente por compatibilidade.
> Remover apenas após atualizar ou remover os testes dependentes.

## Itens Legados

### 1. PDV Commands (CQRS não integrados)

**Arquivos:**
- `src/modules/pdv/application/commands/CreateVendaCommand.ts`
- `src/modules/pdv/application/commands/ConcluirVendaCommand.ts`

**Motivo:** Command handlers `CreateVendaCommandHandler` e `ConcluirVendaCommandHandler`
nunca são instanciados em código de produção (routers/controllers não os importam).
No entanto, ambos possuem testes unitários em `tests/unit/pdvCommands.test.ts`.

**Ação futura:** Migrar os testes para os handlers atuais usados no controller ou
remover os handlers e seus testes quando o módulo PDV for refatorado.

---

## Código Morto Removido (2026-06-01)

Os seguintes arquivos/exportações foram removidos após confirmação de 0 chamadores
em toda a base do backend (produção + testes):

### Batch 1 — 15 arquivos
1. `src/infrastructure/database/CategoryDatabaseManager.ts`
2. `src/modules/pacientes/application/commands/ChangePatientStatusCommand.ts`
3. `src/modules/pacientes/application/commands/CreatePatientCommand.ts`
4. `src/modules/pacientes/application/commands/UpdatePatientCommand.ts`
5. `src/modules/pacientes/application/queries/GetPatientStatsQuery.ts`
6. `src/modules/pacientes/application/queries/ListPatientsQuery.ts`
7. `src/modules/pdv/application/queries/GetVendaQuery.ts`
8. `src/modules/pdv/application/queries/GetVendasPorCaixaQuery.ts`
9. `src/modules/pdv/application/queries/ListVendasQuery.ts`
10. `src/modules/inventario/application/queries/GetProdutoQuery.ts`
11. `src/modules/inventario/application/queries/ListProdutosQuery.ts`
12. `src/modules/inventario/domain/events/ProdutoCriadoEvent.ts`
13. `src/modules/contratos/domain/repositories/IContratoRepository.ts`
14. `src/modules/configuracoes/domain/repositories/IModuloRepository.ts`
15. `src/modules/pacientes/index.ts` (barrel file morto)

### Batch 2 — 6 arquivos + 1 edição
16. `src/modules/agents/index.ts` (barrel file morto)
17. `src/modules/configuracoes/application/dto/ModuloDTO.ts` (placeholder)
18. `src/modules/contratos/application/dto/ContratoDTO.ts` (placeholder)
19. `src/modules/inventario/application/commands/CreateProdutoCommand.ts` (placeholder)
20. `src/modules/inventario/application/commands/UpdateEstoqueCommand.ts` (placeholder)
21. `src/modules/inventario/application/queries/GetEstoqueBaixoQuery.ts` (placeholder)
22. `src/workers/jobs/memoryHubDrift.ts` — removida função `stopMemoryHubDrift` e
    variáveis `driftTimeout`/`driftInterval` não utilizadas
