# Auditoria Frontend + Schema Multi-Category no Deploy TSI

> **Tipo:** Spec de auditoria / drift  
> **Origem:** Brainstorming aprovado em 2026-06-26  
> **Escopo:** Frontend (módulos, sidebar, categorias, cards), schema PostgreSQL multi-category e ambiente deployado em `/opt/tsi-stack/apps/orthoplus-enterprise`  
> **Integração:** SpecKit drift (`spec.drift.md`, `tasks.drift.md`, `canon.drift.md`)

---

## 1. Goal

Auditar o estado real do frontend e do schema de banco de dados do OrthoPlus Enterprise no ambiente deployado, identificar violações arquiteturais e divergências em relação às specs/documentações existentes, e sincronizar os achados via SpecKit drift para que specs e tasks reflitam a realidade do código e do deploy.

---

## 2. Contexto

O projeto OrthoPlus Enterprise é um monorepo full-stack (React + Vite frontend, Node.js + Express + Prisma backend, Python agent-service) com forte governança documentada em:

- `.specify/memory/constitution.md`
- `.specify/memory/architecture_constitution.md`
- `.specify/memory/security_constitution.md`
- `backend/AGENTS.md`
- `AGENTS.md` (root)

Existem dezenas de specs em `specs/` cobrindo funcionalidades do sistema. O deploy canônico ocorre em `/opt/tsi-stack/apps/orthoplus-enterprise/`. O usuário solicitou leitura de **todas as specs existentes sem exceção** durante a auditoria.

---

## 3. Escopo da Auditoria

### 3.1 Frontend
- `apps/web/src/modules/` — estrutura física e organização dos módulos
- Sidebar lateral recolhível — componente, estado, responsividade, acessibilidade
- Categorias dos módulos — definição e consumo no frontend
- Cards — componentes de card, consistência com design system (`@orthoplus/core-ui`)
- Rotas (`apps/web/src/routes/AppRoutes.tsx`) e lazy loading
- Adesão às regras frontend da constituição (FE-1 a FE-7)

### 3.2 Schema Multi-Category
- `backend/prisma/schema.prisma` — definição das 6 categories (CORE, FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO)
- Mapeamento de tabelas/enums para categories
- Relacionamentos cross-schema
- Isolamento por `clinicId` (GP-1)
- Alinhamento entre schema e módulos backend

### 3.3 Ambiente Deployado
- `/opt/tsi-stack/apps/orthoplus-enterprise/docker-compose.yml`
- Estrutura de diretórios (`config`, `logs`, `backups`, `uploads`, `.openspec`)
- Configurações públicas (sem ler `.secrets` ou `.env` desprotegidos)
- Logs recentes e backups
- Divergências entre repo e ambiente deployado

### 3.4 Specs e Documentações
- Ler e correlacionar **todas** as specs em `specs/`, `.openspec/specs/`, `openspec/specs/`
- Ler documentos de governança relevantes
- Ler `_reversa_sdd/` para contexto legado
- Mapear gaps entre specs e implementação

---

## 4. Estratégia

Usar **AgentSwarm** para executar a análise em paralelo, com subagentes especializados. Cada subagente produz um relatório parcial estruturado. Ao final, um subagente consolidador unifica os achados e gera os artefatos de drift.

### 4.1 Subagentes

| Subagente | Tipo | Responsabilidade |
|---|---|---|
| **A — Frontend Audit** | explore | Analisar `apps/web/src/modules/`, sidebar, cards, categorias, rotas e design system. |
| **B — Schema/Category Audit** | explore | Analisar `backend/prisma/schema.prisma`, mapeamento de categories, clinicId isolation. |
| **C — Deploy Environment Audit** | explore | Analisar `/opt/tsi-stack/apps/orthoplus-enterprise/` (docker-compose, estrutura, logs públicos). |
| **D — Specs Reader** | explore | Ler todas as specs existentes (`specs/`, `.openspec/specs/`, `openspec/specs/`) e documentos de governança. |
| **E — Cross-Reference & Drift** | plan | Cruzar achados de A, B, C, D; mapear gaps; propor atualizações de specs/tasks. |

### 4.2 Fluxo

1. Disparar A, B, C, D em paralelo via AgentSwarm.
2. Aguardar entregas parciais.
3. Disparar E com os 4 relatórios como entrada.
4. E gera:
   - `docs/superpowers/auditoria-2026-06-26-findings.md`
   - `specs/_drift/frontend-schema-deploy.spec.drift.md`
   - `specs/_drift/frontend-schema-deploy.tasks.drift.md`
   - Recomendações de atualização de specs existentes.

### 4.3 Ferramentas

- `AgentSwarm` para paralelização
- `Read`, `Glob`, `Grep`, `Bash` para exploração
- `speckit-canon-drift-detect` / `speckit-canon-drift-reverse` / `speckit-canon-drift-reconcile` para sincronização

---

## 5. Entregáveis

1. **Relatório consolidado de findings** (`docs/superpowers/auditoria-2026-06-26-findings.md`) com severidade (CRITICAL, HIGH, MEDIUM, LOW).
2. **Artefatos de drift**:
   - `specs/_drift/frontend-schema-deploy.spec.drift.md`
   - `specs/_drift/frontend-schema-deploy.tasks.drift.md`
3. **Lista de specs a atualizar** com justificativa.
4. **Plano de remediação priorizado** (será gerado pelo skill `writing-plans` após aprovação deste spec).

---

## 6. Restrições e Cuidados

- **Não ler arquivos de secrets** (`.env`, `.secrets`) do deploy sem permissão explícita.
- **Não modificar código ou configs do ambiente deployado** — apenas leitura.
- **Não sobrescrever specs originais** diretamente; gerar drift e propor atualizações.
- **Respeitar AGENTS.md e constituição**: se findings indicarem violações, documentar como débito/tarefa.

---

## 7. Riscos

- **Volume massivo de specs** pode exceder context window ou tempo. Mitigação: dividir specs entre múltiplos subagentes por tema.
- **Divergências profundas** entre código e specs podem gerar muitos drift items. Mitigação: priorizar por severidade e impacto.
- **Acesso ao deploy** pode estar limitado. Mitigação: validar permissões antes de ler arquivos sensíveis.

---

## 8. Próximos Passos

1. Aprovar este spec.
2. Executar AgentSwarm de análise.
3. Consolidar findings e drift.
4. Invocar `writing-plans` para gerar plano de remediação.
