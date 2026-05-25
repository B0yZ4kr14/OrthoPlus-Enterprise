#!/bin/bash
# OrthoPlus Security Audit — Script contundente
# Uso: ./scripts/speckit-security-audit.sh

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

VIOLATIONS=0
WARNINGS=0

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  OrthoPlus Security Audit${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"

check() {
  local name="$1"
  local pattern="$2"
  local path="$3"
  local severity="$4"
  local results
  results=$(grep -rn "$pattern" "$path" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "node_modules" | grep -v ".specify" | head -20 || true)
  if [ -n "$results" ]; then
    local count
    count=$(echo "$results" | wc -l)
    if [ "$severity" = "critical" ]; then
      echo -e "${RED}[CRITICAL]${NC} $name ($count found):"
      VIOLATIONS=$((VIOLATIONS + 1))
    else
      echo -e "${YELLOW}[WARNING]${NC} $name ($count found):"
      WARNINGS=$((WARNINGS + 1))
    fi
    echo "$results" | head -5
    if [ "$count" -gt 5 ]; then
      echo "  ... and $((count - 5)) more"
    fi
  fi
}

# Critical checks
check "Secrets in code" "password.*=.*['\"]" "backend/src" "critical"
check "Hardcoded API keys" "api[_-]?key.*=.*['\"][a-zA-Z0-9]" "." "critical"
check "JWT secret in code" "jwt.*secret.*=.*['\"]" "." "critical"
check "localStorage token access" "localStorage.*[Tt]oken" "apps/web/src" "critical"
check "eval() usage" "eval(" "." "critical"
check "innerHTML with user data" "innerHTML.*=" "apps/web/src" "critical"

# Warnings
check "Console.log in production" "console\.log" "backend/src" "warning"
check "TODO/FIXME in code" "TODO\|FIXME" "backend/src" "warning"
check "Disabled ESLint rules" "eslint-disable" "apps/web/src" "warning"
check "Disabled auth checks" "//.*auth\|skipAuth\|disableAuth" "backend/src" "warning"

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Security Audit Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
if [ "$VIOLATIONS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}🎉 Security audit passed!${NC}"
else
  echo -e "${RED}$VIOLATIONS critical(s)${NC}, ${YELLOW}$WARNINGS warning(s)${NC} found."
  if [ "$VIOLATIONS" -gt 0 ]; then
    exit 1
  fi
fi
