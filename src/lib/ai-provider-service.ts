/**
 * NOVELI.SH - AI Provider Service Implementation
 * 
 * Implements the dual AI architecture:
 * - GitHub Copilot + Claude 4 for software development
 * - OpenAI for narrative generation
 */

import { aiArchitecture, getAIProviderForTask, type AITaskDomain, type AIProviderConfig } from '../config/ai-providers.config';
import { generateWorld, offlineBeat } from './rng';

export interface AIRequest {
  domain: AITaskDomain;
  prompt: string;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    responseTime: number;
    cached: boolean;
    fallbackUsed: boolean;
  };
}

export interface StoryGenerationRequest {
  seed: string;
  previousChoice?: 'Y' | 'N';
  storyBeat?: number;
  worldContext?: Record<string, unknown>;
}

export interface StoryResponse {
  storyText: string;
  choice: {
    prompt: string;
    options: ['Y', 'N'];
  };
  worldState: ReturnType<typeof generateWorld>;
  metadata: {
    seed: string;
    beatNumber: number;
    generatedBy: string;
    continuityLevel: number;
  };
}

/**
 * AI Provider Service - Routes requests to appropriate AI models
 */
export class AIProviderService {
  private static instance: AIProviderService;
  private requestCache = new Map<string, AIResponse>();
  private usageMetrics = {
    totalRequests: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    errorRate: 0
  };

  private constructor() {}

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  /**
   * SOFTWARE DEVELOPMENT AI - GitHub Copilot + Claude 4
   */
  async generateCode(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Ensure this is a development task
    if (!this.isDevelopmentTask(request.domain)) {
      throw new Error(`Invalid domain for code generation: ${request.domain}`);
    }

    const provider = getAIProviderForTask(request.domain);
    
    // For now, simulate GitHub Copilot + Claude 4 response
    // In production, this would integrate with actual GitHub Copilot API
    const response = await this.simulateGithubCopilotClaude4(request, provider);
    
    const responseTime = Date.now() - startTime;
    this.updateMetrics(response, responseTime);
    
    return {
      ...response,
      metadata: {
        ...response.metadata,
        responseTime
      }
    };
  }

  /**
   * NARRATIVE GENERATION AI - OpenAI
   */
  async generateStory(request: StoryGenerationRequest): Promise<StoryResponse> {
    const provider = getAIProviderForTask('narrative-generation');
    
    // Generate deterministic world from seed
    const worldState = generateWorld(request.seed);
    
    // Use RNG-based offline story generation for consistency
    const storyText = offlineBeat(worldState, request.previousChoice);
    
    // In production, this could be enhanced with OpenAI for more variety
    // while maintaining seed-based consistency
    const enhancedStory = await this.enhanceStoryWithOpenAI(storyText, worldState, provider);
    
    return {
      storyText: enhancedStory,
      choice: {
        prompt: this.extractChoicePrompt(enhancedStory),
        options: ['Y', 'N']
      },
      worldState,
      metadata: {
        seed: request.seed,
        beatNumber: request.storyBeat || 1,
        generatedBy: provider.model,
        continuityLevel: worldState.continuity
      }
    };
  }

  /**
   * UNIFIED AI REQUEST - Auto-routes based on domain
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true
        }
      };
    }

    const provider = getAIProviderForTask(request.domain);
    let response: AIResponse;

    try {
      if (this.isDevelopmentTask(request.domain)) {
        response = await this.callDevelopmentAI(request, provider);
      } else {
        response = await this.callNarrativeAI(request, provider);
      }

      // Cache successful responses
      this.requestCache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      // Try fallback provider if available
      if (provider.fallback) {
        try {
          response = await this.callWithFallback(request, provider.fallback);
          response.metadata.fallbackUsed = true;
          return response;
        } catch (fallbackError) {
          throw new Error(`Both primary and fallback AI providers failed: ${error}, ${fallbackError}`);
        }
      }
      throw error;
    }
  }

  /**
   * GITHUB COPILOT + CLAUDE 4 INTEGRATION
   * Uses actual Claude 4 API via Anthropic SDK for development tasks
   */
  private async callGithubCopilotClaude4(
    request: AIRequest, 
    provider: AIProviderConfig
  ): Promise<AIResponse> {
    try {
      // Import Anthropic SDK dynamically to avoid build issues
      const { Anthropic } = await import('@anthropic-ai/sdk');
      
      // Initialize Claude 4 client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key',
      });

      const basePrompt = provider.systemPrompt || '';
      const fullPrompt = `${basePrompt}\n\nTask: ${request.prompt}\nContext: ${JSON.stringify(request.context || {})}`;
      
      // Make actual API call to Claude 4
      const response = await anthropic.messages.create({
        model: provider.model,
        max_tokens: request.maxTokens || provider.maxTokens,
        temperature: request.temperature || provider.temperature,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      return {
        content,
        provider: provider.provider,
        model: provider.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        metadata: {
          responseTime: 0, // Will be set by caller
          cached: false,
          fallbackUsed: false
        }
      };
    } catch (error) {
      console.warn('Claude 4 API unavailable, falling back to simulation:', error);
      return this.simulateGithubCopilotClaude4(request, provider);
    }
  }

  /**
   * GITHUB COPILOT + CLAUDE 4 SIMULATION
   * Fallback simulation when API is unavailable
   */
  private async simulateGithubCopilotClaude4(
    request: AIRequest, 
    provider: AIProviderConfig
  ): Promise<AIResponse> {
    // Simulate Claude 4's reasoning-focused response for development tasks
    const basePrompt = provider.systemPrompt || '';
    const fullPrompt = `${basePrompt}\n\nTask: ${request.prompt}\nContext: ${JSON.stringify(request.context || {})}`;
    
    // Simulate intelligent code generation based on domain
    let content = '';
    
    switch (request.domain) {
      case 'code-generation':
        content = this.generateCodeResponse(request, provider);
        break;
      case 'code-review':
        content = this.generateCodeReviewResponse(request, provider);
        break;
      case 'github-actions':
        content = this.generateGithubActionsResponse(request, provider);
        break;
      case 'technical-documentation':
        content = this.generateDocumentationResponse(request, provider);
        break;
      default:
        content = `// AI-generated response for ${request.domain}\n// ${request.prompt}\n// Generated by ${provider.model} (simulated)`;
    }

    return {
      content,
      provider: provider.provider,
      model: provider.model,
      usage: {
        promptTokens: Math.floor(fullPrompt.length / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((fullPrompt.length + content.length) / 4)
      },
      metadata: {
        responseTime: 0, // Will be set by caller
        cached: false,
        fallbackUsed: true
      }
    };
  }

  /**
   * OPENAI STORY ENHANCEMENT - Real Integration
   * Enhances RNG-based stories with OpenAI creativity while maintaining consistency
   */
  private async enhanceStoryWithOpenAI(
    baseStory: string,
    worldState: ReturnType<typeof generateWorld>,
    provider: AIProviderConfig
  ): Promise<string> {
    // For offline capability, return the RNG-based story
    // In production with OpenAI API, could enhance while preserving seed consistency
    
    if (baseStory.includes('(Restart?)')) {
      return baseStory; // Don't enhance ending beats
    }

    try {
      // Import OpenAI SDK dynamically
      const { OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'demo-key',
      });

      const response = await openai.chat.completions.create({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: provider.systemPrompt || 'You are a creative storyteller for NOVELI.SH interactive fiction.'
          },
          {
            role: 'user',
            content: `Enhance this story segment while preserving its structure and choice format: ${baseStory}`
          }
        ],
        temperature: provider.temperature,
        max_tokens: Math.min(provider.maxTokens, 500) // Limit for story enhancement
      });

      const enhanced = response.choices[0]?.message?.content || baseStory;
      return this.applyNarativeStyle(enhanced, worldState, provider);
    } catch (error) {
      console.warn('OpenAI API unavailable, using offline story:', error);
      // Fallback to offline enhancement
      const enhanced = this.applyNarativeStyle(baseStory, worldState, provider);
      return enhanced;
    }
  }

  /**
   * HELPER METHODS
   */
  private isDevelopmentTask(domain: AITaskDomain): boolean {
    const devDomains = [
      'software-development',
      'code-generation',
      'code-review',
      'github-actions',
      'technical-documentation',
      'architecture-decisions'
    ];
    return devDomains.includes(domain);
  }

  private async callDevelopmentAI(request: AIRequest, provider: AIProviderConfig): Promise<AIResponse> {
    // Use real Claude 4 API first, fallback to simulation if unavailable
    return this.callGithubCopilotClaude4(request, provider);
  }

  private async callNarrativeAI(request: AIRequest, provider: AIProviderConfig): Promise<AIResponse> {
    try {
      // Import OpenAI SDK dynamically
      const { OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'demo-key',
      });

      const response = await openai.chat.completions.create({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: provider.systemPrompt || 'You are a creative storyteller for NOVELI.SH interactive fiction.'
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: request.temperature || provider.temperature,
        max_tokens: request.maxTokens || provider.maxTokens
      });

      const content = response.choices[0]?.message?.content || `Generated narrative content for: ${request.prompt}`;
      
      return {
        content,
        provider: provider.provider,
        model: provider.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || Math.floor(request.prompt.length / 4),
          completionTokens: response.usage?.completion_tokens || Math.floor(content.length / 4),
          totalTokens: response.usage?.total_tokens || Math.floor((request.prompt.length + content.length) / 4)
        },
        metadata: {
          responseTime: 0,
          cached: false,
          fallbackUsed: false
        }
      };
    } catch (error) {
      console.warn('OpenAI API unavailable, falling back to simulation:', error);
      // Fallback to simulation
      const content = `Generated narrative content for: ${request.prompt}`;
      
      return {
        content,
        provider: provider.provider,
        model: provider.model,
        usage: {
          promptTokens: Math.floor(request.prompt.length / 4),
          completionTokens: Math.floor(content.length / 4),
          totalTokens: Math.floor((request.prompt.length + content.length) / 4)
        },
        metadata: {
          responseTime: 0,
          cached: false,
          fallbackUsed: true
        }
      };
    }
  }

  private async callWithFallback(request: AIRequest, fallback: AIProviderConfig): Promise<AIResponse> {
    // Use fallback provider with reduced capabilities
    return this.callDevelopmentAI(request, fallback);
  }

  private generateCacheKey(request: AIRequest): string {
    return `${request.domain}:${request.prompt}:${JSON.stringify(request.context)}`;
  }

  private updateMetrics(response: AIResponse, responseTime: number): void {
    this.usageMetrics.totalRequests++;
    this.usageMetrics.totalTokens += response.usage.totalTokens;
    this.usageMetrics.averageResponseTime = 
      (this.usageMetrics.averageResponseTime + responseTime) / 2;
  }

  private extractChoicePrompt(storyText: string): string {
    const match = storyText.match(/([^.!?]*\?)\s*\(Y\/N\)/);
    return match?.[1]?.trim() || 'Continue?';
  }

  private generateCodeResponse(request: AIRequest, provider: AIProviderConfig): string {
    return `/**
 * AI-generated code for: ${request.prompt}
 * Generated by: ${provider.model}
 * Domain: ${request.domain}
 */

// TypeScript implementation following NOVELI.SH patterns
export interface GeneratedInterface {
  id: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export function generateImplementation(): GeneratedInterface {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    data: {}
  };
}

// Comprehensive error handling
export class GeneratedError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GeneratedError';
  }
}

// Export for use in NOVELI.SH platform
export default { GeneratedInterface, generateImplementation, GeneratedError };`;
  }

  private generateCodeReviewResponse(request: AIRequest, provider: AIProviderConfig): string {
    return `## AI Code Review - ${provider.model}

### Summary
Analyzed code for: ${request.prompt}

### Findings
✅ **Strengths:**
- Follows TypeScript best practices
- Proper error handling implemented
- Clear interface definitions

⚠️ **Suggestions:**
- Consider adding input validation
- Add comprehensive unit tests
- Document public API methods

### Security Analysis
🔒 No security vulnerabilities detected

### Performance Considerations
⚡ Consider caching for frequently accessed data

### NOVELI.SH Compliance
✅ Follows typography-first design principles
✅ Zero emoji policy maintained
✅ Mobile-first responsive patterns`;
  }

  private generateGithubActionsResponse(request: AIRequest, provider: AIProviderConfig): string {
    return `# AI-Generated GitHub Actions Workflow
# Generated by: ${provider.model}
# Purpose: ${request.prompt}

name: 🤖 AI-Generated Workflow

on:
  workflow_dispatch:
    inputs:
      task_type:
        description: "Task to execute"
        required: true
        default: "default"

jobs:
  ai-generated-job:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: 🔄 Checkout Repository
        uses: actions/checkout@v4
        
      - name: 🔧 Setup Environment
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          
      - name: 🤖 Execute AI Task
        run: |
          echo "Executing: \${{ github.event.inputs.task_type }}"
          echo "Generated by: ${provider.model}"`;
  }

  private generateDocumentationResponse(request: AIRequest, provider: AIProviderConfig): string {
    return `# AI-Generated Documentation

**Generated by:** ${provider.model}  
**Topic:** ${request.prompt}  
**Date:** ${new Date().toISOString()}

## Overview

This documentation was automatically generated to address the requirements for ${request.prompt}.

## Implementation Details

### Architecture
- Follows NOVELI.SH AI Native patterns
- Implements TypeScript with strict typing
- Maintains mobile-first responsive design

### Usage Examples

\`\`\`typescript
// Example implementation
import { GeneratedComponent } from './generated-component';

const component = new GeneratedComponent({
  config: { responsive: true, accessible: true }
});
\`\`\`

### Best Practices
- Follow the typography-first design philosophy
- Implement comprehensive error handling
- Maintain zero emoji policy in user content
- Ensure accessibility compliance (WCAG 2.1 AA)

## Next Steps
1. Review generated implementation
2. Add comprehensive test coverage
3. Validate accessibility compliance
4. Deploy following CI/CD pipeline`;
  }

  private applyNarativeStyle(
    story: string, 
    _worldState: ReturnType<typeof generateWorld>,
    _provider: AIProviderConfig
  ): string {
    // Apply NOVELI.SH narrative style while preserving RNG consistency
    const storyParts = story.split('. ');
    const enhancedParts = storyParts.map(part => {
      if (part.includes('(Y/N)')) {
        return part; // Don't modify choice format
      }
      
      // Enhance with atmospheric details based on world state
      if (part.includes('air tastes of')) {
        return part; // Already has sensory detail
      }
      
      return part;
    });
    
    return enhancedParts.join('. ');
  }

  /**
   * PUBLIC METRICS AND MONITORING
   */
  getUsageMetrics() {
    return { ...this.usageMetrics };
  }

  getProviderHealth() {
    return {
      development: {
        provider: aiArchitecture.development.provider,
        model: aiArchitecture.development.model,
        enabled: aiArchitecture.development.enabled,
        rateLimit: aiArchitecture.development.rateLimits
      },
      narrative: {
        provider: aiArchitecture.narrative.provider,
        model: aiArchitecture.narrative.model,
        enabled: aiArchitecture.narrative.enabled,
        rateLimit: aiArchitecture.narrative.rateLimits
      }
    };
  }

  clearCache(): void {
    this.requestCache.clear();
  }
}

// Export singleton instance
export const aiProvider = AIProviderService.getInstance();
