#!/usr/bin/env bash
# =============================================================================
# OrthoPlus — Script de Validação de Produção
# =============================================================================
# Verifica se as variáveis de ambiente e configurações essenciais estão
# corretas antes de realizar o deploy em produção.
#
# Uso:
#   ./scripts/validate-production.sh
#
# Retorna código de saída 0 se todas as verificações passarem.
# Retorna código de saída 1 se qualquer verificação falhar.
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

critical_violation_count=0
warning_violation_count=0

print_validation_banner() {
    echo ""
    echo -e "${BLUE}=========================================================${NC}"
    echo -e "${BLUE}  OrthoPlus — Validação de Produção${NC}"
    echo -e "${BLUE}=========================================================${NC}"
    echo ""
}

log_success() {
    echo -e "  ${GREEN}✔${NC}  $1"
}

log_warning_and_count() {
    echo -e "  ${YELLOW}⚠${NC}  $1"
    warning_violation_count=$((warning_violation_count + 1))
}

log_critical_error_and_count() {
    echo -e "  ${RED}✘${NC}  $1"
    critical_violation_count=$((critical_violation_count + 1))
}

print_section_title() {
    echo ""
    echo -e "${BLUE}── $1${NC}"
}

# Carrega .env.production se existir (para validação local)
if [ -f ".env.production" ]; then
    # shellcheck disable=SC1091
    set -o allexport
    source .env.production
    set +o allexport
    echo -e "${YELLOW}  ℹ  Carregando variáveis de .env.production${NC}"
fi

print_validation_banner

# ─── 1. Variáveis de Segurança Críticas ──────────────────────────────────────
print_section_title "1. Variáveis de Segurança Críticas"

# AUTH_ALLOW_MOCK deve ser false
if [ "${AUTH_ALLOW_MOCK:-}" = "true" ]; then
    log_critical_error_and_count "AUTH_ALLOW_MOCK=true — BLOQUEADOR CRÍTICO: autenticação mock ativa em produção!"
else
    log_success "AUTH_ALLOW_MOCK não é 'true' (${AUTH_ALLOW_MOCK:-não definido})"
fi

# ENABLE_DANGEROUS_ADMIN_ENDPOINTS deve ser false
if [ "${ENABLE_DANGEROUS_ADMIN_ENDPOINTS:-}" = "true" ]; then
    log_critical_error_and_count "ENABLE_DANGEROUS_ADMIN_ENDPOINTS=true — BLOQUEADOR CRÍTICO: endpoints perigosos ativos!"
else
    log_success "ENABLE_DANGEROUS_ADMIN_ENDPOINTS não é 'true' (${ENABLE_DANGEROUS_ADMIN_ENDPOINTS:-não definido})"
fi

# ─── 2. JWT_SECRET ───────────────────────────────────────────────────────────
print_section_title "2. JWT Secret"

if [ -z "${JWT_SECRET:-}" ]; then
    log_critical_error_and_count "JWT_SECRET não está definido!"
elif [ "${#JWT_SECRET}" -lt 32 ]; then
    log_critical_error_and_count "JWT_SECRET tem comprimento insuficiente (${#JWT_SECRET} chars). Mínimo: 32 chars. Gere com: openssl rand -base64 32"
elif echo "${JWT_SECRET}" | grep -qE "^(changeme|secret|password|default|test|dev|example)"; then
    log_critical_error_and_count "JWT_SECRET parece ser um valor padrão inseguro. Gere com: openssl rand -base64 32"
else
    log_success "JWT_SECRET está definido com comprimento adequado (${#JWT_SECRET} chars)"
fi

# ─── 3. Banco de Dados ───────────────────────────────────────────────────────
print_section_title "3. Banco de Dados"

if [ "${DB_SSL:-}" != "true" ]; then
    log_critical_error_and_count "DB_SSL não é 'true' (atual: '${DB_SSL:-não definido}'). Conexão sem SSL é insegura em produção!"
else
    log_success "DB_SSL=true — conexão SSL habilitada"
fi

if [ -z "${DATABASE_URL:-}" ]; then
    log_critical_error_and_count "DATABASE_URL não está definido!"
elif echo "${DATABASE_URL}" | grep -q "sslmode=require"; then
    log_success "DATABASE_URL contém sslmode=require"
else
    log_warning_and_count "DATABASE_URL não contém sslmode=require — considere adicionar para garantir SSL"
fi

# ─── 4. Redis ────────────────────────────────────────────────────────────────
print_section_title "4. Redis"

if [ -z "${REDIS_PASSWORD:-}" ]; then
    log_critical_error_and_count "REDIS_PASSWORD não está definido! Redis sem senha é um vetor de ataque."
elif [ "${#REDIS_PASSWORD}" -lt 16 ]; then
    log_warning_and_count "REDIS_PASSWORD tem comprimento baixo (${#REDIS_PASSWORD} chars). Recomendado: mínimo 16 chars."
else
    log_success "REDIS_PASSWORD está definido com comprimento adequado"
fi

# ─── 5. CORS ─────────────────────────────────────────────────────────────────
print_section_title "5. CORS e Origens Permitidas"

if [ -z "${ALLOWED_ORIGINS:-}" ]; then
    log_critical_error_and_count "ALLOWED_ORIGINS não está definido!"
elif [ "${ALLOWED_ORIGINS}" = "*" ]; then
    log_critical_error_and_count "ALLOWED_ORIGINS='*' — BLOQUEADOR CRÍTICO: CORS aberto para todas as origens!"
elif echo "${ALLOWED_ORIGINS}" | grep -q "localhost"; then
    log_warning_and_count "ALLOWED_ORIGINS contém 'localhost' — remova em produção real"
else
    log_success "ALLOWED_ORIGINS configurado: ${ALLOWED_ORIGINS}"
fi

# ─── 6. Porta do Backend ─────────────────────────────────────────────────────
print_section_title "6. Consistência de Porta"

required_production_port=3005
configured_env_port="${PORT:-}"

if [ -z "${configured_env_port}" ]; then
    log_warning_and_count "PORT não está definido — usará padrão do aplicativo"
elif [ "${configured_env_port}" != "${required_production_port}" ]; then
    log_critical_error_and_count "PORT=${configured_env_port} mas nginx.conf e docker-compose.prod.yml esperam porta ${required_production_port}"
else
    log_success "PORT=${configured_env_port} — consistente com nginx.conf"
fi

# ─── 7. NODE_ENV ─────────────────────────────────────────────────────────────
print_section_title "7. Ambiente"

if [ "${NODE_ENV:-}" != "production" ]; then
    log_critical_error_and_count "NODE_ENV='${NODE_ENV:-não definido}' — deve ser 'production' em produção!"
else
    log_success "NODE_ENV=production"
fi

# ─── Resumo ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}  Resumo da Validação${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

if [ "${critical_violation_count}" -gt 0 ]; then
    echo -e "  ${RED}✘ ${critical_violation_count} erro(s) crítico(s) encontrado(s)${NC}"
fi

if [ "${warning_violation_count}" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ ${warning_violation_count} aviso(s) encontrado(s)${NC}"
fi

if [ "${critical_violation_count}" -eq 0 ] && [ "${warning_violation_count}" -eq 0 ]; then
    echo -e "  ${GREEN}✔ Todas as verificações passaram! Sistema pronto para produção.${NC}"
    echo ""
    exit 0
elif [ "${critical_violation_count}" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠ Avisos encontrados. Revise antes do deploy.${NC}"
    echo ""
    exit 0
else
    echo -e "  ${RED}✘ Corrija os erros críticos antes de fazer o deploy em produção!${NC}"
    echo ""
    exit 1
fi
