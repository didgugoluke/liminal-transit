#!/bin/bash

# =============================================================================
# AI Agent Ecosystem Health Monitor
# =============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[MONITOR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[MONITOR]${NC} $1"; }
log_error() { echo -e "${RED}[MONITOR]${NC} $1"; }

# Check rate limits
check_rate_limits() {
    log_info "Checking GitHub API rate limits..."
    scripts/github-rate-limit-manager.sh check
}

# Check project status alignment
check_project_status() {
    log_info "Checking project status alignment..."
    scripts/fix-kanban-status.sh diagnose
}

# Generate health report
generate_health_report() {
    local report_file="/tmp/agent_health_$(date +%Y%m%d_%H%M%S).json"
    
    log_info "Generating health report: $report_file"
    
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"rate_limits\": $(scripts/github-rate-limit-manager.sh report /dev/stdout | tail -1),"
        echo "  \"workflow_runs\": $(gh run list --limit 10 --json status,conclusion,name | jq '[.[] | {name, status, conclusion}]'),"
        echo "  \"open_issues\": $(gh issue list --limit 20 --json number,title,labels | jq '[.[] | {number, title, labels: [.labels[].name]}]')"
        echo "}"
    } > "$report_file"
    
    log_info "Health report saved: $report_file"
}

main() {
    case "${1:-all}" in
        "rate-limits") check_rate_limits ;;
        "project") check_project_status ;;
        "report") generate_health_report ;;
        "all") 
            check_rate_limits
            check_project_status
            generate_health_report
            ;;
        *) echo "Usage: $0 {rate-limits|project|report|all}" ;;
    esac
}

main "$@"
