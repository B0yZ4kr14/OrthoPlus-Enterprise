#!/bin/bash
set -e

# OrthoPlus Enterprise — Governance Metrics Exporter
# Feature 017: OMK Governance Integration
# Usage: ./scripts/governance-metrics.sh [prometheus|json]
# For Prometheus: output in OpenMetrics format
# For JSON: output as JSON object
#
# Constitution Compliance: INF-2 requires orthoplus_* prefix + category label
# All metrics use prefix: orthoplus_governance_* with label category="governance"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-json}"

# --- GitNexus Metrics ---
gitnexus_nodes=0
gitnexus_edges=0
gitnexus_clusters=0
gitnexus_index_age_seconds=0

if [ -f "$REPO_ROOT/.gitnexus/meta.json" ]; then
  gitnexus_nodes=$(python3 -c "
import json, sys
try:
    with open('$REPO_ROOT/.gitnexus/meta.json') as f:
        d = json.load(f)
    print(d.get('stats', {}).get('nodes', 0))
except: print(0)
" 2>/dev/null || echo 0)

  gitnexus_edges=$(python3 -c "
import json, sys
try:
    with open('$REPO_ROOT/.gitnexus/meta.json') as f:
        d = json.load(f)
    print(d.get('stats', {}).get('edges', 0))
except: print(0)
" 2>/dev/null || echo 0)

  gitnexus_clusters=$(python3 -c "
import json, sys
try:
    with open('$REPO_ROOT/.gitnexus/meta.json') as f:
        d = json.load(f)
    print(d.get('stats', {}).get('communities', 0))
except: print(0)
" 2>/dev/null || echo 0)

  gitnexus_index_age_seconds=$(python3 -c "
import json, sys
from datetime import datetime, timezone
try:
    with open('$REPO_ROOT/.gitnexus/meta.json') as f:
        d = json.load(f)
    idx = d.get('indexedAt', '')
    if idx:
        idx_dt = datetime.fromisoformat(idx.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        print(int((now - idx_dt).total_seconds()))
    else:
        print(0)
except Exception as e:
    print(0)
" 2>/dev/null || echo 0)
fi

# --- SpecKit Metrics ---
speckit_features_total=0
speckit_features_active=0
speckit_features_completed=0

if [ -d "$REPO_ROOT/specs" ]; then
  speckit_features_total=$(find "$REPO_ROOT/specs" -maxdepth 1 -mindepth 1 -type d | wc -l)

  for spec_dir in "$REPO_ROOT"/specs/*/; do
    if [ -f "$spec_dir/tasks.md" ]; then
      total_tasks=$(grep -cE '^\- \[ \]' "$spec_dir/tasks.md" 2>/dev/null | head -1 || echo 0)
      completed_tasks=$(grep -cE '^\- \[X\]' "$spec_dir/tasks.md" 2>/dev/null | head -1 || echo 0)
      total_tasks=$(echo "$total_tasks" | tr -d ' \n')
      completed_tasks=$(echo "$completed_tasks" | tr -d ' \n')
      if [ "${total_tasks:-0}" -gt 0 ]; then
        speckit_features_active=$((speckit_features_active + 1))
      elif [ "${completed_tasks:-0}" -gt 0 ]; then
        speckit_features_completed=$((speckit_features_completed + 1))
      fi
    fi
  done
fi

# --- OMK Metrics ---
omk_goals_active=0
omk_goals_completed=0

if [ -d "$REPO_ROOT/.omk/memory" ]; then
  for state_file in "$REPO_ROOT"/.omk/memory/state-*.json; do
    [ -f "$state_file" ] || continue
    status=$(python3 -c "
import json, sys
try:
    with open('$state_file') as f:
        d = json.load(f)
    print(d.get('status', 'unknown'))
except: print('unknown')
" 2>/dev/null || echo "unknown")
    if [ "$status" = "active" ]; then
      omk_goals_active=$((omk_goals_active + 1))
    elif [ "$status" = "completed" ]; then
      omk_goals_completed=$((omk_goals_completed + 1))
    fi
  done
fi

# --- Output ---
if [ "$MODE" = "prometheus" ]; then
  cat <<PROM
# HELP orthoplus_governance_gitnexus_index_age_seconds Age of GitNexus index in seconds
# TYPE orthoplus_governance_gitnexus_index_age_seconds gauge
orthoplus_governance_gitnexus_index_age_seconds{category="governance"} $gitnexus_index_age_seconds
# HELP orthoplus_governance_gitnexus_nodes_total Total number of nodes in GitNexus index
# TYPE orthoplus_governance_gitnexus_nodes_total gauge
orthoplus_governance_gitnexus_nodes_total{category="governance"} $gitnexus_nodes
# HELP orthoplus_governance_gitnexus_edges_total Total number of edges in GitNexus index
# TYPE orthoplus_governance_gitnexus_edges_total gauge
orthoplus_governance_gitnexus_edges_total{category="governance"} $gitnexus_edges
# HELP orthoplus_governance_gitnexus_clusters_total Total number of clusters in GitNexus index
# TYPE orthoplus_governance_gitnexus_clusters_total gauge
orthoplus_governance_gitnexus_clusters_total{category="governance"} $gitnexus_clusters
# HELP orthoplus_governance_speckit_features_total Total number of SpecKit features
# TYPE orthoplus_governance_speckit_features_total gauge
orthoplus_governance_speckit_features_total{category="governance"} $speckit_features_total
# HELP orthoplus_governance_speckit_features_active Number of active SpecKit features
# TYPE orthoplus_governance_speckit_features_active gauge
orthoplus_governance_speckit_features_active{category="governance"} $speckit_features_active
# HELP orthoplus_governance_speckit_features_completed Number of completed SpecKit features
# TYPE orthoplus_governance_speckit_features_completed gauge
orthoplus_governance_speckit_features_completed{category="governance"} $speckit_features_completed
# HELP orthoplus_governance_omk_goals_active Number of active OMK goals
# TYPE orthoplus_governance_omk_goals_active gauge
orthoplus_governance_omk_goals_active{category="governance"} $omk_goals_active
# HELP orthoplus_governance_omk_goals_completed Number of completed OMK goals
# TYPE orthoplus_governance_omk_goals_completed gauge
orthoplus_governance_omk_goals_completed{category="governance"} $omk_goals_completed
PROM
else
  cat <<JSON
{
  "gitnexus": {
    "index_age_seconds": $gitnexus_index_age_seconds,
    "nodes": $gitnexus_nodes,
    "edges": $gitnexus_edges,
    "clusters": $gitnexus_clusters
  },
  "speckit": {
    "features_total": $speckit_features_total,
    "features_active": $speckit_features_active,
    "features_completed": $speckit_features_completed
  },
  "omk": {
    "goals_active": $omk_goals_active,
    "goals_completed": $omk_goals_completed
  },
  "constitution": {
    "prefix": "orthoplus_governance_",
    "category_label": "governance"
  },
  "timestamp": "$(date -Iseconds)"
}
JSON
fi
