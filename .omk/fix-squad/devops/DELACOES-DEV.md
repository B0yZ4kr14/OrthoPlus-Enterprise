# DELACOES-DEV.md
# Delacoes Recebidas do Esquadrao Forense — DevOps

## DEV-001: Backend container sem healthcheck Docker
- Hipotese falsificada: "Todos os containers tem healthcheck"
- Severidade: MEDIUM
- Container: tsiapp-orthoplus-backend
- Acao: Adicionar HEALTHCHECK ao Dockerfile backend
