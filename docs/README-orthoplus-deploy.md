# OrthoPlus Enterprise - Documentação de Deploy

## 🌐 Acesso ao Sistema

| Ambiente | URL | Status |
|----------|-----|--------|
| Tailscale HTTP | http://100.111.74.69 | ✅ Funcionando |
| IP Público HTTP | http://179.190.15.116 | ✅ Funcionando |
| Tailscale HTTPS | https://100.111.74.69 | ✅ SSL Configurado |

## 🔐 Credenciais de Acesso

**Administrador Padrão:**
- Email: `admin@orthoplus.com`
- Senha: `Admin123!`

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Nginx (80)    │────▶│  OrthoPlus API   │────▶│   PostgreSQL    │
│   + SSL (443)   │     │   (Node.js)      │     │   (Porta 5432)  │
└─────────────────┘     │   Porta 3005     │     └─────────────────┘
                        └──────────────────┘
                                 │
                        ┌────────┴────────┐
                        │      Redis      │
                        │   (Porta 6379)  │
                        └─────────────────┘
```

## 📦 Componentes

| Componente | Tecnologia | Porta | Status |
|------------|------------|-------|--------|
| Frontend | React + Vite | 80/443 | ✅ Nginx |
| Backend | Node.js + Express | 3005 | ✅ PM2 |
| Banco de Dados | PostgreSQL 16 | 5432 | ✅ Ativo |
| Cache | Redis 7 | 6379 | ✅ Ativo |
| Proxy | Nginx | 80/443 | ✅ SSL |

## 🔧 Comandos Úteis

### Backend (PM2)
```bash
# Ver status
pm2 status

# Logs
pm2 logs orthoplus-backend

# Reiniciar
pm2 restart orthoplus-backend
```

### Nginx
```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx
```

### Banco de Dados
```bash
# Acessar PostgreSQL
sudo -u postgres psql -d orthoplus
```

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Backend não responde | `pm2 restart orthoplus-backend` |
| Erro 502 | Verificar se backend está rodando na porta 3005 |
| Erro 404 | Verificar se frontend está em `/var/www/orthoplus` |
| SSL não funciona | Verificar certificados em `/etc/ssl/certs/` |

---
*Documentação gerada em: 2026-04-05*
