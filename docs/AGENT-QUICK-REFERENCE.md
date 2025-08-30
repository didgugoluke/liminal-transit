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

## ✅ Validation Checklist

- [ ] Rate limiting with `GH_TOKEN` env var
- [ ] GitHub CLI auth verification
- [ ] Emergency cleanup on failure
- [ ] Status updates with rate limiting
- [ ] No hardcoded secrets
- [ ] Proper error handling

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
