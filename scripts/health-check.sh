#!/usr/bin/env bash
# =============================================================================
# OrthoPlus — Script de Health Check
# =============================================================================
# Verifica se os serviços essenciais (Backend, PostgreSQL, Redis) estão
# respondendo corretamente.
#
# Uso:
#   ./scripts/health-check.sh
#
# Variáveis de ambiente (opcionais, sobrescrevem os padrões):
#   BACKEND_URL   - URL base do backend (padrão: http://localhost:3005)
#   DB_HOST       - Host do PostgreSQL (padrão: localhost)
#   DB_PORT       - Porta do PostgreSQL (padrão: 5432)
#   DB_USER       - Usuário do PostgreSQL (padrão: orthoplus)
#   DB_NAME       - Nome do banco (padrão: orthoplus)
#   REDIS_HOST    - Host do Redis (padrão: localhost)
#   REDIS_PORT    - Porta do Redis (padrão: 6379)
#
# Retorna código de saída 0 se todos os serviços estiverem saudáveis.
# Retorna código de saída 1 se qualquer serviço falhar.
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

failed_service_count=0

# Configurações (com valores padrão)
BACKEND_URL="${BACKEND_URL:-http://localhost:3005}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-orthoplus}"
DB_NAME="${DB_NAME:-orthoplus}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

print_health_check_banner() {
    echo ""
    echo -e "${BLUE}=========================================================${NC}"
    echo -e "${BLUE}  OrthoPlus — Health Check${NC}"
    echo -e "${BLUE}=========================================================${NC}"
    echo ""
}

log_success() {
    echo -e "  ${GREEN}✔${NC}  $1"
}

log_failure_and_count() {
    echo -e "  ${RED}✘${NC}  $1"
    failed_service_count=$((failed_service_count + 1))
}

print_section_title() {
    echo ""
    echo -e "${BLUE}── $1${NC}"
}

print_health_check_banner

# ─── 1. Backend API ───────────────────────────────────────────────────────────
print_section_title "1. Backend API"

# Tenta /health primeiro, depois /api/health como fallback
backend_health_url="${BACKEND_URL}/health"
backend_http_status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${backend_health_url}" 2>/dev/null || echo "000")

if [ "${backend_http_status_code}" = "200" ]; then
    log_success "Backend respondendo em ${backend_health_url} (HTTP ${backend_http_status_code})"
else
    # Tenta /api/health como fallback
    backend_health_url="${BACKEND_URL}/api/health"
    backend_http_status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${backend_health_url}" 2>/dev/null || echo "000")
    if [ "${backend_http_status_code}" = "200" ]; then
        log_success "Backend respondendo em ${backend_health_url} (HTTP ${backend_http_status_code})"
    else
        log_failure_and_count "Backend NÃO está respondendo. Status HTTP: ${backend_http_status_code}. URL: ${BACKEND_URL}/health"
    fi
fi

# ─── 2. PostgreSQL ────────────────────────────────────────────────────────────
print_section_title "2. PostgreSQL"

if command -v pg_isready &>/dev/null; then
    if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -q 2>/dev/null; then
        log_success "PostgreSQL acessível em ${DB_HOST}:${DB_PORT} (banco: ${DB_NAME})"
    else
        log_failure_and_count "PostgreSQL NÃO está acessível em ${DB_HOST}:${DB_PORT}"
    fi
elif command -v nc &>/dev/null; then
    if nc -z -w 5 "${DB_HOST}" "${DB_PORT}" 2>/dev/null; then
        log_success "PostgreSQL porta ${DB_PORT} acessível em ${DB_HOST} (verificação de porta apenas)"
    else
        log_failure_and_count "PostgreSQL NÃO está acessível em ${DB_HOST}:${DB_PORT}"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  pg_isready e nc não encontrados — pulando verificação do PostgreSQL"
fi

# ─── 3. Redis ─────────────────────────────────────────────────────────────────
print_section_title "3. Redis"

if command -v redis-cli &>/dev/null; then
    redis_ping_response=""
    if [ -n "${REDIS_PASSWORD:-}" ]; then
        redis_ping_response=$(redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" --no-auth-warning PING 2>/dev/null || echo "FAILED")
    else
        redis_ping_response=$(redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" PING 2>/dev/null || echo "FAILED")
    fi

    if [ "${redis_ping_response}" = "PONG" ]; then
        log_success "Redis respondendo em ${REDIS_HOST}:${REDIS_PORT}"
    else
        log_failure_and_count "Redis NÃO está respondendo em ${REDIS_HOST}:${REDIS_PORT} (resposta: ${redis_ping_response})"
    fi
elif command -v nc &>/dev/null; then
    if nc -z -w 5 "${REDIS_HOST}" "${REDIS_PORT}" 2>/dev/null; then
        log_success "Redis porta ${REDIS_PORT} acessível em ${REDIS_HOST} (verificação de porta apenas)"
    else
        log_failure_and_count "Redis NÃO está acessível em ${REDIS_HOST}:${REDIS_PORT}"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  redis-cli e nc não encontrados — pulando verificação do Redis"
fi

# ─── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}  Resumo do Health Check${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

if [ "${failed_service_count}" -eq 0 ]; then
    echo -e "  ${GREEN}✔ Todos os serviços estão saudáveis!${NC}"
    echo ""
    exit 0
else
    echo -e "  ${RED}✘ ${failed_service_count} serviço(s) com falha!${NC}"
    echo ""
    exit 1
fi
