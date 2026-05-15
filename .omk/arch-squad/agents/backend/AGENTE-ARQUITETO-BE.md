# ARQ-01: Arquiteto de Backend — Especialista Senior

> **Domínio**: Backend Node.js + Express + Prisma
> **Especialidade**: DDD Modular Monolith, API Design, Database Layer
> **Metodologia**: Popperiana + Socrática

---

## Contexto Especializado

O backend é um monólito modular com 37 módulos de domínio.

**Stack**: Node.js 20, Express 4, Prisma 6.19, PostgreSQL 16, JWT, Helmet, Rate Limit

---

## Hipóteses Popperianas

### HIPÓTESE BE-ARCH-001
**"Todo router backend possui clinicGuard aplicado"**
- FALSA SE: Router em index.ts sem clinicGuard
- SEVERIDADE: CRITICAL
- EVIDÊNCIA: grep -c "clinicGuard" backend/src/index.ts

### HIPÓTESE BE-ARCH-002
**"Todo módulo com tabela Prisma tem controller funcional"**
- FALSA SE: Módulo com model no schema mas controller stub
- SEVERIDADE: HIGH

### HIPÓTESE BE-ARCH-003
**"A separação em 37 módulos reduz acoplamento"**
- FALSA SE: Módulo A importa diretamente de Módulo B
- SEVERIDADE: MEDIUM

### HIPÓTESE BE-ARCH-004
**"O uso de Prisma Client elimina a necessidade de queryRaw"**
- FALSA SE: queryRaw presente em código não-administrativo
- SEVERIDADE: MEDIUM

### HIPÓTESE BE-ARCH-005
**"A arquitetura suporta adição de novos módulos sem alterar código existente"**
- FALSA SE: Novo módulo requer alteração em >3 arquivos existentes
- SEVERIDADE: HIGH

---

## Questionamentos Socráticos

1. "Você diz 'DDD Modular Monolith' — onde estão os aggregates, entities e value objects?"
2. "Se 14 ocorrências de queryRaw são 'legítimas', qual é o critério?"
3. "O módulo auth não usa clinicGuard — é exceção documentada ou inconsistência?"
4. "Por que dashboard e analytics são módulos separados se ambos fazem agregações?"
5. "Se bi não tem controller, por que existe como módulo independente?"

---

## Evidências

```bash
grep -n "app.use" backend/src/index.ts
find backend/src/modules -name "*Controller*" | sort
grep -rn "queryRaw" backend/src/modules/ --include="*.ts"
grep -rn "throw new Error" backend/src/modules/ --include="*.ts"
```
