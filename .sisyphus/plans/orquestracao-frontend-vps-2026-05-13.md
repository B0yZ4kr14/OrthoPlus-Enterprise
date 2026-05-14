# Plano de Orquestração — Frontend OrthoPlus Enterprise

> Data: 2026-05-13 | Coordenador: Multi-agente | Loops: 5 ciclos

## Contexto (Pós-Reconhecimento)

### Críticos
1. Navegação quebrada: /orthoplus-enterprise (lowercase) retorna 404
2. Frontend desatualizado no VPS: build local nunca deployado
3. CSS fantasmas: .glass-card (45 usos), .stat-card-premium, .chart-card-premium nao existem
4. Sidebar hardcoded: cores emerald/teal fixas

### Importantes
5. Conflito de temas: clinical.ts vs ThemeContext
6. Nginx: headers duplicados, case-sensitive
7. Tokens v3 orfaos: tokens-v3.ts nunca importado

## Agentes Especializados

| Agente | Persona | Responsabilidade |
|--------|---------|------------------|
| A1 | Frontend/UI Senior | CSS fantasmas, Sidebar, Tema, Cores premium |
| A2 | DevOps/Deploy Senior | Nginx, Docker, VPS sync, Pipeline deploy |
| A3 | QA/Browser Senior | Navegacao E2E, Screenshots, Login, Validacao |
| A4 | Backend Senior | API health, Auth endpoints, CORS, DB integrity |

## Loop 1: Investigacao Profunda

### A1 — Frontend/UI
- Mapear TODOS os 45 usos de .glass-card
- Auditar Sidebar: listar cores hardcoded
- Verificar ThemeContext aplicando classes no html

### A2 — DevOps
- Confirmar nginx usa container Docker (8083)
- Testar acesso com maiusculas vs minusculas
- Verificar headers duplicados

### A3 — QA/Browser
- Abrir https://tsiapp.io/OrthoPlus-Enterprise/ no browser
- Capturar screenshot
- Verificar se sidebar renderiza
- Testar login

### A4 — Backend
- Validar health endpoints por categoria
- Testar auth/token
- Verificar CORS headers

## Loop 2: Confronto da Realidade

### A1
- Comparar build local vs container
- Testar tema premium realmente aplica cores
- Validar glassmorphism

### A2
- Rebuildar container com build local
- Medir tempo de deploy
- Validar nginx interno do container

### A3
- Gravar video/trace da navegacao
- Testar cada item de menu
- Testar responsividade mobile

### A4
- Testar carga de requests
- Verificar dbRouters
- Validar workers

## Loop 3: Correcao

### A1
- Criar .glass-card em index.css
- Criar .stat-card-premium e .chart-card-premium
- Refatorar Sidebar: substituir hardcoded por CSS vars
- Unificar tema: remover conflito clinical.ts
- Ativar tokens-v3.ts ou integrar no ThemeContext
- Remover arquivos orfaos

### A2
- Adicionar location /orthoplus-enterprise/ no nginx
- Buildar nova imagem Docker
- Deploy para VPS
- Limpar /var/www/orthoplus
- Remover headers duplicados

### A3
- Criar testes E2E para login + navegacao
- Criar testes E2E para troca de tema
- Criar testes E2E para mobile

### A4
- Garantir CORS permite origin correto
- Validar JWT secret
- Verificar clinicGuard

## Loop 4: Consolidacao

- Build frontend: pnpm build — passar sem erros
- Build backend: npm run build — passar no VPS
- Testes backend: 17/17 suites, 363/363 tests
- Testes E2E: Playwright passar
- Type-check: zero erros
- Lint: zero erros
- Commit consolidado

## Loop 5: Validacao Final + Push GitHub

### A3 — QA Lead
- Screenshot comparativo: antes vs depois
- Navegacao completa: login → dashboard → cada modulo → logout
- Teste de tema: light → premium → dark
- Teste mobile: sidebar como drawer
- Lighthouse score

### A2
- Validar deploy: health check → 200
- Validar lowercase: 200 ou 301
- Disk check: VPS tem espaco

### Todos
- Commit final
- Push para GitHub
- Documentar: STATUS, CHANGELOG, AGENTS.md

## Criterios de Sucesso

| Criterio | Metrica |
|----------|---------|
| Acesso frontend | 200, sidebar visivel |
| Login funciona | JWT retornado |
| Navegacao | Todos os menus acessiveis |
| Tema premium | Cores aplicadas corretamente |
| Glassmorphism | Efeitos visuais presentes |
| Mobile | Sidebar vira drawer |
| Build | Sem erros |
| Testes | 17/17 suites, 363 tests |
| Sync | Local = VPS = GitHub |

## Guardrails

- NUNCA expor credenciais reais em codigo
- NUNCA fazer prisma db push em producao
- SEMPRE backup antes de alterar nginx
- SEMPRE testar nginx config com nginx -t antes de reload
- SEMPRE manter base: '/OrthoPlus-Enterprise/' no vite.config.ts
