#!/bin/bash
# Check for constitution drift: derived docs referencing outdated parent versions
# Usage: bash scripts/check-constitution-drift.sh

set -e

EXIT_CODE=0
CONSTITUTION=".specify/memory/constitution.md"

echo "Checking constitution drift..."
echo ""

# Extract parent version from constitution (format: **Version**: 1.3.1)
PARENT_VERSION=$(grep -oE '\*\*Version\*\*: [0-9]+\.[0-9]+\.[0-9]+' "$CONSTITUTION" | head -1 | sed 's/\*\*Version\*\*: //')

echo "Constitution version: $PARENT_VERSION"
echo ""

# Check derived documents
for derived in .specify/memory/architecture_constitution.md .specify/memory/security_constitution.md; do
    if [ -f "$derived" ]; then
        DERIVED_PARENT=$(grep -oE 'Derived from.*v[0-9]+\.[0-9]+\.[0-9]+' "$derived" | sed 's/.*v//')
        DERIVED_NAME=$(basename "$derived")
        
        if [ "$DERIVED_PARENT" != "$PARENT_VERSION" ]; then
            echo "❌ $DERIVED_NAME — references parent v$DERIVED_PARENT (current: v$PARENT_VERSION)"
            EXIT_CODE=1
        else
            echo "✅ $DERIVED_NAME — synced with parent v$PARENT_VERSION"
        fi
    fi
done

# Check for metric inconsistencies between AGENTS.md files
echo ""
echo "Checking metric consistency..."
echo ""

# Test suites count
ROOT_SUITES=$(grep -oE '[0-9]+ suites' ./AGENTS.md | head -1 | sed 's/ suites//' || echo "")
BACKEND_SUITES=$(grep -oE '[0-9]+ suites' backend/AGENTS.md | head -1 | sed 's/ suites//' || echo "")

if [ -n "$ROOT_SUITES" ] && [ -n "$BACKEND_SUITES" ]; then
    if [ "$ROOT_SUITES" != "$BACKEND_SUITES" ]; then
        echo "⚠️  Test suites mismatch: root=$ROOT_SUITES, backend=$BACKEND_SUITES"
    else
        echo "✅ Test suites consistent: $ROOT_SUITES"
    fi
fi

echo ""
if [ "$EXIT_CODE" -ne 0 ]; then
    echo "FAIL: Constitution drift detected. Please update derived documents."
    exit 1
else
    echo "PASS: No constitution drift detected."
    exit 0
fi
