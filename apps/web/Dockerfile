FROM nginx:alpine

# Labels OCI para rastreabilidade e orquestração
LABEL org.opencontainers.image.title="OrthoPlus Frontend" \
      org.opencontainers.image.description="SPA React para gestão odontológica OrthoPlus Enterprise" \
      org.opencontainers.image.vendor="OrthoPlus" \
      org.opencontainers.image.version="2.9.9" \
      org.opencontainers.image.source="https://github.com/B0yZ4kr14/OrthoPlus-Enterprise"

COPY dist/ /usr/share/nginx/html/
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# DevSecOps: HEALTHCHECK garante que o container seja marcado unhealthy
# antes de ser removido pelo orchestrator (Kubernetes/Docker Swarm)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1
