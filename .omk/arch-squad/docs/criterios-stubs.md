# Critérios de Completude de Módulos — OrthoPlus Enterprise

**Data:** 2026-05-15
**Versão:** 1.0
**Status:** Draft

## Definições

### Módulo "Completo"
Um módulo backend é considerado **completo** quando possui:

1. **Router** registrado em `backend/src/index.ts`
2. **Controller** com handlers para endpoints principais (CRUD)
3. **Prisma model(s)** correspondente(s) no schema
4. **clinicGuard** aplicado em todas as rotas protegidas
5. **Validação** de entrada (Zod ou similar)
6. **Testes unitários** cobrindo handlers principais

### Módulo "Stub/API-only"
Um módulo é considerado **stub** quando:

1. Possui router registrado mas **não** possui controller completo
2. Retorna 404 ou mock data para endpoints
3. Não possui tabela Prisma dedicada
4. É um proxy para serviço externo ou feature não implementada

### Módulo "Parcial"
Um módulo é **parcial** quando:

1. Possui router + controller mas falta Prisma model
2. Ou possui Prisma model mas controller incompleto
3. Funcionalidade básica funciona mas faltam features secundárias

## Módulos Stub Atuais (2026-05-15)

| Módulo | Router | Controller | Prisma | Status |
|--------|--------|------------|--------|--------|
| backups | ✅ | ✅ | ❌ | API-only (fs ops) |
| github_tools | ✅ | ✅ | ❌ | API-only (GitHub API) |
| configuracoes | ✅ | ✅ | ❌ | Parcial (usa tabelas de outros schemas) |
| terminal | ✅ | ✅ | ❌ | API-only (shell exec) |
| comm | ✅ | ✅ | ❌ | API-only (Twilio/SendGrid) |
| crypto_config | ✅ | ✅ | ❌ | Parcial (models existem em outro schema) |
| analytics | ✅ | ❌ | ❌ | Stub |
| dashboard | ✅ | ❌ | ❌ | Stub |
| bi | ✅ | ❌ | ❌ | Stub |
| fidelidade | ✅ | ❌ | ❌ | Stub |
| inadimplencia | ✅ | ❌ | ❌ | Stub |
| lgpd | ✅ | ❌ | ❌ | Stub |
| nfe | ✅ | ❌ | ❌ | Stub |
| orcamentos | ✅ | ❌ | ❌ | Stub |
| split_pagamento | ✅ | ✅ | ❌ | API-only |
| tiss | ✅ | ❌ | ❌ | Stub |
| funcionarios | ✅ | ❌ | ❌ | Stub |

## Critérios para Promoção de Stub → Completo

1. Criar/verificar Prisma models no schema correto
2. Implementar controller com CRUD completo
3. Adicionar validação de entrada
4. Escrever testes unitários
5. Documentar endpoints em `docs/API.md`
6. Verificar clinicGuard em todas as rotas
