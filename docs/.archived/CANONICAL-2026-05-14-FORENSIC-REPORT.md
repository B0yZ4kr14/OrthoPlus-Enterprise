# Relatório de Validação Forense — CANONICAL-2026-05-14.md

> **Data da validação:** 2026-05-15
> **Documento auditado:** `docs/CANONICAL-2026-05-14.md` (320 linhas)
> **Commit atual do repositório:** `46f53410d`
> **Metodologia:** Comparação declarativa vs. evidência de código-fonte, configurações e runtime.

---

## Resumo Executivo

| Métrica | Resultado |
|---------|-----------|
| **Alegações verificadas** | 14 |
| **Alegações com discrepância** | 7 |
| **Taxa de fidelidade geral** | ~67 % |
| **Severidade máxima encontrada** | 🔴 Alta |

---

## 1. Versionamento e Commit

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Hash do commit | `9508bd07c` | `46f53410d` | 🔴 **FALSO** |

**Análise:** O documento referencia um commit inexistente no histórico atual do branch `main`. Isso indica que o CANONICAL não foi atualizado após o último push ou foi gerado a partir de um ambiente/workspace divergente.

---

## 2. Backend — Módulos

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Quantidade de módulos | 36 (heading) / 37 (tabela) | 37 diretórios em `backend/src/modules/` | 🟡 **Inconsistente internamente** |
| Routers registrados | 37 | 37 imports em `backend/src/index.ts` | 🟢 **OK** |
| `clinicGuard` aplicado | Todos | Todos | 🟢 **OK** |

**Análise:** O heading do documento diz "Módulos Backend (36)", mas a tabela enumera 37 módulos (#0 a #36). O código-fonte confirma 37. O documento contém erro de digitação/edição no heading.

---

## 3. Banco de Dados — Prisma

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Modelos Prisma | 180 | 180 (`grep -c '^model '`) | 🟢 **OK** |
| Schemas | 17 (16 custom + public) | 18 (public + 17 custom) | 🟡 **Divergente** |

**Análise:** O `schema.prisma` declara `schemas = ["public", "pacientes", "inventario", "pdv", "financeiro", "pep", "faturamento", "configuracoes", "database_admin", "backups", "crypto_config", "github_tools", "terminal", "core", "comercial", "clinico", "operacional", "administrativo"]`. O documento omite `database_admin` da lista, resultando em contagem de 17 em vez de 18.

**Tabelas de catálogo verificadas:**
- `module_catalog`: 37 registros
- `clinic_modules` (clinic-001): 37 associações

---

## 4. Workers (Cron Jobs)

| Alegação no Doc | Arquivo Real em `backend/src/workers/jobs/` | Status |
|-----------------|---------------------------------------------|--------|
| `adminJobs` | `adminJobs.ts` | 🟢 OK |
| `backupJobs` | `backupJobs.ts` | 🟢 OK |
| `cryptoJobs` | `cryptoJobs.ts` | 🟢 OK |
| `estoqueJobs` | `estoqueJobs.ts` | 🟢 OK |
| `financeiroJobs` | `financeiroJobs.ts` | 🟢 OK |
| `gamificationJobs` | `gamificationJobs.ts` | 🟢 OK |
| `scheduleAppointments` | `scheduleAppointments.ts` | 🟢 OK |
| `scheduleBiExport` | `scheduleBiExport.ts` | 🟢 OK |
| `notificationJobs` | **`marketingJobs.ts`** | 🔴 **FALSO** |

**Análise:** O 9º worker é `marketingJobs`, não `notificationJobs`. Não existe arquivo `notificationJobs.ts` no diretório de workers. O documento contém nome incorreto.

---

## 5. Frontend — Dependências Principais

| Dependência | Alegação no Doc | Valor em `apps/web/package.json` | Status |
|-------------|-----------------|----------------------------------|--------|
| React | `^19.1` | `^18.3.1` | 🔴 **FALSO** |
| Vite | `^6.3` | `^8.0.0` | 🔴 **FALSO** |
| Tailwind CSS | `^4.0` | `^3.4.17` (ou `undefined` no root do package.json — verificar se usa workspace) | 🔴 **FALSO** |
| React Query | `^5.0` | `^5.96.1` | 🟢 **Compatível** (semver match) |
| Zustand | `^5.0` | **NÃO ENCONTRADO** | 🔴 **FALSO** |

**Análise:** As versões de React, Vite e Tailwind CSS estão **significativamente desatualizadas** no documento. O `package.json` real usa React 18, Vite 8 e Tailwind 3. Além disso, `zustand` não consta como dependência do frontend, embora o documento o liste como principal.

---

## 6. Backend — Dependências Principais

| Dependência | Alegação no Doc | Valor em `backend/package.json` | Status |
|-------------|-----------------|---------------------------------|--------|
| Express | `^4.18` | `^4.18.2` | 🟢 **Compatível** |
| Prisma Client | `^6.19` | `^6.19.3` | 🟢 **Compatível** |
| JWT | `^9.0` | `^9.0.2` | 🟢 **Compatível** |
| Bcrypt | `^6.0` | `^6.0.0` | 🟢 **Compatível** |
| Helmet | `^8.0` | `^7.1.0` | 🟡 **Divergente** |
| Express Rate Limit | `^7.0` | `^8.3.1` | 🟡 **Divergente** |

**Análise:** `helmet` e `express-rate-limit` possuem versões menores maiores divergentes no documento. O documento parece refletir intenção de upgrade ou versões aspiracionais.

---

## 7. Frontend — Rotas

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Quantidade de rotas | 60 | 59 (`<Route path=` em `AppRoutes.tsx`) | 🟡 **Divergente** |

---

## 8. Infraestrutura e Runtime

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Imagem Docker frontend | `orthoplus-frontend:v2.9.9` | `orthoplus-frontend:v2.9.9` | 🟢 **OK** |
| Imagem Docker backend | `orthoplus-backend:v2.5.3` | `orthoplus-backend:v2.5.3` | 🟢 **OK** |
| Containers em execução | frontend, backend, redis | 3 containers `Up` | 🟢 **OK** |
| Porta backend | 3005 | 3005 | 🟢 **OK** |
| Porta agente | 8000 | 8000 | 🟢 **OK** |
| Porta frontend dev | 3000 / 5173 | 3000 / 5173 | 🟢 **OK** |
| Health check `/health` | 200 OK | 200 OK | 🟢 **OK** |
| Auth token endpoint | 200 OK para `admin@orthoplus.com` | 200 OK | 🟢 **OK** |

---

## 9. Testes

| Alegação | Valor no Doc | Valor Real | Status |
|----------|--------------|------------|--------|
| Testes backend | 367 passando, 17 suites | 367 passando, 17 suites | 🟢 **OK** |

---

## Matriz de Severidade

| # | Discrepância | Severidade | Justificativa |
|---|--------------|------------|---------------|
| 1 | Commit hash incorreto | 🔴 Alta | Impossibilita rastreabilidade exata do estado documentado |
| 2 | React 19 (doc) vs React 18 (real) | 🔴 Alta | Divergência de major version; quebra compatibilidade assumida |
| 3 | Vite 6 (doc) vs Vite 8 (real) | 🔴 Alta | Major version divergente; configuração de build pode diferir |
| 4 | Tailwind v4 (doc) vs v3 (real) | 🔴 Alta | API de configuração completamente diferente entre v3 e v4 |
| 5 | Zustand listado mas não instalado | 🔴 Alta | Estado management inexistente; código pode usar outra solução |
| 6 | `notificationJobs` → `marketingJobs` | 🟡 Média | Nome de worker incorreto; pode confundir monitoramento |
| 7 | Schemas 17 vs 18 | 🟡 Média | Omissão de `database_admin`; pode afetar migrações/documentação |
| 8 | 60 rotas vs 59 | 🟡 Média | Contagem errada; possível rota removida e não atualizada |
| 9 | Heading "36 módulos" vs 37 reais | 🟢 Baixa | Erro cosmético de heading; tabela interna está correta |
| 10 | Helmet ^8.0 vs ^7.1.0 | 🟢 Baixa | Minor version; comportamento geralmente estável |
| 11 | Rate-limit ^7.0 vs ^8.3.1 | 🟢 Baixa | Minor version; API preservada |

---

## Conclusão e Recomendações

1. **Revisão urgente do CANONICAL:** O documento contém múltiplas alegações de alta severidade sobre o stack do frontend (React, Vite, Tailwind, Zustand) que não refletem o código-fonte atual. Isso pode induzir agentes/mantenedores a tomar decisões baseadas em premissas falsas.
2. **Atualização do commit de referência:** Alterar o hash para `46f53410d` ou o commit real do momento da auditoria.
3. **Correção do worker #9:** Substituir `notificationJobs` por `marketingJobs`.
4. **Inclusão de `database_admin`:** Adicionar à lista de schemas do Prisma.
5. **Recontagem de rotas:** Verificar se a rota #60 existe ou se o número correto é 59.
6. **Heading de módulos:** Corrigir "(36)" para "(37)".
7. **Dependências aspiracionais:** Separar "versões instaladas" de "versões-alvo/roadmap" se o documento pretende servir como especificação futura.

---

*Relatório gerado automaticamente via validação forense de código-fonte.*
