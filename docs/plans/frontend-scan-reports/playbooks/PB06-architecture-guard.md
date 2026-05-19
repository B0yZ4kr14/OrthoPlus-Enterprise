# Playbook PB06: Architecture Guard Scan

## Objetivo
Detectar violacoes arquiteturais no frontend usando principios framework-agnostic.

## Skills
- `speckit-architecture-guard-violation-detection`
- `gitnexus-exploring`

---

## Categorias de Violacao

### A. Intent & Alignment
| Violacao | Descricao | Severidade |
|----------|-----------|------------|
| Intent Divergence | Implementacao desvia do spec/plan | High |
| Hallucinated Abstractions | Abstracao mencionada no plano ausente no codigo | High |
| Spec-Code Mismatch | FR implementada na camada errada | Medium |

### B. Boundaries & Layering
| Violacao | Descricao | Severidade |
|----------|-----------|------------|
| Boundary Erosion | Logica de negocio vazando para UI | High |
| Isolation Breach | Acesso a dados bypassando abstracao | High |
| Separation of Concerns | Infraestrutura poluindo dominio | Medium |

### C. Contracts & Consistency
| Violacao | Descricao | Severidade |
|----------|-----------|------------|
| Missing Contracts | DTOs/schemas ausentes | Medium |
| Contract Mismatch | Shapes diferentes entre camadas | High |
| Response Drift | Erro/sucesso inconsistentes | Medium |

### D. Coupling & Dependencies
| Violacao | Descricao | Severidade |
|----------|-----------|------------|
| Tight Coupling | Dependencia circular | High |
| Hidden Coordination | Utilitario implicito para regras de negocio | Medium |

### E. Constitution & Security
| Violacao | Descricao | Severidade |
|----------|-----------|------------|
| Constitution Breach | Conflito com MUST da constituicao | Critical |
| Security Conflict | Decisao contradiz security-constraints | Critical |

---

## Scan Procedure

### Passo 1: Mapear Boundaries

```bash
# Mapear camadas esperadas
CAMADAS=("domain" "application" "infrastructure" "ui")

# Para cada modulo
for MODULO in apps/web/src/modules/*; do
  echo "=== $MODULO ==="
  for CAMADA in "${CAMADAS[@]}"; do
    if [ -d "$MODULO/$CAMADA" ]; then
      echo "  ✓ $CAMADA existe"
    else
      echo "  ✗ $CAMADA AUSENTE"
    fi
  done
done
```

### Passo 2: Detectar Boundary Erosion

```bash
# UI chamando API diretamente (deve passar por application/infrastructure)
grep -rn "fetch(\|axios(" apps/web/src/modules/*/ui/ --include="*.tsx"

# UI com logica de negocio (deve estar em application)
grep -rn "calculate\|compute\|validate\|format" \
  apps/web/src/modules/*/ui/ --include="*.tsx" | head -20

# Domain importando UI (proibido)
grep -rn "from.*ui/" apps/web/src/modules/*/domain/ --include="*.ts"
```

### Passo 3: Detectar Tight Coupling

```bash
# Usar madge
npx madge --circular --extensions ts,tsx apps/web/src/modules/

# Detectar imports entre modulos nao relacionados
grep -rn "from.*modules/" apps/web/src/modules/*/ --include="*.tsx" | \
  grep -v "from.*modules/$(basename $MODULO)"
```

### Passo 4: Detectar Contract Mismatch

```bash
# Comparar DTOs frontend com backend
# Exemplo: verificar se tipos de API batem

# Encontrar tipos definidos manualmente (devem vir de shared-types)
grep -rn "interface.*Response\|type.*Response" \
  apps/web/src/modules/*/ --include="*.ts" --include="*.tsx"

# Verificar se usam shared-types
grep -rn "@orthoplus/shared-types" apps/web/src/modules/*/ --include="*.tsx"
```

### Passo 5: Detectar Constitution Breaches

```bash
# Ler constituicao
# Verificar cada MUST

# Exemplo: "MUST: Nunca usar var"
grep -rn "^var " apps/web/src/ --include="*.ts" --include="*.tsx"

# Exemplo: "MUST: Sempre usar async/await"
grep -rn "\.then(" apps/web/src/ --include="*.ts" --include="*.tsx" | head -20

# Exemplo: "MUST: Nunca commitar credenciais"
grep -rn "password.*=\|token.*=\|secret.*=" \
  apps/web/src/ --include="*.ts" --include="*.tsx" | head -20
```

---

## Template de Relatorio

```markdown
# Architecture Guard Report

## Modulo: [Nome]

### Boundaries
| Camada | Status | Arquivos |
|--------|--------|----------|
| domain | ✓/✗ | N |
| application | ✓/✗ | N |
| infrastructure | ✓/✗ | N |
| ui | ✓/✗ | N |

### Violacoes

#### [Categoria]: [Titulo]
- **Severidade**: Critical/High/Medium/Low
- **Location**: `arquivo.tsx:42`
- **Descricao**: [O que foi encontrado]
- **Evidence**: [Trecho de codigo]
- **Principle**: [Qual principio foi violado]
- **Fix Sugerido**: [Como corrigir]
- **Esforco**: S/M/L/XL

### Dependencias
```mermaid
graph LR
  A[modulo-a] --> B[modulo-b]
  B --> C[modulo-c]
  C --> A[modulo-a]  %% CIRCULAR!
```

### Recomendacoes
1. [Recomendacao 1]
2. [Recomendacao 2]
```

---

## Exemplo: Boundary Erosion

### Violacao
**Categoria**: B. Boundaries & Layering
**Severidade**: High
**Location**: `modules/financeiro/ui/ConciliacaoBancaria.tsx:145`

**Evidence**:
```tsx
// UI nao deve calcular saldo
const saldo = transacoes.reduce((acc, t) => {
  if (t.tipo === 'CREDITO') return acc + t.valor
  if (t.tipo === 'DEBITO') return acc - t.valor
  return acc
}, 0)
```

**Principle**: "Business logic must be in application layer, not UI"

**Fix Sugerido**:
```tsx
// application/use-cases/calcularSaldo.ts
export function calcularSaldo(transacoes: Transacao[]): number {
  return transacoes.reduce((acc, t) => {
    if (t.tipo === 'CREDITO') return acc + t.valor
    if (t.tipo === 'DEBITO') return acc - t.valor
    return acc
  }, 0)
}

// ui/ConciliacaoBancaria.tsx
const { data: saldo } = useQuery({
  queryKey: ['saldo', contaId],
  queryFn: () => calcularSaldo(transacoes)
})
```

---

## Exemplo: Circular Dependency

### Violacao
**Categoria**: D. Coupling & Dependencies
**Severidade**: High
**Location**: `modules/agenda` <-> `modules/pacientes`

**Evidence**:
```
modules/agenda/ui/AgendaPage.tsx:3
  import { PacienteCard } from '@/modules/pacientes/ui/PacienteCard'

modules/pacientes/ui/PacientePage.tsx:5
  import { AgendaMini } from '@/modules/agenda/ui/AgendaMini'
```

**Fix Sugerido**:
1. Extrair `PacienteCard` para `components/shared/`
2. Extrair `AgendaMini` para `components/shared/`
3. Ambos os modulos importam do shared

---

## Ferramentas

| Ferramenta | Uso | Comando |
|-----------|-----|---------|
| madge | Detectar circular deps | `npx madge --circular apps/web/src` |
| depcheck | Verificar deps nao usadas | `npx depcheck apps/web` |
| ESLint | Regras arquiteturais | `pnpm lint` |
| ts-prune | Codigo morto | `npx ts-prune` |
| unimported | Imports nao usados | `npx unimported` |

---

## Checklist

- [ ] Todas as camadas verificadas
- [ ] Circular deps detectados
- [ ] Boundary erosion mapeado
- [ ] Contract drift identificado
- [ ] Constitution breaches marcados
- [ ] Relatorio gerado
- [ ] Fixes priorizados (Critical > High > Medium > Low)
