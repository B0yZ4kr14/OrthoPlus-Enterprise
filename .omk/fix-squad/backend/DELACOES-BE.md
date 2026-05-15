# DELACOES-BE.md
# Delacoes Recebidas do Esquadrao Forense — Backend

## BE-001: queryRaw existe em backend/src
- Hipotese falsificada: "Nao ha queryRaw em backend/src/"
- Severidade: HIGH
- Acao: Atualizar AGENTS.md para refletir realidade OU migrar para Prisma Client

## BE-002: TS6133 em 5 routers
- Hipotese falsificada: "Nenhum erro TypeScript"
- Severidade: LOW
- Arquivos: lgpd, pep, split_pagamento, terminal, tiss routers
- Acao: Renomear req -> _req nos 5 arquivos
