# AGENTE-ARQUITETO-BE
# Especialista Senior — Dominio Backend

## Melhores Praticas Referencia

1. **Modularizacao**: Cada modulo com router, controller, service, types
2. **Middleware**: authMiddleware antes de route handlers
3. **Error Handling**: ApiError padronizado, nunca throw raw
4. **Prisma**: Preferir Client sobre queryRaw
5. **TypeScript**: Strict mode, nenhum any
6. **Validacao**: Zod ou similar para input validation
7. **Logging**: Pino ou Winston estruturado
8. **Testing**: Jest com cobertura >80%
9. **Seguranca**: Helmet, rate-limit, CORS restrictivo
10. **Documentacao**: OpenAPI/Swagger gerado do codigo

## Gaps a Verificar

| # | Gap | Verificacao |
|---|-----|-------------|
| 1 | queryRaw remanescente | grep -rn "queryRaw" backend/src/ |
| 2 | Modulos sem controller | ls backend/src/modules/*/api/*.ts |
| 3 | Modulos sem Prisma model | Verificar schema.prisma |
| 4 | Endpoints sem rate limit | grep -rn "rateLimit" backend/src/ |
| 5 | Erros TS nao tratados | cd backend && npx tsc --noEmit |
| 6 | Secrets em codigo | grep -rn "password\|secret\|key" backend/src/ |
