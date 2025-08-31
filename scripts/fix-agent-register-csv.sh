#!/bin/bash

# Fix Agent Register CSV - Update V1 agents to archived status

set -e

REGISTER_FILE="docs/AI-AGENT-REGISTER.csv"
TEMP_FILE=$(mktemp)

echo "🔧 Fixing Agent Register CSV - Updating V1 agents to archived status"
echo "====================================================================="

# Create fixed CSV with proper archived status
{
    # Keep the single header
    echo "Agent_ID,Agent_Name,Agent_Type,Development_Status,Production_Status,GitHub_Workflow,Lines_of_Code,Primary_Function,Trigger_Method,Performance_Metrics,Last_Updated,Epic_Integration,Dependencies,Notes"
    
    # Process all entries after headers, removing duplicates and fixing V1 agents
    tail -n +3 "$REGISTER_FILE" | sort -u -t',' -k1,1 | while IFS=',' read -r agent_id agent_name agent_type dev_status prod_status workflow_file lines_of_code primary_function trigger_method performance_metrics last_updated epic_integration dependencies notes; do
        
        # Skip header row if it appears
        if [[ "$agent_id" == "Agent_ID" ]]; then
            continue
        fi
        
        # Clean up duplicate "V1 ARCHIVED:" prefixes
        notes=$(echo "$notes" | sed 's/V1 ARCHIVED: V1 ARCHIVED: /V1 ARCHIVED: /g')
        
        # Update V1 agents (GitHub Actions Workflow type that are Complete/Operational) - EXCEPT CI/CD
        if [[ "$agent_type" == "GitHub Actions Workflow" && "$dev_status" == "✅ Complete" && "$prod_status" == "✅ Operational" && "$agent_id" != "ci-cd-pipeline-v1" ]]; then
            prod_status="📦 Archived (V1 Baseline)"
            if [[ ! "$notes" =~ ^"V1 ARCHIVED:" ]]; then
                notes="V1 ARCHIVED: $notes"
            fi
        fi
        
        echo "$agent_id,$agent_name,$agent_type,$dev_status,$prod_status,$workflow_file,$lines_of_code,$primary_function,$trigger_method,$performance_metrics,$last_updated,$epic_integration,$dependencies,$notes"
    done
} > "$TEMP_FILE"

# Replace original with fixed version
mv "$TEMP_FILE" "$REGISTER_FILE"

echo "✅ Agent Register CSV fixed successfully!"

# Generate validation report
echo ""
echo "📊 Validation Summary:"
echo "====================="

echo -n "📦 Archived Agents: "
grep -c "📦 Archived" "$REGISTER_FILE" || echo "0"

echo -n "✅ Operational Agents: "
grep -c "✅ Operational" "$REGISTER_FILE" || echo "0"

echo -n "🔄 In Development: "
grep -c "🔄 In Development" "$REGISTER_FILE" || echo "0"

echo -n "📋 Planned Agents: "
grep -c "📋 Planned" "$REGISTER_FILE" || echo "0"

echo ""
echo "✅ CSV validation complete!"