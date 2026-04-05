#!/bin/bash
# =============================================================================
# Test Integration: OrthoPlus Backend <> Agno Agent Service
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }

# Configurações
BACKEND_URL="http://localhost:3005"
AGENT_URL="http://localhost:8000"

echo "=========================================="
echo "  Teste de Integração - Agents Module"
echo "=========================================="
echo ""

# =============================================================================
# Teste 1: Verificar se Agent Service está rodando
# =============================================================================
log_info "Teste 1: Verificando Agent Service..."
if curl -s "$AGENT_URL/health" > /dev/null; then
    log_success "Agent Service está rodando"
else
    log_error "Agent Service não está rodando em $AGENT_URL"
    log_info "Inicie com: python src/main.py"
    exit 1
fi

# =============================================================================
# Teste 2: Verificar se Backend está rodando
# =============================================================================
log_info "Teste 2: Verificando Backend..."
if curl -s "$BACKEND_URL/health" > /dev/null; then
    log_success "Backend está rodando"
else
    log_error "Backend não está rodando em $BACKEND_URL"
    log_info "Inicie com: npm run dev"
    exit 1
fi

# =============================================================================
# Teste 3: Health check via Backend
# =============================================================================
log_info "Teste 3: Health check via Backend..."
RESPONSE=$(curl -s "$BACKEND_URL/api/agents/health" 2>/dev/null || echo '{"status":"error"}')

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    log_success "Integração OK - Backend conecta ao Agent Service"
    echo "  Resposta: $RESPONSE" | head -c 200
    echo ""
else
    log_warn "Health check retornou erro"
    echo "  Resposta: $RESPONSE"
fi

echo ""
log_success "Testes de integração concluídos!"
echo ""
echo "Próximos passos:"
echo "  1. Obter token JWT válido"
echo "  2. Testar POST /api/agents/crud/simple"
echo "  3. Testar POST /api/agents/crud"
echo ""
