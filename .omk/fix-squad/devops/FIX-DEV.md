# FIX-DEV.md
# Agente Executor — DevOps Fixes

## Fix DEV-001: Healthcheck Docker Backend

### Fix Minimo
Adicionar ao Dockerfile do backend:
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3
  CMD curl -fsS http://localhost:3005/health > /dev/null || exit 1

### Comando de Verificacao
docker inspect --format='{{.Config.Healthcheck}}' tsiapp-orthoplus-backend
