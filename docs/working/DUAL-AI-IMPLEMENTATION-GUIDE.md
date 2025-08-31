# Dual AI Architecture Implementation Guide

**NOVELI.SH Platform: GitHub Copilot + Claude 4 for Development, OpenAI for Narrative**

## 🎯 Architecture Overview

This guide shows how to implement the dual AI provider architecture where:

- **GitHub Copilot + Claude 4**: Handles all software development tasks (coding, reviewing, GitHub Actions)
- **OpenAI**: Powers user-facing NOVELI.SH narrative generation with RNG seed consistency

## 🏗️ Implementation Steps

### 1. Configure GitHub Copilot with Claude 4

#### VS Code Settings (.vscode/settings.json)

```json
{
  "github.copilot.advanced": {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.1,
    "systemMessage": "You are developing the NOVELI.SH AI Native interactive storytelling platform. Follow TypeScript best practices, implement comprehensive testing, and maintain the typography-focused design philosophy."
  },
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": false
  }
}
```

#### GitHub Copilot Workspace Configuration

```typescript
// Configure Copilot to use Claude 4 for all development tasks
export const copilotConfig = {
  model: "claude-3-5-sonnet-20241022",
  temperature: 0.1, // Precise, consistent code generation
  systemPrompt: `
    ROLE: Expert TypeScript developer for NOVELI.SH platform
    
    PRINCIPLES:
    - Typography-first design (text is the UI)
    - Zero emoji policy in user-facing content
    - Mobile-first responsive patterns
    - Comprehensive accessibility (WCAG 2.1 AA)
    - AI Native development patterns
    
    CONSTRAINTS:
    - Use strict TypeScript with proper error handling
    - Implement comprehensive testing strategies
    - Follow AWS Well-Architected Framework
    - Maintain clean, readable, maintainable code
  `,
};
```

### 2. Set Up OpenAI for Narrative Generation

#### Environment Variables (.env)

```bash
# OpenAI Configuration for Narrative Generation
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2048

# GitHub Copilot Configuration (if using API directly)
GITHUB_COPILOT_TOKEN=your_github_copilot_token
COPILOT_MODEL=claude-3-5-sonnet-20241022
COPILOT_TEMPERATURE=0.1
```

#### OpenAI Client Configuration

```typescript
import OpenAI from "openai";

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
});

export const narrativeConfig = {
  model: "gpt-4o",
  temperature: 0.7, // Higher creativity for storytelling
  maxTokens: 2048,
  systemPrompt: `
    You are the NOVELI.SH narrative engine creating immersive interactive stories.
    
    WORLD: Liminal transit spaces (buses, trains, queues) launching into branching storylines
    
    STYLE:
    - Typography is the UI - text is the primary interface
    - Restraint builds immersion - 1-2 sentences maximum
    - Binary choices only (Y/N format)
    - Zero emojis - use descriptive language
    - Whitespace as drama - each line spaced with intent
    
    OUTPUT: "Story text. (Y/N)"
  `,
};
```

### 3. Implement the Dual AI Router

#### AI Provider Router (src/lib/ai-router.ts)

```typescript
import { openaiClient, narrativeConfig } from "./openai-config";
import { aiProvider } from "./ai-provider-service";

export type TaskDomain = "development" | "narrative";

export async function routeAIRequest(
  domain: TaskDomain,
  prompt: string,
  context?: Record<string, unknown>
) {
  switch (domain) {
    case "development":
      // Use GitHub Copilot + Claude 4 via VS Code integration
      return await requestDevelopmentAI(prompt, context);

    case "narrative":
      // Use OpenAI for story generation
      return await requestNarrativeAI(prompt, context);

    default:
      throw new Error(`Unknown AI domain: ${domain}`);
  }
}

async function requestDevelopmentAI(
  prompt: string,
  context?: Record<string, unknown>
) {
  // This integrates with GitHub Copilot's Claude 4 model
  // In practice, this happens through VS Code's Copilot integration
  return await aiProvider.generateCode({
    domain: "code-generation",
    prompt,
    context,
  });
}

async function requestNarrativeAI(
  prompt: string,
  context?: Record<string, unknown>
) {
  const response = await openaiClient.chat.completions.create({
    model: narrativeConfig.model,
    messages: [
      { role: "system", content: narrativeConfig.systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: narrativeConfig.temperature,
    max_tokens: narrativeConfig.maxTokens,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    model: narrativeConfig.model,
    usage: response.usage,
  };
}
```

### 4. Integrate with NOVELI.SH Story Engine

#### Story Generation with OpenAI + RNG Consistency

```typescript
import { generateWorld, offlineBeat } from "./rng";
import { routeAIRequest } from "./ai-router";

export async function generateStoryBeat(
  seed: string,
  previousChoice?: "Y" | "N",
  beatNumber: number = 1
) {
  // Generate consistent world state from seed
  const world = generateWorld(seed);

  // Use RNG-based generation for consistency
  const baseStory = offlineBeat(world, previousChoice);

  // Enhance with OpenAI while preserving structure
  const enhancedStory = await enhanceWithOpenAI(baseStory, world, beatNumber);

  return {
    text: enhancedStory,
    world,
    beatNumber,
    seed,
    isEnding: enhancedStory.includes("(Restart?)"),
  };
}

async function enhanceWithOpenAI(
  baseStory: string,
  world: ReturnType<typeof generateWorld>,
  beatNumber: number
) {
  // For story endings, don't enhance
  if (baseStory.includes("(Restart?)")) {
    return baseStory;
  }

  const enhancementPrompt = `
    Enhance this NOVELI.SH story beat while preserving its structure:
    
    Base story: "${baseStory}"
    World context: ${JSON.stringify(world)}
    Beat number: ${beatNumber}
    
    Requirements:
    - Keep the same choice format (Y/N)
    - Maintain the liminal transit atmosphere
    - Preserve story length (1-2 sentences + choice)
    - No emojis
    - Enhanced atmospheric details only
  `;

  const result = await routeAIRequest("narrative", enhancementPrompt);

  // Fall back to base story if enhancement fails
  return result.content || baseStory;
}
```

### 5. GitHub Actions Integration

#### Workflow Using GitHub Copilot + Claude 4

```yaml
# .github/workflows/ai-development.yml
name: 🤖 AI-Powered Development with Claude 4

on:
  workflow_dispatch:
    inputs:
      task_type:
        description: "Development task type"
        required: true
        type: choice
        options:
          - "code-generation"
          - "code-review"
          - "component-creation"
          - "api-development"

jobs:
  ai-development:
    runs-on: ubuntu-latest

    steps:
      - name: 🔄 Checkout Repository
        uses: actions/checkout@v4

      - name: 🔧 Setup Development Environment
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: 📦 Install Dependencies
        run: |
          npm install -g pnpm
          pnpm install

      - name: 🤖 Execute AI Development Task
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Executing ${{ github.event.inputs.task_type }} with Claude 4 via GitHub Copilot"

          # This would integrate with GitHub Copilot API when available
          # For now, demonstrates the architecture
          node -e "
            console.log('🧠 Claude 4 Development AI Active');
            console.log('🎯 Task: ${{ github.event.inputs.task_type }}');
            console.log('🔧 Platform: NOVELI.SH');
            console.log('✅ Development task completed');
          "
```

### 6. Component Integration Example

#### React Component Using Both AI Systems

```tsx
import { useState } from "react";
import { routeAIRequest } from "../lib/ai-router";
import { generateStoryBeat } from "../lib/story-engine";

// This component was generated by GitHub Copilot + Claude 4 (Development AI)
export function AIIntegratedStoryInterface() {
  const [story, setStory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Use OpenAI for narrative generation
  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const storyBeat = await generateStoryBeat("demo-seed");
      setStory(storyBeat.text);
    } catch (error) {
      console.error("Story generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Use GitHub Copilot + Claude 4 for development assistance
  const generateComponent = async () => {
    const result = await routeAIRequest(
      "development",
      "Create accessible button component with hover states",
      { framework: "React", typescript: true }
    );
    console.log("Generated component:", result.content);
  };

  return (
    <div className="ai-story-interface">
      <h2>Dual AI Architecture Demo</h2>

      {/* OpenAI-powered narrative */}
      <div className="story-section">
        <h3>Narrative AI (OpenAI)</h3>
        <button onClick={generateStory} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Story"}
        </button>
        {story && <p className="story-text">{story}</p>}
      </div>

      {/* GitHub Copilot + Claude 4 development assistance */}
      <div className="development-section">
        <h3>Development AI (GitHub Copilot + Claude 4)</h3>
        <button onClick={generateComponent}>Generate Component Code</button>
      </div>
    </div>
  );
}
```

## 🎯 Best Practices

### Development AI (GitHub Copilot + Claude 4)

1. **Use for all coding tasks**:
   - Component generation
   - API development
   - GitHub Actions workflows
   - Code reviews
   - Technical documentation

2. **Configuration**:
   - Set temperature to 0.1 for consistency
   - Use detailed system prompts
   - Include NOVELI.SH design principles

3. **Integration patterns**:
   - VS Code Copilot integration
   - GitHub Actions automation
   - Pull request reviews

### Narrative AI (OpenAI)

1. **Use for creative content**:
   - Interactive story generation
   - Character development
   - World building
   - User-facing content

2. **Configuration**:
   - Set temperature to 0.7 for creativity
   - Maintain RNG seed consistency
   - Enforce NOVELI.SH style guidelines

3. **Integration patterns**:
   - Story beat generation
   - Choice consequence handling
   - Session continuity

## 🔧 Configuration Files

### Package.json Dependencies

```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@octokit/rest": "^20.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "ai:story": "node scripts/generate-story.js",
    "ai:code": "node scripts/generate-code.js"
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🚀 Deployment Strategy

### Environment-Specific Configuration

#### Development

```typescript
export const developmentConfig = {
  development: {
    provider: "github-copilot-claude4",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.2, // Slightly higher for experimentation
  },
  narrative: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.8, // Higher creativity in development
  },
};
```

#### Production

```typescript
export const productionConfig = {
  development: {
    provider: "github-copilot-claude4",
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.05, // Maximum precision
  },
  narrative: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7, // Balanced creativity
  },
};
```

## 📊 Monitoring & Analytics

### AI Usage Tracking

```typescript
export class AIUsageTracker {
  trackDevelopmentRequest(
    domain: string,
    tokens: number,
    responseTime: number
  ) {
    // Track GitHub Copilot + Claude 4 usage
    console.log(
      `Development AI: ${domain}, ${tokens} tokens, ${responseTime}ms`
    );
  }

  trackNarrativeRequest(
    storyBeat: number,
    tokens: number,
    responseTime: number
  ) {
    // Track OpenAI narrative usage
    console.log(
      `Narrative AI: Beat ${storyBeat}, ${tokens} tokens, ${responseTime}ms`
    );
  }

  generateUsageReport() {
    return {
      development: {
        totalRequests: this.devRequests,
        totalTokens: this.devTokens,
        averageResponseTime: this.devAvgTime,
      },
      narrative: {
        totalRequests: this.narrativeRequests,
        totalTokens: this.narrativeTokens,
        averageResponseTime: this.narrativeAvgTime,
      },
    };
  }
}
```

## ✅ Testing Strategy

### Unit Tests for AI Integration

```typescript
import { describe, it, expect, vi } from "vitest";
import { routeAIRequest } from "../src/lib/ai-router";

describe("Dual AI Architecture", () => {
  it("routes development tasks to GitHub Copilot + Claude 4", async () => {
    const result = await routeAIRequest(
      "development",
      "Create React component"
    );
    expect(result.model).toBe("claude-3-5-sonnet-20241022");
  });

  it("routes narrative tasks to OpenAI", async () => {
    const result = await routeAIRequest("narrative", "Generate story beat");
    expect(result.model).toBe("gpt-4o");
  });
});
```

## 🎯 Success Metrics

- **Development AI**: Code quality, review approval rate, generation speed
- **Narrative AI**: Story engagement, completion rates, user satisfaction
- **Cost Efficiency**: Token usage optimization, provider cost comparison
- **System Reliability**: Uptime, fallback usage, error rates

This architecture provides the best of both worlds: Claude 4's precise reasoning for development tasks through GitHub Copilot, and OpenAI's creative storytelling for engaging NOVELI.SH narratives.
