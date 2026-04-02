#!/bin/bash
# ============================================================================
# MinIO Automated Backup Script
# ============================================================================
# This script creates automated daily backups of MinIO storage buckets
# with retention policy.
#
# Environment Variables:
#   MINIO_ROOT_USER - MinIO root user (default: admin)
#   MINIO_ROOT_PASSWORD - MinIO root password (required)
#   BACKUP_RETENTION_DAYS - Days to keep backups (default: 30)
# ============================================================================

set -e

# Configuration
MINIO_ENDPOINT="http://minio:9000"
MINIO_ALIAS="local"
BACKUP_DIR="/minio-backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== MinIO Backup Started ==="
log "Endpoint: ${MINIO_ENDPOINT}"
log "Timestamp: ${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Configure MinIO client
log "Configuring MinIO client..."
mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" || {
    log "ERROR: Failed to configure MinIO client"
    exit 1
}

# List all buckets
log "Listing buckets..."
BUCKETS=$(mc ls "${MINIO_ALIAS}" | awk '{print $NF}' || echo "")

if [ -z "${BUCKETS}" ]; then
    log "No buckets found to backup"
    exit 0
fi

# Backup each bucket
for BUCKET in ${BUCKETS}; do
    BUCKET_NAME=$(echo "${BUCKET}" | sed 's/\///')
    BUCKET_BACKUP_DIR="${BACKUP_DIR}/${BUCKET_NAME}_${TIMESTAMP}"

    log "Backing up bucket: ${BUCKET_NAME}"

    # Create bucket backup directory
    mkdir -p "${BUCKET_BACKUP_DIR}"

    # Mirror bucket to backup directory
    if mc mirror --quiet "${MINIO_ALIAS}/${BUCKET_NAME}" "${BUCKET_BACKUP_DIR}"; then
        BACKUP_SIZE=$(du -sh "${BUCKET_BACKUP_DIR}" | cut -f1)
        log "✓ Bucket ${BUCKET_NAME} backed up successfully (${BACKUP_SIZE})"

        # Create compressed archive
        cd "${BACKUP_DIR}"
        tar -czf "${BUCKET_NAME}_${TIMESTAMP}.tar.gz" "${BUCKET_NAME}_${TIMESTAMP}"
        rm -rf "${BUCKET_BACKUP_DIR}"
        log "✓ Compressed backup created: ${BUCKET_NAME}_${TIMESTAMP}.tar.gz"
    else
        log "✗ Failed to backup bucket: ${BUCKET_NAME}"
        rm -rf "${BUCKET_BACKUP_DIR}"
    fi
done

# Clean up old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
log "Deleted ${DELETED_COUNT} old backup(s)"

# List current backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "*.tar.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log "Total backups: ${BACKUP_COUNT}"
log "Total size: ${TOTAL_SIZE}"

log "=== MinIO Backup Completed ==="

exit 0
