# GitHub Actions Workflows

## Workflows Disponiveis

| Workflow | Gatilho | Proposito |
|----------|---------|-----------|
| deploy-vps-orthoplus.yml | push main / dispatch | Deploy automatizado |
| build.yml | push/PR main, develop | Build e type-check |
| ci.yml | push/PR main | CI completo |
| test.yml | push/PR main, develop | Testes unitarios |
| e2e-tests.yml | push/PR main, develop | Testes E2E Playwright |
| quality-check.yml | push/PR main, develop | Verificacao de qualidade |
| security.yml | push main / cron | Scan de seguranca |

## Configuracao

Configurar secrets em Settings - Secrets and variables - Actions.
Nunca commitar credenciais no repositorio.
