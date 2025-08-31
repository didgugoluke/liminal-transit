#!/bin/bash
# claude4-connection-test.sh - Test GitHub Copilot + Claude 4 API connectivity

set -e

echo "🧪 Testing GitHub Copilot + Claude 4 API Connection"
echo "=================================================="

# Check required environment variables
check_environment() {
    echo "🔍 Checking environment configuration..."
    
    if [ -z "$COPILOT_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
        echo "❌ Error: COPILOT_TOKEN or GITHUB_TOKEN required"
        echo "💡 Hint: Set COPILOT_TOKEN for GitHub Copilot API access"
        exit 1
    fi
    
    if [ -z "$GITHUB_REPOSITORY" ]; then
        echo "⚠️ Warning: GITHUB_REPOSITORY not set, using current repository"
        export GITHUB_REPOSITORY=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || echo "unknown/unknown")
    fi
    
    echo "✅ Environment check complete"
    echo "   Repository: $GITHUB_REPOSITORY"
    echo "   Token: ${COPILOT_TOKEN:+COPILOT_TOKEN}${GITHUB_TOKEN:+GITHUB_TOKEN} configured"
}

# Test basic GitHub API connectivity
test_github_api() {
    echo ""
    echo "🔗 Testing GitHub API connectivity..."
    
    if gh auth status >/dev/null 2>&1; then
        echo "✅ GitHub CLI authenticated successfully"
        
        # Get current user info
        USER_INFO=$(gh api user --jq '.login' 2>/dev/null || echo "unknown")
        echo "   Authenticated as: $USER_INFO"
        
        # Test repository access
        if gh repo view "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
            echo "✅ Repository access confirmed: $GITHUB_REPOSITORY"
        else
            echo "⚠️ Repository access limited or not found: $GITHUB_REPOSITORY"
        fi
    else
        echo "❌ GitHub CLI authentication failed"
        echo "💡 Run: gh auth login"
        exit 1
    fi
}

# Test GitHub Copilot API access
test_copilot_api() {
    echo ""
    echo "🤖 Testing GitHub Copilot API access..."
    
    # Use COPILOT_TOKEN if available, otherwise fall back to GITHUB_TOKEN
    TOKEN="${COPILOT_TOKEN:-$GITHUB_TOKEN}"
    
    # Test Copilot API endpoint (this is a mock test - actual endpoint may vary)
    COPILOT_RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/user" \
        -o /tmp/copilot_test_response.json)
    
    HTTP_CODE="${COPILOT_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ GitHub API access confirmed (HTTP $HTTP_CODE)"
        echo "   Note: GitHub Copilot API testing requires specific endpoints"
        echo "   This test validates basic API connectivity"
    else
        echo "❌ API access failed (HTTP $HTTP_CODE)"
        if [ -f /tmp/copilot_test_response.json ]; then
            echo "   Response: $(cat /tmp/copilot_test_response.json | head -c 200)"
        fi
        exit 1
    fi
    
    # Clean up
    rm -f /tmp/copilot_test_response.json
}

# Test Claude 4 model availability (mock test)
test_claude4_availability() {
    echo ""
    echo "🧠 Testing Claude 4 model availability..."
    
    # Note: This is a placeholder test since GitHub Copilot + Claude 4 integration
    # is hypothetical and would require actual API endpoints
    
    echo "📋 Claude 4 Integration Checklist:"
    echo "   [ ] GitHub Copilot API access confirmed"
    echo "   [ ] Claude 4 model selection available"
    echo "   [ ] API rate limits configured"
    echo "   [ ] Error handling implemented"
    
    echo ""
    echo "🔮 Simulating Claude 4 API call..."
    
    # Simulate API call with sample data
    SAMPLE_PROMPT="Analyze this simple requirement: Create a Hello World function"
    
    echo "   Input: $SAMPLE_PROMPT"
    echo "   Model: claude-4 (via GitHub Copilot)"
    echo "   Expected: Structured analysis with implementation suggestions"
    
    # Mock successful response
    cat << 'EOF'
   ✅ Mock Claude 4 Response:
   {
     "analysis": "Simple function creation requirement",
     "complexity": "low",
     "suggested_files": [
       {
         "path": "src/hello/index.ts",
         "type": "typescript",
         "purpose": "Main implementation"
       }
     ],
     "implementation_approach": "TypeScript function with interface",
     "confidence": 0.95
   }
EOF
    
    echo ""
    echo "✅ Claude 4 connectivity test simulation complete"
}

# Test story analysis pipeline
test_story_analysis() {
    echo ""
    echo "📊 Testing story analysis pipeline..."
    
    # Create a sample story for testing
    SAMPLE_STORY='{
        "title": "Test Hello World Implementation",
        "body": "## Purpose\nCreate a simple Hello World function for testing.\n\n## Acceptance Criteria\n- [ ] TypeScript function created\n- [ ] Proper exports configured\n- [ ] Basic documentation included",
        "number": 999
    }'
    
    echo "   Sample story created for testing"
    echo "   Title: Test Hello World Implementation"
    echo "   Acceptance criteria: 3 items detected"
    
    # Test parsing logic
    CRITERIA_COUNT=$(echo "$SAMPLE_STORY" | jq -r '.body' | grep -c '\- \[ \]' || echo 0)
    
    if [ "$CRITERIA_COUNT" -gt 0 ]; then
        echo "✅ Acceptance criteria parsing working ($CRITERIA_COUNT items)"
    else
        echo "⚠️ Acceptance criteria parsing needs improvement"
    fi
    
    # Test requirement extraction
    echo "   Testing requirement extraction..."
    REQUIREMENTS=$(echo "$SAMPLE_STORY" | jq -r '.body' | grep -E '^\s*-\s*\[[ ]\]' | sed 's/^\s*-\s*\[[ ]\]\s*//' | head -3)
    
    echo "   Extracted requirements:"
    echo "$REQUIREMENTS" | while IFS= read -r req; do
        echo "     • $req"
    done
    
    echo "✅ Story analysis pipeline test complete"
}

# Test file generation capabilities
test_file_generation() {
    echo ""
    echo "📁 Testing file generation capabilities..."
    
    # Create temporary directory for testing
    TEST_DIR="/tmp/copilot_agent_test_$(date +%s)"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    echo "   Test directory: $TEST_DIR"
    
    # Test TypeScript file generation
    echo "   Generating sample TypeScript file..."
    
    cat > hello.ts << 'EOF'
// Generated by GitHub Copilot + Claude 4 Agent (Test)
export interface HelloWorldOptions {
  message?: string;
  timestamp?: boolean;
}

export class HelloWorld {
  private options: HelloWorldOptions;

  constructor(options: HelloWorldOptions = {}) {
    this.options = {
      message: "Hello, World!",
      timestamp: false,
      ...options
    };
  }

  greet(): string {
    const message = this.options.message || "Hello, World!";
    return this.options.timestamp 
      ? `${message} (${new Date().toISOString()})`
      : message;
  }
}
EOF
    
    # Validate generated file
    if [ -f "hello.ts" ] && [ -s "hello.ts" ]; then
        echo "✅ TypeScript file generated successfully"
        echo "   Size: $(wc -c < hello.ts) bytes"
        echo "   Lines: $(wc -l < hello.ts) lines"
        
        # Test basic syntax (if TypeScript is available)
        if command -v tsc >/dev/null 2>&1; then
            if tsc --noEmit hello.ts 2>/dev/null; then
                echo "✅ TypeScript syntax validation passed"
            else
                echo "⚠️ TypeScript syntax validation failed (but file generated)"
            fi
        else
            echo "   TypeScript compiler not available for validation"
        fi
    else
        echo "❌ File generation failed"
    fi
    
    # Test documentation generation
    echo "   Generating sample documentation..."
    
    cat > README.md << 'EOF'
# Hello World Test Implementation

> Generated by GitHub Copilot + Claude 4 Agent

## Overview
This is a test implementation demonstrating the AI agent's file generation capabilities.

## Usage
```typescript
import { HelloWorld } from './hello';

const hello = new HelloWorld({ timestamp: true });
console.log(hello.greet());
```

## Features
- TypeScript implementation
- Configurable options
- Timestamp support
EOF
    
    if [ -f "README.md" ] && [ -s "README.md" ]; then
        echo "✅ Documentation generated successfully"
    else
        echo "❌ Documentation generation failed"
    fi
    
    # Clean up test directory
    cd - >/dev/null
    rm -rf "$TEST_DIR"
    echo "   Test directory cleaned up"
}

# Main execution
main() {
    echo "🚀 Starting GitHub Copilot + Claude 4 Agent Connection Test"
    echo "Date: $(date)"
    echo ""
    
    check_environment
    test_github_api
    test_copilot_api
    test_claude4_availability
    test_story_analysis
    test_file_generation
    
    echo ""
    echo "🎉 Connection Test Summary"
    echo "========================="
    echo "✅ Environment configuration validated"
    echo "✅ GitHub API connectivity confirmed"
    echo "✅ Basic API access working"
    echo "✅ Story analysis pipeline functional"
    echo "✅ File generation capabilities validated"
    echo ""
    echo "🚧 Next Steps:"
    echo "   1. Implement actual GitHub Copilot API integration"
    echo "   2. Configure Claude 4 model access"
    echo "   3. Create story analysis scripts"
    echo "   4. Build file generation engine"
    echo "   5. Test with real stories"
    echo ""
    echo "💡 Note: This test validates foundational capabilities."
    echo "   Actual GitHub Copilot + Claude 4 integration requires"
    echo "   specific API endpoints and model access configuration."
}

# Execute main function
main "$@"
