#!/bin/bash
# OrthoPlus Dependency Check — Script contundente
# Uso: ./scripts/speckit-dependency-check.sh

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  OrthoPlus Dependency Check${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"

# Check pnpm workspace
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo -e "${RED}[MISSING]${NC} pnpm-workspace.yaml"
  exit 1
fi
echo -e "${GREEN}✓${NC} pnpm-workspace.yaml found"

# Check all package.json files exist
for pkg in "package.json" "backend/package.json" "apps/web/package.json" "shared-types/package.json" "agent-service/requirements.txt"; do
  if [ -f "$pkg" ]; then
    echo -e "${GREEN}✓${NC} $pkg found"
  else
    echo -e "${RED}✗${NC} $pkg MISSING"
  fi
done

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[WARNING]${NC} node_modules not found. Run: pnpm install"
fi

# Check for outdated dependencies
echo -e "\n${BLUE}--- Checking for outdated dependencies ---${NC}"
cd backend && pnpm outdated --format list 2>/dev/null || echo "No outdated backend dependencies"
cd ../apps/web && pnpm outdated --format list 2>/dev/null || echo "No outdated frontend dependencies"

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Dependency check complete.${NC}"
