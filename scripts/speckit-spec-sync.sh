#!/bin/bash
# OrthoPlus Spec Sync — Script contundente para sincronizar specs com código
# Uso: ./scripts/speckit-spec-sync.sh

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  OrthoPlus Spec Sync${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"

# Check specs structure
SPECS_DIR="specs"
if [ ! -d "$SPECS_DIR" ]; then
  echo -e "${RED}[MISSING]${NC} specs/ directory"
  exit 1
fi

# Count features
TOTAL=$(find "$SPECS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)
COMPLETE=0
INCOMPLETE=0

echo -e "\n${BLUE}--- Feature Spec Status ---${NC}"
for d in "$SPECS_DIR"/*/; do
  name=$(basename "$d")
  has_spec=0; has_plan=0; has_tasks=0
  [ -f "$d/spec.md" ] && has_spec=1
  [ -f "$d/plan.md" ] && has_plan=1
  [ -f "$d/tasks.md" ] && has_tasks=1
  
  if [ "$has_spec" -eq 1 ] && [ "$has_plan" -eq 1 ] && [ "$has_tasks" -eq 1 ]; then
    echo -e "${GREEN}✓${NC} $name: spec plan tasks"
    COMPLETE=$((COMPLETE + 1))
  else
    echo -e "${RED}✗${NC} $name: spec=$has_spec plan=$has_plan tasks=$has_tasks"
    INCOMPLETE=$((INCOMPLETE + 1))
  fi
done

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Spec Sync Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "Total features: $TOTAL"
echo -e "${GREEN}Complete: $COMPLETE${NC}"
echo -e "${RED}Incomplete: $INCOMPLETE${NC}"

if [ "$INCOMPLETE" -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}🎉 All specs synced!${NC}"
fi
