# AGENTE-POPPER-DEV
# Falsificador — Dominio DevOps

## Hipoteses a Falsificar

### HF-DEV-001: "A imagem orthoplus-frontend:v2.9.9 existe"
Experimento: docker images | grep "orthoplus-frontend"
Previsao: Imagem encontrada com tag v2.9.9
Falsificador: Imagem nao encontrada

### HF-DEV-002: "O container tsiapp-orthoplus esta healthy"
Experimento: docker ps --filter "name=tsiapp-orthoplus" --format "{{.Status}}"
Previsao: Status contem "healthy"
Falsificador: Status nao healthy ou container ausente

### HF-DEV-003: "O container tsiapp-orthoplus-backend esta rodando"
Experimento: docker ps --filter "name=tsiapp-orthoplus-backend" --format "{{.Status}}"
Previsao: Container Up
Falsificador: Container ausente ou Exited

### HF-DEV-004: "O Redis container orthoplus-redis esta rodando"
Experimento: docker ps --filter "name=orthoplus-redis" --format "{{.Status}}"
Previsao: Container Up
Falsificador: Container ausente

### HF-DEV-005: "O frontend responde na porta 8083"
Experimento: curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/
Previsao: 200
Falsificador: != 200

### HF-DEV-006: "O backend responde na porta 3005"
Experimento: curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health
Previsao: 200
Falsificador: != 200
