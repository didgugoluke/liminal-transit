/**
 * NOVELI.SH - Integrated AI Architecture for Development & Narrative
 * 
 * Connects the dual AI system with the platform:
 * - GitHub Copilot + Claude 4 for all software tasks
 * - OpenAI for NOVELI.SH interactive storytelling
 */

import { aiProvider, type AIRequest, type StoryGenerationRequest } from './ai-provider-service';
import { aiArchitecture, type AITaskDomain } from '../config/ai-providers.config';
import { hashStringToSeed } from './rng';

/**
 * HIGH-LEVEL AI INTEGRATION
 * 
 * Provides simple interfaces for the dual AI architecture
 */
export class NovelishAI {
  private static instance: NovelishAI;

  private constructor() {}

  static getInstance(): NovelishAI {
    if (!NovelishAI.instance) {
      NovelishAI.instance = new NovelishAI();
    }
    return NovelishAI.instance;
  }

  /**
   * SOFTWARE DEVELOPMENT AI
   * Uses GitHub Copilot + Claude 4 for all development tasks
   */
  async dev(prompt: string, domain: AITaskDomain = 'software-development', context?: Record<string, unknown>) {
    const request: AIRequest = {
      domain,
      prompt,
      context: {
        ...context,
        platform: 'NOVELI.SH',
        designPrinciples: [
          'Typography-first design',
          'Mobile-first responsive',
          'Zero emoji policy',
          'Accessibility compliance',
          'AI Native patterns'
        ]
      }
    };

    const response = await aiProvider.processRequest(request);
    
    return {
      code: response.content,
      model: response.model,
      provider: response.provider,
      usage: response.usage,
      metadata: response.metadata
    };
  }

  /**
   * NARRATIVE GENERATION AI
   * Uses OpenAI for NOVELI.SH interactive storytelling
   */
  async story(seed: string, previousChoice?: 'Y' | 'N', beatNumber?: number) {
    const request: StoryGenerationRequest = {
      seed,
      ...(previousChoice && { previousChoice }),
      ...(beatNumber && { storyBeat: beatNumber }),
      worldContext: {
        platform: 'NOVELI.SH',
        narrativeStyle: [
          'Liminal transit spaces',
          'Typography as UI',
          'Binary choices only',
          'Atmospheric restraint',
          'Zero emoji content'
        ]
      }
    };

    const response = await aiProvider.generateStory(request);
    
    return {
      text: response.storyText,
      choice: response.choice,
      world: response.worldState,
      metadata: response.metadata
    };
  }

  /**
   * GITHUB ACTIONS INTEGRATION
   * GitHub Copilot + Claude 4 for workflow generation
   */
  async workflow(workflowPurpose: string, inputs?: Record<string, unknown>) {
    return this.dev(
      `Generate GitHub Actions workflow for: ${workflowPurpose}`,
      'github-actions',
      {
        workflowInputs: inputs,
        platform: 'NOVELI.SH',
        cicd: true
      }
    );
  }

  /**
   * CODE REVIEW INTEGRATION
   * GitHub Copilot + Claude 4 for intelligent code review
   */
  async review(codeContent: string, pullRequestContext?: Record<string, unknown>) {
    return this.dev(
      `Review this code for quality, security, and NOVELI.SH compliance:\n\n${codeContent}`,
      'code-review',
      {
        pullRequest: pullRequestContext,
        reviewCriteria: [
          'TypeScript best practices',
          'NOVELI.SH design compliance',
          'Security vulnerabilities',
          'Performance optimization',
          'Accessibility standards'
        ]
      }
    );
  }

  /**
   * COMPONENT GENERATION
   * GitHub Copilot + Claude 4 for React component creation
   */
  async component(componentDescription: string, requirements?: Record<string, unknown>) {
    return this.dev(
      `Create React TypeScript component: ${componentDescription}`,
      'code-generation',
      {
        framework: 'React',
        language: 'TypeScript',
        requirements: {
          responsive: true,
          accessible: true,
          testable: true,
          ...requirements
        },
        designSystem: 'NOVELI.SH typography-first'
      }
    );
  }

  /**
   * API GENERATION
   * GitHub Copilot + Claude 4 for API endpoint creation
   */
  async api(apiDescription: string, specifications?: Record<string, unknown>) {
    return this.dev(
      `Create API endpoint: ${apiDescription}`,
      'code-generation',
      {
        type: 'API',
        specifications: {
          method: 'GET',
          authentication: 'required',
          rateLimit: true,
          ...specifications
        },
        patterns: ['RESTful', 'Error handling', 'Type safety']
      }
    );
  }

  /**
   * DOCUMENTATION GENERATION
   * GitHub Copilot + Claude 4 for technical documentation
   */
  async docs(topic: string, documentationType: 'API' | 'Component' | 'Architecture' | 'Guide' = 'Guide') {
    return this.dev(
      `Generate ${documentationType} documentation for: ${topic}`,
      'technical-documentation',
      {
        documentationType,
        includeExamples: true,
        includeTypeScript: true,
        format: 'Markdown',
        audience: 'developers'
      }
    );
  }

  /**
   * STORY SESSION MANAGEMENT
   * Manages NOVELI.SH story sessions with OpenAI
   */
  async startStory(seedString?: string) {
    const seed = seedString || this.generateStorySeed();
    const story = await this.story(seed);
    
    return {
      sessionId: this.generateSessionId(seed),
      seed,
      ...story,
      beatNumber: 1
    };
  }

  async continueStory(sessionId: string, choice: 'Y' | 'N', currentBeat: number) {
    const seed = this.extractSeedFromSession(sessionId);
    const story = await this.story(seed, choice, currentBeat + 1);
    
    return {
      sessionId,
      seed,
      ...story,
      beatNumber: currentBeat + 1
    };
  }

  /**
   * AI PROVIDER HEALTH & MONITORING
   */
  getAIHealth() {
    return {
      providers: aiProvider.getProviderHealth(),
      usage: aiProvider.getUsageMetrics(),
      architecture: {
        development: {
          provider: aiArchitecture.development.provider,
          model: aiArchitecture.development.model,
          purpose: 'Software development, code review, GitHub Actions'
        },
        narrative: {
          provider: aiArchitecture.narrative.provider,
          model: aiArchitecture.narrative.model,
          purpose: 'Interactive storytelling, narrative generation'
        }
      }
    };
  }

  /**
   * COST OPTIMIZATION
   */
  async optimizeCosts() {
    // Clear AI provider cache to free memory
    aiProvider.clearCache();
    
    // Return cost optimization recommendations
    return {
      recommendations: [
        'Use cached responses when possible',
        'Batch similar requests together',
        'Use appropriate model for task complexity',
        'Monitor token usage regularly'
      ],
      currentUsage: aiProvider.getUsageMetrics()
    };
  }

  /**
   * PRIVATE HELPER METHODS
   */
  private generateStorySeed(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `story-${timestamp}-${random}`;
  }

  private generateSessionId(seed: string): string {
    return `session-${hashStringToSeed(seed).toString(36)}`;
  }

  private extractSeedFromSession(sessionId: string): string {
    // In a real implementation, this would lookup the session
    // For now, return a placeholder
    return `extracted-seed-from-${sessionId}`;
  }
}

/**
 * CONVENIENCE EXPORTS FOR EASY INTEGRATION
 */

// Singleton instance for global use
export const ai = NovelishAI.getInstance();

// Direct AI functions for common tasks
export const dev = {
  /**
   * Generate code with GitHub Copilot + Claude 4
   */
  code: (prompt: string, context?: Record<string, unknown>) => 
    ai.dev(prompt, 'code-generation', context),

  /**
   * Review code with GitHub Copilot + Claude 4
   */
  review: (code: string, context?: Record<string, unknown>) => 
    ai.review(code, context),

  /**
   * Generate GitHub Actions workflow
   */
  workflow: (purpose: string, inputs?: Record<string, unknown>) => 
    ai.workflow(purpose, inputs),

  /**
   * Generate React component
   */
  component: (description: string, requirements?: Record<string, unknown>) => 
    ai.component(description, requirements),

  /**
   * Generate API endpoint
   */
  api: (description: string, specs?: Record<string, unknown>) => 
    ai.api(description, specs),

  /**
   * Generate documentation
   */
  docs: (topic: string, type?: 'API' | 'Component' | 'Architecture' | 'Guide') => 
    ai.docs(topic, type)
};

export const story = {
  /**
   * Start new NOVELI.SH story with OpenAI
   */
  start: (seed?: string) => ai.startStory(seed),

  /**
   * Continue existing story
   */
  continue: (sessionId: string, choice: 'Y' | 'N', beat: number) => 
    ai.continueStory(sessionId, choice, beat),

  /**
   * Generate single story beat
   */
  generate: (seed: string, previousChoice?: 'Y' | 'N', beat?: number) => 
    ai.story(seed, previousChoice, beat)
};

/**
 * USAGE EXAMPLES
 */
export const examples = {
  // Software Development Examples
  async generateLoginComponent() {
    return dev.component('User login form with email/password fields', {
      validation: true,
      accessibility: true,
      responsive: true,
      errorHandling: true
    });
  },

  async reviewPullRequest(codeContent: string) {
    return dev.review(codeContent, {
      prNumber: 123,
      targetBranch: 'main',
      reviewFocus: ['security', 'performance', 'accessibility']
    });
  },

  async createAPIEndpoint() {
    return dev.api('User authentication endpoint with JWT tokens', {
      method: 'POST',
      path: '/api/auth/login',
      requestBody: { email: 'string', password: 'string' },
      response: { token: 'string', user: 'UserObject' }
    });
  },

  // Story Generation Examples
  async startNovelishStory() {
    return story.start('liminal-bus-station-mystery');
  },

  async continueNovelishStory() {
    const initialStory = await story.start();
    return story.continue(initialStory.sessionId, 'Y', initialStory.beatNumber);
  },

  // Integrated Workflow Example
  async createFeatureWorkflow() {
    const workflow = await dev.workflow('Deploy React component to production', {
      trigger: 'push',
      branch: 'main',
      environment: 'production',
      tests: true,
      buildSteps: ['npm install', 'npm run build', 'npm test']
    });

    return workflow;
  }
};

// Export everything for comprehensive access
export default {
  ai,
  dev,
  story,
  examples,
  NovelishAI
};
