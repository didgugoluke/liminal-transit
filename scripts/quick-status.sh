#!/bin/bash

# Quick Status Check - One-time run
clear

echo "🎯 QUICK STATUS - $(date '+%H:%M')"
echo "═══════════════════════════════"

echo ""
echo "📈 Open Issues:"
gh issue list --state open --limit 5

echo ""
echo "🔄 Recent Activity:"
git log --oneline -3

echo ""
echo "📊 Repository:"
file_count=$(find . -type f -not -path '*/.*' | wc -l | tr -d ' ')
echo "  Files: $file_count"

change_count=$(git status --porcelain | wc -l)
echo "  Changes: $change_count"

echo ""
echo "✅ Status check complete!"
