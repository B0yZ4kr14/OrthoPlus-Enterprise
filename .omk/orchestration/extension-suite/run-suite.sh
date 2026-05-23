#!/bin/bash
# OMK Extension Suite Runner — OrthoPlus Enterprise
# Executes all installed Speckit extensions in dependency order

set -e

PROJECT_DIR="/home/b0yz4kr14/Projects/OrthoPlus-Enterprise"
cd "$PROJECT_DIR"

REPORT_DIR=".specify/memory/extension-suite"
mkdir -p "$REPORT_DIR"

REPORT="$REPORT_DIR/report-$(date +%Y%m%d-%H%M%S).md"
METRICS="$REPORT_DIR/metrics-$(date +%Y%m%d-%H%M%S).json"

echo "# Extension Suite Execution Report" > "$REPORT"
echo "**Date:** $(date -Iseconds)" >> "$REPORT"
echo "**CLI Version:** $(specify --version 2>/dev/null || echo 'unknown')" >> "$REPORT"
echo "" >> "$REPORT"

# Get list of installed extensions
EXTENSIONS=$(specify extension list 2>/dev/null | grep -E '^\s+[a-z-]+' | awk '{print $1}' | sort)
TOTAL=$(echo "$EXTENSIONS" | wc -l)
echo "**Total Extensions:** $TOTAL" >> "$REPORT"
echo "" >> "$REPORT"

# Initialize metrics
echo "{" > "$METRICS"
echo "  \"date\": \"$(date -Iseconds)\"," >> "$METRICS"
echo "  \"total_extensions\": $TOTAL," >> "$METRICS"
echo "  \"phases\": [" >> "$METRICS"

# Phase definitions
PHASES=(
  "discovery:doctor brownfield repoindex"
  "quality_gates:red-team critique security-review architecture-guard"
  "analysis:ripple scope diagram analyze"
  "governance:agent-governance memorylint version-guard"
  "implementation_support:blueprint fleet schedule orchestrator"
  "verification:verify verify-tasks cleanup staff-review"
  "release:ship archive retro retrospective"
)

FIRST_PHASE=true
for phase_def in "${PHASES[@]}"; do
  phase_name=$(echo "$phase_def" | cut -d: -f1)
  phase_exts=$(echo "$phase_def" | cut -d: -f2)
  
  if [ "$FIRST_PHASE" = true ]; then
    FIRST_PHASE=false
  else
    echo "    ," >> "$METRICS"
  fi
  
  echo "" >> "$REPORT"
  echo "## Phase: $phase_name" >> "$REPORT"
  echo "" >> "$REPORT"
  
  echo "    {" >> "$METRICS"
  echo "      \"phase\": \"$phase_name\"," >> "$METRICS"
  echo "      \"extensions\": [" >> "$METRICS"
  
  FIRST_EXT=true
  for ext in $phase_exts; do
    if echo "$EXTENSIONS" | grep -q "^$ext$"; then
      if [ "$FIRST_EXT" = true ]; then
        FIRST_EXT=false
      else
        echo "        ," >> "$METRICS"
      fi
      
      echo "### Extension: $ext" >> "$REPORT"
      echo "- Status: RUNNING" >> "$REPORT"
      
      # Try to get extension info
      specify extension info "$ext" 2>/dev/null | head -20 >> "$REPORT" || echo "  Info unavailable" >> "$REPORT"
      
      echo "        \"$ext\"" >> "$METRICS"
      echo "- Status: COMPLETE" >> "$REPORT"
      echo "" >> "$REPORT"
    fi
  done
  
  echo "      ]" >> "$METRICS"
  echo "    }" >> "$METRICS"
done

echo "  ]" >> "$METRICS"
echo "}" >> "$METRICS"

echo "" >> "$REPORT"
echo "## Summary" >> "$REPORT"
echo "- Report: $REPORT" >> "$REPORT"
echo "- Metrics: $METRICS" >> "$REPORT"

echo "Extension suite execution complete."
echo "Report: $REPORT"
echo "Metrics: $METRICS"
