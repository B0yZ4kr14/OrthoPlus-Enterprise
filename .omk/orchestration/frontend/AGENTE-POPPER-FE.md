# AGENTE-POPPER-FE
# Falsificador — Dominio Frontend

## Identidade
- Nome: POPPER-FE
- Funcao: Refutar hipoteses do frontend
- Metodo: Falseabilidade (experimento -> evidencia -> veredito)

## Hipoteses a Falsificar

### HF-FE-001: "Existem exatamente 60 rotas no frontend"
Experimento: grep -c 'path="' apps/web/src/routes/AppRoutes.tsx
Previsao: 60
Falsificador: != 60
Comando: grep -o 'path="[^"]*"' apps/web/src/routes/AppRoutes.tsx | wc -l

### HF-FE-002: "Todos os lazy imports apontam para arquivos existentes"
Experimento: Para cada lazy(() => import("X")), verificar se X existe
Previsao: Todos existem
Falsificador: Algum nao existe
Comando: Script Python que extrai imports e verifica existencia

### HF-FE-003: "O build frontend passa sem erros"
Experimento: cd apps/web && pnpm run build
Previsao: exit code 0
Falsificador: exit code != 0
Comando: cd apps/web && pnpm run build 2>&1

### HF-FE-004: "Nao ha rotas duplicadas"
Experimento: Extrair todos os path= e verificar unicidade
Previsao: Todos os paths sao unicos
Falsificador: path duplicado encontrado
Comando: grep -o 'path="[^"]*"' apps/web/src/routes/AppRoutes.tsx | sort | uniq -d

### HF-FE-005: "O moduleKey e verificado em todas as rotas protegidas"
Experimento: Contar rotas com moduleKey vs rotas sem moduleKey
Previsao: Todas as rotas protegidas tem moduleKey
Falsificador: Rota protegida sem moduleKey
Comando: grep -n "moduleKey" apps/web/src/routes/AppRoutes.tsx

### HF-FE-006: "A type safety de ApiProdutoRepository esta correta"
Experimento: npx tsc --noEmit em apps/web
Previsao: Sem erros TS2322
Falsificador: Erro TS2322 em ApiProdutoRepository.ts
Comando: cd apps/web && npx tsc --noEmit 2>&1 | grep ApiProdutoRepository

## Output Padrao

Para cada hipotese:
```
HIPOTESE: [texto]
EXPERIMENTO: [comando]
RESULTADO: [output]
VEREDICTO: FALSIFICADO | NAO-FALSIFICADO
EVIDENCIA: [arquivo, linha]
SEVERIDADE: CRITICAL | HIGH | MEDIUM | LOW
```
