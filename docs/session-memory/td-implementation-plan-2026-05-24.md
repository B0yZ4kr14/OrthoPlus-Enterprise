# Plano de Implementação — Tech Debt Tasks (Agenda + Pacientes)

**Gerado**: 2026-05-24
**Origem**: `/speckit.cleanup` + `/speckit.analyze` remediation
**Escopo**: TD001–TD003 (Agenda) + TD001–TD002 (Pacientes)
**Prioridade**: Antes da próxima feature iteration
**Estimativa**: 2–3 horas

---

## TD Agenda

### TD001 — `appointmentCreateSchema` usa `status: z.string()` em vez de `appointment_type: z.enum([...])`

**Arquivos**: `backend/src/modules/agenda/api/agendaController.ts`
**Complexidade**: Baixa
**Passos**:
1. Adicionar campo `appointment_type: z.enum(["CONSULTA", "RETORNO", "EMERGENCIA", "AVALIACAO", "PROCEDIMENTO"])` ao `appointmentCreateSchema`
2. Remover `status: z.string()` do schema de criação (status é derivado, não input)
3. Atualizar `createAppointment` handler para usar `parsed.data.appointment_type` em vez de `parsed.data.status as AppointmentType`
4. Verificar se frontend envia `appointment_type` no body (se não, adicionar)
5. Rodar `cd backend && pnpm build` para validar

### TD002 — Respostas 500 não usam RFC 7807 Problem Details

**Arquivos**: `backend/src/modules/agenda/api/agendaController.ts`, `backend/src/middleware/errorHandler.ts`
**Complexidade**: Média
**Passos**:
1. Identificar todos os `res.status(500).json({ error: "Internal server error" })` no controller
2. Substituir por `throw new ApiError(...)` ou `next(error)` para delegar ao `errorHandler`
3. Verificar se `errorHandler` já retorna RFC 7807 (`application/problem+json`)
4. Se não, atualizar `errorHandler` para formato Problem Details
5. Rodar testes do controller para garantir que respostas de erro ainda são válidas

### TD003 — `throw new Error("...")` em vez de erros de domínio tipados

**Arquivos**: `apps/web/src/modules/agenda/application/useCases/CreateAppointmentUseCase.ts`
**Complexidade**: Baixa
**Passos**:
1. Criar classes de erro de domínio: `BlockedTimeError`, `SchedulingConflictError` estendendo `Error`
2. Substituir `throw new Error("Horário bloqueado...")` por `throw new BlockedTimeError(...)`
3. Substituir `throw new Error("Já existe um agendamento...")` por `throw new SchedulingConflictError(...)`
4. Exportar os novos tipos de erro
5. Rodar `pnpm type-check` (frontend) para validar

---

## TD Pacientes

### TD001 — `PatientEntity.ts` é apenas um alias de tipo

**Arquivos**: `apps/web/src/modules/pacientes/domain/entities/PatientEntity.ts`
**Complexidade**: Média
**Opções**:
- **Opção A**: Transformar em entidade de domínio real com validação (CPF, email), métodos factory, regras de transição de status
- **Opção B**: Remover o arquivo e usar `Patient` do `@/types/patient` diretamente (se a validação já está no backend)

**Recomendação**: Opção B — o backend já possui `Patient` entity completa com validação. O frontend pode usar o tipo global. Se for necessária lógica de domínio no frontend no futuro, criar entidade real.

**Passos (Opção B)**:
1. Remover `PatientEntity.ts`
2. Atualizar todos os imports de `PatientEntity` para `Patient` de `@/types/patient`
3. Verificar se `usePatientsClean.ts` ou outros arquivos usam `PatientEntity`
4. Rodar `pnpm type-check` para validar

### TD002 — Import inline de tipo em `PatientRepositoryApi.ts`

**Arquivos**: `apps/web/src/modules/pacientes/infrastructure/repositories/PatientRepositoryApi.ts`
**Complexidade**: Baixa
**Passos**:
1. Substituir `import("@/lib/adapters/patientAdapter").PatientAPI` por `PatientAPI` já importado no topo
2. Verificar se há outros imports inline no arquivo
3. Rodar `pnpm type-check` para validar

---

## Ordem de Execução Recomendada

1. **TD Pacientes 002** — Import inline (mais rápido, baixo risco)
2. **TD Pacientes 001** — PatientEntity (decisão arquitetural simples)
3. **TD Agenda 003** — Domain errors (frontend only, testes rápidos)
4. **TD Agenda 001** — Schema Zod (backend, requer validação frontend+backend)
5. **TD Agenda 002** — RFC 7807 (backend, maior impacto, testar errorHandler)

---

## Gates de Qualidade

- [ ] `cd backend && pnpm build` passa
- [ ] `cd apps/web && pnpm type-check` passa
- [ ] `pnpm lint` passa
- [ ] `cd backend && pnpm test` passa (625/625)
- [ ] Nenhum novo `@ts-expect-error` ou `as any` adicionado (CQ-2)

---

## Notas

- TD002 da agenda (RFC 7807) pode ser feito de forma incremental: primeiro propagar erros para `next(error)`, depois refinar o formato no `errorHandler`
- Se o frontend ainda envia `status` em vez de `appointment_type` para criar agendamento, TD001 da agenda requer mudança coordenada frontend+backend
