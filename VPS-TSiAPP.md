# VPS-TSiAPP — Canonical Configuration

> **Versão:** 1.0.0
> **Data:** 2026-05-20
> **Status:** CANÔNICO — Fonte única de verdade

---

## Definições Canônicas

| Variável                  | Valor                            | Descrição                       |
| ------------------------- | -------------------------------- | ------------------------------- |
| `VPS_TSiAPP_HOSTNAME`     | `TSiAPP`                         | Hostname do servidor            |
| `VPS_TSiAPP_IP_PUBLIC`    | `179.190.15.116`                 | IP público (Internet)           |
| `VPS_TSiAPP_IP_TAILSCALE` | `100.111.74.69`                  | IP Tailscale (rede privada)     |
| `VPS_TSiAPP_KEY`          | `~/.ssh/keys/private/TSiHomeLab` | Chave SSH canônica              |
| `VPS_TSiAPP_NAME`         | `VPS TSiAPP`                     | Nome descritivo                 |
| `VPS_TSiAPP_PORT`         | `22`                             | Porta SSH                       |
| `VPS_TSiAPP_USER`         | `tsi`                            | Usuário padrão (NUNCA `ubuntu`) |

> **Credenciais sensíveis** (senhas, API keys): ver `.env.vps.credentials` (não versionado, `.gitignore`)

---

## Acesso SSH Passwordless

### Chave Canônica

- **Path local:** `~/.ssh/keys/private/TSiHomeLab`
- **Path na VPS (tsi):** `/home/tsi/.ssh/authorized_keys`
- **Path na VPS (root):** `/root/.ssh/authorized_keys`

### Usuário `tsi` (padrão / deploy / operações)

```bash
# Via Tailscale (rede privada — preferencial)
ssh -i ~/.ssh/keys/private/TSiHomeLab tsi@100.111.74.69

# Via IP público (fallback)
ssh -i ~/.ssh/keys/private/TSiHomeLab tsi@179.190.15.116
```

### Usuário `root` (emergência / manutenção)

```bash
# Via Tailscale
ssh -i ~/.ssh/keys/private/TSiHomeLab root@100.111.74.69

# Via IP público
ssh -i ~/.ssh/keys/private/TSiHomeLab root@179.190.15.116
```

---

## SSH Config Local (~/.ssh/config)

Adicione ao seu `~/.ssh/config` ou a um arquivo em `~/.ssh/config.d/`:

```ssh-config
# ============================================
# VPS TSiAPP — Acesso Canônico
# ============================================
Host vps-tsiapp vps-orthoplus
    HostName 179.190.15.116
    User tsi
    Port 22
    IdentityFile ~/.ssh/keys/private/TSiHomeLab
    IdentitiesOnly yes
    StrictHostKeyChecking no

Host vps-tsiapp-tailscale
    HostName 100.111.74.69
    User tsi
    Port 22
    IdentityFile ~/.ssh/keys/private/TSiHomeLab
    IdentitiesOnly yes
    StrictHostKeyChecking no

Host vps-tsiapp-root
    HostName 179.190.15.116
    User root
    Port 22
    IdentityFile ~/.ssh/keys/private/TSiHomeLab
    IdentitiesOnly yes
    StrictHostKeyChecking no
```

---

## Docker Compose Stack

```bash
# Navegar ao projeto canônico
cd /home/tsi/OrthoPlus-Enterprise

# Subir stack completa
docker compose up -d

# Ver status
docker compose ps

# Logs em tempo real
docker compose logs -f

# Rebuild após mudanças
docker compose up --build -d
```

---

## Healthchecks

| Serviço       | URL Local                      | Via Nginx                                |
| ------------- | ------------------------------ | ---------------------------------------- |
| Backend API   | `http://127.0.0.1:3005/health` | `https://tsiapp.io/api/orthoplus/health` |
| Frontend SPA  | `http://127.0.0.1:8083/`       | `https://tsiapp.io/`                     |
| Agent Service | `http://127.0.0.1:8000/`       | `https://tsiapp.io/api/agent/`           |
| Prometheus    | `http://127.0.0.1:9090/`       | —                                        |
| Grafana       | `http://127.0.0.1:3100/`       | —                                        |

---

## Estrutura Canônica na VPS

```
/home/tsi/
├── OrthoPlus-Enterprise/         # Projeto principal (git repo)
│   ├── apps/web/                 # Frontend React + Vite
│   ├── backend/                  # Backend Node.js + Express
│   ├── agent-service/            # Python FastAPI
│   ├── docker-compose.yml        # Stack Docker
│   ├── VPS-TSiAPP.md            # Este arquivo
│   └── .specify/memory/          # Memória persistente
│
├── backups/                      # Backups automatizados
└── .ssh/
    ├── authorized_keys          # Chaves autorizadas
    └── config                   # Config SSH local
```

---

## Comandos de Manutenção

### Backup

```bash
cd /home/tsi/OrthoPlus-Enterprise
./scripts/vps/backup.sh
```

### Dashboard do Sistema

```bash
/home/tsi/OrthoPlus-Enterprise/scripts/vps/dashboard.sh
```

### Atualizar Código + Deploy

```bash
cd /home/tsi/OrthoPlus-Enterprise
git pull origin main
docker compose up --build -d
```

---

## Notas Canônicas

| Regra                | Valor                            |
| -------------------- | -------------------------------- |
| **Usuário canônico** | `tsi` — NUNCA usar `ubuntu`      |
| **Path canônico**    | `/home/tsi/OrthoPlus-Enterprise` |
| **Chave canônica**   | `~/.ssh/keys/private/TSiHomeLab` |
| **IP público**       | `179.190.15.116`                 |
| **IP Tailscale**     | `100.111.74.69`                  |
| **Porta SSH**        | `22`                             |

---

**Última atualização:** 2026-05-20
