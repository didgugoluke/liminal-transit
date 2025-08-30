#!/bin/bash

# ============================================================================
# AI Observatory - Epic Progress Monitor
# Real-time Epic and task tracking with GitHub integration
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TRACKING_DIR="$PROJECT_ROOT/observatory/tracking"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================================================${NC}"
    echo -e "${CYAN}🤖 AI Observatory - Epic Progress Monitor${NC}"
    echo -e "${CYAN}================================================================${NC}"
    echo ""
}

monitor_epics() {
    if [ ! -d "$TRACKING_DIR" ]; then
        echo -e "${YELLOW}📁 No Epic tracking data found${NC}"
        echo "Run Epic Task Orchestrator to begin tracking"
        return
    fi

    for epic_file in "$TRACKING_DIR"/epic_*.json; do
        if [ -f "$epic_file" ]; then
            echo -e "${PURPLE}📊 Processing Epic: $(basename "$epic_file")${NC}"
            
            # Extract Epic data
            EPIC_ID=$(jq -r '.epic_id' "$epic_file")
            TITLE=$(jq -r '.title' "$epic_file")
            STATUS=$(jq -r '.status' "$epic_file")
            TOTAL_TASKS=$(jq -r '.progress.total_tasks' "$epic_file")
            COMPLETED_TASKS=$(jq -r '.progress.completed_tasks' "$epic_file")
            
            # Calculate progress percentage
            if [ "$TOTAL_TASKS" -gt 0 ]; then
                PROGRESS=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))
            else
                PROGRESS=0
            fi
            
            # Display Epic status
            echo -e "${BLUE}Epic #$EPIC_ID${NC}: $TITLE"
            echo -e "Status: ${GREEN}$STATUS${NC}"
            echo -e "Progress: ${YELLOW}$COMPLETED_TASKS/$TOTAL_TASKS tasks (${PROGRESS}%)${NC}"
            
            # Progress bar
            BAR_LENGTH=20
            FILLED=$((PROGRESS * BAR_LENGTH / 100))
            BAR=""
            for ((i=1; i<=BAR_LENGTH; i++)); do
                if [ $i -le $FILLED ]; then
                    BAR="${BAR}█"
                else
                    BAR="${BAR}░"
                fi
            done
            echo -e "[$BAR] ${PROGRESS}%"
            
            # Check task status with GitHub API
            echo -e "${CYAN}🔍 Checking task status...${NC}"
            TASK_ISSUES=$(jq -r '.task_issues[]' "$epic_file" 2>/dev/null || echo "")
            
            if [ -n "$TASK_ISSUES" ]; then
                for task_id in $TASK_ISSUES; do
                    if command -v gh &> /dev/null; then
                        TASK_STATUS=$(gh issue view "$task_id" --json state,title | jq -r '.state')
                        TASK_TITLE=$(gh issue view "$task_id" --json state,title | jq -r '.title')
                        
                        if [ "$TASK_STATUS" = "CLOSED" ]; then
                            echo -e "  ✅ #$task_id: $TASK_TITLE"
                        else
                            echo -e "  🔄 #$task_id: $TASK_TITLE"
                        fi
                    else
                        echo -e "  📋 Task #$task_id (GitHub CLI not available)"
                    fi
                done
            fi
            
            echo ""
        fi
    done
}

update_epic_progress() {
    local epic_id="$1"
    local epic_file="$TRACKING_DIR/epic_$epic_id.json"
    
    if [ ! -f "$epic_file" ]; then
        echo -e "${RED}❌ Epic #$epic_id tracking file not found${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🔄 Updating Epic #$epic_id progress...${NC}"
    
    # Get task issues
    TASK_ISSUES=$(jq -r '.task_issues[]' "$epic_file" 2>/dev/null || echo "")
    TOTAL_TASKS=0
    COMPLETED_TASKS=0
    IN_PROGRESS_TASKS=0
    
    for task_id in $TASK_ISSUES; do
        if command -v gh &> /dev/null; then
            TASK_STATUS=$(gh issue view "$task_id" --json state 2>/dev/null | jq -r '.state' || echo "OPEN")
            
            TOTAL_TASKS=$((TOTAL_TASKS + 1))
            
            if [ "$TASK_STATUS" = "CLOSED" ]; then
                COMPLETED_TASKS=$((COMPLETED_TASKS + 1))
            else
                IN_PROGRESS_TASKS=$((IN_PROGRESS_TASKS + 1))
            fi
        fi
    done
    
    # Update Epic tracking file
    jq --argjson total "$TOTAL_TASKS" \
       --argjson completed "$COMPLETED_TASKS" \
       --argjson in_progress "$IN_PROGRESS_TASKS" \
       '.progress.total_tasks = $total | .progress.completed_tasks = $completed | .progress.in_progress = $in_progress' \
       "$epic_file" > "${epic_file}.tmp" && mv "${epic_file}.tmp" "$epic_file"
    
    echo -e "${GREEN}✅ Epic #$epic_id progress updated${NC}"
    echo -e "Total: $TOTAL_TASKS | Completed: $COMPLETED_TASKS | In Progress: $IN_PROGRESS_TASKS"
}

main() {
    print_header
    
    case "${1:-monitor}" in
        "monitor")
            monitor_epics
            ;;
        "update")
            if [ $# -lt 2 ]; then
                echo -e "${RED}❌ Usage: $0 update <epic_id>${NC}"
                exit 1
            fi
            update_epic_progress "$2"
            ;;
        "help")
            echo "Usage: $0 [command] [args]"
            echo ""
            echo "Commands:"
            echo "  monitor          Monitor all Epic progress (default)"
            echo "  update <id>      Update specific Epic progress"
            echo "  help             Show this help"
            echo ""
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
