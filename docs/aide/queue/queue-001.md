# Queue — Batch 001

> Generated from roadmap + progress. Focus: Fase 4.1 (Memory Hub finalizacao) e inicio 4.2.
> Estimated duration: ~1 semana (~8-10 dias de trabalho).

---

### Item 001: Schema e Tabela de Indice Semantico no PostgreSQL

Criar a infraestrutura de banco de dados para o indice semantico do Memory Hub.
Inclui: migracao Prisma para tabela `SearchIndex` (ou similar) com campos para
`entityType`, `entityId`, `clinicId`, `title`, `content`, `tokens` (tsvector ou JSONB),
`module`, `updatedAt`. Garantir indices em `entityType`, `clinicId`, `updatedAt` e
indice full-text em `content`. Validar via `prisma migrate dev` e seed local.

**Teste local:** `pnpm prisma migrate dev` passa; tabela criada; seed insere 3 registros
que retornam em query raw de full-text search.

---

### Item 002: Servico Indexador Batch para Pacientes

Implementar servico backend que escaneia a tabela `Paciente` e popula o indice
semantico (Item 001). Campos indexados: `nome`, `cpf`, `email`, `telefone`,
`observacoes`. Suportar reindexacao completa (`force = true`) e indexacao
incremental (`updatedAt > lastIndexAt`). Endpoint interno ou script CLI para
disparar a indexacao.

**Teste local:** rodar o script/endpoint; verificar que N pacientes aparecem na
tabela `SearchIndex`; reindexacao incremental nao duplica registros.

---

### Item 003: Indexadores Batch para Agenda e PEP

Expandir o servico de indexacao (Item 002) para as entidades `Agendamento` e `Prontuario` (PEP).
- Agenda: indexar `titulo`, `descricao`, `paciente.nome`, `dentista.nome`, `status`
- PEP: indexar `diagnostico`, `prescricao`, `anamnese`, `paciente.nome`
Reutilizar a logica incremental do Item 002.

**Teste local:** seed de agendamentos e prontuarios; rodar indexador; confirmar
entradas no `SearchIndex` com `entityType` correto.

---

### Item 004: Endpoint REST /api/search com Paginacao Basica

Criar endpoint `GET /api/search?q={termo}&module={modulo}&page={n}&limit={n}`
no backend. Deve consultar a tabela `SearchIndex` usando full-text search
(PostgreSQL `websearch_to_tsquery` ou `to_tsvector`), filtrar por `clinicId`
(via clinicGuard) e `module` (opcional). Retornar paginacao com `total`, `page`,
`limit`, `results` (array com `entityType`, `entityId`, `title`, `snippet`, `score`).

**Teste local:** curl/Postman contra `localhost:3005/api/search?q=joao` retorna
resultados paginados com status 200.

---

### Item 005: Componente de Busca Global no Header (UI)

Implementar componente React no header do frontend (acessivel de qualquer tela).
Deve incluir: input com icone de busca, debounce de 300ms, dropdown de resultados
agrupados por modulo (Pacientes, Agenda, PEP, Financeiro), highlight do termo
buscado, navegacao por teclado (setas + Enter). Usar mock data inicialmente.

**Teste local:** rodar `pnpm dev`; componente visivel no header; digitar termo
exibe dropdown mockado; navegacao por teclado funciona.

---

### Item 006: Integracao Frontend-Backend do Componente de Busca

Conectar o componente de busca global (Item 005) ao endpoint `/api/search`
(Item 004). Substitui mock data por chamada real via `apiClient`. Adicionar
estados de loading, empty state e erro. Garantir que o dropdown fecha ao clicar
fora ou pressionar Escape. Cada resultado deve ser clicavel e navegar para a
entidade correspondente (`/pacientes/:id`, `/agenda/:id`, etc.).

**Teste local:** buscar termo real no header; dropdown exibe resultados do
backend; clicar em resultado navega para a pagina correta.

---

### Item 007: Event Bus para Reindexacao em Tempo Real (Pacientes)

Criar hook/event listener no backend que dispara reindexacao automatica quando
entidades de Paciente sao criadas, atualizadas ou removidas. Implementar via
middleware pos-Prisma (extension) ou evento customizado no repository pattern.
Garantir que a reindexacao seja assincrona (nao bloqueia a request HTTP).

**Teste local:** criar/editar/deletar paciente via API; verificar que `SearchIndex`
e atualizado em ate 5 segundos sem necessidade de rodar script batch.

---

### Item 008: Reindexacao em Tempo Real para Agenda, PEP e Financeiro

Expandir o event bus (Item 007) para cobrir `Agendamento`, `Prontuario` e
entidades financeiras (`Lancamento`, `Orcamento`). Cada evento de mutacao
deve disparar reindexacao assincrona da entidade afetada. Garantir que
atualizacoes em cascata (ex: mudanca de nome do paciente) propaguem para
os indices dependentes.

**Teste local:** criar/editar agendamento, prontuario e lancamento; confirmar
atualizacao do indice para cada tipo; mudar nome de paciente e verificar que
indices relacionados (agenda, PEP) sao atualizados.

---

### Item 009: Script de Auditoria de Tipos Duplicados Frontend/Backend

Criar script Node.js (ou usar `ts-morph`) que escaneia `apps/web/src/` e
`backend/src/` em busca de definicoes de tipo/interface/DTO duplicadas
(mesmo nome, estrutura similar). Gerar relatorio `docs/aide/auditoria-tipos.md`
com lista de duplicatas encontradas, localizacao dos arquivos e sugestao de
qual versao manter (preferir a mais completa). Ignorar tipos autogenerados
(`database.ts`) e tipos de bibliotecas de terceiros.

**Teste local:** rodar `node scripts/auditar-tipos.js`; relatorio gerado com
lista nao vazia de duplicatas candidatas a migracao.

---

### Item 010: Migracao dos DTOs Core (Auth, Pacientes, Agenda) para shared-types

Mover as definicoes de tipo dos modulos Auth, Pacientes e Agenda do frontend
e backend para `shared-types/src/`. Atualizar todos os imports em `apps/web/src/`
e `backend/src/` para consumir de `@orthoplus/shared-types`. Garantir que
`cd shared-types && pnpm build` gera os `.d.ts` sem erros e que ambos os workspaces
(frontend e backend) compilam (`pnpm type-check` no frontend, `pnpm build` no backend)
sem regressoes.

**Teste local:** `shared-types` builda; frontend type-check passa; backend build
passa; funcionalidades de auth, pacientes e agenda continuam operacionais.
