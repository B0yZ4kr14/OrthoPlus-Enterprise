# Pesquisa: Melhores Praticas 2025-2026
# Resultados dos Agentes Firecrawl

## 1. Documentacao SaaS Enterprise

### Frameworks Recomendados
- **arc42**: 12 secoes para documentacao de arquitetura
- **C4 Model**: 4 niveis de diagramas (Context, Container, Component, Code)
- **Diataxis**: 4 tipos de docs (Tutorial, How-to, Explanation, Reference)
- **ADRs**: Architecture Decision Records (append-only log)

### Ferramentas
- Docusaurus, Vale, Mermaid.js, Structurizr DSL
- Stripe: Markdoc com AST validation
- GitHub: Content type templates
- Vercel: AI-first com llms.txt generation
- Google: Developer Documentation Style Guide

### Falseabilidade em Documentacao
- Code Samples as Tests
- Contract Testing
- Living Documentation (BDD)
- Metricas explicitas e condicoes de falha

## 2. Frontend (React 19 + Vite 6 + TS Strict + Tailwind 4)

### Estrutura Recomendada: Feature-First + Clean Architecture
```
src/
  features/[feature-name]/
    domain/        # Entidades, Value Objects, exceptions
    application/   # Use cases, ports, services
    infrastructure/ # Repositories, adapters, API
    ui/            # Components, hooks, pages
    index.ts       # Public API (barrel export)
    types.ts       # Tipos do feature
    README.md      # Documentacao do modulo
```

### Lazy Loading
- Route-based: maior ROI
- Component-based: widgets pesados (editores, charts, modals)
- Prefetching em hover de links
- Budget: initial < 500KB, lazy chunk < 200KB

### Design System
- Radix UI (primitivos acessiveis)
- CVA (Class Variance Authority) para variantes
- Tailwind CSS v4: CSS-first config, engine Oxide (Rust)
- Compound components para complexos

### Estado
- Server state -> TanStack Query (staleTime 5min)
- Client state -> Zustand (+ persist para filtros)
- Local UI -> useState/useReducer

### Seguranca Frontend
- Tokens em httpOnly cookies (NAO localStorage)
- DOMPurify para dangerouslySetInnerHTML
- CSP headers
- Source maps NAO em producao

## 3. Backend (Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16)

### Estrutura Modular: DDD + Modular Monolith
```
src/
  modules/[modulo]/
    domain/          # Entidades, aggregates
    application/     # Use cases
    infrastructure/  # Controllers, routes, repositories
    public/          # API publica para outros modulos
  core/              # Errors, logger
  infrastructure/    # HTTP, DB, DI
```

### Prisma Multi-Schema
- Schema por Bounded Context (10-30 contexts)
- @@schema("nome") em cada model
- Connection pooling com singleton pattern
- Anti-patterns: prefixo em tabelas, 50+ schemas, FKs cross-schema sem planejamento

### Documentacao API
- OpenAPI 3.1 + Zod-to-OpenAPI + Scalar (recomendado 2026)
- Alternativas: Swagger UI, Redoc, Bump.sh, ReadMe

### Workers (9+ jobs)
- BullMQ com Redis
- Separar producer (API) e workers (processos independentes)
- Dead letter queue para falhas permanentes
- Bull Board para dashboard
- Cron: repeatable jobs com pattern

### Seguranca Backend
- JWT: RS256, 5-15min access, 7-30 dias refresh
- httpOnly + secure + sameSite=strict cookies
- Refresh token rotation (detecta reuse)
- Row Level Security (RLS) no PostgreSQL
- Rate limiting: express-rate-limit ou rate-limiter-flexible
- Helmet com CSP customizado
- CSRF: SameSite strict (moderno) ou csurf tokens

## 4. Metodologia Popperiana/Socratica

### Framework Popperiano (6 etapas)
1. Identificar afirmacoes arquiteturais
2. Formular hipoteses falseaveis
3. Desenhar experimentos de falsificacao
4. Escrutinio adversarial
5. Coleta de dados
6. Refutacao ou corroboracao

### Ferramentas de Falsificacao
- Chaos Engineering (Netflix Chaos Monkey)
- Fitness Functions (ArchUnit)
- Property-Based Testing (Hypothesis/QuickCheck)
- Mutation Testing
- SAST (SonarQube, CodeQL)

### Questionamento Socratico (6 tipos)
1. Clarificacao: "O que voce quer dizer com X?"
2. Probing assumptions: "Que premissas estao por tras?"
3. Probing evidence: "Que evidencia voce tem?"
4. Perspectives: "Existe outra forma de ver isso?"
5. Implications: "Se isso for verdade, o que implica?"
6. Meta-questioning: "Por que perguntamos isso?"

### Casos de Estudo
- Netflix Chaos Engineering: encontrou issues que revisoes tradicionais nao encontraram
- Property-Based Testing: encontrou 27 bugs em 24h
- LLM Code Review Bias: confirmation bias permite reintroducao de CVEs
