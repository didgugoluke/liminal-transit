#!/bin/bash

# AI Agent Register Maintenance Script
# Automatically updates agent status and validates workflow files

set -e

REGISTER_FILE="docs/AI-AGENT-REGISTER.csv"
WORKFLOWS_DIR=".github/workflows"
TEMP_FILE="/tmp/agent-register-update.csv"

echo "🤖 AI Agent Register Maintenance Script"
echo "========================================"

# Function to check if a workflow file exists and get its line count
check_workflow() {
    local workflow_file="$1"
    if [ -f "$workflow_file" ]; then
        local line_count=$(wc -l < "$workflow_file")
        echo "$line_count"
    else
        echo "0"
    fi
}

# Function to check GitHub Actions workflow status
check_workflow_status() {
    local workflow_name="$1"
    # This would require gh CLI authentication
    # gh workflow list --limit 50 | grep "$workflow_name" | head -1 || echo "Not found"
    echo "✅ Operational" # Default for now
}

# Function to update agent status based on file existence and validation
update_agent_status() {
    local agent_id="$1"
    local workflow_file="$2"
    
    if [ -f "$workflow_file" ]; then
        echo "✅ Operational"
    elif [[ "$agent_id" == *"agent-"* ]] && [[ "$agent_id" != *"-v1" ]]; then
        echo "🔄 In Development"
    else
        echo "📋 Planned"
    fi
}

echo "📊 Checking agent status..."

# Create header for updated file
echo "Agent_ID,Agent_Name,Agent_Type,Development_Status,Production_Status,GitHub_Workflow,Lines_of_Code,Primary_Function,Trigger_Method,Performance_Metrics,Last_Updated,Epic_Integration,Dependencies,Notes" > "$TEMP_FILE"

# Skip header and process each agent
tail -n +2 "$REGISTER_FILE" | while IFS=',' read -r agent_id agent_name agent_type dev_status prod_status workflow_file lines_of_code primary_function trigger_method performance_metrics last_updated epic_integration dependencies notes; do
    
    # Update line count if workflow exists
    if [ ! -z "$workflow_file" ] && [ "$workflow_file" != "TBD" ]; then
        full_workflow_path="$workflow_file"
        if [ -f "$full_workflow_path" ]; then
            actual_lines=$(check_workflow "$full_workflow_path")
            if [ "$actual_lines" -gt 0 ]; then
                lines_of_code="$actual_lines"
            fi
        fi
    fi
    
    # Update production status based on workflow existence
    if [ ! -z "$workflow_file" ] && [ "$workflow_file" != "TBD" ] && [ -f "$workflow_file" ]; then
        # Check if agent is archived (don't override archived status)
        if [[ "$prod_status" == "📦 Archived (V1 Baseline)" ]]; then
            # Keep archived status
            prod_status="📦 Archived (V1 Baseline)"
            dev_status="✅ Complete"
        else
            prod_status="✅ Operational"
            dev_status="✅ Complete"
        fi
    elif [[ "$agent_id" == *"observatory"* ]] || [[ "$agent_id" == *"storygen"* ]] || [[ "$agent_id" == *"qualityguard"* ]] || [[ "$agent_id" == *"experimentlab"* ]] || [[ "$agent_id" == *"debugmaster"* ]]; then
        prod_status="🚧 Epic 2 Development"
        dev_status="🔄 In Development"
    elif [[ "$agent_id" == *"infraopt"* ]] || [[ "$agent_id" == *"deploymaster"* ]] || [[ "$agent_id" == *"secureops"* ]] || [[ "$agent_id" == *"datasage"* ]]; then
        prod_status="🚧 Epic 3 Development"
        dev_status="📋 Planned"
    fi
    
    # Update last_updated to current date
    current_date=$(date +%Y-%m-%d)
    
    # Write updated row
    echo "$agent_id,$agent_name,$agent_type,$dev_status,$prod_status,$workflow_file,$lines_of_code,$primary_function,$trigger_method,$performance_metrics,$current_date,$epic_integration,$dependencies,$notes" >> "$TEMP_FILE"
done

# Replace original file with updated version
mv "$TEMP_FILE" "$REGISTER_FILE"

echo "✅ Agent register updated successfully!"

# Generate summary report
echo ""
echo "📋 Agent Status Summary:"
echo "========================"

echo -n "✅ Operational Agents: "
grep -c "✅ Operational" "$REGISTER_FILE" || echo "0"

echo -n "📦 Archived (V1 Baseline): "
grep -c "📦 Archived" "$REGISTER_FILE" || echo "0"

echo -n "🔄 In Development: "
grep -c "🔄 In Development" "$REGISTER_FILE" || echo "0"

echo -n "📋 Planned Agents: "
grep -c "📋 Planned" "$REGISTER_FILE" || echo "0"

echo -n "🚧 Epic 2 Development: "
grep -c "🚧 Epic 2" "$REGISTER_FILE" || echo "0"

echo -n "🚧 Epic 3 Development: "
grep -c "🚧 Epic 3" "$REGISTER_FILE" || echo "0"

echo ""
echo "📁 Workflow Files Status:"
echo "=========================="

# Check for workflow files that exist but aren't in register
echo "Checking for unregistered workflows..."
for workflow in "$WORKFLOWS_DIR"/*.yml; do
    if [ -f "$workflow" ]; then
        workflow_name=$(basename "$workflow")
        if ! grep -q "$workflow" "$REGISTER_FILE"; then
            echo "⚠️  Unregistered workflow found: $workflow_name"
        fi
    fi
done

# Check for registered workflows that don't exist
echo "Checking for missing workflow files..."
grep -o '\\.github/workflows/[^,]*\\.yml' "$REGISTER_FILE" | while read -r workflow_path; do
    if [ ! -f "$workflow_path" ] && [ "$workflow_path" != "TBD" ]; then
        echo "❌ Missing workflow file: $workflow_path"
    fi
done

echo ""
echo "🎯 Next Actions:"
echo "================"
echo "1. Review unregistered workflows and add to register"
echo "2. Update missing workflow files or mark as TBD"
echo "3. Validate Epic 2 development progress"
echo "4. Plan Epic 3 infrastructure agents"

echo ""
echo "📊 Register file location: $REGISTER_FILE"
echo "🔄 Last updated: $(date)"
