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

      - name: 🔄 Agent Handoff (Optional)
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

- `GITHUB_TOKEN` - For GitHub API operations (automatically provided)
- `PROJECT_TOKEN` - For GitHub Projects API (if using project management)

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

### 5. **Emergency Cleanup** (MANDATORY)
```yaml
- name: 🚨 Emergency Cleanup
  if: failure()
  run: |
    echo "🚨 Agent failed - cleaning up..."
    # Cleanup logic here
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🎨 Agent Naming Conventions

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
```

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
