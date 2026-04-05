#!/bin/bash
# =============================================================================
# VPS Hardening Script - OrthoPlus Enterprise
# =============================================================================
# Script para hardening inicial de segurança na VPS
# Execute como root na primeira configuração
# =============================================================================

set -e

echo "=========================================="
echo "OrthoPlus VPS Hardening"
echo "=========================================="
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root"
    exit 1
fi

# 1. Atualizar sistema
echo "🔄 Updating system..."
apt-get update && apt-get upgrade -y

# 2. Instalar ferramentas de segurança
echo "🔧 Installing security tools..."
apt-get install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    logwatch \
    rkhunter \
    chkrootkit

# 3. Configurar Firewall UFW
echo "🛡️  Configuring UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (alterar porta depois se necessário)
ufw allow 22/tcp

# Permitir HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir aplicações (apenas localhost para serviços internos)
ufw allow from 127.0.0.1 to any port 3005  # Backend
ufw allow from 127.0.0.1 to any port 8000  # Agent Service
ufw allow from 127.0.0.1 to any port 5432  # PostgreSQL
ufw allow from 127.0.0.1 to any port 6379  ***REMOVED***

# Habilitar UFW
ufw --force enable

echo "✅ UFW configured"

# 4. Configurar Fail2Ban
echo "🚫 Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban
echo "✅ Fail2Ban configured"

# 5. Configurar auto-updates de segurança
echo "⚙️  Configuring auto-updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

echo "✅ Auto-updates configured"

# 6. Criar usuário para aplicação
echo "👤 Creating application user..."
if ! id "orthoplus" &>/dev/null; then
    useradd -m -s /bin/bash orthoplus
    usermod -aG sudo orthoplus
    echo "✅ User 'orthoplus' created"
else
    echo "✅ User 'orthoplus' already exists"
fi

# 7. Configurar permissões de diretórios
echo "📁 Setting up directory permissions..."
mkdir -p /var/www/orthoplus
mkdir -p /var/backups/orthoplus
chown -R orthoplus:orthoplus /var/www/orthoplus
chown -R orthoplus:orthoplus /var/backups/orthoplus
chmod 750 /var/www/orthoplus
chmod 750 /var/backups/orthoplus

# 8. Configurar SSH (segurança básica)
echo "🔐 Configuring SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Desabilitar login root
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Desabilitar autenticação por senha (após configurar chave!)
# sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

systemctl restart sshd
echo "✅ SSH configured (remember to disable password auth after setting up keys!)"

# 9. Configurar sysctl (kernel hardening)
echo "🐧 Configuring kernel parameters..."
cat >> /etc/sysctl.conf << 'EOF'

# Security settings
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
EOF

sysctl -p
echo "✅ Kernel parameters configured"

# 10. Configurar logrotate
echo "📝 Configuring logrotate..."
cat > /etc/logrotate.d/orthoplus << 'EOF'
/var/www/orthoplus/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 orthoplus orthoplus
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF

echo "✅ Logrotate configured"

echo ""
echo "=========================================="
echo "✅ Hardening completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set up SSH keys for orthoplus user"
echo "2. Copy application files to /var/www/orthoplus"
echo "3. Configure PostgreSQL and Redis"
echo "4. Set up SSL certificates (Let's Encrypt)"
echo "5. Review and customize firewall rules if needed"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Change default passwords"
echo "- Set up regular backups"
echo "- Configure monitoring"
echo "- Test disaster recovery plan"
echo ""
