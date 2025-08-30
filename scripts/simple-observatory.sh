#!/bin/bash

# Simple AI Observatory - No Dependencies
clear

# Setup rate limiting
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RATE_LIMIT_SCRIPT="$SCRIPT_DIR/github-rate-limit-manager.sh"

echo "🤖 SIMPLE AI OBSERVATORY - NOVELI.SH"
echo "$(date)"
echo "═══════════════════════════════════════"

while true; do
    echo ""
    echo "📈 ISSUES:"
    
    # Check rate limits before making GitHub API calls
    if [ -f "$RATE_LIMIT_SCRIPT" ] && ! "$RATE_LIMIT_SCRIPT" check; then
        echo "⚠️  Rate limits low - showing cached data"
        echo "   Run 'scripts/github-rate-limit-manager.sh status' for details"
    else
        # Safe GitHub API call with rate limiting protection
        if ! gh issue list --state open --limit 3 2>/dev/null; then
            echo "⚠️  GitHub API unavailable - check rate limits"
        fi
    fi
    
    echo ""
    echo "🔄 COMMITS:"
    git log --oneline -2
    
    echo ""
    file_count=$(find . -name '*.md' -o -name '*.ts' -o -name '*.js' | wc -l | tr -d ' ')
    echo "📊 FILES: $file_count"
    
    echo ""
    echo "🕐 $(date '+%H:%M:%S') - Refreshing in 10s..."
    sleep 10
    
    clear
    echo "🤖 SIMPLE AI OBSERVATORY - NOVELI.SH"
    echo "$(date)"
    echo "═══════════════════════════════════════"
done
