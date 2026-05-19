#!/bin/bash
set -e

# OrthoPlus Enterprise — Governance Metrics Exporter
# Feature 017: OMK Governance Integration
# Usage: ./scripts/governance-metrics.sh [prometheus|json]
# For Prometheus: output in OpenMetrics format
# For JSON: output as JSON object

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-json}"

# --- GitNexus Metrics ---
gitnexus_nodes=0
gitnexus_edges=0
gitnexus_clusters=0
gitnexus_index_age_seconds=0

if [ -f "$REPO_ROOT/.gitnexus/meta.json" ]; then
  # Use Python/jq to parse nested JSON safely
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

  # Count active/completed features
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
# HELP gitnexus_index_age_seconds Age of GitNexus index in seconds
# TYPE gitnexus_index_age_seconds gauge
gitnexus_index_age_seconds $gitnexus_index_age_seconds
# HELP gitnexus_nodes_total Total number of nodes in GitNexus index
# TYPE gitnexus_nodes_total gauge
gitnexus_nodes_total $gitnexus_nodes
# HELP gitnexus_edges_total Total number of edges in GitNexus index
# TYPE gitnexus_edges_total gauge
gitnexus_edges_total $gitnexus_edges
# HELP gitnexus_clusters_total Total number of clusters in GitNexus index
# TYPE gitnexus_clusters_total gauge
gitnexus_clusters_total $gitnexus_clusters
# HELP speckit_features_total Total number of SpecKit features
# TYPE speckit_features_total gauge
speckit_features_total $speckit_features_total
# HELP speckit_features_active Number of active SpecKit features
# TYPE speckit_features_active gauge
speckit_features_active $speckit_features_active
# HELP speckit_features_completed Number of completed SpecKit features
# TYPE speckit_features_completed gauge
speckit_features_completed $speckit_features_completed
# HELP omk_goals_active Number of active OMK goals
# TYPE omk_goals_active gauge
omk_goals_active $omk_goals_active
# HELP omk_goals_completed Number of completed OMK goals
# TYPE omk_goals_completed gauge
omk_goals_completed $omk_goals_completed
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
  "timestamp": "$(date -Iseconds)"
}
JSON
fi
