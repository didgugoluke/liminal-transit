#!/bin/bash

# Quick Status Check - Rate Limit Aware
clear

# Setup rate limiting
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RATE_LIMIT_SCRIPT="$SCRIPT_DIR/github-rate-limit-manager.sh"

echo "🎯 QUICK STATUS CHECK - NOVELI.SH"
echo "$(date)"
echo "═══════════════════════════════════════"

# Check if rate limiting script exists
if [ ! -f "$RATE_LIMIT_SCRIPT" ]; then
    echo "⚠️  Rate limiting script not found - running without protection"
    echo ""
fi

echo "🔍 RATE LIMITS:"
if [ -f "$RATE_LIMIT_SCRIPT" ]; then
    "$RATE_LIMIT_SCRIPT" status
else
    echo "   Rate limiting script not available"
fi

echo ""
echo "� REPOSITORY STATUS:"
echo "   Branch: $(git branch --show-current)"
echo "   Last commit: $(git log -1 --pretty=format:'%h %s')"
echo "   Files: $(find . -name '*.md' -o -name '*.ts' -o -name '*.js' | wc -l | tr -d ' ')"

echo ""
echo "🤖 AGENT ECOSYSTEM:"
agent_count=$(find .github/workflows -name "*agent*.yml" | wc -l | tr -d ' ')
echo "   Agent workflows: $agent_count"
echo "   Working docs: $(find docs/working -name '*.md' | wc -l | tr -d ' ')"

echo ""
echo "🔄 RECENT ACTIVITY:"
if [ -f "$RATE_LIMIT_SCRIPT" ] && "$RATE_LIMIT_SCRIPT" check; then
    echo "   GitHub issues (safe to query):"
    gh issue list --state open --limit 3 2>/dev/null || echo "   ⚠️  GitHub API unavailable"
else
    echo "   ⚠️  Rate limits low - skipping GitHub API calls"
    echo "   Use 'scripts/github-rate-limit-manager.sh emergency' if needed"
fi

echo ""
echo "📈 Recent commits:"
git log --oneline -3

echo ""
change_count=$(git status --porcelain | wc -l)
echo "📋 Changes: $change_count"

echo ""
echo "✅ Status check complete"
