#!/bin/bash
# OMK Extension Suite Execution — OrthoPlus Enterprise
# Runs all installed extensions in dependency order

set -e

PROJECT_DIR="/home/b0yz4kr14/Projects/OrthoPlus-Enterprise"
cd "$PROJECT_DIR"

REPORT_DIR=".specify/memory/extension-suite"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT="$REPORT_DIR/execution-report-$TIMESTAMP.md"
METRICS="$REPORT_DIR/execution-metrics-$TIMESTAMP.json"

echo "# Extension Suite Execution Report" > "$REPORT"
echo "**Date:** $(date -Iseconds)" >> "$REPORT"
echo "**CLI:** $(specify --version 2>/dev/null || echo 'unknown')" >> "$REPORT"
echo "" >> "$REPORT"

# Initialize metrics JSON
cat > "$METRICS" << 'JSONEOF'
{
  "date": "$(date -Iseconds)",
  "cli_version": "$(specify --version 2>/dev/null || echo 'unknown')",
  "phases": []
}
JSONEOF

run_extension() {
    local phase="$1"
    local ext="$2"
    local cmd="$3"
    
    echo ""
    echo "========================================"
    echo "[$phase] Running: $ext → $cmd"
    echo "========================================"
    
    echo "" >> "$REPORT"
    echo "## [$phase] $ext — $cmd" >> "$REPORT"
    echo "" >> "$REPORT"
    echo "- **Status:** RUNNING" >> "$REPORT"
    
    if $cmd >> "$REPORT" 2>&1; then
        echo "- **Result:** SUCCESS" >> "$REPORT"
        echo "✓ SUCCESS: $ext"
        return 0
    else
        echo "- **Result:** FAILED (exit code $?)" >> "$REPORT"
        echo "✗ FAILED: $ext"
        return 1
    fi
}

# Phase 0: Bootstrap
echo ""
echo "########################################"
echo "# PHASE 0: BOOTSTRAP & DISCOVERY       #"
echo "########################################"

run_extension "PHASE-0" "doctor" "specify extension run doctor" || true
run_extension "PHASE-0" "repoindex-overview" "specify extension run repoindex overview" || true

# Phase 1: Quality Gates
echo ""
echo "########################################"
echo "# PHASE 1: QUALITY GATES               #"
echo "########################################"

run_extension "PHASE-1" "red-team" "specify extension run red-team" || true
run_extension "PHASE-1" "security-review-audit" "specify extension run security-review audit" || true
run_extension "PHASE-1" "architecture-guard" "specify extension run architecture-guard review" || true
run_extension "PHASE-1" "critique" "specify extension run critique" || true

# Phase 2: Analysis
echo ""
echo "########################################"
echo "# PHASE 2: ANALYSIS                    #"
echo "########################################"

run_extension "PHASE-2" "ripple-scan" "specify extension run ripple scan" || true
run_extension "PHASE-2" "analyze" "specify extension run analyze" || true
run_extension "PHASE-2" "scope-estimate" "specify extension run scope estimate" || true

# Phase 3: Governance
echo ""
echo "########################################"
echo "# PHASE 3: GOVERNANCE                  #"
echo "########################################"

run_extension "PHASE-3" "agent-governance" "specify extension run agent-governance" || true
run_extension "PHASE-3" "memorylint" "specify extension run memorylint" || true
run_extension "PHASE-3" "version-guard" "specify extension run version-guard check" || true

# Phase 4: Implementation Support
echo ""
echo "########################################"
echo "# PHASE 4: IMPLEMENTATION SUPPORT      #"
echo "########################################"

run_extension "PHASE-4" "blueprint-generate" "specify extension run blueprint generate" || true
run_extension "PHASE-4" "diagram-workflow" "specify extension run diagram workflow" || true

# Phase 5: Verification
echo ""
echo "########################################"
echo "# PHASE 5: VERIFICATION                #"
echo "########################################"

run_extension "PHASE-5" "verify" "specify extension run verify" || true
run_extension "PHASE-5" "verify-tasks" "specify extension run verify-tasks" || true
run_extension "PHASE-5" "cleanup" "specify extension run cleanup" || true
run_extension "PHASE-5" "staff-review" "specify extension run staff-review" || true

# Phase 6: Release
echo ""
echo "########################################"
echo "# PHASE 6: RELEASE                     #"
echo "########################################"

run_extension "PHASE-6" "ship" "specify extension run ship" || true
run_extension "PHASE-6" "retro" "specify extension run retro" || true

# Final summary
echo "" >> "$REPORT"
echo "## Summary" >> "$REPORT"
echo "- Report: $REPORT" >> "$REPORT"
echo "- Metrics: $METRICS" >> "$REPORT"

echo ""
echo "########################################"
echo "# EXTENSION SUITE EXECUTION COMPLETE   #"
echo "########################################"
echo "Report: $REPORT"
echo "Metrics: $METRICS"
