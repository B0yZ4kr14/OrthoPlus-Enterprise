# OrthoPlus Self-Hosted Deployment Guide
## Ubuntu 22.04/24.04 LTS - Private Infrastructure

**Classification:** Production Deployment Guide
**Date:** 2026-03-17
**Target:** Ubuntu Server 22.04/24.04 LTS (CLI-only)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Security Hardening](#security-hardening)
5. [Backup Configuration](#backup-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [Maintenance](#maintenance)

---

## Prerequisites

### Required Knowledge
- Basic Linux command-line operations
- Understanding of Docker and Docker Compose
- PostgreSQL administration basics
- Nginx/web server configuration
- SSL/TLS certificate management

### Access Requirements
- Root or sudo access to Ubuntu server
- Static IP address or domain name
- Ports 80, 443, 5432, 6379, 9000, 9001 available

---

## System Requirements

### Minimum Requirements (Small Clinic: <100 patients)
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 100 GB SSD
- **Network:** 10 Mbps

### Recommended Requirements (Medium Clinic: 100-500 patients)
- **CPU:** 8 cores
- **RAM:** 16 GB
- **Storage:** 500 GB NVMe SSD
- **Network:** 100 Mbps

### Enterprise Requirements (Large Clinic: >500 patients)
- **CPU:** 16+ cores
- **RAM:** 32+ GB
- **Storage:** 1+ TB NVMe SSD (RAID 10 recommended)
- **Network:** 1 Gbps
- **Backup Storage:** External NAS or separate backup server

---

## Installation Steps

### Step 1: Update System

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git ufw fail2ban certbot
```

### Step 2: Install Docker Engine

```bash
# Remove old Docker versions
sudo apt remove -y docker docker-engine docker.io containerd runc

# Install Docker prerequisites
sudo apt install -y ca-certificates gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 3: Clone OrthoPlus Repository

```bash
# Create application directory
sudo mkdir -p /opt/orthoplus
sudo chown $USER:$USER /opt/orthoplus
cd /opt/orthoplus

# Clone repository (replace with your repository URL)
git clone https://github.com/B0yZ4kr14/OrthoPlus-ModularDB.git .
```

### Step 4: Configure Environment Variables

```bash
# Create production environment file
cp backend/.env.example backend/.env

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Generate secure PostgreSQL password
POSTGRES_PASSWORD=$(openssl rand -base64 24)

# Generate secure MinIO credentials
MINIO_ROOT_USER="orthoplus_admin"
MINIO_ROOT_PASSWORD=$(openssl rand -base64 24)

# Edit .env file
nano backend/.env
```

**Critical Environment Variables:**

```bash
# JWT Authentication (REQUIRED)
JWT_SECRET=<generated-jwt-secret>

# PostgreSQL Connection (REQUIRED)
DB_HOST=postgres
DB_NAME=orthoplus
DB_USER=postgres
DB_PASSWORD=<generated-postgres-password>
DB_PORT=5432
DB_SSL=true

# Redis Connection
REDIS_URL=redis://redis:6379

# MinIO Storage
STORAGE_ENDPOINT=minio:9000
STORAGE_ACCESS_KEY=<minio-root-user>
STORAGE_SECRET_KEY=<minio-root-password>
STORAGE_USE_SSL=false

# Security Flags (CRITICAL)
AUTH_ALLOW_MOCK=false
ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false
NODE_ENV=production
```

### Step 5: Create Docker Compose Override (Optional)

```bash
# Create docker-compose.override.yml for production-specific settings
cat > docker-compose.override.yml <<EOF
version: '3.8'

services:
  postgres:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

  backend:
    environment:
      - JWT_SECRET=${JWT_SECRET}

  minio:
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
EOF
```

### Step 6: Launch Stack

```bash
# Use the on-premise configuration
docker compose -f docker-compose.onprem.yml up -d

# View logs
docker compose -f docker-compose.onprem.yml logs -f

# Check service status
docker compose -f docker-compose.onprem.yml ps
```

---

## Security Hardening

### UFW (Uncomplicated Firewall) Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (adjust port if changed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access to internal services (only allow from localhost)
sudo ufw deny 5432/tcp    # PostgreSQL
sudo ufw deny 6379/tcp    # Redis
sudo ufw deny 9000/tcp    # MinIO (optional: allow for admin access)

# Check status
sudo ufw status verbose
```

### Fail2ban Configuration

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Create local configuration
sudo cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 7200
EOF

# Restart Fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### SSL/TLS Configuration with Certbot

```bash
# Install Certbot for Nginx
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate (replace with your domain)
sudo certbot --nginx -d orthoplus.example.com -d www.orthoplus.example.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal (already configured via systemd timer)
sudo systemctl status certbot.timer
```

### Generate Diffie-Hellman Parameters

```bash
# Generate strong DH parameters (takes ~5-10 minutes)
sudo mkdir -p /opt/orthoplus/nginx
sudo openssl dhparam -out /opt/orthoplus/nginx/dhparam.pem 4096
```

---

## Backup Configuration

### Automated Backup Verification

The `docker-compose.onprem.yml` includes automated backup services:

- **PostgreSQL Backups:** Daily at 2:00 AM (30-day retention)
- **MinIO Backups:** Daily at 3:00 AM (30-day retention)

Verify backups are running:

```bash
# Check backup logs
docker compose -f docker-compose.onprem.yml logs postgres-backup
docker compose -f docker-compose.onprem.yml logs minio-backup

# List backup files
docker exec orthoplus-postgres ls -lh /backups
docker exec orthoplus-minio-backup ls -lh /minio-backups
```

### Manual Backup

```bash
# PostgreSQL manual backup
docker exec orthoplus-postgres /backup.sh

# Restore from backup
gunzip -c /path/to/backup.sql.gz | \
  docker exec -i orthoplus-postgres psql -U postgres -d orthoplus
```

### Off-site Backup Configuration

```bash
# Install rsync
sudo apt install -y rsync

# Create backup sync script
cat > /opt/orthoplus/scripts/offsite-sync.sh <<'EOF'
#!/bin/bash
REMOTE_HOST="backup.example.com"
REMOTE_USER="backup_user"
REMOTE_PATH="/backup/orthoplus"

rsync -avz --progress \
  /var/lib/docker/volumes/orthoplus_postgres_backups/_data/ \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/postgres/

rsync -avz --progress \
  /var/lib/docker/volumes/orthoplus_minio_backups/_data/ \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/minio/
EOF

chmod +x /opt/orthoplus/scripts/offsite-sync.sh

# Add to crontab (daily at 4:00 AM)
echo "0 4 * * * /opt/orthoplus/scripts/offsite-sync.sh" | crontab -
```

---

## Monitoring Setup

### Health Check Endpoints

- **Backend Health:** `http://localhost:3333/health`
- **MinIO Health:** `http://localhost:9000/minio/health/live`
- **System Metrics:** `http://localhost:9100/metrics` (Prometheus format)

### Log Monitoring

```bash
# View all service logs
docker compose -f docker-compose.onprem.yml logs -f

# View specific service logs
docker compose -f docker-compose.onprem.yml logs -f backend
docker compose -f docker-compose.onprem.yml logs -f postgres

# Export logs for analysis
docker compose -f docker-compose.onprem.yml logs --no-color > orthoplus_logs_$(date +%Y%m%d).txt
```

### Resource Monitoring

```bash
# Monitor container resource usage
docker stats

# Check disk usage
df -h
du -sh /var/lib/docker/volumes/orthoplus_*
```

---

## Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks

```bash
# 1. Check service health
docker compose -f docker-compose.onprem.yml ps
docker compose -f docker-compose.onprem.yml logs --tail=100

# 2. Verify backups
docker exec orthoplus-postgres ls -lh /backups

# 3. Update system packages
sudo apt update && sudo apt upgrade -y
```

#### Monthly Tasks

```bash
# 1. Rotate JWT secret (requires user re-authentication)
# Only do this if security breach suspected

# 2. Review and clean up old logs
docker system prune -f

# 3. Verify SSL certificate status
sudo certbot certificates

# 4. Review fail2ban blocked IPs
sudo fail2ban-client status nginx-limit-req
```

### Updating OrthoPlus

```bash
# 1. Pull latest changes
cd /opt/orthoplus
git pull origin main

# 2. Backup current state
docker compose -f docker-compose.onprem.yml exec postgres /backup.sh

# 3. Rebuild and restart services
docker compose -f docker-compose.onprem.yml down
docker compose -f docker-compose.onprem.yml build --no-cache
docker compose -f docker-compose.onprem.yml up -d

# 4. Verify services
docker compose -f docker-compose.onprem.yml ps
```

### Disaster Recovery

```bash
# 1. Stop all services
docker compose -f docker-compose.onprem.yml down

# 2. Restore PostgreSQL data
docker volume create orthoplus_postgres_data
gunzip -c /path/to/backup.sql.gz | \
  docker run --rm -i \
  -v orthoplus_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine psql -U postgres -d orthoplus

# 3. Restore MinIO data
docker volume create orthoplus_minio_data
tar -xzf /path/to/minio_backup.tar.gz -C /var/lib/docker/volumes/orthoplus_minio_data/_data/

# 4. Restart services
docker compose -f docker-compose.onprem.yml up -d
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
docker compose -f docker-compose.onprem.yml ps

# View detailed logs
docker compose -f docker-compose.onprem.yml logs <service-name>

# Restart specific service
docker compose -f docker-compose.onprem.yml restart <service-name>
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec orthoplus-postgres psql -U postgres -d orthoplus -c "SELECT 1;"

# Check PostgreSQL logs
docker logs orthoplus-postgres
```

### Storage Issues

```bash
# Check MinIO status
docker exec orthoplus-minio mc admin info local

# List buckets
docker exec orthoplus-minio mc ls local
```

---

## Support and Documentation

- **GitHub Repository:** https://github.com/B0yZ4kr14/OrthoPlus-ModularDB
- **Security Analysis:** `docs/SECURITY_ANALYSIS_2026-03-17.md`
- **Technical Debt:** `docs/TECHNICAL_DEBT.md`
- **Baseline Validation:** `docs/BASELINE_TECNICA_E_FONTE_DE_VERDADE.md`

---

**Last Updated:** 2026-03-17
**Maintained By:** TSI Telecom
