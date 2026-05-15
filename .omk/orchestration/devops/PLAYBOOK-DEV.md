# PLAYBOOK-DEV.md
# Procedimentos do Dominio DevOps

## Comandos Padrao

### Verificar Imagens Docker
docker images | grep orthoplus

### Verificar Containers
docker ps --filter "name=orthoplus" --format "{{.Names}}|{{.Image}}|{{.Status}}"

### Verificar Health Frontend
docker inspect --format='{{.State.Health.Status}}' tsiapp-orthoplus

### Verificar Health Backend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health

### Verificar Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/

### Verificar Nginx Config
cat /etc/nginx/sites-enabled/tsiapp-https 2>/dev/null || echo "nginx config nao acessivel"

### Verificar Redis
redis-cli -h localhost -p 6379 ping 2>/dev/null || docker exec orthoplus-redis redis-cli ping
