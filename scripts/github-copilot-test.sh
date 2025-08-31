#!/bin/bash

# GitHub Copilot Integration Test Script
# Tests GitHub API access and Copilot availability

set -e

echo "🧪 GitHub Copilot Integration Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_github_auth() {
    echo -e "\n${YELLOW}1. Testing GitHub Authentication...${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI not found. Please install: brew install gh${NC}"
        return 1
    fi
    
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
        gh auth status
    else
        echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
        echo "Run: gh auth login"
        return 1
    fi
}

test_repository_access() {
    echo -e "\n${YELLOW}2. Testing Repository Access...${NC}"
    
    if gh repo view &> /dev/null; then
        echo -e "${GREEN}✅ Repository access confirmed${NC}"
        echo "Repository: $(gh repo view --json nameWithOwner -q .nameWithOwner)"
    else
        echo -e "${RED}❌ No repository access${NC}"
        return 1
    fi
}

test_copilot_extension() {
    echo -e "\n${YELLOW}3. Testing Copilot Extension...${NC}"
    
    if gh extension list | grep -q "gh-copilot"; then
        echo -e "${GREEN}✅ GitHub Copilot extension installed${NC}"
    else
        echo -e "${YELLOW}⚠️ GitHub Copilot extension not found${NC}"
        echo "Installing GitHub Copilot extension..."
        
        if gh extension install github/gh-copilot; then
            echo -e "${GREEN}✅ GitHub Copilot extension installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install Copilot extension${NC}"
            return 1
        fi
    fi
}

test_copilot_functionality() {
    echo -e "\n${YELLOW}4. Testing Copilot Functionality...${NC}"
    
    # Test basic suggestion
    echo "Testing basic code suggestion..."
    if gh copilot suggest "create a hello world function in typescript" --target shell &> /dev/null; then
        echo -e "${GREEN}✅ Copilot suggestion working${NC}"
    else
        echo -e "${RED}❌ Copilot suggestion failed${NC}"
        echo "You may need to authenticate Copilot: gh copilot auth"
        return 1
    fi
}

test_api_tokens() {
    echo -e "\n${YELLOW}5. Testing API Token Access...${NC}"
    
    # Check for GitHub token
    if [ -n "$GITHUB_TOKEN" ]; then
        echo -e "${GREEN}✅ GITHUB_TOKEN environment variable set${NC}"
    else
        echo -e "${YELLOW}⚠️ GITHUB_TOKEN not set in environment${NC}"
        echo "This is normal for local testing"
    fi
    
    # Check for Anthropic token
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo -e "${GREEN}✅ ANTHROPIC_API_KEY environment variable set${NC}"
    else
        echo -e "${YELLOW}⚠️ ANTHROPIC_API_KEY not set in environment${NC}"
        echo "You'll need this for Claude 4 integration"
    fi
}

test_workflow_permissions() {
    echo -e "\n${YELLOW}6. Testing Workflow Permissions...${NC}"
    
    # Test if we can trigger workflows
    if gh workflow list &> /dev/null; then
        echo -e "${GREEN}✅ Workflow access confirmed${NC}"
        echo "Available workflows:"
        gh workflow list --limit 5
        
        # Check for our specific workflow
        if gh workflow list | grep -q "GitHub Copilot Claude 4 Agent"; then
            echo -e "${GREEN}✅ GitHub Copilot Claude 4 Agent workflow found${NC}"
        else
            echo -e "${YELLOW}⚠️ GitHub Copilot Claude 4 Agent workflow not found${NC}"
        fi
    else
        echo -e "${RED}❌ No workflow access${NC}"
        return 1
    fi
}

# Main test execution
main() {
    local exit_code=0
    
    echo "Starting GitHub Copilot integration tests..."
    echo "Time: $(date)"
    echo ""
    
    test_github_auth || exit_code=1
    test_repository_access || exit_code=1
    test_copilot_extension || exit_code=1
    test_copilot_functionality || exit_code=1
    test_api_tokens || exit_code=1
    test_workflow_permissions || exit_code=1
    
    echo -e "\n${YELLOW}=================================="
    echo "🧪 GitHub Copilot Integration Test Complete"
    echo -e "==================================${NC}"
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed! GitHub Copilot integration ready.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Run: ./scripts/claude4-connection-test.sh"
        echo "2. Trigger workflow: gh workflow run 'GitHub Copilot Claude 4 Agent'"
        echo "3. Monitor results: gh run list"
    else
        echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
        echo ""
        echo "Common fixes:"
        echo "1. Run: gh auth login --scopes write:packages,workflow,repo"
        echo "2. Run: gh copilot auth"
        echo "3. Check repository permissions"
    fi
    
    exit $exit_code
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
