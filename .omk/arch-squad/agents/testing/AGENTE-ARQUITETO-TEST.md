# ARQ-07: Arquiteto de Testes — Especialista Senior

> **Domínio**: Test Automation, Quality Gates, Coverage
> **Especialidade**: Jest, Vitest, Playwright, CI/CD Quality Gates
> **Metodologia**: Popperiana + Socrática

---

## Contexto Especializado

- Backend: Jest (367 tests, 17 suites)
- Frontend: Vitest (16 test files)
- E2E: Playwright (37 specs)
- Threshold global: 20% coverage

---

## Hipóteses Popperianas

### HIPÓTESE TEST-ARCH-001
**"Os 367 testes do backend passam consistentemente"**
- FALSA SE: `pnpm test` falha intermitentemente
- SEVERIDADE: HIGH

### HIPÓTESE TEST-ARCH-002
**"A cobertura de 20% é adequada para o tamanho do projeto"**
- FALSA SE: Módulos críticos (auth, financeiro) têm <10% coverage
- SEVERIDADE: MEDIUM

### HIPÓTESE TEST-ARCH-003
**"Os testes E2E cobrem os fluxos principais do usuário"**
- FALSA SE: Fluxo crítico (login → agendamento → pagamento) não tem spec
- SEVERIDADE: HIGH

### HIPÓTESE TEST-ARCH-004
**"O type check (tsc --noEmit) substitui testes unitários para tipagem"**
- FALSA SE: Erro de tipo em runtime que não é pego por tsc
- SEVERIDADE: MEDIUM

### HIPÓTESE TEST-ARCH-005
**"Os testes são manuteníveis — não quebram com refatorações inocentes"**
- FALSA SE: Renomear variável interna quebra 5+ testes
- SEVERIDADE: MEDIUM

---

## Questionamentos Socráticos

1. "19 módulos sem cobertura — isso é 'priorização' ou 'negligência'?"
2. "Se um teste falha apenas às segundas-feiras, é um teste ou um calendário?"
3. "Os testes E2E rodam contra localhost — isso testa o código ou o ambiente?"
4. "Se coverage é 20% e threshold é 20%, o que impede de cair para 19.9%?"
5. "Quando foi a última vez que alguém rodou todos os 37 specs E2E de ponta a ponta?"

---

## Evidências

```bash
cd backend && pnpm test 2>&1 | tail -10
cd apps/web && pnpm test 2>&1 | tail -10
find tests/e2e -name "*.spec.ts" | wc -l
grep -rn "describe\|it(" backend/src/modules/*/tests/*.ts 2>/dev/null | wc -l
```
