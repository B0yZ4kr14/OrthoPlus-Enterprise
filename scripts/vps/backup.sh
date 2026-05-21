#!/bin/bash
# Backup script v2.0 - OrthoPlus Enterprise Hardened
# Aligned with v3 directory structure

BACKUP_DIR="/home/tsi/backups/20260408_120926"
mkdir -p $BACKUP_DIR

echo "[qua 08 abr 2026 12:09:26 -03] Iniciando backup estratégico..."

# 1. Backup PostgreSQL
pg_dump -U orthoplus -d orthoplus > $BACKUP_DIR/database.sql 2>/dev/null || \
    sudo -u postgres pg_dump orthoplus > $BACKUP_DIR/database.sql

# 2. Backup aplicação (Monorepo v3)
tar -czf $BACKUP_DIR/frontend_www.tar.gz -C /var/www orthoplus/
tar -czf $BACKUP_DIR/app_v3_source.tar.gz -C /home/tsi OrthoPlus-Enterprise-v3/

# 3. Backup configurações Nginx
tar -czf $BACKUP_DIR/nginx_configs.tar.gz /etc/nginx/

# 4. Limpar backups antigos (manter últimos 14 - estendido)
ls -t /home/tsi/backups/ | tail -n +15 | xargs -I {} rm -rf /home/tsi/backups/{}

echo "[qua 08 abr 2026 12:09:26 -03] Backup concluído com sucesso em $BACKUP_DIR"
