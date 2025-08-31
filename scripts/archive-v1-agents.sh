#!/bin/bash

# V1 Agent Archival Script
# Safely disables all V1 GitHub Actions agents while preserving them as operational baseline

set -e

echo "🚀 V1 Agent Archival Script - Preparing for V2 Transition"
echo "=========================================================="

WORKFLOWS_DIR=".github/workflows"
REGISTER_FILE="docs/AI-AGENT-REGISTER.csv"
ARCHIVE_DIR="archive/v1-agents"

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# List of V1 agent workflows to archive
V1_AGENTS=(
    "ai-agent-orchestrator.yml"
    "scrum-master-agent.yml" 
    "development-agent.yml"
    "project-admin-agent.yml"
    "project-cleanup-agent.yml"
    "epic-task-orchestrator.yml"
    "find-replace-agent.yml"
    "github-issue-comment-agent.yml"
    "copilot-pr-kanban-manager.yml"
    "enhanced-pr-kanban-manager.yml"
    "github-copilot-claude4-agent.yml"
    "observatory-monitoring.yml"
    "well-architected-compliance.yml"
)

# Workflows to keep active (essential infrastructure)
KEEP_ACTIVE=(
    "ci-cd.yml"
)

echo "📦 Archiving V1 Agents..."
echo "========================"

for workflow in "${V1_AGENTS[@]}"; do
    workflow_path="$WORKFLOWS_DIR/$workflow"
    
    if [ -f "$workflow_path" ]; then
        echo "🔄 Processing: $workflow"
        
        # Backup original to archive
        cp "$workflow_path" "$ARCHIVE_DIR/${workflow%.yml}-v1-original.yml"
        
        # Add archival marker to workflow name and disable with if: false
        if ! grep -q "ARCHIVED V1" "$workflow_path"; then
            # Update workflow name to indicate archival
            sed -i 's/^name: \(.*\)$/name: 📦 [ARCHIVED V1] \1/' "$workflow_path"
            
            # Find the first job and add archival condition
            first_job_line=$(grep -n "^  [a-zA-Z].*:$" "$workflow_path" | head -1 | cut -d: -f1)
            
            if [ ! -z "$first_job_line" ]; then
                # Insert archival condition before first job
                next_line=$((first_job_line + 1))
                
                # Check if there's already an 'if' condition
                if grep -A 3 "^  [a-zA-Z].*:$" "$workflow_path" | grep -q "if:"; then
                    # Modify existing if condition
                    sed -i '/if:/c\
                else
                    # Add new if condition after the job declaration
                    sed -i "${next_line}i\
                fi
            fi
        fi
        
        echo "  ✅ Archived: $workflow"
    else
        echo "  ⚠️  Not found: $workflow"
    fi
done

echo ""
echo "📋 Keeping Active Workflows:"
echo "============================="
for workflow in "${KEEP_ACTIVE[@]}"; do
    echo "  ✅ Active: $workflow"
done

echo ""
echo "📊 Updating Agent Register CSV..."
echo "=================================="

# Create temporary file for updated register
temp_file=$(mktemp)

# Process CSV and update V1 agents to archived status
{
    head -n 2 "$REGISTER_FILE"  # Keep headers
    tail -n +2 "$REGISTER_FILE" | while IFS=',' read -r agent_id agent_name agent_type dev_status prod_status workflow_file lines_of_code primary_function trigger_method performance_metrics last_updated epic_integration dependencies notes; do
        # Check if this is a V1 agent (GitHub Actions Workflow)
        if [[ "$agent_type" == "GitHub Actions Workflow" && "$prod_status" == "✅ Operational" ]]; then
            # Update to archived status
            new_prod_status="📦 Archived (V1 Baseline)"
            new_notes="V1 ARCHIVED: ${notes#V1 ARCHIVED: }"  # Remove existing prefix if present
            new_notes="V1 ARCHIVED: $new_notes"
            
            echo "$agent_id,$agent_name,$agent_type,$dev_status,$new_prod_status,$workflow_file,$lines_of_code,$primary_function,$trigger_method,$performance_metrics,$last_updated,$epic_integration,$dependencies,$new_notes"
        else
            # Keep other agents unchanged
            echo "$agent_id,$agent_name,$agent_type,$dev_status,$prod_status,$workflow_file,$lines_of_code,$primary_function,$trigger_method,$performance_metrics,$last_updated,$epic_integration,$dependencies,$notes"
        fi
    done
} > "$temp_file"

# Replace original with updated version
mv "$temp_file" "$REGISTER_FILE"

echo "✅ Agent Register updated with archived status"

echo ""
echo "🎯 V1 Archival Summary:"
echo "======================="
echo "📦 Archived Agents: ${#V1_AGENTS[@]}"
echo "✅ Active Workflows: ${#KEEP_ACTIVE[@]}"
echo "💾 Backup Location: $ARCHIVE_DIR"
echo ""
echo "🔄 Next Steps:"
echo "- V1 agents are disabled but preserved as operational baseline"
echo "- Remove 'if: false &&' condition from any workflow to reactivate"
echo "- Original configurations backed up in $ARCHIVE_DIR"
echo "- Ready for V2 agent development and deployment"
echo ""
echo "✅ V1 Agent Archival Complete!"