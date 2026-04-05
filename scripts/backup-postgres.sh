#!/bin/bash
# =============================================================================
# PostgreSQL Backup Script - OrthoPlus Enterprise
# =============================================================================
# Backup diário automatizado com retenção de 30 dias
# 
# Crontab: 0 2 * * * /var/www/orthoplus/scripts/backup-postgres.sh
# =============================================================================

set -e

# Configurações
BACKUP_DIR="/var/backups/orthoplus"
DB_NAME="orthoplus"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/orthoplus_${DATE}.sql"
RETENTION_DAYS=30

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Log
LOG_FILE="${BACKUP_DIR}/backup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "=========================================="
echo "Backup started: $(date)"
echo "=========================================="

# Verificar espaço em disco
AVAILABLE_SPACE=$(df -BG "$BACKUP_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    echo "❌ ERROR: Low disk space (${AVAILABLE_SPACE}GB available)"
    exit 1
fi

# Realizar backup
echo "📦 Creating backup..."
if pg_dump -U "$DB_USER" -d "$DB_NAME" -F p -f "$BACKUP_FILE"; then
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Comprimir backup
    echo "🗜️  Compressing backup..."
    gzip "$BACKUP_FILE"
    echo "✅ Compressed: ${BACKUP_FILE}.gz"
    
    # Verificar integridade
    echo "🔍 Verifying backup..."
    if gunzip -t "${BACKUP_FILE}.gz" 2>/dev/null; then
        echo "✅ Backup integrity verified"
    else
        echo "❌ ERROR: Backup corruption detected"
        exit 1
    fi
    
    # Calcular tamanho
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
else
    echo "❌ ERROR: Backup failed"
    exit 1
fi

# Remover backups antigos
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "orthoplus_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Removed backups older than $RETENTION_DAYS days"

# Listar backups existentes
echo ""
echo "📋 Current backups:"
ls -lh "$BACKUP_DIR"/orthoplus_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo "=========================================="
echo "Backup completed: $(date)"
echo "=========================================="
