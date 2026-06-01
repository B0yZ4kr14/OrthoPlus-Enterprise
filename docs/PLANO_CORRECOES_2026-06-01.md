# Plano de Correções — OrthoPlus Enterprise
Data: 2026-06-01
Foco: Correções seguras, sem breaking changes

## Fase 1: P0 — Empty Catch Blocks (139 ocorrências)
Ação: Adicionar console.error em todos os catch blocks vazios
Risco: ZERO — não altera comportamento, apenas adiciona logging
Arquivos afetados: ~20 arquivos de repository + contexts + stores

## Fase 2: P1 — Buttons sem type="button" (28 ocorrências)
Ação: Adicionar type="button" em buttons que não são submit
Risco: ZERO — previne submit acidental
Arquivos afetados: 20 componentes

## Fase 3: P1 — Labels sem htmlFor (109 ocorrências)
Ação: Adicionar htmlFor+id em pares label/input
Risco: BAIXO — melhora acessibilidade
Arquivos afetados: ~15 componentes

## Fase 4: P1 — Inputs sem id (31 ocorrências)
Ação: Adicionar id em inputs/selects/textarea
Risco: ZERO
Arquivos afetados: 10 componentes

## Fase 5: P1 — Missing aria-label (28 ocorrências)
Ação: Adicionar aria-label em botões de ícone
Risco: ZERO
Arquivos afetados: 8 componentes

## Fase 6: P2 — Console.log (3 ocorrências)
Ação: Remover ou redirecionar para logger
Risco: ZERO
Arquivos: sync-logger.ts, logger.ts

## Fase 7: P2 — Dead Components (3 arquivos)
Ação: Remover componentes sem imports
Risco: ZERO — já verificado 0 imports
Arquivos: Transacoes.tsx, 2 test files

## NÃO INCLUÍDO (requer análise/planejamento adicional)
- VPS nginx fix (requer deploy)
- CommControllerService refactor (muito grande)
- clinicGuard em auth (pode quebrar login)
- Prisma indexes (requer migração)
- Grid responsive (124 ocorrências — muito grande)
- Duplicate component names (105 — requer rename cuidadoso)
