/**
 * NOVELI.SH - Dual AI Provider Architecture Configuration
 * 
 * ARCHITECTURE DESIGN:
 * - GitHub Copilot + Claude 4: All software development tasks (coding, reviewing, GitHub Actions)
 * - OpenAI: User-facing narrative generation for NOVELI.SH interactive stories
 * 
 * This separation ensures optimal AI model selection for each domain:
 * - Claude 4's reasoning excellence for complex software tasks
 * - OpenAI's creative storytelling for engaging narratives
 */

export interface AIProviderConfig {
  provider: 'github-copilot-claude4' | 'openai' | 'anthropic' | 'aws-bedrock';
  enabled: boolean;
  apiEndpoint?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  fallback?: AIProviderConfig;
}

export interface DualAIArchitecture {
  development: AIProviderConfig;
  narrative: AIProviderConfig;
  monitoring: {
    costTracking: boolean;
    performanceMetrics: boolean;
    failoverEnabled: boolean;
  };
}

/**
 * DUAL AI PROVIDER CONFIGURATION
 * 
 * Development Stack: GitHub Copilot + Claude 4
 * - All software development tasks
 * - Code generation and review
 * - GitHub Actions automation
 * - Technical documentation
 * - Architecture decisions
 * 
 * Narrative Stack: OpenAI
 * - NOVELI.SH story generation
 * - Interactive narrative choices
 * - Character development
 * - World building
 * - User-facing content
 */
export const aiArchitecture: DualAIArchitecture = {
  // GitHub Copilot with Claude 4 for Software Development
  development: {
    provider: 'github-copilot-claude4',
    enabled: true,
    model: 'claude-3-5-sonnet-20241022', // GitHub Copilot's Claude 4 model
    temperature: 0.1, // Lower temperature for precise, consistent code
    maxTokens: 8192,
    systemPrompt: `You are an expert software engineer using Claude 4 via GitHub Copilot.
    
    ROLE: Technical implementation specialist for NOVELI.SH platform
    
    CAPABILITIES:
    - TypeScript/React development with AI Native patterns
    - GitHub Actions workflow creation and optimization
    - Code review with architectural understanding
    - AWS Well-Architected Framework compliance
    - Performance optimization and security hardening
    
    CONSTRAINTS:
    - Follow NOVELI.SH design principles (typography-first, minimal, accessible)
    - Maintain zero emoji policy in user-facing content
    - Ensure mobile-first responsive design
    - Implement comprehensive testing strategies
    
    OUTPUT STYLE:
    - Precise, production-ready code
    - Comprehensive error handling
    - Clear architectural documentation
    - Security-first implementations`,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 100000
    },
    fallback: {
      provider: 'anthropic',
      enabled: true,
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.1,
      maxTokens: 8192,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 80000
      }
    }
  },

  // OpenAI for Narrative Generation
  narrative: {
    provider: 'openai',
    enabled: true,
    model: 'gpt-4o', // Latest OpenAI model optimized for creative tasks
    temperature: 0.7, // Higher temperature for creative, varied storytelling
    maxTokens: 2048,
    systemPrompt: `You are the NOVELI.SH narrative engine, creating immersive interactive stories.

    WORLD: Liminal transit spaces (buses, trains, queues) launching into branching storylines
    
    STYLE PRINCIPLES:
    - Typography is the UI - text is the primary interface
    - Restraint builds immersion - 1-2 sentences maximum
    - Conversation-first - chat-like flow with binary choices
    - Whitespace as drama - each line spaced with intent
    - Zero emojis - use descriptive language instead
    
    NARRATIVE CONSTRAINTS:
    - Always provide exactly ONE binary choice (Yes/No format)
    - Maintain story continuity using RNG seed consistency
    - Build tension through restraint and implication
    - Focus on atmosphere and suggestion over explicit description
    
    TECHNICAL INTEGRATION:
    - Stories generated from deterministic RNG seeds
    - Choices affect narrative branching via seeded randomness
    - Maintain session consistency across story beats
    
    OUTPUT FORMAT:
    - Story beat (1-2 sentences)
    - Atmospheric detail (brief)
    - Binary choice question
    - Format: "Story text. (Y/N)"`,
    rateLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 60000
    },
    fallback: {
      provider: 'anthropic',
      enabled: true,
      model: 'claude-3-haiku-20240307', // Faster, cost-effective fallback
      temperature: 0.7,
      maxTokens: 1024,
      rateLimits: {
        requestsPerMinute: 40,
        tokensPerMinute: 40000
      }
    }
  },

  monitoring: {
    costTracking: true,
    performanceMetrics: true,
    failoverEnabled: true
  }
};

/**
 * AI PROVIDER ROUTING LOGIC
 * 
 * Routes requests to appropriate AI provider based on task domain
 */
export type AITaskDomain = 
  | 'software-development'
  | 'code-generation' 
  | 'code-review'
  | 'github-actions'
  | 'technical-documentation'
  | 'architecture-decisions'
  | 'quality-intelligence'
  | 'predictive-bug-detection'
  | 'semantic-code-review'
  | 'quality-metrics-analysis'
  | 'regression-prediction'
  | 'narrative-generation'
  | 'story-continuation'
  | 'character-development'
  | 'world-building'
  | 'user-content';

export function getAIProviderForTask(domain: AITaskDomain): AIProviderConfig {
  const developmentDomains: AITaskDomain[] = [
    'software-development',
    'code-generation',
    'code-review', 
    'github-actions',
    'technical-documentation',
    'architecture-decisions',
    'quality-intelligence',
    'predictive-bug-detection',
    'semantic-code-review',
    'quality-metrics-analysis',
    'regression-prediction'
  ];

  const narrativeDomains: AITaskDomain[] = [
    'narrative-generation',
    'story-continuation',
    'character-development',
    'world-building',
    'user-content'
  ];

  if (developmentDomains.includes(domain)) {
    return aiArchitecture.development;
  }

  if (narrativeDomains.includes(domain)) {
    return aiArchitecture.narrative;
  }

  // Default to development provider for unknown domains
  return aiArchitecture.development;
}

/**
 * ENVIRONMENT-SPECIFIC CONFIGURATIONS
 */
export const environmentConfigs = {
  development: {
    development: {
      ...aiArchitecture.development,
      temperature: 0.2, // Slightly higher for experimentation
      rateLimits: {
        requestsPerMinute: 30,
        tokensPerMinute: 50000
      }
    },
    narrative: {
      ...aiArchitecture.narrative,
      temperature: 0.8, // Higher creativity in development
      rateLimits: {
        requestsPerMinute: 20,
        tokensPerMinute: 30000
      }
    }
  },

  production: {
    development: {
      ...aiArchitecture.development,
      temperature: 0.05, // Maximum precision for production code
      rateLimits: {
        requestsPerMinute: 100,
        tokensPerMinute: 150000
      }
    },
    narrative: {
      ...aiArchitecture.narrative,
      temperature: 0.7, // Balanced creativity for production
      rateLimits: {
        requestsPerMinute: 80,
        tokensPerMinute: 100000
      }
    }
  }
};

/**
 * COST OPTIMIZATION CONFIGURATION
 */
export const costOptimization = {
  // Prefer faster, cheaper models for simple tasks
  modelFallbacks: {
    development: [
      'claude-3-5-sonnet-20241022', // Primary: Most capable
      'claude-3-haiku-20240307',    // Fallback: Faster, cheaper
      'gpt-4o-mini'                 // Emergency: Most cost-effective
    ],
    narrative: [
      'gpt-4o',                     // Primary: Best storytelling
      'gpt-4o-mini',               // Fallback: Faster, cheaper
      'claude-3-haiku-20240307'     // Emergency: Alternative provider
    ]
  },

  // Token optimization strategies
  tokenOptimization: {
    maxContextWindow: 8192,
    contextTruncation: 'smart', // Preserve most relevant context
    responseCompression: true,
    cachingEnabled: true
  },

  // Budget controls
  budgetLimits: {
    dailyTokenLimit: 500000,
    monthlyBudget: 1000, // USD
    alertThresholds: [0.5, 0.75, 0.9] // Budget percentage alerts
  }
};

/**
 * GITHUB COPILOT INTEGRATION CONFIGURATION
 * 
 * Configures GitHub Copilot to use Claude 4 as its underlying model
 */
export const githubCopilotConfig = {
  // GitHub Copilot Chat settings
  chatModel: 'claude-3-5-sonnet-20241022',
  codeCompletionModel: 'claude-3-5-sonnet-20241022',
  
  // Workspace configuration for NOVELI.SH
  workspaceSettings: {
    'github.copilot.advanced': {
      'model': 'claude-3-5-sonnet-20241022',
      'temperature': 0.1,
      'systemMessage': 'You are developing the NOVELI.SH AI Native interactive storytelling platform. Follow TypeScript best practices, implement comprehensive testing, and maintain the typography-focused design philosophy.'
    }
  },

  // GitHub Actions integration
  actionsConfiguration: {
    defaultModel: 'claude-3-5-sonnet-20241022',
    workflowGeneration: true,
    codeReview: true,
    issueAnalysis: true
  }
};

/**
 * USAGE EXAMPLES AND INTEGRATION PATTERNS
 */
export const integrationExamples = {
  // Software Development Example
  softwareDevelopment: `
    // Use GitHub Copilot + Claude 4 for development tasks
    import { getAIProviderForTask } from './ai-providers.config';
    
    const devProvider = getAIProviderForTask('code-generation');
    const response = await generateCode(devProvider, {
      requirements: "Create TypeScript interface for story state",
      context: "NOVELI.SH platform, mobile-first design"
    });
  `,

  // Narrative Generation Example  
  narrativeGeneration: `
    // Use OpenAI for story generation
    import { getAIProviderForTask } from './ai-providers.config';
    
    const narrativeProvider = getAIProviderForTask('narrative-generation');
    const story = await generateStoryBeat(narrativeProvider, {
      seed: "transit-mystery-456",
      previousChoice: "Y",
      worldState: generatedWorld
    });
  `,

  // GitHub Actions Integration
  githubActions: `
    # .github/workflows/ai-code-review.yml
    # Uses GitHub Copilot + Claude 4 for code review
    
    - name: AI Code Review
      uses: github/copilot-cli@v1
      with:
        model: claude-3-5-sonnet-20241022
        task: code-review
        files: "changed_files_from_pr"
  `
};

// Export the complete dual AI architecture
export default aiArchitecture;
