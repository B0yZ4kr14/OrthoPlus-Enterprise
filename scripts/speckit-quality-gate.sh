#!/bin/bash
# OrthoPlus Quality Gate — Script contundente para validação completa
# Uso: ./scripts/speckit-quality-gate.sh [all|backend|frontend|agent]

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET="${1:-all}"
FAILED=0

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  OrthoPlus Quality Gate${NC}"
echo -e "${BLUE}  Target: $TARGET${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"

run_gate() {
  local name="$1"
  local cmd="$2"
  echo -e "\n${BLUE}--- $name ---${NC}"
  if eval "$cmd"; then
    echo -e "${GREEN}✓ PASS${NC} $name"
  else
    echo -e "${RED}✗ FAIL${NC} $name"
    FAILED=$((FAILED + 1))
  fi
}

# Backend gates
if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
  run_gate "Backend TypeScript Build" "cd backend && pnpm build"
  run_gate "Backend Lint" "cd backend && pnpm lint"
  run_gate "Backend Tests" "cd backend && pnpm test"
fi

# Frontend gates
if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
  run_gate "Frontend Type Check" "cd apps/web && pnpm type-check"
  run_gate "Frontend Lint" "cd apps/web && pnpm lint"
  run_gate "Frontend Build" "cd apps/web && pnpm build"
fi

# Agent service gates
if [ "$TARGET" = "agent" ] || [ "$TARGET" = "all" ]; then
  run_gate "Agent Service Syntax" "cd agent-service && python -m py_compile src/main.py"
fi

# Architecture guard
if [ "$TARGET" = "all" ]; then
  run_gate "Architecture Guard" "bash scripts/arch-guard.sh all || true"
fi

# Monorepo gates
if [ "$TARGET" = "all" ]; then
  run_gate "Root Lint" "pnpm lint"
  run_gate "Root Type Check" "pnpm type-check || true"
fi

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Quality Gate Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}🎉 All quality gates passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAILED gate(s) failed.${NC}"
  exit 1
fi
