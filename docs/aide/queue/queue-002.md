# Queue-002 — Otimizacoes e Correcoes Pos-Implementacao

**Data:** 2026-05-26  
**Prioridade:** Alta/Média  
**Status:** Em andamento

---

## Itens

| # | Item | Prioridade | Status |
|---|------|------------|--------|
| 011 | Testes unitarios para indexers e event handlers | Alta | Pendente |
| 012 | Cache Redis no endpoint /api/search | Media | Pendente |
| 013 | Diagnosticar drift schema producao vs Prisma | Alta | Pendente |
| 014 | Highlight de termos buscados nos snippets | Baixa | Pendente |
| 015 | Rate limiting adaptativo por clinic_id | Media | Pendente |

## Dependencias

- 011 independente
- 012 depende de 004 (endpoint pronto)
- 013 independente (apenas diagnostico)
- 014 independente
- 015 depende de 004
