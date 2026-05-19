# VPS Network Topology — TSiAPP Production

**Feature**: 017-omk-governance-integration
**Last Updated**: 2026-05-19
**VPS**: Ubuntu Server LTS (Tailscale + Cloudflare)

## Network Diagram

```
Internet
   │
   ▼
Cloudflare (CDN + SSL Proxy)
   │  tsiapp.io / www.tsiapp.io
   ▼
Host Nginx (Cloudflare Origin CA cert)
   │  /etc/nginx/sites-enabled/tsiapp-https
   ├── listen 443 ssl (all interfaces)
   ├── listen 10.1.1.23:443 ssl (Tailscale local)
   ├── proxy /api/* → backend:3005
   ├── proxy / → frontend:8083
   └── try_files fallback → SPA index.html
   ▼
Docker Compose Stack (orthoplus-* containers)
```

## Tailscale Network

| Device | Tailscale IP | Role |
|--------|-------------|------|
| tsiapp (VPS) | 100.111.74.69 | Production server |
| tsidesktop-01 | 100.104.61.127 | Developer workstation |
| pdm-tsihomelab | 100.119.171.92 | DevOps/monitoring |
| tsi-reunion-room | 100.81.18.64 | Windows workstation |

## Public Infrastructure

| Resource | Value |
|----------|-------|
| Public IP | 179.190.15.116 |
| Domain | tsiapp.io / www.tsiapp.io |
| DNS | Cloudflare (proxied) |
| SSL | Cloudflare Origin CA → host nginx |
| SSH Access | Key-based, Tailscale preferred |

## Ports & Services

| Port | Service | Container | Access |
|------|---------|-----------|--------|
| 443 | HTTPS (frontend + API) | host nginx | Public |
| 3005 | Backend API | orthoplus-backend | localhost only |
| 8083 | Frontend SPA | orthoplus-app | localhost only |
| 5432 | PostgreSQL | orthoplus-db | internal only |
| 6379 | Redis | orthoplus-redis | internal only |
| 9090 | Prometheus | orthoplus-prometheus | internal only |
| 3000 | Grafana | orthoplus-grafana | localhost only |
| 9100 | Node Exporter | orthoplus-node-exporter | internal only |
