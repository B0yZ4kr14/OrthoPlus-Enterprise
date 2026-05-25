#!/bin/bash
set -euo pipefail

# sync-copilot-prompts.sh
# Populates .github/prompts/ from SKILL.md files
# Only creates prompts for skills that exist and have content

PROMPT_DIR=".github/prompts"
SKILL_DIR=".kimi/skills"
CHANGED=0

mkdir -p "$PROMPT_DIR"

# Map skill names to agent names
map_skill_to_agent() {
  local skill_name="$1"
  # Convert directory name like "speckit-plan" to "speckit.plan"
  echo "$skill_name" | tr '-' '.'
}

# Find all SKILL.md files and generate corresponding prompts
find "$SKILL_DIR" -mindepth 1 -maxdepth 1 -type d | while read -r skill_dir; do
  skill_name=$(basename "$skill_dir")
  skill_file="$skill_dir/SKILL.md"
  
  if [ ! -f "$skill_file" ]; then
    continue
  fi
  
  agent_name=$(map_skill_to_agent "$skill_name")
  prompt_file="$PROMPT_DIR/${agent_name}.prompt.md"
  
  # Extract description from SKILL.md
  description=$(grep -m1 "^Description:" "$skill_file" | sed 's/Description: //' || echo "")
  
  # Create prompt file
  cat > "$prompt_file" <<EOF
---
agent: $agent_name
---

# $agent_name

## Description
$description

## Instructions

$(cat "$skill_file")

## Context
- Project: OrthoPlus Enterprise
- Auto-generated from: $skill_file
- Synced: $(date -Iseconds)
EOF
  
  echo "✅ Generated: $prompt_file ($skill_name)"
  CHANGED=1
done

if [ "$CHANGED" -eq 0 ]; then
  echo "⚠️ No SKILL.md files found in $SKILL_DIR"
  exit 1
fi

echo ""

echo ""
echo "PASS: Copilot prompts synchronized."
