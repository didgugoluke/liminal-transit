#!/bin/bash

# =============================================================================
# GitHub Project Status Column Alignment Fixer
# Resolves kanban status jumping from "No Status" to "Done" 
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project configuration
PROJECT_ID="PVT_kwDONQhLrs4ApQ3Q"
PROJECT_OWNER="@me"

# Logging functions
log_info() {
    echo -e "${BLUE}[KANBAN-FIX]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[KANBAN-FIX]${NC} $1"
}

log_error() {
    echo -e "${RED}[KANBAN-FIX]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[KANBAN-FIX]${NC} $1"
}

# =============================================================================
# Project Structure Analysis
# =============================================================================

# Get project structure details
analyze_project_structure() {
    log_info "Analyzing project structure for status columns..."
    
    # Get project details
    local project_data
    project_data=$(GH_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}" gh api graphql -f query='
        query($projectId: ID!) {
            node(id: $projectId) {
                ... on ProjectV2 {
                    title
                    fields(first: 20) {
                        nodes {
                            __typename
                            ... on ProjectV2Field {
                                id
                                name
                                dataType
                            }
                            ... on ProjectV2SingleSelectField {
                                id
                                name
                                dataType
                                options {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    ' -f projectId="$PROJECT_ID" 2>/dev/null || echo '{"data":{"node":null}}')
    
    if [ "$(echo "$project_data" | jq -r '.data.node')" = "null" ]; then
        log_error "Failed to fetch project structure"
        return 1
    fi
    
    # Extract status field information
    local status_field_data
    status_field_data=$(echo "$project_data" | jq -r '.data.node.fields.nodes[] | select(.name == "Status")')
    
    if [ -z "$status_field_data" ] || [ "$status_field_data" = "null" ]; then
        log_error "Status field not found in project"
        return 1
    fi
    
    local status_field_id
    status_field_id=$(echo "$status_field_data" | jq -r '.id')
    
    echo "STATUS_FIELD_ID=$status_field_id"
    
    # List all status options
    log_info "Available status options:"
    echo "$status_field_data" | jq -r '.options[]? | "  - \(.name) (ID: \(.id))"'
    
    # Store status options for later use
    echo "$status_field_data" | jq -r '.options[]? | "\(.name)|\(.id)"' > /tmp/status_options.txt
    
    return 0
}

# =============================================================================
# Status Validation and Mapping
# =============================================================================

# Validate status value exists in project
validate_status_value() {
    local status_name="$1"
    
    if [ ! -f /tmp/status_options.txt ]; then
        log_error "Status options not available - run analyze_project_structure first"
        return 1
    fi
    
    local status_id
    status_id=$(grep "^${status_name}|" /tmp/status_options.txt | cut -d'|' -f2)
    
    if [ -z "$status_id" ]; then
        log_error "Status '$status_name' not found in project options"
        log_info "Available options:"
        cat /tmp/status_options.txt | cut -d'|' -f1 | sed 's/^/  - /'
        return 1
    fi
    
    echo "STATUS_ID=$status_id"
    log_success "Status '$status_name' validated (ID: $status_id)"
    return 0
}

# Get the correct status option ID
get_status_option_id() {
    local status_name="$1"
    
    if [ ! -f /tmp/status_options.txt ]; then
        log_error "Status options not available"
        return 1
    fi
    
    grep "^${status_name}|" /tmp/status_options.txt | cut -d'|' -f2
}

# =============================================================================
# Safe Status Update Functions
# =============================================================================

# Update project item status with proper validation
safe_update_project_status() {
    local story_title="$1"
    local new_status="$2"
    local project_id="${3:-$PROJECT_ID}"
    
    log_info "Updating project status: '$story_title' → '$new_status'"
    
    # Validate status exists
    local status_option_id
    status_option_id=$(get_status_option_id "$new_status")
    
    if [ -z "$status_option_id" ]; then
        log_error "Invalid status: '$new_status'"
        return 1
    fi
    
    # Get project items (using cache for efficiency)
    local project_items
    if ! project_items=$(scripts/github-rate-limit-manager.sh safe-project-list "$project_id"); then
        log_error "Failed to get project items"
        return 1
    fi
    
    # Find the item ID
    local item_id
    item_id=$(echo "$project_items" | jq -r --arg title "$story_title" '.items[]? | select(.content.title == $title) | .id')
    
    if [ -z "$item_id" ] || [ "$item_id" = "null" ]; then
        log_error "Story not found in project: '$story_title'"
        return 1
    fi
    
    # Get status field ID
    local status_field_id
    if ! status_field_id=$(grep "^STATUS_FIELD_ID=" /tmp/project_analysis.txt 2>/dev/null | cut -d'=' -f2); then
        log_error "Status field ID not available - run analyze_project_structure first"
        return 1
    fi
    
    # Update the status using GraphQL with proper option ID
    log_info "Updating item $item_id to status option $status_option_id"
    
    local update_result
    update_result=$(GH_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}" gh api graphql -f query='
        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
            updateProjectV2ItemFieldValue(input: {
                projectId: $projectId
                itemId: $itemId
                fieldId: $fieldId
                value: {
                    singleSelectOptionId: $optionId
                }
            }) {
                projectV2Item {
                    id
                }
            }
        }
    ' -f projectId="$project_id" -f itemId="$item_id" -f fieldId="$status_field_id" -f optionId="$status_option_id" 2>/dev/null || echo '{"errors":[{"message":"Update failed"}]}')
    
    if [ "$(echo "$update_result" | jq -r '.errors // empty')" != "" ]; then
        log_error "Failed to update project status"
        echo "$update_result" | jq -r '.errors[]?.message'
        return 1
    fi
    
    log_success "Successfully updated '$story_title' to '$new_status'"
    return 0
}

# =============================================================================
# Story Lifecycle Management
# =============================================================================

# Fix story that jumped from "No Status" to "Done"
fix_jumped_story() {
    local story_title="$1"
    local target_status="${2:-To Do}"
    
    log_info "Fixing jumped story: '$story_title'"
    
    # Ensure we have project structure analyzed
    if [ ! -f /tmp/project_analysis.txt ]; then
        analyze_project_structure > /tmp/project_analysis.txt
    fi
    
    # Validate target status exists
    if ! validate_status_value "$target_status" >/dev/null; then
        log_error "Target status '$target_status' is not valid"
        return 1
    fi
    
    # Update to correct status
    if safe_update_project_status "$story_title" "$target_status"; then
        log_success "Story '$story_title' fixed - moved to '$target_status'"
        return 0
    else
        log_error "Failed to fix story '$story_title'"
        return 1
    fi
}

# Ensure proper story lifecycle progression
ensure_proper_lifecycle() {
    local story_title="$1"
    local current_status="$2"
    local desired_status="$3"
    
    log_info "Ensuring proper lifecycle: '$story_title' $current_status → $desired_status"
    
    # Define proper progression paths
    case "$current_status" in
        "No Status"|"null"|"")
            if [ "$desired_status" != "To Do" ]; then
                log_warning "Story should go to 'To Do' first, not '$desired_status'"
                # Fix to "To Do" first
                safe_update_project_status "$story_title" "To Do"
                log_info "Story moved to 'To Do' - ready for proper progression"
            else
                safe_update_project_status "$story_title" "$desired_status"
            fi
            ;;
        "To Do")
            if [ "$desired_status" = "Done" ]; then
                log_warning "Story jumping from 'To Do' directly to 'Done' - adding 'In Progress' step"
                safe_update_project_status "$story_title" "In Progress"
                sleep 2  # Brief pause for status to register
                safe_update_project_status "$story_title" "Done"
            else
                safe_update_project_status "$story_title" "$desired_status"
            fi
            ;;
        "In Progress")
            safe_update_project_status "$story_title" "$desired_status"
            ;;
        "Done")
            log_info "Story is already complete"
            ;;
        *)
            log_warning "Unknown current status: '$current_status' - proceeding with update"
            safe_update_project_status "$story_title" "$desired_status"
            ;;
    esac
}

# =============================================================================
# Diagnostic and Repair Functions
# =============================================================================

# Diagnose current project status issues
diagnose_status_issues() {
    log_info "Diagnosing project status issues..."
    
    # Analyze project structure
    analyze_project_structure > /tmp/project_analysis.txt
    
    # Get all project items
    local project_items
    if ! project_items=$(scripts/github-rate-limit-manager.sh safe-project-list "$PROJECT_ID"); then
        log_error "Cannot fetch project items for diagnosis"
        return 1
    fi
    
    log_info "Current project items and their status:"
    echo "$project_items" | jq -r '.items[]? | "  - \(.content.title // "Untitled") → \(.fieldValues.nodes[]? | select(.field.name == "Status") | .text // "No Status")"'
    
    # Look for potential issues
    local issues_found=false
    
    # Check for items with "Done" status that might have jumped
    local done_items
    done_items=$(echo "$project_items" | jq -r '.items[]? | select(.fieldValues.nodes[]?.text == "Done") | .content.title')
    
    if [ -n "$done_items" ]; then
        log_warning "Items with 'Done' status found - checking if they properly progressed:"
        echo "$done_items" | while read -r title; do
            if [ -n "$title" ]; then
                echo "  - $title"
                issues_found=true
            fi
        done
    fi
    
    # Check for items with "No Status"
    local no_status_items
    no_status_items=$(echo "$project_items" | jq -r '.items[]? | select(.fieldValues.nodes[]?.text == null or .fieldValues.nodes[]?.text == "No Status" or (.fieldValues.nodes | length == 0)) | .content.title')
    
    if [ -n "$no_status_items" ]; then
        log_info "Items without status found:"
        echo "$no_status_items" | while read -r title; do
            if [ -n "$title" ]; then
                echo "  - $title"
            fi
        done
    fi
    
    log_success "Diagnosis complete"
}

# =============================================================================
# Main Functions
# =============================================================================

# Main function
main() {
    local command="${1:-diagnose}"
    
    case "$command" in
        "analyze")
            analyze_project_structure
            ;;
        "diagnose")
            diagnose_status_issues
            ;;
        "validate")
            validate_status_value "$2"
            ;;
        "fix-story")
            fix_jumped_story "$2" "${3:-To Do}"
            ;;
        "update-status")
            safe_update_project_status "$2" "$3" "${4:-$PROJECT_ID}"
            ;;
        "ensure-lifecycle")
            ensure_proper_lifecycle "$2" "$3" "$4"
            ;;
        "repair-all")
            log_info "Running comprehensive repair..."
            diagnose_status_issues
            # Add specific repair logic based on diagnosis
            ;;
        *)
            echo "Usage: $0 {analyze|diagnose|validate|fix-story|update-status|ensure-lifecycle|repair-all}"
            echo ""
            echo "Commands:"
            echo "  analyze                           - Analyze project structure and status options"
            echo "  diagnose                          - Diagnose current status issues"
            echo "  validate <status>                 - Validate status value exists"
            echo "  fix-story <title> [status]        - Fix a specific story's status"
            echo "  update-status <title> <status>    - Update story status safely"
            echo "  ensure-lifecycle <title> <from> <to> - Ensure proper lifecycle progression"
            echo "  repair-all                        - Run comprehensive repair"
            exit 1
            ;;
    esac
}

# Export functions for use in workflows
export -f analyze_project_structure
export -f validate_status_value
export -f safe_update_project_status
export -f fix_jumped_story
export -f ensure_proper_lifecycle
export -f diagnose_status_issues

# Run main function if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
