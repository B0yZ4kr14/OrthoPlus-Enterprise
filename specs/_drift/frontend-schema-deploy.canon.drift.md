# Canon Drift Plan: Frontend ↔ Schema ↔ Deploy
**Data:** 2026-06-26  
**Fonte:** Drifts registrados em `frontend-schema-deploy.spec.drift.md`

| ID | Fonte Canônica | Descrição do Drift | Resolução Proposta | Severidade | Status |
|---|---|---|---|---|---|
| C001 | Security Constitution §4.1 | `.env` na working tree | Remover arquivo, rotacionar secrets, atualizar `.gitignore` | CRITICAL | RESOLVED |
| C002 | Security Constitution §5.2 | Secrets de certificado em texto plano | Criptografar campos e migrar dados existentes | CRITICAL | RESOLVED |
| C003 | Security Constitution §6.1 | Refresh token no body JSON | Mover para cookie HttpOnly; remover do JSON | CRITICAL | RESOLVED |
| C004 | Security Constitution §6.2 | `AUTH_ALLOW_MOCK` ativável em produção | Remover flag ou garantir que nunca seja `true` em produção | CRITICAL | RESOLVED |
| C005 | AGENTS.md — Frontend | `ModuleCard` duplicado em 6 arquivos | Extrair componente único e substituir usos | HIGH | RESOLVED |
| C006 | AGENTS.md — Frontend | Taxonomia da sidebar diverge do catálogo de módulos | Decisão de UX: unificar ou documentar mapeamento | HIGH | PENDING |
| C007 | AGENTS.md — Backend | Toggle de módulos não persiste | Usar `clinic_modules` com `clinic_id`; remover mutação em memória | HIGH | RESOLVED |
| C008 | Architecture Constitution | Tabelas filhas sem `clinic_id` | Adicionar coluna + backfill + índices | HIGH | RESOLVED |
| C009 | Architecture Constitution | Controllers aceitam `clinicId` do body | Forçar `req.clinicId` do `clinicGuard`; ignorar body | HIGH | RESOLVED |
| C010 | AGENTS.md — Backend | Dupla gestão de módulos (`/api/modules` vs `/api/configuracoes/modulos`) | Escolher rota canônica e deprecar a outra | HIGH | PENDING |
| C011 | SpecKit / STATUS.md | Specs 018, 020, admin-tools, 016, 017 com status desatualizado | Atualizar `STATUS.md` e criar rastreabilidade | HIGH | RESOLVED |
| C012 | .openspec/specs/tsiapp-deploy.spec | `docker-compose.yml` diverge do deploy canônico | Documentar exceção local ou alinhar nomes/rede/proxy | MEDIUM | PENDING |
| C013 | .openspec/specs/tsiapp-deploy.spec | Compose injeta secrets direto do `.env` | Adotar Infisical CE local ou documentar exceção | MEDIUM | PENDING |
| C014 | AGENTS.md — Frontend | Novos componentes em diretório legacy | Mover para `modules/<feature>/components/` | MEDIUM | RESOLVED |
| C015 | backend AGENTS.md | Mock path em `authMiddleware`/`AuthService` | Remover caminhos de mock de código produtivo | HIGH | RESOLVED |
| C016 | Architecture Constitution | Controller legado `moduleController.ts` acessa Prisma diretamente | Refatorar para padrão router→controller→service→repository | MEDIUM | PENDING |
| C017 | backend AGENTS.md | Erros não padronizados em `moduleController.ts` | Adotar `ApiError` via `errorHandler` | LOW | RESOLVED |
| C018 | SpecKit — Traceability | Ausência de matriz specs ↔ código | Criar e manter matriz de rastreabilidade | MEDIUM | RESOLVED |
| C019 | AGENTS.md — TypeScript | Erros pré-existentes documentados | Manter como débito monitorado; não aumentar | LOW | MONITOR |

---

## Decisões Pendentes (PENDING)

1. **C006 — Taxonomia de módulos:** a fonte da verdade deve ser `modules.config.ts` ou `sidebar.config.ts`?
2. **C010 — Rota de módulos:** manter `/api/modules` legado ou promover `/api/configuracoes/modulos`?
3. **C012/C013 — OpenSpec local:** o `docker-compose.yml` deve espelhar o canônico ou permanecer como ambiente de dev simplificado?
