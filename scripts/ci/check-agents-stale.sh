#!/bin/bash
# Check for stale AGENTS.md files (>14 days old)
# Usage: bash scripts/check-agents-stale.sh [days_threshold]

set -e

DAYS_THRESHOLD=${1:-14}
EXIT_CODE=0

echo "Checking AGENTS.md files older than ${DAYS_THRESHOLD} days..."
echo ""

NOW=$(date +%s)
THRESHOLD_SECONDS=$((DAYS_THRESHOLD * 86400))

find . -name "AGENTS.md" -type f | grep -v node_modules | grep -v ".git" | grep -v ".specify" | grep -v ".omk/open-design" | while read -r file; do
    FILE_DATE=$(grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' "$file" | head -1)
    
    if [ -z "$FILE_DATE" ]; then
        echo "⚠️  $file — no date found"
        EXIT_CODE=1
        continue
    fi
    
    FILE_SECONDS=$(date -d "$FILE_DATE" +%s 2>/dev/null || echo 0)
    
    if [ "$FILE_SECONDS" -eq 0 ]; then
        echo "⚠️  $file — invalid date format: $FILE_DATE"
        EXIT_CODE=1
        continue
    fi
    
    AGE_SECONDS=$((NOW - FILE_SECONDS))
    AGE_DAYS=$((AGE_SECONDS / 86400))
    
    if [ "$AGE_DAYS" -gt "$DAYS_THRESHOLD" ]; then
        echo "❌ $file — stale by ${AGE_DAYS} days (last updated: $FILE_DATE)"
        EXIT_CODE=1
    else
        echo "✅ $file — fresh (${AGE_DAYS} days old)"
    fi
done

echo ""
if [ "$EXIT_CODE" -ne 0 ]; then
    echo "FAIL: Some AGENTS.md files are stale. Please update them."
    exit 1
else
    echo "PASS: All AGENTS.md files are up to date."
    exit 0
fi
