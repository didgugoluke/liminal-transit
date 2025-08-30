#!/bin/bash

# Compact AI Observatory - Clean and Simple
clear

echo "🤖 COMPACT AI OBSERVATORY - NOVELI.SH"
echo "$(date)"
echo "═══════════════════════════════════════"

while true; do
    echo ""
    echo "📈 ISSUES:"
    gh issue list --state open --limit 3 --json number,title | jq -r '.[] | "#\(.number) \(.title)"'
    
    echo ""
    echo "🔄 COMMITS:"
    git log --oneline -2
    
    echo ""
    echo "📊 STATS: $(find . -name '*.md' -o -name '*.ts' -o -name '*.js' | wc -l | tr -d ' ') files"
    
    echo ""
    echo "🕐 $(date '+%H:%M:%S') - Refreshing in 8s..."
    sleep 8
    
    clear
    echo "🤖 COMPACT AI OBSERVATORY - NOVELI.SH"
    echo "$(date)"
    echo "═══════════════════════════════════════"
done
