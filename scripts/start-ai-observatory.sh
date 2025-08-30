#!/bin/bash

# NOVELI.SH AI Agent Observatory - Terminal Setup Script
# Instantly restore comprehensive monitoring in VS Code

set -e

echo "🤖 Starting NOVELI.SH AI Agent Observatory..."
echo "═══════════════════════════════════════════════════"

# Check dependencies
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install: brew install gh"
    exit 1
fi

if ! command -v fswatch &> /dev/null; then
    echo "📦 Installing fswatch for file monitoring..."
    brew install fswatch
fi

# Ensure we're in the right directory
if [[ ! -f "package.json" || ! -d ".git" ]]; then
    echo "❌ Must be run from the NOVELI.SH project root directory"
    exit 1
fi

echo "✅ Dependencies verified"
echo "🚀 Launching AI Agent Observatory terminals..."

# Function to create new terminal in VS Code
create_terminal() {
    local title="$1"
    local command="$2"
    
    # For VS Code integrated terminals, we'll output the command to run
    echo "Terminal: $title"
    echo "Command: $command"
    echo "---"
}

echo ""
echo "🔬 Observatory Terminal Commands:"
echo "Copy and paste these into separate VS Code terminals:"
echo ""

echo "📊 TERMINAL 1: Repository Activity Monitor"
echo "watch -n 5 'echo \"📊 Repository Status (\$(date))\" && echo \"═══════════════════════════════════════\" && git log --oneline -5 && echo \"\" && echo \"🎯 Active Issues:\" && gh issue list --state open --limit 5 && echo \"\" && echo \"🔄 Recent Activity:\" && gh pr list --limit 3'"
echo ""

echo "📁 TERMINAL 2: File System Changes"
echo "echo \"📁 File System Monitor - Watching for AI Agent Changes\" && echo \"═══════════════════════════════════════════════════\" && fswatch -r . --exclude='\\.git' --exclude='node_modules' --exclude='\\.DS_Store' | while read file; do echo \"\$(date '+%H:%M:%S') 🔧 \${file}\"; done"
echo ""

echo "🔬 TERMINAL 3: AI Agent Dashboard"
echo "echo \"🔬 AI Agent Activity Dashboard\" && echo \"═══════════════════════════════════════\" && while true; do clear && echo \"🤖 NOVELI.SH AI Agent Observatory\" && echo \"\$(date)\" && echo \"═══════════════════════════════════════\" && echo \"\" && echo \"📈 Issue Status:\" && gh issue list --state open --json number,title,labels,updatedAt --template '{{range .}}{{printf \"#%-2d %s\" .number .title}}{{\"\\n\"}}    {{range .labels}}{{.name}} {{end}}{{\"\\n\"}}    Updated: {{timeago .updatedAt}}{{\"\\n\\n\"}}{{end}}' && echo \"🔄 Recent Commits:\" && git log --oneline -3 && echo \"\" && echo \"📊 Repository Stats:\" && echo \"Files: \$(find . -type f -not -path '*/.*' | wc -l | tr -d ' ')\" && echo \"Lines: \$(find . -name '*.md' -o -name '*.ts' -o -name '*.js' -o -name '*.json' | xargs wc -l 2>/dev/null | tail -1 | awk '{print \$1}')\" && sleep 10; done"
echo ""

echo "🎯 Quick Start: Run './scripts/start-ai-observatory.sh' to see these commands"
echo "💡 Pro Tip: Use VS Code's terminal split view for optimal monitoring"
echo ""
echo "✅ NOVELI.SH AI Agent Observatory ready for deployment!"
