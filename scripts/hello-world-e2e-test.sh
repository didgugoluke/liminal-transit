#!/bin/bash

# NOVELI.SH - Hello World E2E Test Script
# AI Native Interactive Storytelling Platform
# Automated testing for Scrum Master → Development Agent pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STORY_NUMBER=66
TASK_NUMBERS=(67 68 69)
PROJECT_ID=2
OWNER="didgugoluke"
REPO="liminal-transit"

echo -e "${BLUE}🧪 HELLO WORLD E2E TEST AUTOMATION${NC}"
echo "=================================================="
echo "Story: #${STORY_NUMBER} (Hello World E2E)"
echo "Tasks: #${TASK_NUMBERS[@]}"
echo "Project: ${PROJECT_ID}"
echo ""

# Function to wait for workflow completion with live monitoring
wait_for_workflow() {
    local workflow=$1
    local timeout=${2:-120}
    local start_time=$(date +%s)
    local last_log_line=""
    local run_id=""
    
    echo -e "${YELLOW}⏳ Waiting for ${workflow} to start...${NC}"
    
    # Wait for workflow to start and get run ID
    local attempts=0
    while [ $attempts -lt 12 ]; do  # 60 seconds max wait for start
        run_id=$(gh run list --workflow="${workflow}" --limit=1 --json databaseId,status --jq 'if .[0].status == "in_progress" or .[0].status == "queued" then .[0].databaseId else empty end' 2>/dev/null || echo "")
        if [ -n "$run_id" ]; then
            break
        fi
        echo -n "."
        sleep 5
        attempts=$((attempts + 1))
    done
    
    if [ -z "$run_id" ]; then
        echo -e "${RED}❌ ${workflow} did not start within expected time${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}📋 Monitoring ${workflow} (Run ID: ${run_id})${NC}"
    echo "=============================="
    
    while true; do
        local status=$(gh run list --workflow="${workflow}" --limit=1 --json status --jq '.[0].status' 2>/dev/null || echo "unknown")
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ "$status" = "completed" ]; then
            local conclusion=$(gh run list --workflow="${workflow}" --limit=1 --json conclusion --jq '.[0].conclusion')
            echo ""
            echo "=============================="
            if [ "$conclusion" = "success" ]; then
                echo -e "${GREEN}✅ ${workflow} completed successfully${NC}"
                return 0
            else
                echo -e "${RED}❌ ${workflow} failed with conclusion: ${conclusion}${NC}"
                return 1
            fi
        elif [ "$status" = "in_progress" ] || [ "$status" = "queued" ]; then
            # Get recent logs and show new lines
            local recent_logs=$(gh run view "${run_id}" --log 2>/dev/null | tail -5 | grep -v "^$" || echo "")
            if [ -n "$recent_logs" ] && [ "$recent_logs" != "$last_log_line" ]; then
                echo "$recent_logs" | while IFS= read -r line; do
                    if [ -n "$line" ]; then
                        # Clean up the log line for better display
                        local clean_line=$(echo "$line" | sed 's/^.*[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9]*Z[[:space:]]*//' | sed 's/^[[:space:]]*//')
                        if [ -n "$clean_line" ] && [[ ! "$clean_line" =~ ^(shell:|env:|\|\||##\[) ]]; then
                            # Color code different types of messages
                            if [[ "$clean_line" =~ ✅|✓|SUCCESS|completed.successfully ]]; then
                                echo -e "${GREEN}${clean_line}${NC}"
                            elif [[ "$clean_line" =~ ❌|✗|ERROR|FAILED|Failed|failed ]]; then
                                echo -e "${RED}${clean_line}${NC}"
                            elif [[ "$clean_line" =~ ⚠️|WARNING|warning ]]; then
                                echo -e "${YELLOW}${clean_line}${NC}"
                            elif [[ "$clean_line" =~ 🔄|🚀|📋|Starting|Triggering ]]; then
                                echo -e "${BLUE}${clean_line}${NC}"
                            else
                                echo "${clean_line}"
                            fi
                        fi
                    fi
                done
                last_log_line="$recent_logs"
            fi
            sleep 3
        else
            echo -e "${RED}❌ ${workflow} status: ${status}${NC}"
            return 1
        fi
        
        if [ $elapsed -gt $timeout ]; then
            echo -e "${RED}❌ Timeout waiting for ${workflow}${NC}"
            return 1
        fi
    done
}

# Function to check project status of an issue
check_project_status() {
    local issue_number=$1
    local issue_title=$(gh issue view "$issue_number" --json title --jq '.title')
    
    echo -e "${BLUE}📋 Checking project status for #${issue_number}...${NC}"
    
    # Get project item info
    local project_item=$(gh project item-list "${PROJECT_ID}" --owner "${OWNER}" --format json 2>/dev/null | jq --arg title "$issue_title" '.items[] | select(.content.title == $title)' || echo "{}")
    
    if [ -n "$project_item" ] && [ "$project_item" != "{}" ]; then
        local status=$(echo "$project_item" | jq -r '.status // "No Status"')
        local item_id=$(echo "$project_item" | jq -r '.id')
        echo "  Title: $issue_title"
        echo "  Status: $status"
        echo "  Item ID: $item_id"
        echo "$status"
    else
        echo "  Issue not found in project"
        echo "Not in project"
    fi
}

# Cached project status check (reduces API calls)
cached_project_status_check() {
    local issue_number=$1
    local cache_file="/tmp/project_status_cache_${issue_number}"
    local cache_age=15  # Cache for 15 seconds to reduce API calls
    
    # Check if cache exists and is fresh
    if [ -f "$cache_file" ]; then
        local file_age=$(($(date +%s) - $(stat -c %Y "$cache_file" 2>/dev/null || stat -f %m "$cache_file" 2>/dev/null || echo 0)))
        if [ $file_age -lt $cache_age ]; then
            echo -e "${YELLOW}📋 Using cached status for #${issue_number}${NC}"
            cat "$cache_file"
            return 0
        fi
    fi
    
    # Cache miss or expired - check rate limits before fetch
    if ! scripts/github-rate-limit-manager.sh check-graphql "project status check" 50; then
        echo -e "${YELLOW}⚠️ Rate limited - using last known status${NC}"
        if [ -f "$cache_file" ]; then
            cat "$cache_file"
        else
            echo "No Status"
        fi
        return 0
    fi
    
    # Fetch fresh data
    local status=$(check_project_status "$issue_number")
    echo "$status" > "$cache_file"
    echo "$status"
}

# Function to check recent webhook deliveries (to diagnose workflow_dispatch issues)
check_webhook_deliveries() {
    echo -e "${BLUE}🔗 Checking recent webhook deliveries...${NC}"
    
    # Get recent workflow runs with timestamps
    echo "Recent workflow runs in the last 5 minutes:"
    local cutoff_time=$(date -d "5 minutes ago" '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -v-5M '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || echo "")
    
    if [ -n "$cutoff_time" ]; then
        gh run list --limit=20 --json workflowName,createdAt,event,status,conclusion | \
        jq --arg cutoff "$cutoff_time" '.[] | select(.createdAt > $cutoff) | "\(.workflowName) | \(.event) | \(.createdAt) | \(.status) | \(.conclusion // "null")"' -r | \
        while read -r line; do
            echo "  $line"
        done
    else
        echo "  (Could not determine cutoff time, showing last 5 runs)"
        gh run list --limit=5 --json workflowName,createdAt,event,status,conclusion | \
        jq '.[] | "\(.workflowName) | \(.event) | \(.createdAt) | \(.status) | \(.conclusion // "null")"' -r | \
        while read -r line; do
            echo "  $line"
        done
    fi
}

# Function to monitor project status changes
monitor_project_status() {
    local story_number=$1
    local timeout=${2:-60}
    local start_time=$(date +%s)
    
    echo -e "${YELLOW}👀 Monitoring project status changes for Story #${story_number}...${NC}"
    
    local initial_status=$(cached_project_status_check "$story_number")
    echo "Initial status: $initial_status"
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            echo -e "${RED}⏰ Timeout monitoring project status${NC}"
            break
        fi
        
        local current_status=$(cached_project_status_check "$story_number")
        if [ "$current_status" != "$initial_status" ]; then
            echo -e "${GREEN}📊 Status changed: ${initial_status} → ${current_status}${NC}"
            
            # Check for key workflow transitions
            if [ "$current_status" = "Todo" ] && [ "$initial_status" != "Todo" ]; then
                echo -e "${GREEN}✅ Scrum Master moved story to Todo - ready for Development Agent${NC}"
            elif [ "$current_status" = "In Progress" ] && [ "$initial_status" = "Todo" ]; then
                echo -e "${GREEN}🚀 Development Agent picked up the story (Todo → In Progress)${NC}"
                echo -e "${GREEN}✅ Kanban workflow progression detected - continuing test${NC}"
                return 0
            elif [ "$current_status" = "Done" ]; then
                echo -e "${GREEN}🎉 Story completed (moved to Done)${NC}"
                return 0
            fi
            
            initial_status="$current_status"
        else
            echo -n "."
        fi
        
        sleep 10  # Wait 10 seconds between checks to reduce API rate limiting
        
        sleep 5
    done
    
    echo ""
}
check_workflow_outcome() {
    local workflow=$1
    echo -e "${BLUE}📊 Checking ${workflow} outcome...${NC}"
    
    local run_id=$(gh run list --workflow="${workflow}" --limit=1 --json databaseId --jq '.[0].databaseId')
    local conclusion=$(gh run list --workflow="${workflow}" --limit=1 --json conclusion --jq '.[0].conclusion')
    
    echo "Run ID: ${run_id}"
    echo "Conclusion: ${conclusion}"
    
    if [ "$conclusion" = "success" ]; then
        echo -e "${GREEN}✅ ${workflow} succeeded${NC}"
        return 0
    else
        echo -e "${RED}❌ ${workflow} failed${NC}"
        echo "Recent log entries:"
        gh run view "${run_id}" --log | grep -E "Error|Failed|❌|⚠️" | tail -5 || echo "No obvious errors found"
        return 1
    fi
}

# Function to reset everything
reset_hello_world() {
    echo -e "${YELLOW}🔄 RESETTING HELLO WORLD TEST ENVIRONMENT${NC}"
    echo "=================================================="
    
    # 1. Clean up branches
    echo -e "${BLUE}🧹 Cleaning up branches...${NC}"
    git fetch origin >/dev/null 2>&1 || true
    
    # Delete local branches
    for branch in "story/${STORY_NUMBER}" "story-${STORY_NUMBER}-local" "ai-agent/story-${STORY_NUMBER}-implementation"; do
        if git branch | grep -q "${branch}"; then
            echo "Deleting local branch: ${branch}"
            git branch -D "${branch}" >/dev/null 2>&1 || true
        fi
    done
    
    # Delete remote branches
    for branch in "story/${STORY_NUMBER}" "ai-agent/story-${STORY_NUMBER}-implementation"; do
        if git branch -r | grep -q "origin/${branch}"; then
            echo "Deleting remote branch: ${branch}"
            git push origin --delete "${branch}" >/dev/null 2>&1 || true
        fi
    done
    
    echo -e "${GREEN}✅ Branches cleaned${NC}"
    
    # Clean up any cache files
    rm -f /tmp/project_status_cache_* 2>/dev/null || true
    
    # 1.5. Clean up generated files from previous runs
    echo -e "${BLUE}🗑️ Cleaning up generated files...${NC}"
    
    # Switch to main branch to ensure we're not on story branch when deleting files
    git checkout main >/dev/null 2>&1 || true
    
    # Check if Hello World files exist from previous runs
    files_to_delete=()
    if [ -f "src/hello/index.ts" ]; then
        files_to_delete+=("src/hello/index.ts")
    fi
    if [ -f "src/config/hello.config.ts" ]; then
        files_to_delete+=("src/config/hello.config.ts")
    fi
    if [ -d "src/hello" ] && [ -z "$(ls -A src/hello 2>/dev/null)" ]; then
        files_to_delete+=("src/hello/")
    fi
    if [ -d "src/config" ] && [ -z "$(ls -A src/config 2>/dev/null)" ]; then
        files_to_delete+=("src/config/")
    fi
    
    if [ ${#files_to_delete[@]} -gt 0 ]; then
        echo "Deleting files from previous Hello World E2E runs:"
        for file in "${files_to_delete[@]}"; do
            echo "  - $file"
            if [ -d "$file" ]; then
                rm -rf "$file"
            else
                rm -f "$file"
            fi
        done
        
        # Stage and commit the deletions
        git add . >/dev/null 2>&1 || true
        
        # Check if there are changes to commit
        if ! git diff --staged --quiet 2>/dev/null; then
            echo "Committing file cleanup..."
            git commit -m "🧹 E2E Test Cleanup: Remove Hello World files from previous run

- Delete generated TypeScript modules and config files
- Prepare clean state for fresh Hello World E2E test
- Auto-cleanup by hello-world-e2e-test.sh script" >/dev/null 2>&1 || true
            
            # Push the cleanup commit
            git push origin main >/dev/null 2>&1 || true
            echo "✅ File deletions committed and pushed"
        else
            echo "No files to clean up"
        fi
    else
        echo "No Hello World files found to clean up"
    fi
    
    echo -e "${GREEN}✅ Files cleaned${NC}"
    
    # 2. Reset issues to open state
    echo -e "${BLUE}📝 Resetting issue states...${NC}"
    
    # Reopen all tasks
    for task in "${TASK_NUMBERS[@]}"; do
        local state=$(gh issue view "${task}" --json state --jq '.state')
        if [ "$state" = "CLOSED" ]; then
            echo "Reopening task #${task}"
            gh issue reopen "${task}" >/dev/null 2>&1 || true
        else
            echo "Task #${task} already open"
        fi
    done
    
    # Ensure story is open
    local story_state=$(gh issue view "${STORY_NUMBER}" --json state --jq '.state')
    if [ "$story_state" = "CLOSED" ]; then
        echo "Reopening story #${STORY_NUMBER}"
        gh issue reopen "${STORY_NUMBER}" >/dev/null 2>&1 || true
    else
        echo "Story #${STORY_NUMBER} already open"
    fi
    
    echo -e "${GREEN}✅ Issues reset${NC}"
    
    # 3. Remove from project (so Scrum Master can add fresh)
    echo -e "${BLUE}📋 Cleaning project items...${NC}"
    
    # Find and remove story from project
    local project_items=$(gh project item-list "${PROJECT_ID}" --owner "${OWNER}" --format json 2>/dev/null | jq -r --arg title "Hello World E2E" '.items[] | select(.content.title == $title) | .id' || echo "")
    
    if [ -n "$project_items" ]; then
        echo "$project_items" | while read -r item_id; do
            if [ -n "$item_id" ] && [ "$item_id" != "null" ]; then
                echo "Removing story from project (item: ${item_id})"
                gh project item-delete "${PROJECT_ID}" --owner "${OWNER}" --id "${item_id}" >/dev/null 2>&1 || true
            fi
        done
    else
        echo "Story not found in project"
    fi
    
    echo -e "${GREEN}✅ Project cleaned${NC}"
    
    # 4. Close any existing PRs
    echo -e "${BLUE}🔀 Cleaning pull requests...${NC}"
    local prs=$(gh pr list --head "story/${STORY_NUMBER}" --json number --jq '.[].number' || echo "")
    if [ -n "$prs" ]; then
        echo "$prs" | while read -r pr_number; do
            if [ -n "$pr_number" ]; then
                echo "Closing PR #${pr_number}"
                gh pr close "${pr_number}" >/dev/null 2>&1 || true
            fi
        done
    else
        echo "No PRs to clean"
    fi
    
    echo -e "${GREEN}✅ PRs cleaned${NC}"
    
    # 5. Sync with remote
    echo -e "${BLUE}🔄 Syncing with remote...${NC}"
    git checkout main >/dev/null 2>&1 || true
    git pull origin main >/dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ RESET COMPLETE${NC}"
    echo ""
}

# Function to run the E2E test
run_e2e_test() {
    echo -e "${YELLOW}🚀 RUNNING E2E TEST${NC}"
    echo "=================================================="
    
    # Trigger Scrum Master
    echo -e "${BLUE}1️⃣ Triggering Scrum Master...${NC}"
    gh workflow run scrum-master-agent.yml -f story_number="${STORY_NUMBER}"
    
    if ! wait_for_workflow "scrum-master-agent.yml" 60; then
        echo -e "${RED}❌ Scrum Master failed${NC}"
        check_workflow_outcome "scrum-master-agent.yml"
        return 1
    fi
    
    echo -e "${GREEN}✅ Scrum Master completed${NC}"
    
    # Monitor project status transitions after Scrum Master completes
    echo -e "${BLUE}⏱️ Monitoring project status transitions...${NC}"
    if monitor_project_status "${STORY_NUMBER}" 120; then # Monitor for 2 minutes
        echo -e "${GREEN}✅ Development Agent pickup detected via status change${NC}"
        
        # Verify with workflow run check
        echo -e "${BLUE}🔍 Verifying Development Agent workflow...${NC}"
        sleep 5  # Brief pause for workflow to start
        
        local latest_dev_run=$(gh run list --workflow="development-agent.yml" --limit=1 --json createdAt,status,databaseId --jq '.[0]' 2>/dev/null || echo "{}")
        local dev_created_at=$(echo "$latest_dev_run" | jq -r '.createdAt // empty')
        local dev_run_id=$(echo "$latest_dev_run" | jq -r '.databaseId // empty')
        
        if [ -n "$dev_created_at" ]; then
            local dev_timestamp=$(date -d "$dev_created_at" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$dev_created_at" +%s 2>/dev/null || echo "0")
            local current_timestamp=$(date +%s)
            local time_diff=$((current_timestamp - dev_timestamp))
            
            if [ $time_diff -lt 300 ]; then  # Within last 5 minutes
                echo -e "${GREEN}✅ Development Agent workflow confirmed (Run ID: ${dev_run_id})${NC}"
                return 0
            fi
        fi
        
        echo -e "${YELLOW}⚠️ Status changed but no recent Development Agent workflow found${NC}"
    fi
    
    # Fallback: Traditional Development Agent detection
    echo -e "${BLUE}2️⃣ Checking if Development Agent was triggered...${NC}"
    
    # Wait a moment for the trigger to happen
    echo "Waiting for Development Agent trigger..."
    sleep 15
    
    # Look for a recent Development Agent run
    local latest_dev_run=$(gh run list --workflow="development-agent.yml" --limit=1 --json createdAt,status,databaseId --jq '.[0]' 2>/dev/null || echo "{}")
    local dev_created_at=$(echo "$latest_dev_run" | jq -r '.createdAt // empty')
    local dev_status=$(echo "$latest_dev_run" | jq -r '.status // empty')
    local dev_run_id=$(echo "$latest_dev_run" | jq -r '.databaseId // empty')
    
    # Check if there's a recent run (within last 2 minutes)
    if [ -n "$dev_created_at" ]; then
        local dev_timestamp=$(date -d "$dev_created_at" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$dev_created_at" +%s 2>/dev/null || echo "0")
        local current_timestamp=$(date +%s)
        local time_diff=$((current_timestamp - dev_timestamp))
        
        if [ $time_diff -lt 180 ]; then  # Less than 3 minutes old
            echo -e "${GREEN}✅ Development Agent was triggered (Run ID: ${dev_run_id})${NC}"
            echo "Status: ${dev_status}"
            
            if [ "$dev_status" = "in_progress" ] || [ "$dev_status" = "queued" ]; then
                echo ""
                if ! wait_for_workflow "development-agent.yml" 240; then
                    echo -e "${RED}❌ Development Agent failed${NC}"
                    check_workflow_outcome "development-agent.yml"
                    return 1
                fi
            elif [ "$dev_status" = "completed" ]; then
                local dev_conclusion=$(gh run list --workflow="development-agent.yml" --limit=1 --json conclusion --jq '.[0].conclusion')
                if [ "$dev_conclusion" = "success" ]; then
                    echo -e "${GREEN}✅ Development Agent completed successfully${NC}"
                else
                    echo -e "${RED}❌ Development Agent failed${NC}"
                    check_workflow_outcome "development-agent.yml"
                    return 1
                fi
            fi
        else
            echo -e "${RED}❌ No recent Development Agent run found${NC}"
            echo "Latest run was $(($time_diff / 60)) minutes ago"
            check_workflow_outcome "scrum-master-agent.yml"
            return 1
        fi
    else
        echo -e "${RED}❌ Development Agent was not triggered${NC}"
        check_workflow_outcome "scrum-master-agent.yml"
        return 1
    fi
    
    echo -e "${GREEN}✅ E2E TEST PHASE COMPLETE${NC}"
    echo ""
}

# Function to validate outcomes
validate_outcomes() {
    echo -e "${YELLOW}🔍 VALIDATING OUTCOMES${NC}"
    echo "=================================================="
    
    local success=true
    
    # Check if story branch was created
    echo -e "${BLUE}📂 Checking branch creation...${NC}"
    git fetch origin >/dev/null 2>&1 || true
    if git branch -r | grep -q "origin/story/${STORY_NUMBER}"; then
        echo -e "${GREEN}✅ Branch story/${STORY_NUMBER} created${NC}"
    else
        echo -e "${RED}❌ Branch story/${STORY_NUMBER} not created${NC}"
        success=false
    fi
    
    # Check if files were committed
    echo -e "${BLUE}📁 Checking file creation...${NC}"
    local files_created=$(git diff --name-only main origin/story/${STORY_NUMBER} 2>/dev/null | wc -l || echo "0")
    if [ "$files_created" -gt 0 ]; then
        echo -e "${GREEN}✅ ${files_created} files created:${NC}"
        git diff --name-only main origin/story/${STORY_NUMBER} 2>/dev/null | sed 's/^/  - /' || true
    else
        echo -e "${RED}❌ No files were committed${NC}"
        success=false
    fi
    
    # Check if PR was created
    echo -e "${BLUE}🔀 Checking pull request...${NC}"
    local pr_count=$(gh pr list --head "story/${STORY_NUMBER}" --json number --jq 'length' || echo "0")
    if [ "$pr_count" -gt 0 ]; then
        local pr_number=$(gh pr list --head "story/${STORY_NUMBER}" --json number --jq '.[0].number')
        echo -e "${GREEN}✅ Pull request #${pr_number} created${NC}"
    else
        echo -e "${RED}❌ No pull request created${NC}"
        success=false
    fi
    
    # Check if story is in project and its status
    echo -e "${BLUE}📋 Checking project status...${NC}"
    local project_status=$(cached_project_status_check "${STORY_NUMBER}")
    if [ "$project_status" != "Not in project" ]; then
        echo -e "${GREEN}✅ Story added to project${NC}"
        echo "  Current status: $project_status"
        
        # Check if status progression is correct
        case "$project_status" in
            "No Status")
                echo -e "${YELLOW}⚠️ Story is in 'No Status' - this might prevent Development Agent trigger${NC}"
                ;;
            "To Do")
                echo -e "${GREEN}✅ Story correctly moved to 'To Do' status${NC}"
                ;;
            "In Progress")
                echo -e "${GREEN}✅ Story moved to 'In Progress' status${NC}"
                ;;
            *)
                echo -e "${YELLOW}ℹ️ Story status: $project_status${NC}"
                ;;
        esac
    else
        echo -e "${RED}❌ Story not in project${NC}"
        success=false
    fi
    
    if [ "$success" = true ]; then
        echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED!${NC}"
        return 0
    else
        echo -e "${RED}💥 SOME VALIDATIONS FAILED${NC}"
        return 1
    fi
}

# Function to show detailed failure analysis
analyze_failures() {
    echo -e "${YELLOW}🔬 FAILURE ANALYSIS${NC}"
    echo "=================================================="
    
    echo -e "${BLUE}📊 Recent Scrum Master logs:${NC}"
    gh run view $(gh run list --workflow="scrum-master-agent.yml" --limit=1 --json databaseId --jq '.[0].databaseId') --log | grep -E "✅|❌|⚠️|Error|Failed" | tail -10 || echo "No logs found"
    
    echo ""
    echo -e "${BLUE}📊 Recent Development Agent logs:${NC}"
    gh run view $(gh run list --workflow="development-agent.yml" --limit=1 --json databaseId --jq '.[0].databaseId') --log | grep -E "✅|❌|⚠️|Error|Failed|Found linked tasks|No linked tasks" | tail -10 || echo "No logs found"
    
    echo ""
    check_webhook_deliveries
}

# Main execution
main() {
    local action="${1:-full}"
    
    case "$action" in
        "reset")
            reset_hello_world
            ;;
        "test")
            run_e2e_test
            ;;
        "validate")
            validate_outcomes
            ;;
        "analyze")
            analyze_failures
            ;;
        "full")
            reset_hello_world
            sleep 2
            if run_e2e_test; then
                sleep 5
                validate_outcomes
            else
                echo ""
                analyze_failures
            fi
            ;;
        *)
            echo "Usage: $0 [reset|test|validate|analyze|full]"
            echo ""
            echo "Commands:"
            echo "  reset    - Reset Hello World test environment"
            echo "  test     - Run E2E test (Scrum Master → Development Agent)"
            echo "  validate - Validate outcomes (branches, files, PRs)"
            echo "  analyze  - Show failure analysis"
            echo "  full     - Run complete cycle (default)"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
