# Deploy no Ubuntu Server LTS

Guia completo para deploy do OrthoPlus Enterprise em servidor Ubuntu com Docker.

## Requisitos

### Hardware Mínimo
- **CPU:** 2 cores (4+ recomendado)
- **RAM:** 4GB (8GB+ recomendado)
- **Disco:** 20GB SSD (50GB+ recomendado)
- **Rede:** Conexão estável, IP fixo recomendado

### Sistema Operacional
- Ubuntu Server 22.04 LTS ou 24.04 LTS
- Arquitetura: x86_64 (amd64)
- Acesso root ou sudo

### Portas de Rede
- 22/TCP - SSH (obrigatório)
- 80/TCP - HTTP
- 443/TCP - HTTPS

## Instalação Rápida

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd OrthoPlus-Enterprise

# 2. Configure as variáveis de ambiente
cp .env.ubuntu.example .env
nano .env  # Edite JWT_SECRET, DB_PASSWORD, REDIS_PASSWORD

# 3. Execute o deploy automatizado
chmod +x scripts/deploy-ubuntu.sh
sudo ./scripts/deploy-ubuntu.sh
```

O script irá:
- Atualizar o sistema
- Instalar Docker e Docker Compose
- Configurar firewall UFW
- Gerar secrets de segurança
- Criar estrutura de diretórios em `/opt/orthoplus`
- Iniciar todos os serviços

## Instalação Manual

Se preferir fazer manualmente:

### 1. Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Configurar Ambiente

```bash
# Criar diretórios
sudo mkdir -p /opt/orthoplus/data/postgres
sudo mkdir -p /opt/orthoplus/data/redis
sudo mkdir -p /opt/orthoplus/backups
sudo mkdir -p /opt/orthoplus/config/postgresql

# Copiar arquivos
sudo cp docker-compose.ubuntu.yml /opt/orthoplus/docker-compose.yml
sudo cp .env /opt/orthoplus/.env

# Configurar PostgreSQL
sudo tee /opt/orthoplus/config/postgresql/postgresql.conf > /dev/null <<EOF
listen_addresses = '*'
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB
EOF
```

### 3. Iniciar Serviços

```bash
cd /opt/orthoplus
sudo docker compose up -d
```

## Configuração SSL/TLS

### Com Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com.br

# Renovação automática já configurada
```

### Certificado Próprio

```bash
# Copiar certificados
sudo cp /caminho/certificado.crt /opt/orthoplus/ssl/
sudo cp /caminho/chave-privada.key /opt/orthoplus/ssl/

# Ajustar permissões
sudo chmod 600 /opt/orthoplus/ssl/*.key

# Reiniciar nginx
sudo docker compose restart nginx
```

## Operações Diárias

### Verificar Status

```bash
cd /opt/orthoplus
sudo docker compose ps
sudo docker compose logs -f backend
```

### Backup Manual

```bash
# Executar script de backup
sudo /opt/orthoplus/scripts/backup.sh

# Ou manualmente
docker exec orthoplus-postgres pg_dump -U orthoplus orthoplus > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
# Parar aplicação
sudo docker compose stop backend

# Restaurar backup
docker exec -i orthoplus-postgres psql -U orthoplus orthoplus < backup_20240101.sql

# Reiniciar
sudo docker compose start backend
```

### Atualizar Aplicação

```bash
cd /opt/orthoplus

# Puxar novas imagens
sudo docker compose pull

# Reiniciar serviços
sudo docker compose up -d

# Verificar logs
sudo docker compose logs -f
```

## Troubleshooting

### Container não inicia

```bash
# Verificar logs
sudo docker compose logs backend

# Verificar se porta está em uso
sudo netstat -tlnp | grep 3005
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está saudável
sudo docker compose ps postgres

# Testar conexão manualmente
sudo docker exec -it orthoplus-postgres psql -U orthoplus -d orthoplus -c "SELECT 1;"
```

### Erro de permissão

```bash
# Corrigir permissões
sudo chown -R 1000:1000 /opt/orthoplus/data
sudo chmod 700 /opt/orthoplus/data/postgres
```

### Reset completo (CUIDADO!)

```bash
cd /opt/orthoplus

# Parar e remover containers
sudo docker compose down

# Remover volumes (APAGA TODOS OS DADOS!)
sudo docker compose down -v
sudo rm -rf /opt/orthoplus/data/*

# Recriar tudo
sudo docker compose up -d
```

## Segurança

### Firewall UFW

```bash
# Verificar status
sudo ufw status verbose

# Adicionar regra
sudo ufw allow from 192.168.1.0/24 to any port 5432

# Remover regra
sudo ufw delete allow 5432
```

### Fail2ban

Já instalado e configurado pelo script de deploy.

```bash
# Verificar status
sudo fail2ban-client status

# Ver logs
sudo tail -f /var/log/fail2ban.log
```

## Monitoramento

### Logs

```bash
# Todos os serviços
sudo docker compose logs -f

# Serviço específico
sudo docker compose logs -f backend

# Últimas 100 linhas
sudo docker compose logs --tail 100 backend
```

### Recursos do Sistema

```bash
# Uso de recursos
sudo docker stats

# Uso de disco
df -h

# Uso de memória
free -h
```

## Suporte

Em caso de problemas:

1. Verifique os logs: `sudo docker compose logs`
2. Consulte a documentação técnica
3. Verifique o status dos serviços: `sudo docker compose ps`
4. Verifique recursos do servidor: `htop`, `df -h`

## Referência

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
