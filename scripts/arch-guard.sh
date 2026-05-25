#!/bin/bash
# OrthoPlus Architecture Guard — Script contundente para detectar violações
# Uso: ./scripts/arch-guard.sh [backend|frontend|all]

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET="${1:-all}"
VIOLATIONS=0
WARNINGS=0

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  OrthoPlus Architecture Guard${NC}"
echo -e "${BLUE}  Target: $TARGET${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"

# ─── Backend Checks ───
check_backend() {
  echo -e "\n${BLUE}--- Backend Layer Violations ---${NC}"

  # 1. Controllers acessando Prisma diretamente
  local prisma_in_ctrl
  prisma_in_ctrl=$(find backend/src/modules -path "*/api/*Controller*.ts" -exec grep -l "prisma\." {} \; 2>/dev/null || true)
  if [ -n "$prisma_in_ctrl" ]; then
    echo -e "${RED}[VIOLACAO]${NC} Controllers acessando Prisma diretamente:"
    for f in $prisma_in_ctrl; do
      local count
      count=$(grep -c "prisma\." "$f" || true)
      echo "  -> $f ($count ocorrencias)"
      VIOLATIONS=$((VIOLATIONS + 1))
    done
  else
    echo -e "${GREEN}[OK]${NC} Nenhum controller acessa Prisma diretamente"
  fi

  # 2. Controllers gordos (>300 linhas)
  echo -e "\n${BLUE}--- Fat Controllers (>300 linhas) ---${NC}"
  local fat_ctrl
  fat_ctrl=$(find backend/src/modules -path "*/api/*Controller*.ts" -exec wc -l {} + 2>/dev/null | awk '$1 > 300 {print $1, $2}' || true)
  if [ -n "$fat_ctrl" ]; then
    echo -e "${YELLOW}[ALERTA]${NC} Controllers com >300 linhas:"
    echo "$fat_ctrl" | while read -r lines file; do
      echo "  -> $file ($lines linhas)"
      WARNINGS=$((WARNINGS + 1))
    done
  else
    echo -e "${GREEN}[OK]${NC} Todos os controllers estao enxutos"
  fi

  # 3. Módulos sem repository
  echo -e "\n${BLUE}--- Modules Without Repository Layer ---${NC}"
  local modules_with_repo
  modules_with_repo=$(find backend/src/modules -type d -name "repositories" | wc -l)
  local total_modules
  total_modules=$(find backend/src/modules -maxdepth 1 -type d | wc -l)
  total_modules=$((total_modules - 1))
  local modules_without_repo=$((total_modules - modules_with_repo))
  
  if [ "$modules_without_repo" -gt 0 ]; then
    echo -e "${YELLOW}[ALERTA]${NC} $modules_without_repo de $total_modules modulos sem camada de repository"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}[OK]${NC} Todos os modulos tem repository layer"
  fi

  # 4. Raw SQL fora de database_admin
  echo -e "\n${BLUE}--- Raw SQL Outside database_admin ---${NC}"
  local raw_sql
  raw_sql=$(grep -r "\\\$queryRaw\\\|db\\\.query" backend/src/modules --include="*.ts" | grep -v "database_admin" | grep -v "node_modules" || true)
  if [ -n "$raw_sql" ]; then
    echo -e "${RED}[VIOLACAO]${NC} Raw SQL fora do modulo database_admin:"
    echo "$raw_sql" | head -5 | while read -r line; do
      echo "  -> $line"
      VIOLATIONS=$((VIOLATIONS + 1))
    done
  else
    echo -e "${GREEN}[OK]${NC} Sem raw SQL fora de database_admin"
  fi
}

# ─── Frontend Checks ───
check_frontend() {
  echo -e "\n${BLUE}--- Frontend Layer Violations ---${NC}"

  # 1. API calls inline em page components
  local inline_api
  inline_api=$(grep -r "apiClient\\.\\(get\\|post\\|put\\|delete\\|patch\\)" apps/web/src/modules --include="*.tsx" | grep -E "pages/.*\\.tsx:" | head -10 || true)
  if [ -n "$inline_api" ]; then
    echo -e "${YELLOW}[ALERTA]${NC} API calls inline em page components:"
    echo "$inline_api" | while read -r line; do
      echo "  -> $(echo "$line" | cut -d: -f1)"
      WARNINGS=$((WARNINGS + 1))
    done
  else
    echo -e "${GREEN}[OK]${NC} Nenhuma API call inline em pages"
  fi

  # 2. Components gordos (>300 linhas)
  echo -e "\n${BLUE}--- Fat Components (>300 linhas) ---${NC}"
  local fat_comp
  fat_comp=$(find apps/web/src -name "*.tsx" -exec wc -l {} + 2>/dev/null | awk '$1 > 300 {print $1, $2}' | head -10 || true)
  if [ -n "$fat_comp" ]; then
    echo -e "${YELLOW}[ALERTA]${NC} Componentes com >300 linhas:"
    echo "$fat_comp" | while read -r lines file; do
      echo "  -> $file ($lines linhas)"
      WARNINGS=$((WARNINGS + 1))
    done
  fi

  # 3. Uso de localStorage para tokens (security risk)
  echo -e "\n${BLUE}--- localStorage Token Usage ---${NC}"
  local ls_tokens
  ls_tokens=$(grep -r "localStorage.*[Tt]oken" apps/web/src --include="*.ts" --include="*.tsx" || true)
  if [ -n "$ls_tokens" ]; then
    echo -e "${RED}[VIOLACAO]${NC} Tokens armazenados em localStorage (XSS risk):"
    echo "$ls_tokens" | head -5 | while read -r line; do
      echo "  -> $line"
      VIOLATIONS=$((VIOLATIONS + 1))
    done
  else
    echo -e "${GREEN}[OK]${NC} Sem tokens em localStorage"
  fi
}

# ─── Run ---
if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
  check_backend
fi

if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
  check_frontend
fi

# ─── Summary ───
echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
if [ "$VIOLATIONS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
else
  echo -e "${RED}$VIOLATIONS violation(s)${NC}, ${YELLOW}$WARNINGS warning(s)${NC} found."
  if [ "$VIOLATIONS" -gt 0 ]; then
    echo -e "${RED}Action required: Fix violations before merging.${NC}"
    exit 1
  fi
fi
