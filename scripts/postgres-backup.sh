#!/bin/bash
# ============================================================================
# PostgreSQL Automated Backup Script
# ============================================================================
# This script creates automated daily backups of the PostgreSQL database
# with retention policy and compression.
#
# Environment Variables:
#   POSTGRES_HOST - PostgreSQL host (default: postgres)
#   POSTGRES_DB - Database name (default: orthoplus)
#   POSTGRES_USER - Database user (default: postgres)
#   POSTGRES_PASSWORD - Database password (required)
#   BACKUP_RETENTION_DAYS - Days to keep backups (default: 30)
# ============================================================================

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-orthoplus}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== PostgreSQL Backup Started ==="
log "Database: ${POSTGRES_DB}"
log "Host: ${POSTGRES_HOST}"
log "Backup file: ${BACKUP_FILE}"

# Check if POSTGRES_PASSWORD is set
if [ -z "${POSTGRES_PASSWORD}" ]; then
    log "ERROR: POSTGRES_PASSWORD environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup with compression
log "Creating backup..."
export PGPASSWORD="${POSTGRES_PASSWORD}"

if pg_dump -h "${POSTGRES_HOST}" \
           -U "${POSTGRES_USER}" \
           -d "${POSTGRES_DB}" \
           --verbose \
           --format=plain \
           --no-owner \
           --no-acl \
           2>&1 | gzip > "${BACKUP_FILE}"; then

    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "✓ Backup completed successfully"
    log "Backup size: ${BACKUP_SIZE}"
else
    log "✗ Backup failed"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Clean up old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
log "Deleted ${DELETED_COUNT} old backup(s)"

# List current backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log "Total backups: ${BACKUP_COUNT}"
log "Total size: ${TOTAL_SIZE}"

log "=== PostgreSQL Backup Completed ==="

# Unset password
unset PGPASSWORD

exit 0
