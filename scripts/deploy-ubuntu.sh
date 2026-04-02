#!/bin/bash
# ============================================================================
# OrthoPlus Enterprise - Deploy Script for Ubuntu Server LTS
# ============================================================================
# Compatível com: Ubuntu Server 22.04 LTS, 24.04 LTS
# Arquitetura: x86_64 (amd64)
#
# USO:
#   chmod +x scripts/deploy-ubuntu.sh
#   sudo ./scripts/deploy-ubuntu.sh
#
# O que este script faz:
#   1. Atualiza o sistema
#   2. Instala Docker e Docker Compose
#   3. Cria estrutura de diretórios
#   4. Configura firewall UFW
#   5. Gera secrets automáticos
#   6. Inicia os serviços
# ============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
INSTALL_DIR="/opt/orthoplus"
DATA_DIR="$INSTALL_DIR/data"
BACKUP_DIR="$INSTALL_DIR/backups"
LOG_DIR="$INSTALL_DIR/logs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Funções de log
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║          OrthoPlus Enterprise - Deploy Ubuntu Server           ║"
    echo "║                     PostgreSQL + Docker                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Verificar root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script precisa ser executado como root (sudo)"
        exit 1
    fi
}

# Verificar sistema operacional
check_os() {
    log_info "Verificando sistema operacional..."
    
    if [[ ! -f /etc/os-release ]]; then
        log_error "Não foi possível detectar o sistema operacional"
        exit 1
    fi
    
    source /etc/os-release
    
    if [[ "$ID" != "ubuntu" ]]; then
        log_error "Este script é projetado para Ubuntu Server. Detectado: $ID"
        exit 1
    fi
    
    if [[ ! "$VERSION_ID" =~ ^(22.04|24.04)$ ]]; then
        log_warn "Versão do Ubuntu não testada: $VERSION_ID. Continuando mesmo assim..."
    fi
    
    log_success "Ubuntu $VERSION_ID detectado"
}

# Atualizar sistema
update_system() {
    log_info "Atualizando sistema..."
    apt-get update -qq
    apt-get upgrade -y -qq
    log_success "Sistema atualizado"
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    apt-get install -y -qq \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        software-properties-common \
        git \
        openssl \
        wget \
        htop \
        ufw \
        fail2ban \
        ncdu \
        tree
    log_success "Dependências instaladas"
}

# Instalar Docker
install_docker() {
    log_info "Instalando Docker..."
    
    if command -v docker &> /dev/null; then
        log_warn "Docker já instalado: $(docker --version)"
        return
    fi
    
    # Adicionar repositório oficial do Docker
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Habilitar serviço Docker
    systemctl enable docker
    systemctl start docker
    
    log_success "Docker instalado: $(docker --version)"
}

# Configurar usuário docker
setup_docker_user() {
    log_info "Configurando permissões Docker..."
    
    # Detectar usuário não-root que executou sudo
    SUDO_USER="${SUDO_USER:-$USER}"
    
    if [[ "$SUDO_USER" != "root" ]]; then
        usermod -aG docker "$SUDO_USER"
        log_success "Usuário $SUDO_USER adicionado ao grupo docker"
        log_warn "Faça logout e login novamente para aplicar as alterações de grupo"
    fi
}

# Criar estrutura de diretórios
create_directories() {
    log_info "Criando estrutura de diretórios..."
    
    mkdir -p \
        "$DATA_DIR/postgres" \
        "$DATA_DIR/redis" \
        "$BACKUP_DIR" \
        "$LOG_DIR" \
        "$INSTALL_DIR/config/postgresql" \
        "$INSTALL_DIR/ssl"
    
    # Permissões
    chown -R 1000:1000 "$DATA_DIR"
    chmod 700 "$DATA_DIR/postgres"
    
    log_success "Diretórios criados em $INSTALL_DIR"
}

# Configurar PostgreSQL
setup_postgresql_config() {
    log_info "Configurando PostgreSQL..."
    
    cat > "$INSTALL_DIR/config/postgresql/postgresql.conf" << 'EOF'
# Configuração otimizada para Ubuntu Server LTS
# OrthoPlus Enterprise v2.0

# Conexões
listen_addresses = '*'
max_connections = 200

# Memória
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# WAL
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Query Planner
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000

# Timezone
timezone = 'America/Sao_Paulo'

# Locale
lc_messages = 'en_US.UTF-8'
lc_monetary = 'pt_BR.UTF-8'
lc_numeric = 'pt_BR.UTF-8'
lc_time = 'pt_BR.UTF-8'
EOF
    
    log_success "Configuração PostgreSQL criada"
}

# Configurar firewall
setup_firewall() {
    log_info "Configurando firewall UFW..."
    
    # Resetar UFW
    ufw --force reset
    
    # Políticas padrão
    ufw default deny incoming
    ufw default allow outgoing
    
    # SSH (essencial!)
    ufw allow 22/tcp comment 'SSH'
    
    # HTTP/HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Habilitar UFW
    ufw --force enable
    
    log_success "Firewall configurado"
    ufw status verbose
}

# Gerar secrets
generate_secrets() {
    log_info "Gerando secrets de segurança..."
    
    JWT_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
    REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
    GRAFANA_PASSWORD=$(openssl rand -base64 16)
    
    # Salvar em arquivo seguro
    cat > "$INSTALL_DIR/.env.secrets" << EOF
# Secrets gerados automaticamente em $(date)
# GUARDE ESTE ARQUIVO EM LOCAL SEGURO!

JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
EOF
    
    chmod 600 "$INSTALL_DIR/.env.secrets"
    
    log_success "Secrets gerados em $INSTALL_DIR/.env.secrets"
    log_warn "GUARDE O ARQUIVO .env.secrets EM LOCAL SEGURO!"
}

# Criar arquivo .env
create_env_file() {
    log_info "Criando arquivo .env..."
    
    source "$INSTALL_DIR/.env.secrets"
    
    cat > "$INSTALL_DIR/.env" << EOF
# OrthoPlus Enterprise - Environment Configuration
# Gerado automaticamente em $(date)

# ============================================================================
# APLICAÇÃO
# ============================================================================
NODE_ENV=production
PORT=3005
LOG_LEVEL=info

# ============================================================================
# SEGURANÇA (CRÍTICO)
# ============================================================================
JWT_SECRET=$JWT_SECRET
AUTH_ALLOW_MOCK=false
ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false

# ============================================================================
# BANCO DE DADOS - POSTGRESQL (ÚNICO SUPORTADO)
# ============================================================================
DB_HOST=postgres
DB_PORT=5432
DB_NAME=orthoplus
DB_USER=orthoplus
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false

# Connection string usada pelo Prisma
DATABASE_URL=postgresql://orthoplus:${DB_PASSWORD}@postgres:5432/orthoplus?schema=public

# ============================================================================
# REDIS
# ============================================================================
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# ============================================================================
# CORS
# ============================================================================
ALLOWED_ORIGINS=http://localhost,https://localhost

# ============================================================================
# FRONTEND
# ============================================================================
VITE_API_BASE_URL=/api

# ============================================================================
# EMAIL (Opcional - configure se tiver serviço de email)
# ============================================================================
# RESEND_API_KEY=

# ============================================================================
# MONITORAMENTO
# ============================================================================
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
EOF
    
    chmod 600 "$INSTALL_DIR/.env"
    
    log_success "Arquivo .env criado em $INSTALL_DIR/.env"
}

# Copiar arquivos do projeto
copy_project_files() {
    log_info "Copiando arquivos do projeto..."
    
    # Criar diretório do projeto
    mkdir -p "$INSTALL_DIR/app"
    
    # Copiar arquivos necessários
    cp "$PROJECT_ROOT/docker-compose.ubuntu.yml" "$INSTALL_DIR/docker-compose.yml"
    cp "$PROJECT_ROOT/nginx.conf" "$INSTALL_DIR/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/backend" "$INSTALL_DIR/app/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/categories" "$INSTALL_DIR/app/" 2>/dev/null || true
    
    # Copiar .env
    cp "$INSTALL_DIR/.env" "$INSTALL_DIR/app/.env"
    
    log_success "Arquivos copiados para $INSTALL_DIR"
}

# Criar script de backup
create_backup_script() {
    log_info "Criando script de backup..."
    
    cat > "$INSTALL_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash
# OrthoPlus Backup Script

set -e

BACKUP_DIR="/opt/orthoplus/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="orthoplus_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

# Backup do PostgreSQL
docker exec orthoplus-postgres pg_dump -U orthoplus orthoplus > "$BACKUP_DIR/$BACKUP_FILE"

# Compactar
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remover backups antigos (manter últimos 7 dias)
find "$BACKUP_DIR" -name "orthoplus_backup_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: $BACKUP_DIR/${BACKUP_FILE}.gz"
EOF
    
    chmod +x "$INSTALL_DIR/scripts/backup.sh"
    
    # Agendar backup diário via cron
    echo "0 2 * * * root /opt/orthoplus/scripts/backup.sh >> /var/log/orthoplus-backup.log 2>&1" > /etc/cron.d/orthoplus-backup
    
    log_success "Script de backup criado e agendado (diário às 2:00)"
}

# Iniciar serviços
start_services() {
    log_info "Iniciando serviços..."
    
    cd "$INSTALL_DIR"
    
    # Verificar se docker compose está disponível
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    # Pull das imagens
    $DOCKER_COMPOSE pull
    
    # Iniciar serviços
    $DOCKER_COMPOSE up -d
    
    log_success "Serviços iniciados"
    
    # Aguardar healthcheck
    log_info "Aguardando serviços ficarem saudáveis..."
    sleep 30
    
    $DOCKER_COMPOSE ps
}

# Mensagem final
print_footer() {
    source "$INSTALL_DIR/.env.secrets"
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    DEPLOY CONCLUÍDO!                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    log_success "OrthoPlus Enterprise instalado em: $INSTALL_DIR"
    echo ""
    echo "Próximos passos:"
    echo "  1. Configure seu domínio apontando para este servidor"
    echo "  2. Configure SSL: certbot --nginx"
    echo "  3. Edite ALLOWED_ORIGINS em $INSTALL_DIR/.env"
    echo "  4. Acesse: http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "Comandos úteis:"
    echo "  cd $INSTALL_DIR"
    echo "  docker compose logs -f"
    echo "  docker compose ps"
    echo "  $INSTALL_DIR/scripts/backup.sh"
    echo ""
    echo "⚠️  IMPORTANTE: Salve os secrets abaixo em local seguro!"
    echo ""
    echo "  JWT_SECRET:     ${JWT_SECRET:0:20}..."
    echo "  DB_PASSWORD:    ${DB_PASSWORD:0:10}..."
    echo "  REDIS_PASSWORD: ${REDIS_PASSWORD:0:10}..."
    echo ""
    echo "Arquivo com todos os secrets: $INSTALL_DIR/.env.secrets"
    echo ""
}

# Main
main() {
    print_header
    check_root
    check_os
    update_system
    install_dependencies
    install_docker
    setup_docker_user
    create_directories
    setup_postgresql_config
    setup_firewall
    generate_secrets
    create_env_file
    copy_project_files
    create_backup_script
    start_services
    print_footer
}

# Executar
main "$@"
