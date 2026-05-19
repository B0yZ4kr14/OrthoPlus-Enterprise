# Playbook PB05: Falsificacao pelo Metodo Popperiano

## Objetivo
Aplicar falsificacao de hipoteses para encontrar bugs e inconsistencias no frontend.

## Principios
- **Hipose nula (H0)**: "Este codigo esta correto"
- **Experimento**: Tentar provar que H0 eh falsa
- **Criterio**: Se encontrar contradicao, H0 eh rejeitada

---

## Framework de Falsificacao

```
1. Formular H0
2. Identificar predicao de H0
3. Projetar experimento para contradizer predicao
4. Executar experimento
5. Se contradicao encontrada → H0 rejeitada → Fix
6. Se nenhuma contradicao → H0 nao eh provada, apenas nao falsificada
```

---

## Categorias de Hipoteses

### H1: Componente esta correto
**Predicao**: O componente renderiza corretamente em todas as condicoes

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F1 | Props nulas | Passar `null`, `undefined`, `{}` |
| F2 | Props vazias | Passar arrays vazios, strings vazias |
| F3 | Props invalidas | Passar tipos errados, strings no lugar de numbers |
| F4 | Dados grandes | Passar arrays com 10.000 itens |
| F5 | Dados malformados | Passar objetos com campos faltando |
| F6 | Mobile | Testar em 320px, 375px |
| F7 | Tablet | Testar em 768px |
| F8 | Desktop | Testar em 1440px, 1920px |
| F9 | Dark mode | Testar com tema escuro |
| F10 | Slow network | Simular 3G |

### H2: Estado esta bem gerenciado
**Predicao**: O estado nunca entra em condicao invalida

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F11 | Race condition | Clicar rapido 10x no mesmo botao |
| F12 | Estado parcial | Interromper carregamento no meio |
| F13 | Cache stale | Navegar para tras e para frente |
| F14 | Multiplas abas | Abrir a mesma pagina em 2 abas |
| F15 | Offline | Desconectar internet |
| F16 | Reconnect | Reconectar apos offline |

### H3: Formulario esta validado
**Predicao**: O formulario nao aceita dados invalidos

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F17 | Campos vazios | Submeter sem preencher |
| F18 | Espacos | Preencher com apenas espacos |
| F19 | SQL injection | Preencher com `' OR '1'='1` |
| F20 | XSS | Preencher com `<script>alert(1)</script>` |
| F21 | Emoji | Preencher com 🚨💥🔥 |
| F22 | Unicode | Preencher com caracteres chineses/japoneses |
| F23 | Numeros negativos | Idade = -1 |
| F24 | Numeros grandes | Idade = 999999 |
| F25 | Data futura | Data de nascimento = 2050-01-01 |
| F26 | Data invalida | 2023-02-30 |
| F27 | Email invalido | `not-an-email` |
| F28 | CPF invalido | `123.456.789-00` |

### H4: API esta bem integrada
**Predicao**: A aplicacao lida corretamente com todas as respostas da API

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F29 | 400 Bad Request | API retorna erro de validacao |
| F30 | 401 Unauthorized | Token expirado |
| F31 | 403 Forbidden | Sem permissao |
| F32 | 404 Not Found | Recurso nao existe |
| F33 | 500 Internal Error | Erro no servidor |
| F34 | Timeout | API demora >30s |
| F35 | Resposta vazia | API retorna `{}` ou `[]` |
| F36 | Resposta extra | API retorna campos a mais |
| F37 | Resposta faltando | API retorna campos a menos |
| F38 | JSON invalido | API retorna HTML em vez de JSON |

### H5: Permissoes funcionam
**Predicao**: Usuarios so acessam o que tem permissao

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F39 | Sem login | Acessar rota sem autenticacao |
| F40 | MEMBER acessa ADMIN | Tentar acessar pagina de admin |
| F41 | Token manipulado | Alterar token no localStorage |
| F42 | Modulo desativado | Acessar modulo nao ativo |
| F43 | URL direta | Acessar `/admin/usuarios` direto |
| F44 | Historico | Voltar para pagina apos logout |

### H6: Performance eh aceitavel
**Predicao**: A aplicacao nao trava nem gela

**Experimentos de Falsificacao**:

| # | Experimento | Como Falsificar |
|---|-------------|-----------------|
| F45 | Heap growth | Navegar 50x entre rotas |
| F46 | Re-render | Digitar em input e medir renders |
| F47 | Bundle size | Analisar bundle com `pnpm build` |
| F48 | Lighthouse | Rodar Lighthouse CI |
| F49 | Memory leak | Abrir DevTools > Memory |
| F50 | Long tasks | Abrir DevTools > Performance |

---

## Template de Experimento

```markdown
## Experimento: [Nome]

### Hipose (H0)
"[Descricao da hipose]"

### Predicao
"[O que H0 prediz]"

### Experimento de Falsificacao
**Setup**: [Como preparar]
**Acao**: [O que fazer]
**Input**: [Dados de entrada]
**Expected (segundo H0)**: [O que deveria acontecer]

### Resultado
**Actual**: [O que realmente aconteceu]
**Contradicao?**: Sim/Nao

### Conclusao
- [ ] H0 nao falsificada (nao prova que esta correta)
- [x] H0 rejeitada (contradicao encontrada)

### Fix Proposto
[Descricao do fix]

### Severidade
- [ ] CRITICAL
- [ ] LARGE
- [x] MEDIUM
- [ ] SMALL
```

---

## Exemplo Completo

### Experimento F3: Props Invalidas

**H0**: "O componente DataTable aceita props corretamente"

**Predicao**: "Passar `columns="invalid"` nao vai quebrar"

**Experimento**:
```tsx
<DataTable data={[]} columns="invalid" />
```

**Expected**: Renderizar mensagem de erro ou nao renderizar nada

**Actual**:
```
TypeError: columns.map is not a function
```

**Contradicao?**: SIM

**Conclusao**: H0 rejeitada

**Fix Proposto**:
```tsx
// Adicionar validacao de props
if (!Array.isArray(columns)) {
  console.error('DataTable: columns must be an array')
  return <ErrorState message="Configuracao invalida da tabela" />
}
```

**Severidade**: MEDIUM

---

## Exemplo: Experimento F22 (Unicode)

**H0**: "O formulario de paciente aceita todos os caracteres validos"

**Experimento**:
```
Nome: 田中太郎
Email: tanaka@example.jp
Telefone: +81-90-1234-5678
```

**Expected**: Formulario aceita e salva corretamente

**Actual**:
```
ValidationError: "Nome contem caracteres invalidos"
```

**Contradicao?**: SIM

**Conclusao**: H0 rejeitada

**Fix**: Atualizar regex de validacao para aceitar Unicode

---

## Exemplo: Experimento F39 (Sem Login)

**H0**: "Rotas protegidas exigem autenticacao"

**Experimento**:
1. Limpar localStorage
2. Acessar `https://tsiapp.io/OrthoPlus-Enterprise/configuracoes`

**Expected**: Redirecionar para `/auth`

**Actual**: Pagina de configuracoes renderiza (com dados vazios)

**Contradicao?**: SIM

**Conclusao**: H0 rejeitada

**Fix**: Verificar auth antes de renderizar rota

---

## Ferramentas para Falsificacao

| Ferramenta | Uso | Comando |
|-----------|-----|---------|
| React DevTools | Inspecionar props e estado | Extensao do browser |
| DevTools > Network | Simular erros de API | Throttle, Block |
| DevTools > Performance | Medir re-renders | Record |
| DevTools > Memory | Detectar leaks | Heap snapshot |
| Lighthouse | Performance audit | `npx lighthouse` |
| axe-core | Acessibilidade | `npx axe` |
| Playwright | E2E tests | `npx playwright test` |
| Storybook | Isolar componentes | `pnpm storybook` |

---

## Checklist de Falsificacao

Para cada componente/modulo:
- [ ] H1 testado (props validas/invalidas)
- [ ] H2 testado (estados possiveis)
- [ ] H3 testado (se tiver formulario)
- [ ] H4 testado (se chamar API)
- [ ] H5 testado (se tiver permissoes)
- [ ] H6 testado (se tiver dados grandes)
- [ ] Todos os experimentos documentados
- [ ] Issues classificadas
- [ ] Fixes aplicados (se SMALL)
