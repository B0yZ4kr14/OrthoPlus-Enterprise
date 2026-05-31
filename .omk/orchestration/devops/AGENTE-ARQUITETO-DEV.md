# AGENTE-ARQUITETO-DEV
# Especialista Senior — Dominio DevOps

## Melhores Praticas Referencia

1. **Docker**: Multi-stage build, imagens pequenas, non-root user
2. **Compose**: Orquestracao local, healthchecks, restart policies
3. **Nginx**: SSL, gzip, cache headers, rate limiting
4. **CI/CD**: GitHub Actions, testes antes de deploy
5. **Observabilidade**: Logs centralizados, metrics, alerting
6. **Secrets**: Vault ou secret management, nunca em repo
7. **Rede**: Bridge network, nao host network
8. **Backup**: DB backup automatizado, testado
9. **Scaling**: Horizontal scaling ready, stateless apps
10. **Security**: Container scanning, vulnerability management

## Gaps a Verificar

| # | Gap | Verificacao |
|---|-----|-------------|
| 1 | Host network no backend | docker inspect tsiapp-orthoplus-backend |
| 2 | Non-root user | docker inspect --format='{{.Config.User}}' |
| 3 | Healthcheck no backend | docker inspect --format='{{.Config.Healthcheck}}' |
| 4 | CSP header no nginx | curl -I http://localhost:8080 |
| 5 | .env no .gitignore | grep .env .gitignore |
