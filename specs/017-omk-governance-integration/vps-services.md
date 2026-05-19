# Docker Compose Service Map — TSiAPP Production

**Feature**: 017-omk-governance-integration
**Last Updated**: 2026-05-19

## OrthoPlus Enterprise Services

| Container | Image | Status | Ports | Network |
|-----------|-------|--------|-------|---------|
| orthoplus-backend | orthoplus-enterprise-backend:latest | healthy | 127.0.0.1:3005→3005 | orthoplus_default |
| orthoplus-app | orthoplus-enterprise-app:latest | healthy | 127.0.0.1:8083→8080 | orthoplus_default |
| orthoplus-db | postgres:16-alpine | healthy | 5432/tcp | orthoplus_default |
| orthoplus-redis | redis:7-alpine | healthy | 6379/tcp | orthoplus_default |
| orthoplus-prometheus | prom/prometheus:latest | running | 9090/tcp | orthoplus_default |
| orthoplus-grafana | grafana/grafana:latest | running | 127.0.0.1:3000→3000 | orthoplus_default |
| orthoplus-node-exporter | prom/node-exporter:latest | healthy | 9100/tcp | orthoplus_default |
| orthoplus-redis-exporter | oliver006/redis_exporter:latest | running | 9121/tcp | orthoplus_default |

## TSiSIP Services (Co-located on VPS)

| Container | Status | Ports |
|-----------|--------|-------|
| tsisip-ocp-1 | healthy | 127.0.0.1:8084→80 |
| tsisip-backup-1 | healthy | 127.0.0.1:9101→9101 |
| tsisip-postgres-1 | healthy | 5432/tcp |
| tsisip-opensips-1 | healthy | 0.0.0.0:5060-5061→5060-5061 |
| tsisip-asterisk-pbx-1-1 | healthy | 5038/tcp, 5060/tcp/udp |
| tsisip-asterisk-pbx-2-1 | healthy | 5038/tcp, 5060/tcp/udp |
| tsisip-rtpengine-1 | healthy | 10000-10999/udp, 11000-20000/udp |

## Volumes

| Volume | Mount | Purpose |
|--------|-------|---------|
| postgres-data | /var/lib/postgresql/data | PostgreSQL persistent data |
| redis-data | /data | Redis persistent data |
| grafana-data | /var/lib/grafana | Grafana dashboards & data |
| prometheus-data | /prometheus | Prometheus time-series data |

## Networks

| Network | Driver | Containers |
|---------|--------|------------|
| orthoplus_default | bridge | All orthoplus-* containers |
| tsisip_default | bridge | All tsisip-* containers |
