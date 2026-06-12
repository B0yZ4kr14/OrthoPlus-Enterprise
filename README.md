# OrthoPlus Enterprise

SaaS de gestao odontologica enterprise. Monorepo full-stack com frontend React, backend Node.js/Express, agent service Python/FastAPI e 38 modulos de dominio.

Subdominio canônico: `orthoplus.tsiapp.io`
Porta do servico: `3000`

---

## 1. Visao Geral

O OrthoPlus Enterprise e a plataforma core de gestao clinica e administrativa para consultorios e redes odontologicas. O monorepo compreende:

- Frontend SPA — React 19 + Vite 6 + Tailwind CSS + shadcn/ui
- Backend API — Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16
- Agent Service — Python 3.14 + FastAPI + Agno (IA generativa)
- Infraestrutura — Docker CE, Redis, Prometheus, Grafana

Para detalhes de arquitetura de codigo, convencoes e comandos de desenvolvimento, consulte `AGENTS.md` na raiz do repositorio.

---

## 2. Estrutura Canônica de Deploy

A fonte de verdade para deploy Docker e a stack canônica em `/opt/tsi-stack/`.

```
/opt/tsi-stack/
├── apps/
│   └── orthoplus-enterprise/    # <<< Este servico
│       ├── docker-compose.yml
│       ├── .env                 # Injetado via Infisical (nunca commitar)
│       └── config/              # Configs bind-mount (read-only)
├── global/traefik/              # Reverse proxy e TLS (Traefik v3)
├── vault/infisical/             # Vault de secrets (Infisical CE)
└── scripts/
    └── vault-get.sh             # Protocolo de leitura de secrets
```

Regra absoluta: nenhum secret ou credencial e hardcoded no compose, Dockerfile ou codigo fonte. Todas as variaveis sensíveis sao injetadas via Infisical CE e consumidas pelo servico em runtime.

---

## 3. Protocolo de Secrets

Nunca armazene secrets em arquivos versionados. O fluxo canônico e:

1. Armazenar o secret no Infisical CE (`/opt/tsi-stack/vault/infisical/`).
2. No host de deploy, exportar via script de vault:
   ```bash
   source /opt/tsi-stack/scripts/vault-get.sh orthoplus
   ```
3. O script injeta as variaveis no ambiente do shell antes de `docker compose up`.
4. O `docker-compose.yml` referencia as variaveis com sintaxe `${VAR}` sem valores default para secrets.

Secrets obrigatorios (exemplos):

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `POSTGRES_PASSWORD`
- `INFISICAL_TOKEN` (se o proprio servico consultar o vault)

Exemplo de uso do vault-get.sh:

```bash
export DATABASE_URL=$(/opt/tsi-stack/scripts/vault-get.sh orthoplus DATABASE_URL)
export POSTGRES_PASSWORD=$(/opt/tsi-stack/scripts/vault-get.sh orthoplus POSTGRES_PASSWORD)
export JWT_SECRET=$(/opt/tsi-stack/scripts/vault-get.sh orthoplus JWT_SECRET)
```

---

## 4. Labels Traefik Obrigatorios

Todo servico exposto na stack deve declarar os labels abaixo no `docker-compose.yml`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.orthoplus.rule=Host(`orthoplus.tsiapp.io`)"
  - "traefik.http.routers.orthoplus.entrypoints=websecure"
  - "traefik.http.routers.orthoplus.tls.certresolver=letsencrypt"
  - "traefik.http.routers.orthoplus.tls=true"
  - "traefik.http.services.orthoplus.loadbalancer.server.port=3000"
  - "traefik.docker.network=tsi-network"
```

Convencoes:

- Nome do router: `<app>` (ex: `orthoplus`)
- Nome do service: `<app>` (ex: `orthoplus`)
- Network Docker: `tsi-network` (rede externa compartilhada com Traefik)
- Cert resolver: `letsencrypt` (HTTP-01 via Traefik)
- Entrypoint: `websecure` (HTTPS na 443)

---

## 5. Comandos de Deploy na Stack

### 5.1 Pre-requisitos no host

- Debian 13
- Docker CE 25+
- Usuario com permissao no grupo `docker`
- Acesso ao vault Infisical CE em `/opt/tsi-stack/vault/infisical/`
- Rede `tsi-network` criada e Traefik v3 em execucao

### 5.2 Deploy completo

```bash
# 1. Acesse o diretorio canônico do servico
cd /opt/tsi-stack/apps/orthoplus-enterprise

# 2. Carregue os secrets do vault
source /opt/tsi-stack/scripts/vault-get.sh orthoplus

# 3. Puxe as ultimas imagens (recomendado fixar tag em producao)
docker compose pull

# 4. Sobe a stack
docker compose up -d

# 5. Verifique saude
docker compose ps
docker compose logs -f --tail 100
```

### 5.3 Healthcheck rapido

```bash
curl -sf https://orthoplus.tsiapp.io/health || echo "FALHA"
curl -sf https://orthoplus.tsiapp.io/api/health || echo "FALHA API"
```

### 5.4 Rollback emergencial

```bash
cd /opt/tsi-stack/apps/orthoplus-enterprise
docker compose down
docker compose up -d --force-recreate
```

---

## 6. Convenções de Nomenclatura

| Entidade | Padrao | Exemplo |
|----------|--------|---------|
| Diretorio de deploy | `/opt/tsi-stack/apps/<app>/` | `/opt/tsi-stack/apps/orthoplus-enterprise/` |
| Subdominio canônico | `<app>.tsiapp.io` | `orthoplus.tsiapp.io` |
| Router Traefik | `<app>` | `orthoplus` |
| Service Traefik | `<app>` | `orthoplus` |
| Container prefixo | `tsi-<app>-<servico>` | `tsi-orthoplus-app`, `tsi-orthoplus-db` |
| Volume Docker | `tsi_<app>_<dados>` | `tsi_orthoplus_postgres_data` |
| Network | `tsi-network` | — |
| Env var prefixo | generico ou `ORTHoplus_` | `DATABASE_URL`, `JWT_SECRET` |

---

## 7. Stack de Producao

| Camada | Tecnologia | Versao |
|--------|------------|--------|
| SO | Debian | 13 |
| Container | Docker CE | 25+ |
| Proxy / Ingress | Traefik | v3 |
| Vault | Infisical CE | latest |
| DNS / TLS | Cloudflare + Let's Encrypt | DNS-01 / HTTP-01 |
| IP Publico | 177.10.116.10 | — |
| Dominio | tsiapp.io | — |

---

## 8. Manifesto e Documentacao Oficial

- `.agent-manifest.json` — Metadados do workspace para agentes de IA
- `AGENTS.md` — Guia canônico para agentes de IA e desenvolvedores (arquitetura, codigo, testes)
- `.openspec/specs/tsiapp-deploy.spec` — Especificacao OpenSpec de deploy
- `backend/ARCHITECTURE.md` — Arquitetura do backend
- `docs/DEPLOYMENT.md` — Guia de deploy legacy (referencia apenas)
- `docs/CONTRIBUTING.md` — Guia de contribuicao

---

## 9. Seguranca e Compliance

- clinicGuard middleware em todos os routers (35 modulos)
- Rate limiting por contexto (auth, upload, API geral)
- CSRF protection com sameSite=strict
- Helmet para headers de seguranca
- Redis auth-enabled
- TLS 1.3 via Traefik + Let's Encrypt
- Nenhum secret hardcoded em arquivos versionados

---

Proprietary — All rights reserved.
