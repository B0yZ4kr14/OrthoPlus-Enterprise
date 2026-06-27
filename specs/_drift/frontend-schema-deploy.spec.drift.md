# Drift Report: Frontend ↔ Schema ↔ Deploy
**Data:** 2026-06-26  
**Fonte:** Auditoria consolidada dos 8 relatórios read-only

## Registro de Drifts

| ID | Spec / Canon | Estado Canônico / Esperado | Estado Atual do Código | Drift | Severidade | Status |
|---|---|---|---|---|---|---|
| D001 | Security Constitution §4.1 | Secrets não devem estar no repo | `.env` presente na working tree | Arquivo de secrets exposto | CRITICAL | RESOLVED |
| D002 | Security Constitution §5.2 | Secrets de certificado criptografados | `fiscal_config.senha_certificado`, `csc_token`, `certificado_digital` em texto plano | Dados sensíveis sem criptografia | CRITICAL | RESOLVED |
| D003 | Security Constitution §6.1 | Refresh token em cookie HttpOnly | `AuthController.refreshToken` retorna `refreshToken` no JSON body | Token refresh exposto a XSS | CRITICAL | RESOLVED |
| D004 | Security Constitution §6.2 | `AUTH_ALLOW_MOCK` proibido em produção | Flag `AUTH_ALLOW_MOCK` pode ser ativada via env em qualquer ambiente | Bypass de autenticação possível | CRITICAL | RESOLVED |
| D005 | AGENTS.md — Frontend | Componentes novos em `modules/<feature>/` | `ModuleCard.tsx` existe em 6 arquivos distintos | Duplicação de componente | HIGH | RESOLVED |
| D006 | AGENTS.md — Frontend | Taxonomia de módulos única | Sidebar usa `CLÍNICA/FINANCEIRO/CRESCIMENTO`; catálogo usa `Atendimento Clínico/Gestão Financeira` | Divergência de categorias | HIGH | OPEN |
| D007 | AGENTS.md — Backend | Services orquestram, Repositories persistem | `ModulosControllerService.performToggle` muta `MODULE_CATALOG` em memória | Toggle de módulos não persiste | HIGH | RESOLVED |
| D008 | Architecture Constitution | Tabelas filhas devem ter `clinic_id` | `budget_items`, `budget_approvals`, `budget_versions`, `orcamento_itens`, `orcamento_pagamento`, `orcamento_visualizacoes` não possuem `clinic_id` | Quebra de isolamento por clínica | HIGH | RESOLVED |
| D009 | Architecture Constitution | `clinicId` deve vir de `clinicGuard` | `AuthController.register`, `database_admin` audit log, `crypto_config`, `notifications` aceitam `clinicId` do body | Possível override de clínica | HIGH | RESOLVED |
| D010 | AGENTS.md — Backend | `clinicGuard` obrigatório em routers protegidos | Existe controller legado `backend/src/controllers/moduleController.ts` e rota `/api/modules/*`; nova rota `/api/configuracoes/modulos/*` usa catálogo em memória | Dupla gestão de módulos inconsistente | HIGH | OPEN |
| D011 | specs/018-sidebar-collapsed-default | STATUS: “Sem Implementação” | `apps/web/src/stores/sidebarStore.ts`, `SidebarGroup.tsx` implementam colapso e persistência | Spec desatualizado | HIGH | RESOLVED |
| D012 | specs/020-spec-memory-hub | STATUS: “Sem Implementação” | `backend/src/modules/memory_hub/` completo | Spec desatualizado | HIGH | RESOLVED |
| D013 | specs/admin-tools | STATUS: “Sem Implementação” | `backend/src/modules/admin_tools/` completo | Spec desatualizado | HIGH | RESOLVED |
| D014 | specs/016-theme-premium-fix | STATUS: “Arquivado” | Refatorações de cores semânticas presentes no codebase | Spec desatualizado | MEDIUM | RESOLVED |
| D015 | specs/017-omk-governance-integration | STATUS: “Arquivado” | Artefatos GitNexus/SpecKit/OMK presentes | Spec desatualizado | MEDIUM | RESOLVED |
| D016 | .openspec/specs/tsiapp-deploy.spec | Service name `tsi-orthoplus-app`, network `tsi-network`, proxy Traefik | `docker-compose.yml` usa `orthoplus`, `orthoplus-network`, nginx | Desvio do deploy canônico | MEDIUM | OPEN |
| D017 | .openspec/specs/tsiapp-deploy.spec | Secrets via Infisical CE | `docker-compose.yml` injeta `DATABASE_URL`, `JWT_SECRET`, `REDIS_PASSWORD`, `GRAFANA_PASSWORD` direto do `.env` | Secrets não gerenciados pelo vault | MEDIUM | OPEN |
| D018 | AGENTS.md — Frontend | Novos componentes em `modules/<feature>/components/` | Componentes ainda criados em `src/components/*` (ex.: `src/components/ModuleCard.tsx`) | Uso de diretório legacy | MEDIUM | RESOLVED |
| D019 | backend AGENTS.md | Mock mode apenas para testes/dev | `authMiddleware.ts` e `AuthService.ts` implementam mock path produtivo | Mock de auth presente em código produtivo | HIGH | RESOLVED |
| D020 | Architecture Constitution | Controllers não acessam Prisma diretamente | `backend/src/controllers/moduleController.ts` acessa `prisma.clinic_modules` diretamente | Controller legado viola camada | MEDIUM | PENDING |
| D021 | backend AGENTS.md | `ApiError` para erros | `moduleController.ts` retorna JSON manual com status 401/200 sem padronização | Erros não padronizados | LOW | PENDING |
| D022 | SpecKit — Traceability | Cada spec reflete estado real do código | Múltiplos specs arquivados possuem implementação | Falta de matriz de rastreabilidade | MEDIUM | RESOLVED |
| D023 | AGENTS.md — TypeScript | Erros pré-existentes documentados | `agenda/api/agendaController.ts`, `crypto-pagamentos`, etc. mantêm mismatches conhecidos | Débito técnico documentado, não drift novo | LOW | MONITOR |

---

## Observações

- Os itens D011–D015 indicam que os arquivos `STATUS.md` foram gerados automaticamente sem verificação de implementação real.
- D016–D017 podem ser aceitos como exceção de desenvolvimento local, desde que documentados.
