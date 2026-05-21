# VPS-TSiAPP — Canonical Configuration

> Versao: 1.0.0 | Data: 2026-05-20 | Status: CANONICO

## Definicoes Canonicas

| Variavel | Valor |
|----------|-------|
| HOSTNAME | TSiAPP |
| USER | tsi |
| PORT | 22 |
| KEY | ~/.ssh/keys/private/TSiHomeLab |

## Acesso SSH Passwordless

### Usuario root
```bash
ssh -i ~/.ssh/keys/private/TSiHomeLab root@<IP_PUBLICO>
```

### Usuario tsi
```bash
ssh -i ~/.ssh/keys/private/TSiHomeLab tsi@<IP_PUBLICO>
```

## Docker Compose Stack

```bash
cd /home/tsi/OrthoPlus-Enterprise
docker compose up -d
```

## Healthchecks

| Servico | URL |
|---------|-----|
| Backend | http://localhost:3005/health |
| Frontend | http://localhost:8083/ |
| Agent | http://localhost:8000/ |

## Notas

- Usuario canonico: tsi
- Path canonico: /home/tsi/OrthoPlus-Enterprise
- Chave canonica: ~/.ssh/keys/private/TSiHomeLab
