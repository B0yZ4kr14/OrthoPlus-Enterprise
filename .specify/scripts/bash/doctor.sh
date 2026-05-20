#!/bin/bash
set -e

# =============================================================================
# doctor.sh — Spec-Kit Project Health Diagnostic
# Verifica: estrutura, agents, features, scripts, extensions, git status
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_ok() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
log_err() { echo -e "${RED}✗${NC} $1"; ((ERRORS++)); }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }

section() {
  echo ""
  echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
}

# --- 1. PROJECT STRUCTURE ---
section "1. Project Structure"

for d in .specify specs .specify/scripts .specify/templates .specify/memory; do
  if [ -d "$d" ]; then
    log_ok "Directory: $d"
  else
    log_err "Missing directory: $d"
  fi
done

if [ -f ".specify/memory/constitution.md" ]; then
  log_ok "constitution.md"
else
  log_err "Missing: .specify/memory/constitution.md"
fi

# --- 2. AI AGENT CONFIGURATION ---
section "2. AI Agent Configuration"

AGENT_COUNT=0
for d in .claude .cursor .kimi .agents; do
  if [ -d "$d" ]; then
    log_ok "Agent dir: $d"
    ((AGENT_COUNT++))
  else
    log_warn "Missing agent dir: $d"
  fi
done
log_info "Total agent directories: $AGENT_COUNT"

# --- 3. FEATURE SPECIFICATIONS ---
section "3. Feature Specifications"

FEATURE_COUNT=0
COMPLETE_FEATURES=0
INCOMPLETE_FEATURES=0

for f in specs/*/; do
  [ -d "$f" ] || continue
  name=$(basename "$f")
  spec="${f}spec.md"
  plan="${f}plan.md"
  tasks="${f}tasks.md"

  has_spec=""; has_plan=""; has_tasks=""
  [ -f "$spec" ] && has_spec="✓" || has_spec="✗"
  [ -f "$plan" ] && has_plan="✓" || has_plan="✗"
  [ -f "$tasks" ] && has_tasks="✓" || has_tasks="✗"

  if [ -f "$spec" ] && [ -f "$plan" ] && [ -f "$tasks" ]; then
    log_ok "$name: spec=$has_spec plan=$has_plan tasks=$has_tasks"
    ((COMPLETE_FEATURES++))
  else
    log_err "$name: spec=$has_spec plan=$has_plan tasks=$has_tasks"
    ((INCOMPLETE_FEATURES++))
  fi
  ((FEATURE_COUNT++))
done

log_info "Features: $FEATURE_COUNT total, $COMPLETE_FEATURES complete, $INCOMPLETE_FEATURES incomplete"

# --- 4. SCRIPTS HEALTH ---
section "4. Scripts Health"

SCRIPT_COUNT=0
NON_EXEC=0

for s in .specify/scripts/bash/*.sh; do
  [ -f "$s" ] || continue
  name=$(basename "$s")
  if [ -x "$s" ]; then
    log_ok "$name (executable)"
  else
    log_warn "$name (not executable)"
    ((NON_EXEC++))
  fi
  ((SCRIPT_COUNT++))
done

log_info "Bash scripts: $SCRIPT_COUNT total, $NON_EXEC non-executable"

# --- 5. EXTENSIONS HEALTH ---
section "5. Extensions Health"

if [ -f ".specify/extensions.yml" ]; then
  log_ok "extensions.yml present"
  INSTALLED=$(grep -c '^\s*-\s*\w' .specify/extensions.yml 2>/dev/null || echo 0)
  log_info "Extensions installed: ~$INSTALLED"
else
  log_err "Missing: .specify/extensions.yml"
fi

# --- 6. GIT STATUS ---
section "6. Git Status"

if git rev-parse --git-dir >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  log_ok "Git repository on branch: $BRANCH"

  UNCOMMITTED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNCOMMITTED" -gt 0 ]; then
    log_warn "$UNCOMMITTED uncommitted file(s)"
    git status --short | head -10
  else
    log_ok "Working tree clean"
  fi

  UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNTRACKED" -gt 0 ]; then
    log_warn "$UNTRACKED untracked file(s)"
  else
    log_ok "No untracked files"
  fi
else
  log_err "Not a git repository"
fi

# --- SUMMARY ---
section "Summary"

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠ $WARNINGS warning(s) found.${NC}"
else
  echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s) found.${NC}"
fi

exit $ERRORS
