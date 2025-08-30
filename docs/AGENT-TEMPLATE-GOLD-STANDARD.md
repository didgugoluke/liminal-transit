# 🤖 GitHub Actions Agent Template - Gold Standard

## Overview

This is the proven template for creating new AI agents in the NOVELI.SH ecosystem. Based on systematic analysis of all working agents, this template includes all essential patterns for reliable agent execution.

## 🎯 Core Design Principles

- **Authentication First**: All agents must have proper GitHub CLI authentication
- **Rate Limiting Protection**: Mandatory rate limit checks before GitHub API operations
- **Error Handling**: Graceful degradation and emergency protocols
- **Observability**: Clear logging and status reporting
- **Modularity**: Single responsibility with clean handoff patterns
- **AI Native**: Designed for autonomous operation with human oversight

## 📋 Agent Template

```yaml
name: 🤖 [Agent Name] Agent

on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: "Issue number to process"
        required: true
        type: string
      trigger_comment:
        description: "Comment that triggered this agent"
        required: false
        type: string

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  agent-execution:
    name: 🤖 [Agent Name] Execution
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: ⚡ Setup Rate Limiting
        run: |
          echo "Setting up [Agent Name] environment with rate limiting..."
          chmod +x scripts/github-rate-limit-manager.sh

          # Check initial rate limits
          if ! scripts/github-rate-limit-manager.sh check; then
            echo "❌ Rate limits too low for [Agent Name] operations"
            scripts/github-rate-limit-manager.sh emergency "[Agent Name]"
            exit 1
          fi

          echo "✅ Rate limits OK - proceeding with [agent] tasks"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: ⚙️ Configure Git and GitHub CLI
        run: |
          git config --global user.name "AI [Agent Name] Agent"
          git config --global user.email "[agent-name]-agent@noveli.sh"

          # Verify GitHub CLI authentication
          if ! gh auth status; then
            echo "❌ GitHub CLI authentication failed"
            exit 1
          fi

          echo "✅ Git and GitHub CLI configured successfully"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: 📊 Agent Context Analysis
        id: context_analysis
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "🔍 Analyzing agent context..."

          ISSUE_NUMBER="${{ github.event.inputs.issue_number }}"
          TRIGGER_COMMENT="${{ github.event.inputs.trigger_comment }}"

          # Validate inputs with defaults to avoid null/empty warnings
          if [ -z "$ISSUE_NUMBER" ] || [ "$ISSUE_NUMBER" = "null" ]; then
            echo "❌ No issue number provided"
            exit 1
          fi

          # Get issue details
          ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title')
          ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body --jq '.body')
          ISSUE_LABELS=$(gh issue view "$ISSUE_NUMBER" --json labels --jq '.labels[].name' | tr '\n' ',' | sed 's/,$//')

          echo "📋 Issue: #$ISSUE_NUMBER - $ISSUE_TITLE"
          echo "🏷️ Labels: $ISSUE_LABELS"

          # Set environment variables for subsequent steps
          echo "ISSUE_NUMBER=$ISSUE_NUMBER" >> $GITHUB_ENV
          echo "ISSUE_TITLE=$ISSUE_TITLE" >> $GITHUB_ENV
          echo "ISSUE_BODY=$ISSUE_BODY" >> $GITHUB_ENV
          echo "ISSUE_LABELS=$ISSUE_LABELS" >> $GITHUB_ENV
          echo "TRIGGER_COMMENT=$TRIGGER_COMMENT" >> $GITHUB_ENV

          # Export for step outputs (alternative access pattern)
          echo "issue_number=$ISSUE_NUMBER" >> $GITHUB_OUTPUT
          echo "issue_title=$ISSUE_TITLE" >> $GITHUB_OUTPUT
          echo "issue_body=$ISSUE_BODY" >> $GITHUB_OUTPUT
          echo "issue_labels=$ISSUE_LABELS" >> $GITHUB_OUTPUT
          echo "trigger_comment=$TRIGGER_COMMENT" >> $GITHUB_OUTPUT

      - name: 🎯 Core Agent Logic
        id: agent_execution
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ISSUE_NUMBER: ${{ env.ISSUE_NUMBER }}
          ISSUE_TITLE: ${{ env.ISSUE_TITLE }}
          # Add other environment variables needed for this step
        run: |
          echo "🤖 Executing [Agent Name] core logic..."
          echo "Processing Issue: #$ISSUE_NUMBER - $ISSUE_TITLE"

          # REPLACE THIS SECTION WITH AGENT-SPECIFIC LOGIC
          # Example patterns:

          # For analysis agents:
          # - Parse requirements from issue
          # - Generate analysis or breakdown
          # - Create structured output

          # For implementation agents:
          # - Create feature branch
          # - Generate code files
          # - Create pull request

          # For coordination agents:
          # - Update project status
          # - Trigger other agents
          # - Manage workflow handoffs

          echo "✅ [Agent Name] execution completed"

      - name: 📝 Update Issue Status
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ISSUE_NUMBER: ${{ env.ISSUE_NUMBER }}
          ISSUE_TITLE: ${{ env.ISSUE_TITLE }}
          TRIGGER_COMMENT: ${{ env.TRIGGER_COMMENT }}
        run: |
          echo "📝 Updating issue status..."

          # Rate limit check before commenting
          if scripts/github-rate-limit-manager.sh check-rest "issue comment" 10; then
            gh issue comment "$ISSUE_NUMBER" --body "✅ **[Agent Name] Agent Complete**

## 🎯 Agent Execution Summary

- **Status**: Successfully completed
- **Issue**: #$ISSUE_NUMBER - $ISSUE_TITLE
- **Trigger**: $TRIGGER_COMMENT

## 📊 Results

[Include agent-specific results here]

## 🔄 Next Steps

[Include any handoff instructions or next actions]

---
*Executed by [Agent Name] Agent at $(date -u '+%Y-%m-%d %H:%M:%S UTC')*"
          else
            echo "⚠️ Rate limit too low for issue comment - skipping status update"
          fi

      - name: � Create Pull Request
        run: |
          # Create PR first
          PR_URL=$(gh pr create \
            --title "PR Title" \
            --body "$PR_BODY" \
            --head "$BRANCH_NAME" \
            --base main)

          # Add labels one by one with error handling
          for label in "ai-agent" "automated"; do
            if gh label list | grep -q "^$label"; then
              if gh pr edit "$PR_URL" --add-label "$label" 2>/dev/null; then
                echo "✅ Added label: $label"
              else
                echo "⚠️ Failed to add label: $label"
              fi
            else
              echo "⚠️ Label not found: $label"
            fi
          done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: �🔄 Agent Handoff (Optional)
        if: success()
        run: |
          echo "🔄 Initiating agent handoff..."

          # Example: Trigger next agent in workflow
          # gh workflow run next-agent.yml \
          #   --field issue_number="${{ steps.context_analysis.outputs.issue_number }}" \
          #   --field previous_agent="[Agent Name]"

          echo "✅ Handoff completed"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: 🚨 Emergency Cleanup
        if: failure()
        run: |
          echo "🚨 Agent execution failed - performing emergency cleanup..."

          # Clean up any partial work
          # Report failure status
          # Trigger recovery procedures if needed

          if scripts/github-rate-limit-manager.sh check-rest "emergency comment" 5; then
            gh issue comment "${{ github.event.inputs.issue_number }}" --body "🚨 **[Agent Name] Agent Failed**

Agent execution encountered an error and has been stopped. Manual intervention may be required.

**Issue**: #${{ github.event.inputs.issue_number }}
**Time**: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
**Workflow**: ${{ github.workflow }}
**Run**: ${{ github.run_id }}

Please check the workflow logs for details."
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🔧 Required Secrets

Every agent workflow requires these secrets to be configured:

- `GITHUB_TOKEN` - For basic GitHub API operations (automatically provided)
- `PROJECT_TOKEN` - For elevated permissions including PR merging and GitHub Projects API

### **TOKEN USAGE GUIDELINES**

#### **GITHUB_TOKEN** - Use for:

- Reading repository content
- Creating issues and comments
- Basic PR operations (create, comment)
- Repository analysis and status checks

#### **PROJECT_TOKEN** - Required for:

- **PR merging operations** (auto-merge functionality)
- **Branch deletion** after merge
- **GitHub Projects API** (updating project status)
- **Protected branch operations**
- **Administrative actions**

### **Token Permission Examples**

```yaml
# ✅ Basic operations - Use GITHUB_TOKEN
- name: 📊 Analyze PR
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh pr view "$PR_NUMBER" --json files,title,body

# ✅ Administrative operations - Use PROJECT_TOKEN
- name: 🚀 Auto-merge PR
  env:
    GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
  run: |
    gh pr merge "$PR_NUMBER" --squash --delete-branch
```

## ⚠️ Environment Variable Best Practices

### 1. **Always Validate Inputs**

```yaml
run: |
  ISSUE_NUMBER="${{ github.event.inputs.issue_number }}"

  # Validate to avoid null/empty warnings
  if [ -z "$ISSUE_NUMBER" ] || [ "$ISSUE_NUMBER" = "null" ]; then
    echo "❌ No issue number provided"
    exit 1
  fi
```

### 2. **Set Environment Variables Early**

```yaml
# In first step after validation
echo "ISSUE_NUMBER=$ISSUE_NUMBER" >> $GITHUB_ENV
echo "ISSUE_TITLE=$ISSUE_TITLE" >> $GITHUB_ENV
```

### 3. **Declare Environment Variables in Each Step**

```yaml
- name: Step Name
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ISSUE_NUMBER: ${{ env.ISSUE_NUMBER }}
    ISSUE_TITLE: ${{ env.ISSUE_TITLE }}
  run: |
    # Now you can safely use $ISSUE_NUMBER and $ISSUE_TITLE
```

### 4. **Use Both Patterns for Flexibility**

```yaml
# Set both env vars and step outputs
echo "ISSUE_NUMBER=$ISSUE_NUMBER" >> $GITHUB_ENV      # For env access
echo "issue_number=$ISSUE_NUMBER" >> $GITHUB_OUTPUT   # For step outputs
```

### 5. **Avoid Direct Context Access in Scripts**

```yaml
# ❌ Avoid this pattern - can cause warnings
ISSUE_NUMBER="${{ env.ISSUE_NUMBER }}"

# ✅ Better - declare in env section
env:
  ISSUE_NUMBER: ${{ env.ISSUE_NUMBER }}
run: |
  echo "Processing: $ISSUE_NUMBER"
```

## 📝 Multi-line String Handling

### **CRITICAL:** Use File-Based Approach for Long Markdown Content

When working with long markdown strings (like PR review comments), avoid YAML multi-line syntax which can cause parsing errors. Instead, use a file-based approach:

```yaml
- name: 📝 Create Review Comment
  run: |
    # Create comment content in a temporary file
    cat > /tmp/review_comment.md << 'EOF'
    ## 🔍 PR Review Analysis

    **Risk Assessment**: Low Risk ✅
    - File count: 3 files
    - Changes: +45 -0 lines
    - Type: Database schema updates

    ### 📊 Review Criteria Met
    - [x] Automated tests passed
    - [x] Code follows project standards
    - [x] Changes are backwards compatible
    - [x] Documentation updated

    ### 🎯 Approval Summary
    This PR meets all criteria for auto-merge:
    - Low complexity (≤5 files, ≤100 additions)
    - AI agent generated with proper labels
    - Database/Schema focused changes
    - No breaking changes detected

    **Recommendation**: APPROVED for merge 🚀
    EOF

    # Use the file content for GitHub API call
    gh pr comment "$PR_NUMBER" --body-file /tmp/review_comment.md

    # Clean up
    rm /tmp/review_comment.md
```

### **Why This Pattern is Required**

```yaml
# ❌ AVOID - Multi-line YAML strings cause parsing errors
COMMENT_BODY="## Long markdown content
with multiple lines
and special characters"

# ✅ RECOMMENDED - File-based approach is bulletproof
cat > /tmp/content.md << 'EOF'
## Long markdown content
with multiple lines
and special characters
EOF
```

## 🔍 JSON Parsing Best Practices

### **Proper Array Length Checking**

```yaml
# ✅ Correct way to get array length
FILE_COUNT=$(gh pr view "$PR_NUMBER" --json files --jq '.files | length')

# ❌ Incorrect - causes parsing errors
FILE_COUNT=$(gh pr view "$PR_NUMBER" --json files --jq '.files.length')
```

### **Safe JSON Property Access**

```yaml
# ✅ Safe array access with length check
FILES_JSON=$(gh pr view "$PR_NUMBER" --json files)
FILE_COUNT=$(echo "$FILES_JSON" | jq '.files | length')
ADDITIONS=$(echo "$FILES_JSON" | jq '.files | map(.additions) | add // 0')

# ✅ Handle null values gracefully
PR_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq '.title // "No title"')
```

## 📚 Essential Patterns

### 1. **Rate Limiting Setup** (MANDATORY)

```yaml
- name: ⚡ Setup Rate Limiting
  run: |
    chmod +x scripts/github-rate-limit-manager.sh
    if ! scripts/github-rate-limit-manager.sh check; then
      echo "❌ Rate limits too low for agent operations"
      scripts/github-rate-limit-manager.sh emergency "Agent Name"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. **GitHub CLI Authentication** (MANDATORY)

```yaml
- name: ⚙️ Configure Git and GitHub CLI
  run: |
    git config --global user.name "AI Agent Name"
    git config --global user.email "agent@noveli.sh"
    if ! gh auth status; then
      echo "❌ GitHub CLI authentication failed"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. **Label Management** (RECOMMENDED)

```yaml
- name: 🏷️ Ensure Required Labels
  run: |
    # Function to ensure a label exists, create if missing
    ensure_label_exists() {
      local label_name="$1"
      local label_color="${2:-0052CC}"  # Default blue
      local label_description="${3:-AI Agent Label}"
      
      if ! gh label list | grep -q "^$label_name"; then
        echo "📝 Creating missing label: $label_name"
        if gh label create "$label_name" --color "$label_color" --description "$label_description" 2>/dev/null; then
          echo "✅ Created label: $label_name"
        else
          echo "⚠️ Failed to create label: $label_name (will use fallback)"
        fi
      else
        echo "✅ Label exists: $label_name"
      fi
    }

    # Create agent-specific labels
    ensure_label_exists "ai-agent" "7B68EE" "Issues and PRs created by AI agents"
    ensure_label_exists "automated" "00D084" "Automated processes and workflows"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. **Context Analysis** (RECOMMENDED)

```yaml
- name: 📊 Agent Context Analysis
  id: context_analysis
  run: |
    ISSUE_NUMBER="${{ github.event.inputs.issue_number }}"
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title')
    echo "issue_number=$ISSUE_NUMBER" >> $GITHUB_OUTPUT
    echo "issue_title=$ISSUE_TITLE" >> $GITHUB_OUTPUT
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. **Status Updates with Rate Limiting** (RECOMMENDED)

```yaml
- name: 📝 Update Status
  run: |
    if scripts/github-rate-limit-manager.sh check-rest "comment" 10; then
      gh issue comment "$ISSUE_NUMBER" --body "Status update"
    else
      echo "⚠️ Rate limit too low - skipping comment"
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5. **Robust PR Creation with Label Management** (RECOMMENDED)

````yaml
- name: � Create Pull Request
  run: |
    # Create PR first
    PR_URL=$(gh pr create \
      --title "PR Title" \
      --body "$PR_BODY" \
      --head "$BRANCH_NAME" \
      --base main)

    # Add labels one by one with error handling
    for label in "ai-agent" "automated"; do
      if gh label list | grep -q "^$label"; then
        if gh pr edit "$PR_URL" --add-label "$label" 2>/dev/null; then
          echo "✅ Added label: $label"
        else
          echo "⚠️ Failed to add label: $label"
        fi
      else
        echo "⚠️ Label not found: $label"
      fi
          done
        env:
          GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
```## 🎨 Agent Naming Conventions

- **File**: `[agent-purpose]-agent.yml` (e.g., `story-generation-agent.yml`)
- **Name**: `🤖 [Purpose] Agent` (e.g., `🤖 Story Generation Agent`)
- **Job**: `[agent-name]-execution` (e.g., `story-generation-execution`)
- **Email**: `[agent-name]-agent@noveli.sh`

## 🏷️ Trigger Patterns

### Issue Comment Triggers
```yaml
on:
  issue_comment:
    types: [created]

jobs:
  check-trigger:
    if: contains(github.event.comment.body, '@agent-name')
````

### Workflow Dispatch

```yaml
on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: "Issue number to process"
        required: true
        type: string
```

### Agent Handoff

```yaml
on:
  workflow_run:
    workflows: ["Previous Agent"]
    types: [completed]
```

## 🔐 Security Best Practices

1. **Never hardcode secrets** - Always use `${{ secrets.SECRET_NAME }}`
2. **Validate inputs** - Check all user inputs before processing
3. **Limit permissions** - Only request necessary GitHub permissions
4. **Rate limiting** - Always check rate limits before API calls
5. **Error handling** - Graceful failure with cleanup procedures
6. **Audit trails** - Log all significant operations

## 📊 Observability Standards

### Required Logging

- Agent start/completion timestamps
- Issue numbers and context
- Rate limit status checks
- Error conditions and recovery actions
- Handoff notifications

### Status Reporting

- Progress updates in issue comments
- Final execution summaries
- Error notifications with actionable information
- Next steps or handoff instructions

## 🧪 Testing Guidelines

1. **Rate limiting scenarios** - Test with low rate limits
2. **Authentication failures** - Test with invalid tokens
3. **Issue context variations** - Test with different issue types
4. **Emergency cleanup** - Test failure scenarios
5. **Agent handoffs** - Test coordination between agents

## 📈 Performance Standards

- **Startup**: Rate limiting check must complete within 30 seconds
- **Authentication**: GitHub CLI auth must complete within 15 seconds
- **Context analysis**: Issue parsing must complete within 60 seconds
- **Core logic**: Agent-specific (document expected duration)
- **Cleanup**: Emergency procedures must complete within 30 seconds

## 🔄 Integration Patterns

### With Scrum Master Agent

```yaml
# Trigger from Scrum Master
on:
  workflow_dispatch:
    inputs:
      story_id:
        description: "Story ID from Scrum Master"
        required: true
```

### With Development Agents

```yaml
# Handoff to Development Agent
- name: Trigger Development
  run: |
    gh workflow run development-agent.yml \
      --field issue_number="$ISSUE_NUMBER" \
      --field requirements="$REQUIREMENTS"
```

### With Project Management

```yaml
# Update GitHub Project
env:
  GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
run: |
  gh project item-edit "$PROJECT_ID" "$ITEM_ID" \
    --field-id "$STATUS_FIELD" --text "In Progress"
```

## 🚀 Quick Start Checklist

When creating a new agent:

- [ ] Copy this template to `.github/workflows/[agent-name]-agent.yml`
- [ ] Replace all `[Agent Name]` placeholders
- [ ] Replace all `[agent-name]` placeholders
- [ ] Implement core agent logic in the designated section
- [ ] Add any additional required secrets
- [ ] Configure trigger patterns (issue comments, workflow dispatch, etc.)
- [ ] Test rate limiting scenarios
- [ ] Test authentication flows
- [ ] Document agent-specific behavior
- [ ] Add integration with other agents as needed

## 📋 Validation Checklist

Before deploying a new agent:

- [ ] Rate limiting setup with `GH_TOKEN` environment variable
- [ ] GitHub CLI authentication verification
- [ ] Proper error handling and cleanup procedures
- [ ] Status reporting with rate limit checks
- [ ] Security review (no hardcoded secrets)
- [ ] Integration testing with existing agents
- [ ] Documentation updated
- [ ] Emergency procedures tested

---

## 🎯 Success Metrics

A gold standard agent should achieve:

- **99%+ Authentication Success Rate** - No false GitHub CLI failures
- **Zero Rate Limit Violations** - All API calls properly throttled
- **< 30s Startup Time** - Fast rate limiting and auth setup
- **100% Error Recovery** - All failures trigger proper cleanup
- **Clear Status Reporting** - Users always know agent status

This template represents the distilled wisdom from systematic analysis of all working agents in the NOVELI.SH ecosystem. Use it as the foundation for all new agent development.

## 🆕 Project Admin Agent Patterns (ADVANCED)

The following patterns were discovered and validated during the creation of the Project Admin Agent:

### **File-Based Multi-line Content Handling**

When creating long markdown content (like PR review comments), avoid YAML multi-line syntax and use file-based approach:

```yaml
- name: 📝 Create Comprehensive Review Comment
  run: |
    # Create review content in temporary file to avoid YAML parsing issues
    cat > /tmp/review_comment.md << 'EOF'
    ## 🔍 PR Review Analysis

    **Risk Assessment**: Low Risk ✅
    - File count: 3 files
    - Changes: +45 -0 lines
    - Type: Database schema updates

    ### 📊 Review Criteria Met
    - [x] Automated tests passed
    - [x] Code follows project standards
    - [x] Changes are backwards compatible

    **Recommendation**: APPROVED for merge 🚀
    EOF

    # Use file content for GitHub API
    gh pr comment "$PR_NUMBER" --body-file /tmp/review_comment.md
    rm /tmp/review_comment.md
```

### **Advanced Risk Assessment Logic**

Pattern for evaluating PR complexity and determining merge eligibility:

```yaml
- name: 🎯 Advanced Risk Assessment
  id: risk_assessment
  run: |
    # Get comprehensive PR data
    FILES_JSON=$(gh pr view "$PR_NUMBER" --json files)
    FILE_COUNT=$(echo "$FILES_JSON" | jq '.files | length')
    ADDITIONS=$(echo "$FILES_JSON" | jq '.files | map(.additions) | add // 0')
    DELETIONS=$(echo "$FILES_JSON" | jq '.files | map(.deletions) | add // 0')

    # Get PR metadata
    PR_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq '.title')
    PR_LABELS=$(gh pr view "$PR_NUMBER" --json labels --jq '.labels[].name' | tr '\n' ' ')

    # Multi-criteria risk assessment
    RISK_LEVEL="high"
    RISK_REASONS=()

    # Size-based assessment
    if [ "$FILE_COUNT" -le 5 ] && [ "$ADDITIONS" -le 100 ]; then
      # Check for AI agent labels (trust indicator)
      if echo "$PR_LABELS" | grep -q "ai-agent"; then
        # Check for safe change types
        if echo "$PR_TITLE" | grep -iE "(database|schema|migration|table|index|doc|readme)" > /dev/null; then
          RISK_LEVEL="low"
          RISK_REASONS+=("Small size (≤5 files, ≤100 additions)")
          RISK_REASONS+=("AI agent generated")
          RISK_REASONS+=("Safe change type detected")
        else
          RISK_LEVEL="medium" 
          RISK_REASONS+=("AI generated but unknown change type")
        fi
      else
        RISK_LEVEL="medium"
        RISK_REASONS+=("Small size but not AI generated")
      fi
    else
      RISK_REASONS+=("Large changeset (>5 files or >100 additions)")
    fi

    echo "🎯 Risk Assessment: $RISK_LEVEL"
    echo "📊 Files: $FILE_COUNT, Additions: $ADDITIONS, Deletions: $DELETIONS"
    echo "🔍 Reasons: ${RISK_REASONS[*]}"

    # Set outputs for subsequent steps
    echo "risk_level=$RISK_LEVEL" >> $GITHUB_OUTPUT
    echo "file_count=$FILE_COUNT" >> $GITHUB_OUTPUT
    echo "additions=$ADDITIONS" >> $GITHUB_OUTPUT
```

### **Robust Auto-merge with Comprehensive Cleanup**

Pattern for safe automated merging with full cleanup:

```yaml
- name: 🚀 Auto-merge with Full Cleanup
  if: steps.risk_assessment.outputs.risk_level == 'low'
  run: |
    echo "🚀 Low-risk PR - proceeding with auto-merge"
    echo "📊 Files: ${{ steps.risk_assessment.outputs.file_count }}"
    echo "📈 Additions: ${{ steps.risk_assessment.outputs.additions }}"

    # Attempt merge with squash and branch deletion
    if gh pr merge "$PR_NUMBER" --squash --delete-branch; then
      echo "✅ PR merged and branch deleted successfully"

      # Verify branch was actually deleted
      BRANCH_NAME=$(gh pr view "$PR_NUMBER" --json headRefName --jq '.headRefName')
      if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
        echo "⚠️ Branch still exists remotely, attempting manual cleanup"
        git push origin --delete "$BRANCH_NAME" || echo "Manual deletion failed"
      fi

    else
      echo "❌ Auto-merge failed - manual intervention required"
      # Post failure comment
      gh pr comment "$PR_NUMBER" --body "🚨 **Auto-merge Failed**

The Project Admin Agent attempted to auto-merge this low-risk PR but encountered an error.
Manual review and merge may be required.

**Risk Assessment**: Low
**Attempted Action**: Auto-merge with squash
**Time**: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
```

## 🎯 Lessons Learned from Project Admin Agent Development

1. **Multi-line Markdown**: Always use file-based approach with `cat > file << 'EOF'` pattern
2. **JSON Parsing**: Use `jq '.files | length'` not `.files.length` for array lengths
3. **Token Permissions**: PROJECT_TOKEN required for merge operations, GITHUB_TOKEN sufficient for analysis
4. **Environment Variables**: Declare all variables in `env:` section of each step to avoid context warnings
5. **Risk Assessment**: Multi-criteria evaluation is more reliable than single-factor decisions
6. **Error Handling**: Always provide fallback actions and informative error messages
7. **Branch Cleanup**: Verify deletion success and provide manual cleanup fallbacks
