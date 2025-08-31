# 🎯 Agent Template Quick Reference

## 🚨 MANDATORY Components (Never Skip These)

### 1. Rate Limiting Setup

```yaml
- name: ⚡ Setup Rate Limiting
  run: |
    chmod +x scripts/github-rate-limit-manager.sh
    if ! scripts/github-rate-limit-manager.sh check; then
      echo "❌ Rate limits too low"
      scripts/github-rate-limit-manager.sh emergency "Agent Name"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # ← CRITICAL: Never forget this!
```

### 2. GitHub CLI Authentication

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
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # ← CRITICAL: Must be here too!
```

### 3. Emergency Cleanup

```yaml
- name: 🚨 Emergency Cleanup
  if: failure()
  run: |
    echo "🚨 Agent failed - cleaning up..."
    # Your cleanup logic here
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ⚡ Quick Copy-Paste Snippets

### Basic Agent Structure

```yaml
name: 🤖 [Agent Name] Agent

on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: "Issue number to process"
        required: true
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
      # ... steps here
```

### Safe Issue Comment

```yaml
- name: 📝 Comment with Rate Limiting
  run: |
    if scripts/github-rate-limit-manager.sh check-rest "comment" 10; then
      gh issue comment "$ISSUE_NUMBER" --body "Your message"
    else
      echo "⚠️ Rate limit too low - skipping comment"
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Context Extraction with Environment Variables

```yaml
- name: 📊 Get Issue Context
  id: context
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    ISSUE_NUMBER="${{ github.event.inputs.issue_number }}"

    # Validate inputs
    if [ -z "$ISSUE_NUMBER" ] || [ "$ISSUE_NUMBER" = "null" ]; then
      echo "❌ No issue number provided"
      exit 1
    fi

    ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq '.title')

    # Set for subsequent steps
    echo "ISSUE_NUMBER=$ISSUE_NUMBER" >> $GITHUB_ENV
    echo "ISSUE_TITLE=$ISSUE_TITLE" >> $GITHUB_ENV

    # Also set as outputs
    echo "issue_number=$ISSUE_NUMBER" >> $GITHUB_OUTPUT
    echo "issue_title=$ISSUE_TITLE" >> $GITHUB_OUTPUT
```

### Using Environment Variables in Steps

```yaml
- name: Process Issue
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ISSUE_NUMBER: ${{ env.ISSUE_NUMBER }}
    ISSUE_TITLE: ${{ env.ISSUE_TITLE }}
  run: |
    echo "Processing: #$ISSUE_NUMBER - $ISSUE_TITLE"
    # Safe to use variables here
```

## 🔥 Common Mistakes to Avoid

❌ **Missing `env: GH_TOKEN`** in rate limiting step
❌ **No emergency cleanup** for failed workflows  
❌ **Hardcoded secrets** instead of using `${{ secrets.NAME }}`
❌ **No rate limit checks** before GitHub API calls
❌ **Missing authentication verification**
❌ **No error handling** in core agent logic
❌ **Using `${{ env.VAR }}` in run scripts** without declaring in env section
❌ **No input validation** for null/empty values
❌ **Accessing environment variables before they're set**
❌ **Multi-line YAML strings** for long markdown content (use file-based approach)
❌ **Incorrect JSON parsing** - use `jq '.files | length'` not `.files.length`
❌ **Wrong token for merge operations** - use PROJECT_TOKEN not GITHUB_TOKEN
❌ **🚨 CRITICAL: Using `git diff` for new file detection** - must check untracked files too
❌ **Missing default action handling** - always set default when action is null/empty
❌ **Race conditions in auto-progression** - add delays between workflow triggers
❌ **No branch cleanup** - clean existing branches before creating new ones
❌ **Forgetting to source external scripts** - always verify function availability
❌ **🆕 Missing pipeline coordination** - no handoff delays causing rate limit issues
❌ **🆕 Incomplete agent routing** - orchestrator not handling all agent types
❌ **🆕 No risk assessment** - auto-merging without complexity evaluation
❌ **🆕 Missing inline task processing** - not parsing acceptance criteria from story body
❌ **🆕 No clean state management** - branches not reset between implementation cycles

## 🆕 3-Agent Pipeline Patterns (PRODUCTION PROVEN)

### **Orchestrator → Scrum Master → Development Agent**

**Proven End-to-End Flow**:

1. AI Agent Orchestrator analyzes and routes issues
2. Scrum Master manages story lifecycle
3. Development Agent implements code in phases
4. Project Admin Agent auto-reviews and merges

### **Orchestrator Pattern (Entry Point)**

```yaml
# Multi-trigger orchestrator
on:
  issues:
    types: [opened, labeled, edited]
  issue_comment:
    types: [created]

# Inline Node.js agent routing
- name: AI Agent Analysis
  run: |
    cat > agent-dispatcher.js << 'EOF'
    import * as core from '@actions/core';

    async function analyzeIssue() {
      const context = JSON.parse(process.env.GITHUB_CONTEXT);
      const issue = context.event.issue;

      // Route based on labels
      let assignedAgent = 'GeneralPurposeAgent';
      for (const label of issue.labels) {
        if (label.name === 'epic') assignedAgent = 'EpicOrchestrator';
        if (label.name === 'chore') assignedAgent = 'MaintenanceAgent';
      }

      core.setOutput('agent-type', assignedAgent);
    }

    analyzeIssue().catch(console.error);
    EOF

    GITHUB_CONTEXT='${{ toJson(github) }}' node agent-dispatcher.js
```

### **Scrum Master Pattern (Lifecycle Management)**

```yaml
# Multi-phase story management
- name: Story Lifecycle
  run: |
    ACTION="${{ github.event.inputs.action }}"

    # Default action handling
    if [ -z "$ACTION" ] || [ "$ACTION" = "null" ]; then
      ACTION="take_story"
    fi

    case "$ACTION" in
      "take_story")
        gh issue edit "$STORY_NUMBER" --add-assignee "@me"
        echo "next_action=trigger_development" >> $GITHUB_OUTPUT
        ;;
      "trigger_development")
        gh workflow run development-agent.yml \
          --field story_number="$STORY_NUMBER" \
          --field action="take_story"
        ;;
    esac

# Auto-progression with rate limiting
- name: Auto-Progress
  if: steps.lifecycle.outputs.next_action
  run: |
    sleep 15  # Rate limit friendly delay
    gh workflow run scrum-master-agent.yml \
      --field issue_number="$ISSUE_NUMBER" \
      --field action="${{ steps.lifecycle.outputs.next_action }}"
```

### **Development Agent Pattern (Multi-Phase Implementation)**

```yaml
# Three-phase development workflow
- name: Multi-Phase Development
  run: |
    ACTION="${{ github.event.inputs.action }}"

    if [ -z "$ACTION" ] || [ "$ACTION" = "null" ]; then
      ACTION="take_story"
    fi

    case "$ACTION" in
      "take_story")
        # Analyze story and extract tasks
        echo "next_action=implement_tasks" >> $GITHUB_OUTPUT
        ;;

      "implement_tasks")
        # Create clean branch and implement files
        BRANCH_NAME="story/$STORY_NUMBER"

        # Clean existing branch
        git fetch origin
        if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
          git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
          git branch -D "$BRANCH_NAME" 2>/dev/null || true
        fi

        git checkout main && git pull origin main
        git checkout -b "$BRANCH_NAME" && git push -u origin "$BRANCH_NAME"

        # Process inline acceptance criteria
        STORY_BODY=$(gh issue view "$STORY_NUMBER" --json body --jq '.body')
        echo "$STORY_BODY" | grep -E "^\s*-\s*\[[ ]\]" | while read task; do
          # Modular task processing
          if echo "$task" | grep -i "config" > /dev/null; then
            # Create config file
            mkdir -p src/config
            cat > src/config/hello.config.ts << 'EOF'
export const config = { environment: "development" };
EOF
          elif echo "$task" | grep -i "documentation" > /dev/null; then
            # Create docs
            cat > README.md << 'EOF'
# Hello World Documentation
EOF
          else
            # Generic implementation
            mkdir -p src/hello
            cat > src/hello/index.ts << 'EOF'
export class HelloWorld {
  greet() { return "Hello, World!"; }
}
EOF
          fi
        done

        echo "next_action=complete_story" >> $GITHUB_OUTPUT
        ;;

      "complete_story")
        # CRITICAL: Enhanced commit detection
        HAS_CHANGES=false

        if ! git diff --quiet; then
          HAS_CHANGES=true
        fi

        if ! git diff --staged --quiet; then
          HAS_CHANGES=true
        fi

        # CRITICAL: Check untracked files
        if [ -n "$(git status --porcelain | grep '^??')" ]; then
          HAS_CHANGES=true
        fi

        if [ "$HAS_CHANGES" = "true" ]; then
          git add . && git commit -m "Implementation" && git push
          gh pr create --title "Story Implementation" --body "Implementation complete"
        fi
        ;;
    esac
```

### **Project Admin Pattern (Auto-merge)**

```yaml
# Risk-based auto-merge for AI agent PRs
- name: Risk Assessment & Auto-merge
  if: contains(github.event.pull_request.labels.*.name, 'ai-agent')
  run: |
    PR_NUMBER="${{ github.event.pull_request.number }}"

    # Get PR metrics
    FILE_COUNT=$(gh pr view "$PR_NUMBER" --json files --jq '.files | length')
    ADDITIONS=$(gh pr view "$PR_NUMBER" --json files --jq '.files | map(.additions) | add // 0')

    # Risk assessment
    if [ "$FILE_COUNT" -le 5 ] && [ "$ADDITIONS" -le 100 ]; then
      if gh pr view "$PR_NUMBER" --json labels | jq -r '.labels[].name' | grep -q "ai-agent"; then
        echo "✅ Low-risk PR - auto-merging"
        gh pr merge "$PR_NUMBER" --squash --delete-branch
      fi
    fi
  env:
    GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
```

## 🆕 Development Agent Patterns (PROVEN)

### Critical: Git Commit Detection for New Files

```yaml
# ✅ MANDATORY for agents that create files
- name: 🔍 Enhanced Commit Detection
  run: |
    HAS_CHANGES=false

    if ! git diff --quiet; then
      echo "🔍 Found unstaged changes"
      HAS_CHANGES=true
    fi

    if ! git diff --staged --quiet; then
      echo "🔍 Found staged changes" 
      HAS_CHANGES=true
    fi

    # CRITICAL: Check for new untracked files
    if [ -n "$(git status --porcelain | grep '^??')" ]; then
      echo "🔍 Found untracked files"
      git status --porcelain | grep '^??'
      HAS_CHANGES=true
    fi

    if [ "$HAS_CHANGES" = "true" ]; then
      git add .
      git commit -m "Your commit message"
      git push origin "$BRANCH_NAME"
    else
      echo "⚠️ No changes to commit"
    fi
```

### Action Flow Control (Multi-Phase Workflows)

```yaml
- name: 🎯 Action Flow Control
  id: execute
  run: |
    ACTION="${{ github.event.inputs.action }}"

    # Default action to avoid null issues
    if [ -z "$ACTION" ] || [ "$ACTION" = "null" ]; then
      ACTION="take_story"
    fi

    case "$ACTION" in
      "take_story")
        echo "📋 Taking story..."
        echo "next_action=implement_tasks" >> $GITHUB_OUTPUT
        ;;
      "implement_tasks") 
        echo "🔨 Implementing tasks..."
        echo "next_action=complete_story" >> $GITHUB_OUTPUT
        ;;
      "complete_story")
        echo "✅ Completing story..."
        # No next_action - workflow complete
        ;;
    esac

- name: 🔄 Auto-Progress
  if: steps.execute.outputs.next_action
  run: |
    NEXT_ACTION="${{ steps.execute.outputs.next_action }}"
    sleep 10  # Avoid race conditions
    gh workflow run agent.yml --field action="$NEXT_ACTION"
```

### Dynamic File Creation

```yaml
- name: 📁 Create Files from Task Requirements
  run: |
    # Extract file path from task body
    FILE_PATH=$(echo "$TASK_BODY" | sed -n 's/.*Create[[:space:]]*`\([^`]*\)`.*/\1/p' | head -1)

    if [ -n "$FILE_PATH" ]; then
      mkdir -p "$(dirname "$FILE_PATH")"

      case "$FILE_PATH" in
        *.ts|*.tsx)
          cat > "$FILE_PATH" << 'EOF'
// Generated TypeScript file
export interface Config {
  environment: string;
}
EOF
          ;;
        *.md)
          cat > "$FILE_PATH" << 'EOF'
# Documentation
Generated documentation file.
EOF
          ;;
      esac

      echo "✅ Created: $FILE_PATH"
    fi
```

### Clean Branch Management

```yaml
- name: 🌿 Create Clean Branch
  run: |
    BRANCH_NAME="story/$STORY_NUMBER"
    git fetch origin

    # Clean up existing branch
    if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
      git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
      git branch -D "$BRANCH_NAME" 2>/dev/null || true
    fi

    # Create fresh branch
    git checkout main
    git pull origin main  
    git checkout -b "$BRANCH_NAME"
    git push -u origin "$BRANCH_NAME"

    echo "BRANCH_NAME=$BRANCH_NAME" >> $GITHUB_ENV
```

## 🆕 Advanced Patterns (From Project Admin Agent)

### File-Based Multi-line Content

```yaml
# ✅ Safe approach for long markdown
- name: Create Long Comment
  run: |
    cat > /tmp/comment.md << 'EOF'
    ## Long markdown content
    With multiple lines and special characters
    EOF
    gh pr comment "$PR_NUMBER" --body-file /tmp/comment.md
    rm /tmp/comment.md
```

### Proper JSON Array Length

```yaml
# ✅ Correct JSON parsing
FILE_COUNT=$(gh pr view "$PR_NUMBER" --json files --jq '.files | length')

# ❌ Wrong - causes errors
FILE_COUNT=$(gh pr view "$PR_NUMBER" --json files --jq '.files.length')
```

### Token Usage Guidelines

```yaml
# ✅ Analysis operations - Use GITHUB_TOKEN
- name: Analyze PR
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: gh pr view "$PR_NUMBER" --json files

# ✅ Merge operations - Use PROJECT_TOKEN
- name: Merge PR
  env:
    GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
  run: gh pr merge "$PR_NUMBER" --squash --delete-branch
```

### Debug Pattern for Development Workflows

```yaml
- name: 🔍 Development Agent Debugging
  run: |
    echo "🔍 DEBUG: Agent status check"
    echo "🔍 DEBUG: Working directory: $(pwd)"
    echo "🔍 DEBUG: Git branch: $(git branch --show-current)"

    echo "🔍 DEBUG: Created files:"
    find . -name "*.ts" -o -name "*.md" | head -10 | while read file; do
      echo "  $file ($(wc -c < "$file" 2>/dev/null || echo "0") bytes)"
    done

    echo "🔍 DEBUG: Git status:"
    git status --porcelain

    echo "🔍 DEBUG: Change detection:"
    echo "  Unstaged: $(git diff --quiet && echo "NONE" || echo "FOUND")"
    echo "  Staged: $(git diff --staged --quiet && echo "NONE" || echo "FOUND")" 
    echo "  Untracked: $(git status --porcelain | grep '^??' | wc -l) files"
```

## ✅ Validation Checklist

- [ ] Rate limiting with `GH_TOKEN` env var
- [ ] GitHub CLI auth verification
- [ ] Emergency cleanup on failure
- [ ] Status updates with rate limiting
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] **Git commit detection includes untracked files** (for file-creating agents)
- [ ] **Default action handling** for null/empty action inputs
- [ ] **Auto-progression delays** to avoid race conditions
- [ ] **Branch cleanup** before creating new branches
- [ ] **External script sourcing** with function verification
- [ ] **🆕 Pipeline coordination** - proper handoffs with rate limit delays
- [ ] **🆕 Agent routing logic** - orchestrator handles all expected agent types
- [ ] **🆕 Risk assessment** - complexity evaluation before auto-merge
- [ ] **🆕 Inline task processing** - parsing acceptance criteria from story body
- [ ] **🆕 Clean state management** - fresh branches for each implementation cycle

## 🚀 Agent Creation Steps

1. Copy template from `docs/agent-template-gold-standard.md`
2. Replace `[Agent Name]` and `[agent-name]` placeholders
3. Implement core logic in designated section
4. Test authentication and rate limiting
5. Validate with checklist above
6. Deploy and monitor

## 📋 Required Files

- `.github/workflows/[agent-name]-agent.yml` - The agent workflow
- `scripts/github-rate-limit-manager.sh` - Rate limiting script (already exists)

See `docs/AGENT-TEMPLATE-GOLD-STANDARD.md` for complete documentation.
