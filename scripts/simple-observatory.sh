#!/bin/bash

# Simple AI Observatory - No Dependencies
clear

echo "🤖 SIMPLE AI OBSERVATORY - NOVELI.SH"
echo "$(date)"
echo "═══════════════════════════════════════"

while true; do
    echo ""
    echo "📈 ISSUES:"
    gh issue list --state open --limit 3
    
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
