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

# Function to wait for workflow completion
wait_for_workflow() {
    local workflow=$1
    local timeout=${2:-120}
    local start_time=$(date +%s)
    
    echo -e "${YELLOW}⏳ Waiting for ${workflow} to complete...${NC}"
    
    while true; do
        local status=$(gh run list --workflow="${workflow}" --limit=1 --json status --jq '.[0].status' 2>/dev/null || echo "unknown")
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ "$status" = "completed" ]; then
            local conclusion=$(gh run list --workflow="${workflow}" --limit=1 --json conclusion --jq '.[0].conclusion')
            if [ "$conclusion" = "success" ]; then
                echo -e "${GREEN}✅ ${workflow} completed successfully${NC}"
                return 0
            else
                echo -e "${RED}❌ ${workflow} failed with conclusion: ${conclusion}${NC}"
                return 1
            fi
        elif [ "$status" = "in_progress" ] || [ "$status" = "queued" ]; then
            echo -n "."
            sleep 5
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

# Function to check workflow outcome
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
    
    # Check if Development Agent was triggered
    echo -e "${BLUE}2️⃣ Checking if Development Agent was triggered...${NC}"
    sleep 10  # Give time for trigger
    
    local dev_agent_runs_before=$(gh run list --workflow="development-agent.yml" --limit=5 --json createdAt --jq 'length')
    sleep 20  # Wait for potential new run
    local dev_agent_runs_after=$(gh run list --workflow="development-agent.yml" --limit=5 --json createdAt --jq 'length')
    
    if [ "$dev_agent_runs_after" -gt "$dev_agent_runs_before" ] || gh run list --workflow="development-agent.yml" --limit=1 --json status --jq '.[0].status' | grep -q "in_progress\|queued"; then
        echo -e "${GREEN}✅ Development Agent was triggered${NC}"
        
        if ! wait_for_workflow "development-agent.yml" 180; then
            echo -e "${RED}❌ Development Agent failed${NC}"
            check_workflow_outcome "development-agent.yml"
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
    
    # Check if story is in project
    echo -e "${BLUE}📋 Checking project status...${NC}"
    if gh project item-list "${PROJECT_ID}" --owner "${OWNER}" | grep -q "Hello World E2E"; then
        echo -e "${GREEN}✅ Story added to project${NC}"
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
