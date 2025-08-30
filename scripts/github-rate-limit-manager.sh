#!/bin/bash

# =============================================================================
# GitHub API Rate Limit Management Utilities
# Provides comprehensive rate limiting for AI agent workflows
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Rate limit thresholds
GRAPHQL_MIN_REMAINING=200
REST_MIN_REMAINING=500
SEARCH_MIN_REMAINING=10

# Logging functions
log_rate_info() {
    echo -e "${BLUE}[RATE-LIMIT]${NC} $1"
}

log_rate_warning() {
    echo -e "${YELLOW}[RATE-LIMIT]${NC} $1"
}

log_rate_error() {
    echo -e "${RED}[RATE-LIMIT]${NC} $1"
}

log_rate_success() {
    echo -e "${GREEN}[RATE-LIMIT]${NC} $1"
}

# =============================================================================
# Rate Limit Checking Functions
# =============================================================================

# Check all API rate limits
check_all_rate_limits() {
    log_rate_info "Checking GitHub API rate limits..."
    
    local rate_data
    rate_data=$(gh api rate_limit 2>/dev/null || echo '{"resources":{"core":{"remaining":0},"graphql":{"remaining":0},"search":{"remaining":0}}}')
    
    local graphql_remaining
    local rest_remaining
    local search_remaining
    local graphql_reset
    local rest_reset
    local search_reset
    
    graphql_remaining=$(echo "$rate_data" | jq -r '.resources.graphql.remaining // 0')
    rest_remaining=$(echo "$rate_data" | jq -r '.resources.core.remaining // 0')
    search_remaining=$(echo "$rate_data" | jq -r '.resources.search.remaining // 0')
    
    graphql_reset=$(echo "$rate_data" | jq -r '.resources.graphql.reset // 0')
    rest_reset=$(echo "$rate_data" | jq -r '.resources.core.reset // 0')
    search_reset=$(echo "$rate_data" | jq -r '.resources.search.reset // 0')
    
    echo "GRAPHQL_REMAINING=$graphql_remaining"
    echo "REST_REMAINING=$rest_remaining"
    echo "SEARCH_REMAINING=$search_remaining"
    echo "GRAPHQL_RESET=$graphql_reset"
    echo "REST_RESET=$rest_reset"
    echo "SEARCH_RESET=$search_reset"
    
    # Check if any limits are critically low
    local critical_limit=false
    
    if [ "$graphql_remaining" -lt "$GRAPHQL_MIN_REMAINING" ]; then
        log_rate_warning "GraphQL rate limit low: $graphql_remaining remaining (min: $GRAPHQL_MIN_REMAINING)"
        critical_limit=true
    fi
    
    if [ "$rest_remaining" -lt "$REST_MIN_REMAINING" ]; then
        log_rate_warning "REST API rate limit low: $rest_remaining remaining (min: $REST_MIN_REMAINING)"
        critical_limit=true
    fi
    
    if [ "$search_remaining" -lt "$SEARCH_MIN_REMAINING" ]; then
        log_rate_warning "Search API rate limit low: $search_remaining remaining (min: $SEARCH_MIN_REMAINING)"
        critical_limit=true
    fi
    
    if [ "$critical_limit" = true ]; then
        echo "RATE_LIMIT_STATUS=CRITICAL"
        return 1
    else
        echo "RATE_LIMIT_STATUS=OK"
        log_rate_success "All rate limits OK - GraphQL: $graphql_remaining, REST: $rest_remaining, Search: $search_remaining"
        return 0
    fi
}

# Check rate limit before GraphQL operations
check_graphql_rate_limit() {
    local operation_name="${1:-GraphQL operation}"
    local min_required="${2:-$GRAPHQL_MIN_REMAINING}"
    
    log_rate_info "Checking GraphQL rate limit for: $operation_name"
    
    local rate_data
    rate_data=$(gh api rate_limit 2>/dev/null || echo '{"resources":{"graphql":{"remaining":0,"reset":0}}}')
    
    local remaining
    local reset_time
    remaining=$(echo "$rate_data" | jq -r '.resources.graphql.remaining // 0')
    reset_time=$(echo "$rate_data" | jq -r '.resources.graphql.reset // 0')
    
    if [ "$remaining" -lt "$min_required" ]; then
        local reset_date
        if command -v date >/dev/null 2>&1; then
            reset_date=$(date -r "$reset_time" 2>/dev/null || echo "unknown")
        else
            reset_date="unknown"
        fi
        
        log_rate_error "GraphQL rate limit too low for $operation_name"
        log_rate_error "Remaining: $remaining, Required: $min_required"
        log_rate_error "Rate limit resets at: $reset_date"
        return 1
    fi
    
    log_rate_success "GraphQL rate limit OK: $remaining remaining"
    return 0
}

# Check rate limit before REST API operations
check_rest_rate_limit() {
    local operation_name="${1:-REST operation}"
    local min_required="${2:-$REST_MIN_REMAINING}"
    
    log_rate_info "Checking REST rate limit for: $operation_name"
    
    local rate_data
    rate_data=$(gh api rate_limit 2>/dev/null || echo '{"resources":{"core":{"remaining":0,"reset":0}}}')
    
    local remaining
    local reset_time
    remaining=$(echo "$rate_data" | jq -r '.resources.core.remaining // 0')
    reset_time=$(echo "$rate_data" | jq -r '.resources.core.reset // 0')
    
    if [ "$remaining" -lt "$min_required" ]; then
        local reset_date
        if command -v date >/dev/null 2>&1; then
            reset_date=$(date -r "$reset_time" 2>/dev/null || echo "unknown")
        else
            reset_date="unknown"
        fi
        
        log_rate_error "REST rate limit too low for $operation_name"
        log_rate_error "Remaining: $remaining, Required: $min_required"
        log_rate_error "Rate limit resets at: $reset_date"
        return 1
    fi
    
    log_rate_success "REST rate limit OK: $remaining remaining"
    return 0
}

# =============================================================================
# Optimized API Operation Functions
# =============================================================================

# Safe issue view with rate limiting
safe_issue_view() {
    local issue_number="$1"
    local fields="${2:-title,labels,state,body,number}"
    
    if ! check_rest_rate_limit "issue view #$issue_number" 10; then
        log_rate_error "Cannot perform issue view due to rate limits"
        return 1
    fi
    
    gh api "repos/:owner/:repo/issues/$issue_number" --jq "{$(echo "$fields" | sed 's/,/: ., /g'): .}"
}

# Safe project item list with caching
safe_project_item_list() {
    local project_id="$1"
    local cache_file="/tmp/project_${project_id}_cache.json"
    local cache_max_age=300 # 5 minutes
    
    # Check if we have a recent cache
    if [ -f "$cache_file" ]; then
        local cache_age
        cache_age=$(($(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file" 2>/dev/null || echo 0)))
        if [ "$cache_age" -lt "$cache_max_age" ]; then
            log_rate_info "Using cached project data (age: ${cache_age}s)"
            cat "$cache_file"
            return 0
        fi
    fi
    
    if ! check_graphql_rate_limit "project item list" 50; then
        log_rate_warning "Rate limit low, using cached data if available"
        if [ -f "$cache_file" ]; then
            cat "$cache_file"
            return 0
        else
            log_rate_error "No cache available and rate limit exceeded"
            return 1
        fi
    fi
    
    log_rate_info "Fetching fresh project data"
    GH_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}" gh project item-list "$project_id" --owner "@me" --format json > "$cache_file"
    cat "$cache_file"
}

# Safe project item edit with rate limiting
safe_project_item_edit() {
    local project_id="$1"
    local item_id="$2"
    local field_id="$3"
    local new_value="$4"
    
    if ! check_graphql_rate_limit "project item edit" 20; then
        log_rate_error "Cannot perform project item edit due to rate limits"
        return 1
    fi
    
    log_rate_info "Updating project item $item_id field $field_id to: $new_value"
    GH_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}" gh project item-edit --project-id "$project_id" --id "$item_id" --field-id "$field_id" --text "$new_value"
}

# Batch project operations to reduce API calls
batch_project_status_update() {
    local project_id="$1"
    local story_title="$2"
    local new_status="$3"
    
    log_rate_info "Batch updating project status for: $story_title → $new_status"
    
    # Get project items with caching
    local project_items
    project_items=$(safe_project_item_list "$project_id")
    
    if [ $? -ne 0 ]; then
        log_rate_error "Failed to get project items"
        return 1
    fi
    
    # Find the item ID locally instead of making another API call
    local item_id
    item_id=$(echo "$project_items" | jq -r --arg title "$story_title" '.items[] | select(.content.title == $title) | .id')
    
    if [ -z "$item_id" ] || [ "$item_id" = "null" ]; then
        log_rate_warning "Story not found in project: $story_title"
        return 1
    fi
    
    # Update the status
    safe_project_item_edit "$project_id" "$item_id" "Status" "$new_status"
}

# =============================================================================
# Rate Limit Monitoring and Reporting
# =============================================================================

# Generate rate limit report
generate_rate_limit_report() {
    local report_file="${1:-/tmp/rate_limit_report.json}"
    
    log_rate_info "Generating rate limit report..."
    
    local rate_data
    rate_data=$(gh api rate_limit 2>/dev/null || echo '{"resources":{"core":{"remaining":0},"graphql":{"remaining":0},"search":{"remaining":0}}}')
    
    # Add timestamp and analysis
    echo "$rate_data" | jq ". + {
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"analysis\": {
            \"graphql_status\": (if .resources.graphql.remaining < $GRAPHQL_MIN_REMAINING then \"LOW\" else \"OK\" end),
            \"rest_status\": (if .resources.core.remaining < $REST_MIN_REMAINING then \"LOW\" else \"OK\" end),
            \"search_status\": (if .resources.search.remaining < $SEARCH_MIN_REMAINING then \"LOW\" else \"OK\" end)
        }
    }" > "$report_file"
    
    log_rate_success "Rate limit report saved to: $report_file"
}

# =============================================================================
# Emergency Rate Limit Handling
# =============================================================================

# Handle rate limit emergency
handle_rate_limit_emergency() {
    local operation_name="$1"
    
    log_rate_error "RATE LIMIT EMERGENCY: $operation_name blocked"
    
    # Generate emergency report
    generate_rate_limit_report "/tmp/emergency_rate_limit_$(date +%s).json"
    
    # Get rate limit status
    local rate_data
    rate_data=$(gh api rate_limit 2>/dev/null || echo '{"resources":{"graphql":{"reset":0},"core":{"reset":0}}}')
    
    local graphql_reset
    local rest_reset
    graphql_reset=$(echo "$rate_data" | jq -r '.resources.graphql.reset // 0')
    rest_reset=$(echo "$rate_data" | jq -r '.resources.core.reset // 0')
    
    # Calculate wait time
    local current_time
    current_time=$(date +%s)
    local wait_time
    wait_time=$((graphql_reset > rest_reset ? graphql_reset - current_time : rest_reset - current_time))
    
    if [ "$wait_time" -gt 0 ]; then
        local wait_minutes
        wait_minutes=$((wait_time / 60))
        log_rate_error "Rate limits will reset in approximately $wait_minutes minutes"
    fi
    
    # Set output for GitHub Actions
    echo "RATE_LIMIT_EMERGENCY=true" >> "${GITHUB_OUTPUT:-/dev/null}"
    echo "OPERATION_BLOCKED=$operation_name" >> "${GITHUB_OUTPUT:-/dev/null}"
    echo "WAIT_TIME_SECONDS=$wait_time" >> "${GITHUB_OUTPUT:-/dev/null}"
    
    return 1
}

# =============================================================================
# Main Function for Workflow Integration
# =============================================================================

# Main function that can be called from workflows
main() {
    local command="${1:-check}"
    
    case "$command" in
        "check")
            check_all_rate_limits
            ;;
        "check-graphql")
            check_graphql_rate_limit "${2:-GraphQL operation}" "${3:-$GRAPHQL_MIN_REMAINING}"
            ;;
        "check-rest")
            check_rest_rate_limit "${2:-REST operation}" "${3:-$REST_MIN_REMAINING}"
            ;;
        "safe-issue-view")
            safe_issue_view "$2" "${3:-title,labels,state,body,number}"
            ;;
        "safe-project-list")
            safe_project_item_list "$2"
            ;;
        "safe-project-edit")
            safe_project_item_edit "$2" "$3" "$4" "$5"
            ;;
        "batch-status-update")
            batch_project_status_update "$2" "$3" "$4"
            ;;
        "report")
            generate_rate_limit_report "$2"
            ;;
        "emergency")
            handle_rate_limit_emergency "$2"
            ;;
        *)
            echo "Usage: $0 {check|check-graphql|check-rest|safe-issue-view|safe-project-list|safe-project-edit|batch-status-update|report|emergency}"
            exit 1
            ;;
    esac
}

# Export functions for use in other scripts
export -f check_all_rate_limits
export -f check_graphql_rate_limit
export -f check_rest_rate_limit
export -f safe_issue_view
export -f safe_project_item_list
export -f safe_project_item_edit
export -f batch_project_status_update
export -f generate_rate_limit_report
export -f handle_rate_limit_emergency

# Run main function if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
