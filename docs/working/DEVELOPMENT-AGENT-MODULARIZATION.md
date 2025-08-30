# Development Agent Modularization Strategy

## Current Problem

The Development Agent is currently hardcoded for database schema creation tasks:

```yaml
if [[ "$TASK_TITLE" == *"Database Schema"* ]]; then
echo "🗄️  Implementing Database Schema Design..."
# Hardcoded database schema implementation
```

This approach doesn't scale for different task types like:

- API Design & Core Endpoints
- UI Components & React Implementation
- Testing Implementation
- Documentation Creation
- Infrastructure Setup
- Configuration Management

## Solution: Modular Task Handler Architecture

### 1. Task Type Detection Pattern

```yaml
# Detect task type from title/labels/content
detect_task_type() {
TASK_TITLE="$1"
TASK_BODY="$2"

case "$TASK_TITLE" in
*"Database Schema"*|*"database"*|*"DB"*)
echo "database"
;;
*"API"*|*"endpoint"*|*"REST"*|*"GraphQL"*)
echo "api"
;;
*"UI"*|*"component"*|*"React"*|*"frontend"*)
echo "frontend"
;;
*"Test"*|*"testing"*|*"spec"*)
echo "testing"
;;
*"Documentation"*|*"docs"*|*"README"*)
echo "documentation"
;;
*"Infrastructure"*|*"terraform"*|*"AWS"*|*"deploy"*)
echo "infrastructure"
;;
*"Configuration"*|*"config"*|*"setup"*)
echo "configuration"
;;
*)
echo "generic"
;;
esac
}
```

### 2. Modular Task Handlers

Each task type gets its own handler function:

```yaml
# Database Schema Handler
handle_database_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"

  echo "🗄️  Implementing Database Schema Design..."
  mkdir -p src/database

  # Generate schema.sql
  generate_database_schema > src/database/schema.sql
  # Generate types.ts
  generate_database_types > src/database/types.ts
  # Generate config.ts
  generate_database_config > src/database/config.ts

  gh issue comment "$TASK_NUM" --body "✅ Database schema implemented: schema.sql, types.ts, config.ts"
  gh issue close "$TASK_NUM" --reason completed
}

# API Design Handler
handle_api_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"

  echo "🔌 Implementing API Design & Endpoints..."
  mkdir -p src/api

  # Generate OpenAPI spec
  generate_api_specification > src/api/openapi.yml
  # Generate route handlers
  generate_api_routes > src/api/routes.ts
  # Generate middleware
  generate_api_middleware > src/api/middleware.ts

  gh issue comment "$TASK_NUM" --body "✅ API design implemented: OpenAPI spec, routes, middleware"
  gh issue close "$TASK_NUM" --reason completed
}

# Frontend/UI Handler
handle_frontend_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"

  echo "🎨 Implementing Frontend Components..."
  mkdir -p src/components

  # Generate React components
  generate_react_components > src/components/
  # Generate styles
  generate_component_styles > src/styles/
  # Generate tests
  generate_component_tests > src/__tests__/

  gh issue comment "$TASK_NUM" --body "✅ Frontend components implemented: React components, styles, tests"
  gh issue close "$TASK_NUM" --reason completed
}

# Testing Handler
handle_testing_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"

  echo "🧪 Implementing Testing Infrastructure..."
  mkdir -p src/__tests__

  # Generate test suites
  generate_test_suites > src/__tests__/
  # Generate test configuration
  generate_test_config > vitest.config.ts
  # Generate CI/CD test pipeline
  generate_test_pipeline > .github/workflows/tests.yml

  gh issue comment "$TASK_NUM" --body "✅ Testing infrastructure implemented: test suites, config, CI pipeline"
  gh issue close "$TASK_NUM" --reason completed
}

# Documentation Handler
handle_documentation_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"

  echo "📚 Implementing Documentation..."
  mkdir -p docs

  # Generate technical documentation
  generate_technical_docs > docs/
  # Generate API documentation
  generate_api_docs > docs/api/
  # Generate user guides
  generate_user_guides > docs/guides/

  gh issue comment "$TASK_NUM" --body "✅ Documentation implemented: technical docs, API docs, user guides"
  gh issue close "$TASK_NUM" --reason completed
}

# Generic Task Handler (fallback)
handle_generic_task() {
  local TASK_NUM="$1"
  local TASK_TITLE="$2"
  local TASK_BODY="$3"

  echo "🔧 Processing generic task: $TASK_TITLE"

  # AI-powered generic implementation
  analyze_task_requirements "$TASK_TITLE" "$TASK_BODY"
  generate_implementation_plan
  execute_implementation_steps

  gh issue comment "$TASK_NUM" --body "🔧 Development Agent processed generic task. Implementation completed."
  gh issue close "$TASK_NUM" --reason completed
}
```

### 3. Main Task Processing Loop

```yaml
# Process each task with modular handlers
if [ -n "$TASK_NUMBERS" ]; then
  IFS=',' read -ra TASK_ARRAY <<< "$TASK_NUMBERS"
  for TASK_NUM in "${TASK_ARRAY[@]}"; do
    if [ -n "$TASK_NUM" ]; then
      echo "🔧 Processing Task #$TASK_NUM..."

      # Get task details
      TASK_DATA=$(gh issue view "$TASK_NUM" --json title,body,labels)
      TASK_TITLE=$(echo "$TASK_DATA" | jq -r '.title')
      TASK_BODY=$(echo "$TASK_DATA" | jq -r '.body')

      # Detect task type
      TASK_TYPE=$(detect_task_type "$TASK_TITLE" "$TASK_BODY")
      echo "  Task Type: $TASK_TYPE"

      # Route to appropriate handler
      case "$TASK_TYPE" in
        "database")
          handle_database_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "api")
          handle_api_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "frontend")
          handle_frontend_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "testing")
          handle_testing_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "documentation")
          handle_documentation_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "infrastructure")
          handle_infrastructure_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        "configuration")
          handle_configuration_task "$TASK_NUM" "$TASK_TITLE"
          ;;
        *)
          handle_generic_task "$TASK_NUM" "$TASK_TITLE" "$TASK_BODY"
          ;;
      esac
    fi
  done
fi
```

### 4. Template-Based File Generation

Create reusable templates for common file types:

```yaml
# Template generation functions
generate_database_schema() {
  cat << 'EOF'
-- NOVELI.SH Database Schema
-- AI Native Interactive Storytelling Platform
-- Generated by Development Agent

-- Core Tables for Story Management
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

-- User Sessions and Choices
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    story_id UUID REFERENCES stories(id),
    current_scene VARCHAR(255),
    choices_made JSONB DEFAULT '[]',
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
EOF
}

generate_api_specification() {
  cat << 'EOF'
openapi: 3.0.3
info:
  title: NOVELI.SH API
  description: AI Native Interactive Storytelling Platform
  version: 1.0.0

paths:
  /api/stories:
    get:
      summary: List stories
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Story'
    post:
      summary: Create story
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateStoryRequest'
      responses:
        '201':
          description: Created

components:
  schemas:
    Story:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        content:
          type: object
        status:
          type: string
          enum: [draft, published, archived]
EOF
}

generate_react_components() {
  cat << 'EOF'
// NOVELI.SH React Components
// AI Native Interactive Storytelling Platform
// Generated by Development Agent

import React from 'react';

export interface StoryProps {
  id: string;
  title: string;
  content: string;
  onChoice: (choice: string) => void;
}

export const StoryComponent: React.FC<StoryProps> = ({
  id,
  title,
  content,
  onChoice
}) => {
  return (
    <div className="story-container">
      <h1 className="story-title">{title}</h1>
      <p className="story-content">{content}</p>

      <div className="choice-buttons">
        <button
          onClick={() => onChoice('yes')}
          className="choice-yes"
        >
          Yes
        </button>
        <button
          onClick={() => onChoice('no')}
          className="choice-no"
        >
          No
        </button>
      </div>
    </div>
  );
};
EOF
}
```

### 5. Benefits of Modular Architecture

1. **Scalability**: Easy to add new task types without modifying core logic
2. **Maintainability**: Each handler is isolated and testable
3. **Reusability**: Templates can be shared across different stories
4. **Flexibility**: Generic handler for unexpected task types
5. **AI Native**: Each handler can integrate with AI for content generation
6. **Quality**: Consistent patterns across all implementation types

### 6. Future Enhancements

1. **AI-Powered Template Generation**: Use LLMs to generate task-specific templates
2. **Dynamic Handler Registration**: Load handlers from external files
3. **Context-Aware Generation**: Use story context to influence implementation
4. **Quality Validation**: Automated testing and validation for each task type
5. **Cross-Task Dependencies**: Handle tasks that depend on other tasks
6. **Performance Optimization**: Parallel task processing for independent tasks

## Implementation Steps

1. **Refactor Current Development Agent**: Extract database logic into modular handler
2. **Create Task Detection System**: Implement pattern matching for task types
3. **Build Handler Library**: Create handlers for common task types
4. **Add Template System**: Create reusable file generation templates
5. **Test with Epic #60 Stories**: Validate with real API and frontend tasks
6. **Add AI Integration**: Enhance handlers with LLM-powered generation
7. **Performance Optimization**: Implement parallel processing for independent tasks
8. **Documentation**: Update agent documentation with new patterns

This modular approach transforms the Development Agent from a hardcoded database tool into a flexible, extensible development automation system that can handle any type of implementation task while maintaining the AI Native principles.
