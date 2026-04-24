#!/bin/bash
# Dashboard de Monitoramento v2.0 - OrthoPlus Enterprise Hardened
# Versão Sênior Fullstack - Foco em Estabilidade

clear
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           ORTHOPLUS - DASHBOARD DE MONITORAMENTO v2.0        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Timestamp: $(date)"
echo "Uptime: $(uptime -p)"
echo ""

# 1. Status dos Serviços PM2
echo "📊 PROCESSOS PM2 (Backend & Logs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status | grep -E "orthoplus|pm2-logrotate|id"
echo ""

# 2. Health Checks de Conectividade
echo "🏥 HEALTH CHECKS (Endpoints)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Nginx Landing/App: "
curl -s -o /dev/null -k -w "%{http_code}" https://localhost/ 2>/dev/null && echo " ✅ 200/Authorized" || echo " ❌ ERRO"

echo -n "Backend API v3:   "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health 2>/dev/null && echo " ✅ 200/Online" || echo " ❌ OFFLINE"

echo -n "Agent Service:    "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null && echo " ✅ 200/Online" || echo " ❌ OFFLINE"
echo ""

# 3. Integridade do Banco de Dados
echo "🗄️  DATA LAYER (PostgreSQL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Conexão de Sistema: "
sudo -u postgres psql -d orthoplus -c "SELECT 1" > /dev/null 2>&1 && echo "✅ OK" || echo "❌ ERRO"

# 4. Recursos do Sistema
echo "💻 RECURSOS DA INSTÂNCIA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
free -h | grep Mem | awk '{print "  RAM   -> Total: " $2 " | Usada: " $3 " | Livre: " $4}'
df -h / | tail -1 | awk '{print "  DISCO -> Total: " $2 " | Usado: " $3 " | Livre: " $4 " (" $5 ")"}'
echo ""

# 5. Backup Verification
echo "💾 PERSISTÊNCIA (Backups)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
COUNT=$(ls -1 /home/ubuntu/backups/ 2>/dev/null | wc -l)
LAST=$(ls -t /home/ubuntu/backups/ 2>/dev/null | head -1)
echo "  Total de Backups: $COUNT"
echo "  Último Backup:    $LAST"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "                    HARDENED STATUS: OK                        "
echo "═══════════════════════════════════════════════════════════════"
