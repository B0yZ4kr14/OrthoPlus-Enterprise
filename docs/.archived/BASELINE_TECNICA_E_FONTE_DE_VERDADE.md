# Baseline Técnica e Fonte de Verdade

## Objetivo
Este documento consolida a **fonte de verdade técnica** do frontend do Ortho+ após a nova rodada de validação.

## Fonte de verdade (código)
- Branch atual com os commits mais recentes de correção e validação.
- Estrutura principal do app via `src/App.tsx` e roteamento central em `src/routes/AppRoutes`.
- Configurações de validação em:
  - `eslint.config.js`
  - `tsconfig.json`
  - `vitest.config.ts`

## Pipeline local de validação (obrigatório)
Executar na raiz do projeto:

```bash
npm install
npm run validate:baseline
```

O script `validate:baseline` executa, em sequência:

1. `npm run lint -- --quiet`
2. `npm run type-check`
3. `npm run build`
4. `npm run test`

## Ajustes consolidados nesta etapa
1. **Instalação consistente de dependências**
   - Uso de `legacy-peer-deps=true` em `.npmrc` para resolver conflito de peers e garantir repetibilidade do `npm install`.

2. **Escopo correto dos testes unitários**
   - `vitest.config.ts` atualizado para **ignorar backend e diretórios de build** (`backend/`, `dist/`), evitando execução indevida de testes fora do escopo do frontend.

3. **Critério de aceite técnico**
   - Lint sem erros bloqueantes.
   - Type-check sem erros.
   - Build de produção concluindo.
   - Testes unitários do projeto executando sem coletar suites de backup/terceiros.

## Observações operacionais
- Warnings de performance no build (chunks grandes) não bloqueiam release, mas devem entrar no backlog de otimização.
- Recomendado revisar periodicamente o bundle com divisão de chunks para reduzir payload inicial.

## Responsabilidade de manutenção
- Qualquer alteração estrutural (roteamento, configuração de lint/test/build, módulos core) deve atualizar este documento no mesmo PR.
