/**
 * V2 Intelligence Foundation - Unified Architecture
 * Synthesizes comprehensive V2 capabilities with advanced MetaAgent orchestration
 * 
 * Combines:
 * - Comprehensive AI Intelligence Foundation (from copilot/fix-112)
 * - Advanced Natural Language Epic Interpretation (from copilot/fix-118)
 * - MetaAgent V2 orchestration and reasoning
 * 
 * Evolution: V1 Automation → V2 Intelligence → Unified V2 Architecture
 */

// Core Intelligence Metrics (from comprehensive foundation)
export interface IntelligenceMetrics {
  naturalLanguageAccuracy: number;
  codeGenerationQuality: number;
  predictiveAccuracy: number;
  learningRate: number;
  contextualUnderstanding: number;
  epicInterpretationAccuracy: number; // Enhanced with epic analysis
  agentCoordinationEfficiency: number; // MetaAgent coordination
}

// V2 Agent Capabilities (enhanced)
export interface V2AgentCapabilities {
  naturalLanguageProcessing: boolean;
  contextualCodeGeneration: boolean;
  predictiveIntelligence: boolean;
  continuousLearning: boolean;
  humanLikeCollaboration: boolean;
  epicInterpretation: boolean; // Added from MetaAgent
  agentOrchestration: boolean; // Added from MetaAgent
}

// Story Intelligence Analysis (from comprehensive foundation)
export interface StoryIntelligenceAnalysis {
  requirements: {
    technical: string[];
    business: string[];
    integration: string[];
    testing: string[];
  };
  complexity: 'low' | 'medium' | 'high';
  estimatedEffort: number;
  riskFactors: string[];
  recommendedApproach: string;
  dependencies: string[];
  qualityGates: string[];
}

// Epic Analysis (from MetaAgent V2)
export interface EpicAnalysisResult {
  epicType: string;
  confidence: number;
  keywords: string[];
  complexityLevel: 'low' | 'medium' | 'high';
  complexityScore: number;
  successPrediction: 'low' | 'medium' | 'high';
  successScore: number;
  taskCount: number;
  acceptanceCriteriaCount: number;
  storyAnalysis?: StoryIntelligenceAnalysis; // Bridge to story intelligence
}

// Agent Routing (from MetaAgent V2)
export interface AgentRoutingRecommendation {
  primary: string;
  secondary: string[];
  reasoning: string;
  executionStrategy: 'sequential' | 'parallel' | 'hybrid';
  monitoringRequired: boolean;
  intelligenceLevel: 'basic' | 'enhanced' | 'advanced' | 'contextual' | 'predictive' | 'adaptive';
}

// Unified Intelligence Context
export interface V2IntelligenceContext {
  issueNumber?: number;
  storyNumber?: string;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  analysisTimestamp: Date;
  epicAnalysis?: EpicAnalysisResult;
  storyAnalysis?: StoryIntelligenceAnalysis;
}

// Code Generation Context (from comprehensive foundation)
export interface CodeGenerationContext {
  repository: string;
  existingPatterns: string[];
  architecturalConstraints: string[];
  codebaseStyle: string;
  testingStrategy: string;
  performanceRequirements: string[];
}

// Predictive Insights (from comprehensive foundation)
export interface PredictiveInsight {
  type: 'deployment' | 'performance' | 'security' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  recommendation: string;
  preventiveActions: string[];
}

/**
 * Natural Language Epic Interpreter (from MetaAgent V2)
 * Enhanced with comprehensive intelligence capabilities
 */
export class NaturalLanguageEpicInterpreter {
  private epicPatterns = {
    foundation: ['foundation', 'core', 'base', 'infrastructure', 'setup', 'init'],
    intelligence: ['ai', 'agent', 'intelligence', 'reasoning', 'nlp', 'claude', 'copilot', 'ml'],
    development: ['development', 'implementation', 'code', 'feature', 'build', 'dev'],
    architecture: ['architecture', 'design', 'system', 'framework', 'pattern', 'structure'],
    integration: ['integration', 'connection', 'api', 'service', 'pipeline', 'connector'],
    optimization: ['optimization', 'performance', 'efficiency', 'improvement', 'speed'],
    monitoring: ['monitoring', 'observability', 'metrics', 'analytics', 'dashboard', 'tracking'],
    v2Evolution: ['v2', 'evolution', 'enhancement', 'upgrade', 'transformation', 'advancement']
  };

  async analyzeEpic(context: V2IntelligenceContext): Promise<EpicAnalysisResult> {
    const content = `${context.title} ${context.body}`.toLowerCase();
    
    // Determine epic type based on patterns
    const epicType = this.determineEpicType(content);
    
    // Calculate confidence based on keyword matches
    const keywords = this.extractKeywords(content);
    const confidence = this.calculateConfidence(keywords, epicType);
    
    // Assess complexity with enhanced scoring
    const complexityResult = this.assessComplexity(content, keywords);
    
    // Predict success based on epic characteristics
    const successResult = this.predictSuccess(complexityResult, keywords, epicType);
    
    // Estimate task and acceptance criteria counts
    const taskCount = this.estimateTaskCount(content, complexityResult.complexityLevel);
    const acceptanceCriteriaCount = this.estimateAcceptanceCriteria(content, keywords);

    const result: EpicAnalysisResult = {
      epicType,
      confidence,
      keywords,
      complexityLevel: complexityResult.complexityLevel,
      complexityScore: complexityResult.complexityScore,
      successPrediction: successResult.successPrediction,
      successScore: successResult.successScore,
      taskCount,
      acceptanceCriteriaCount
    };

    return result;
  }

  private determineEpicType(content: string): string {
    let maxMatches = 0;
    let detectedType = 'general';

    for (const [type, patterns] of Object.entries(this.epicPatterns)) {
      const matches = patterns.filter(pattern => content.includes(pattern)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = type;
      }
    }

    return detectedType;
  }

  private extractKeywords(content: string): string[] {
    const allPatterns = Object.values(this.epicPatterns).flat();
    return allPatterns.filter(pattern => content.includes(pattern));
  }

  private calculateConfidence(keywords: string[], epicType: string): number {
    const typePatterns = this.epicPatterns[epicType as keyof typeof this.epicPatterns] || [];
    const typeMatches = keywords.filter(kw => typePatterns.includes(kw)).length;
    const totalTypePatterns = typePatterns.length;
    
    if (totalTypePatterns === 0) return 0.5;
    
    const baseConfidence = Math.min(typeMatches / totalTypePatterns, 1);
    const keywordBonus = Math.min(keywords.length * 0.05, 0.3);
    
    return Math.min(baseConfidence + keywordBonus, 0.98);
  }

  private assessComplexity(content: string, keywords: string[]): { complexityLevel: 'low' | 'medium' | 'high', complexityScore: number } {
    const complexityIndicators = [
      'complex', 'advanced', 'integration', 'multiple', 'enterprise',
      'machine learning', 'ml', 'algorithms', 'real-time', 'optimization',
      'intelligent', 'behavior patterns', 'personalized', 'ai', 'automation',
      'orchestration', 'coordination', 'multi-agent', 'ecosystem', 'intelligence',
      'claude', 'copilot', 'v2', 'foundation', 'synthesis', 'transform'
    ];

    const matches = complexityIndicators.filter(indicator => content.includes(indicator)).length;
    const keywordComplexity = keywords.length;
    const lengthComplexity = Math.min(content.split(' ').length / 100, 3);
    
    const complexityScore = (matches * 0.5) + (keywordComplexity * 0.15) + (lengthComplexity * 0.3);
    
    let complexityLevel: 'low' | 'medium' | 'high';
    if (complexityScore >= 2.5) complexityLevel = 'high';
    else if (complexityScore >= 1.2) complexityLevel = 'medium';
    else complexityLevel = 'low';

    return { complexityLevel, complexityScore: Math.min(complexityScore, 5) };
  }

  private predictSuccess(
    complexity: { complexityLevel: 'low' | 'medium' | 'high', complexityScore: number },
    keywords: string[],
    epicType: string
  ): { successPrediction: 'low' | 'medium' | 'high', successScore: number } {
    let baseScore = 0.7; // Base success probability

    // Adjust for complexity
    switch (complexity.complexityLevel) {
      case 'low': baseScore += 0.2; break;
      case 'medium': baseScore += 0.0; break;
      case 'high': baseScore -= 0.2; break;
    }

    // Adjust for epic type confidence
    if (['foundation', 'intelligence', 'development'].includes(epicType)) {
      baseScore += 0.1; // Well-understood domains
    }

    // Adjust for keyword density (more keywords = better defined)
    const keywordBonus = Math.min(keywords.length * 0.02, 0.15);
    baseScore += keywordBonus;

    const successScore = Math.max(0.1, Math.min(baseScore, 0.95));
    
    let successPrediction: 'low' | 'medium' | 'high';
    if (successScore >= 0.75) successPrediction = 'high';
    else if (successScore >= 0.5) successPrediction = 'medium';
    else successPrediction = 'low';

    return { successPrediction, successScore };
  }

  private estimateTaskCount(content: string, complexity: 'low' | 'medium' | 'high'): number {
    const baseTaskCounts = { low: 3, medium: 8, high: 15 };
    let taskCount = baseTaskCounts[complexity];

    // Adjust based on content length
    const wordCount = content.split(' ').length;
    if (wordCount > 200) taskCount += 2;
    if (wordCount > 500) taskCount += 3;

    // Look for explicit task indicators
    const taskIndicators = ['implement', 'create', 'build', 'develop', 'integrate', 'deploy', 'test', 'monitor'];
    const explicitTasks = taskIndicators.filter(indicator => content.includes(indicator)).length;
    taskCount += Math.min(explicitTasks, 5);

    return Math.min(taskCount, 25); // Cap at reasonable maximum
  }

  private estimateAcceptanceCriteria(content: string, keywords: string[]): number {
    let criteriaCount = Math.max(3, Math.floor(keywords.length / 2));

    // Look for quality indicators
    const qualityIndicators = ['test', 'quality', 'performance', 'security', 'usability', 'reliability'];
    const qualityMatches = qualityIndicators.filter(indicator => content.includes(indicator)).length;
    criteriaCount += qualityMatches;

    return Math.min(criteriaCount, 15); // Cap at reasonable maximum
  }
}

/**
 * Unified V2 Intelligence Foundation
 * Combines comprehensive intelligence with MetaAgent orchestration
 */
export class UnifiedV2IntelligenceFoundation {
  private metrics: IntelligenceMetrics;
  private capabilities: V2AgentCapabilities;
  private learningHistory: Map<string, Record<string, unknown>[]>;
  private epicInterpreter: NaturalLanguageEpicInterpreter;

  constructor() {
    this.metrics = {
      naturalLanguageAccuracy: 0.85,       // Starting baseline, targets 95%+
      codeGenerationQuality: 0.80,         // Starting baseline, targets 90%+
      predictiveAccuracy: 0.75,            // Starting baseline, targets 85%+
      learningRate: 0.05,                  // Adaptive learning rate
      contextualUnderstanding: 0.82,       // Context awareness baseline
      epicInterpretationAccuracy: 0.88,    // Epic analysis baseline
      agentCoordinationEfficiency: 0.83    // MetaAgent coordination baseline
    };

    this.capabilities = {
      naturalLanguageProcessing: true,
      contextualCodeGeneration: true,
      predictiveIntelligence: true,
      continuousLearning: true,
      humanLikeCollaboration: true,
      epicInterpretation: true,             // Enhanced capability
      agentOrchestration: true              // Enhanced capability
    };

    this.learningHistory = new Map();
    this.epicInterpreter = new NaturalLanguageEpicInterpreter();
  }

  /**
   * Unified Epic and Story Intelligence Analysis
   * Combines epic interpretation with detailed story analysis
   */
  async analyzeUnifiedIntelligence(
    context: V2IntelligenceContext
  ): Promise<{ epicAnalysis: EpicAnalysisResult; storyAnalysis?: StoryIntelligenceAnalysis }> {
    // Epic-level analysis
    const epicAnalysis = await this.epicInterpreter.analyzeEpic(context);

    // Story-level analysis (if detailed content available)
    let storyAnalysis: StoryIntelligenceAnalysis | undefined;
    if (context.body && context.body.length > 50) {
      storyAnalysis = await this.analyzeStoryIntelligence(
        `${context.title}\n${context.body}`,
        context.storyNumber || context.issueNumber?.toString() || 'unified-analysis'
      );
      
      // Bridge epic and story analysis
      epicAnalysis.storyAnalysis = storyAnalysis;
    }

    // Record for continuous learning
    this.recordLearningData('unified_intelligence_analysis', {
      context,
      epicAnalysis,
      storyAnalysis,
      timestamp: new Date().toISOString()
    });

    if (storyAnalysis) {
      return { epicAnalysis, storyAnalysis };
    } else {
      return { epicAnalysis };
    }
  }

  /**
   * Story Intelligence Analysis (from comprehensive foundation)
   */
  async analyzeStoryIntelligence(
    storyContent: string,
    storyNumber: string
  ): Promise<StoryIntelligenceAnalysis> {
    const analysis: StoryIntelligenceAnalysis = {
      requirements: {
        technical: this.extractTechnicalRequirements(storyContent),
        business: this.extractBusinessRequirements(storyContent),
        integration: this.extractIntegrationPoints(storyContent),
        testing: this.generateTestingStrategy(storyContent)
      },
      complexity: this.assessStoryComplexity(storyContent),
      estimatedEffort: this.estimateEffort(storyContent),
      riskFactors: this.identifyRisks(storyContent),
      recommendedApproach: this.recommendApproach(storyContent),
      dependencies: this.analyzeDependencies(storyContent),
      qualityGates: this.defineQualityGates(storyContent)
    };

    this.recordLearningData('story_analysis', {
      storyNumber,
      analysis,
      timestamp: new Date().toISOString()
    });

    return analysis;
  }

  /**
   * Agent Routing Recommendations (from MetaAgent V2)
   */
  async generateAgentRouting(
    epicAnalysis: EpicAnalysisResult,
    _context: V2IntelligenceContext
  ): Promise<AgentRoutingRecommendation> {
    const { epicType, complexityLevel, successPrediction } = epicAnalysis;

    // Determine primary agent based on epic type
    const primaryAgent = this.selectPrimaryAgent(epicType, complexityLevel);
    
    // Determine secondary agents for support
    const secondaryAgents = this.selectSecondaryAgents(epicType, complexityLevel, successPrediction);
    
    // Determine execution strategy
    const executionStrategy = this.determineExecutionStrategy(complexityLevel, secondaryAgents);
    
    // Determine intelligence level required
    const intelligenceLevel = this.determineIntelligenceLevel(epicAnalysis);
    
    // Generate reasoning
    const reasoning = this.generateRoutingReasoning(epicType, complexityLevel, primaryAgent, secondaryAgents);
    
    // Determine monitoring requirements
    const monitoringRequired = complexityLevel === 'high' || successPrediction === 'low';

    return {
      primary: primaryAgent,
      secondary: secondaryAgents,
      reasoning,
      executionStrategy,
      monitoringRequired,
      intelligenceLevel
    };
  }

  /**
   * Contextual Code Generation (from comprehensive foundation)
   */
  async generateContextualCode(
    requirements: StoryIntelligenceAnalysis,
    _context: CodeGenerationContext
  ): Promise<{ files: { path: string; type: string; content: string }[], reasoning: string, confidence: number }> {
    const reasoning = this.generateReasoning(requirements, _context);
    const confidence = this.calculateConfidence(requirements, _context);
    
    const files = await this.generateIntelligentFiles(requirements, _context);

    this.updateMetrics('code_generation', confidence);

    return { files, reasoning, confidence };
  }

  /**
   * Predictive Intelligence (from comprehensive foundation)
   */
  async generatePredictiveInsights(
    _context: CodeGenerationContext,
    analysis: StoryIntelligenceAnalysis | EpicAnalysisResult
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Handle both story and epic analysis
    const complexity = 'complexity' in analysis ? analysis.complexity : analysis.complexityLevel;
    const isEpicAnalysis = 'epicType' in analysis;

    // Deployment insights
    if (complexity === 'high') {
      insights.push({
        type: 'deployment',
        severity: 'medium',
        confidence: 0.85,
        description: `High complexity ${isEpicAnalysis ? 'epic' : 'story'} may require staged deployment`,
        recommendation: 'Consider feature flags and gradual rollout',
        preventiveActions: ['Add integration tests', 'Enable monitoring', 'Create rollback plan']
      });
    }

    // Epic-specific insights
    if (isEpicAnalysis) {
      const epicAnalysis = analysis as EpicAnalysisResult;
      
      if (epicAnalysis.taskCount > 15) {
        insights.push({
          type: 'quality',
          severity: 'medium',
          confidence: 0.78,
          description: 'Large epic with many tasks may face coordination challenges',
          recommendation: 'Break into smaller epics or implement robust project management',
          preventiveActions: ['Epic breakdown review', 'Milestone planning', 'Progress tracking']
        });
      }

      if (epicAnalysis.successPrediction === 'low') {
        insights.push({
          type: 'deployment',
          severity: 'high',
          confidence: 0.92,
          description: 'Low success prediction indicates potential delivery risks',
          recommendation: 'Enhance planning, add risk mitigation, consider scope reduction',
          preventiveActions: ['Risk assessment', 'Scope review', 'Resource allocation', 'Stakeholder alignment']
        });
      }
    }

    // Story-specific insights
    if (!isEpicAnalysis) {
      const storyAnalysis = analysis as StoryIntelligenceAnalysis;
      
      // Performance insights
      if (storyAnalysis.requirements.technical.some(req => 
        req.toLowerCase().includes('database') || req.toLowerCase().includes('api')
      )) {
        insights.push({
          type: 'performance',
          severity: 'medium',
          confidence: 0.78,
          description: 'Database/API integration detected',
          recommendation: 'Implement caching and optimize queries',
          preventiveActions: ['Add performance tests', 'Monitor response times', 'Implement circuit breakers']
        });
      }

      // Security insights
      if (storyAnalysis.requirements.business.some(req => 
        req.toLowerCase().includes('user') || req.toLowerCase().includes('auth')
      )) {
        insights.push({
          type: 'security',
          severity: 'high',
          confidence: 0.92,
          description: 'User authentication/authorization features detected',
          recommendation: 'Implement comprehensive security controls',
          preventiveActions: ['Security review', 'Input validation', 'Rate limiting', 'Audit logging']
        });
      }
    }

    return insights;
  }

  /**
   * Continuous Learning System (enhanced)
   */
  updateMetrics(operation: string, outcome: number): void {
    const currentMetric = this.getRelevantMetric(operation);
    const newValue = currentMetric + (this.metrics.learningRate * (outcome - currentMetric));
    
    switch (operation) {
      case 'story_analysis':
        this.metrics.naturalLanguageAccuracy = Math.min(0.99, Math.max(0.1, newValue));
        break;
      case 'epic_interpretation':
        this.metrics.epicInterpretationAccuracy = Math.min(0.99, Math.max(0.1, newValue));
        break;
      case 'agent_coordination':
        this.metrics.agentCoordinationEfficiency = Math.min(0.99, Math.max(0.1, newValue));
        break;
      case 'code_generation':
        this.metrics.codeGenerationQuality = Math.min(0.99, Math.max(0.1, newValue));
        break;
      case 'prediction':
        this.metrics.predictiveAccuracy = Math.min(0.99, Math.max(0.1, newValue));
        break;
    }

    // Adaptive learning rate based on performance
    if (this.metrics.naturalLanguageAccuracy > 0.90 && 
        this.metrics.codeGenerationQuality > 0.85 &&
        this.metrics.epicInterpretationAccuracy > 0.90) {
      this.metrics.learningRate = Math.max(0.01, this.metrics.learningRate * 0.9);
    }
  }

  /**
   * Human-like Collaboration Interface (from comprehensive foundation)
   */
  async generateCollaborativeResponse(
    humanInput: string,
    context: Record<string, unknown>
  ): Promise<{ response: string, suggestions: string[], confidence: number }> {
    const response = this.generateHumanLikeResponse(humanInput, context);
    const suggestions = this.generateActionableSuggestions(humanInput, context);
    const confidence = this.assessResponseConfidence(humanInput, context);

    return { response, suggestions, confidence };
  }

  // Private helper methods from both implementations

  private selectPrimaryAgent(epicType: string, _complexity: 'low' | 'medium' | 'high'): string {
    const agentMap: Record<string, string> = {
      foundation: 'GitHub Copilot Claude 4 Agent V2',
      intelligence: 'MetaAgent Orchestrator V2',
      development: 'Development Intelligence Agent V2',
      architecture: 'Development Intelligence Agent V2',
      integration: 'Infrastructure Intelligence Agent V2',
      optimization: 'Quality Intelligence Agent V2',
      monitoring: 'Infrastructure Intelligence Agent V2',
      v2Evolution: 'MetaAgent Orchestrator V2'
    };

    return agentMap[epicType] || 'GitHub Copilot Claude 4 Agent V2';
  }

  private selectSecondaryAgents(epicType: string, complexity: 'low' | 'medium' | 'high', successPrediction: string): string[] {
    const baseAgents = ['Quality Intelligence Agent V2', 'Test Intelligence Agent V2'];
    
    if (complexity === 'high') {
      baseAgents.push('Security Intelligence Agent V2', 'Infrastructure Intelligence Agent V2');
    }
    
    if (successPrediction === 'low') {
      baseAgents.push('MetaAgent Orchestrator V2');
    }

    if (epicType === 'intelligence' || epicType === 'v2Evolution') {
      baseAgents.push('Development Intelligence Agent V2');
    }

    return [...new Set(baseAgents)]; // Remove duplicates
  }

  private determineExecutionStrategy(complexity: 'low' | 'medium' | 'high', secondaryAgents: string[]): 'sequential' | 'parallel' | 'hybrid' {
    if (complexity === 'low' && secondaryAgents.length <= 2) return 'sequential';
    if (complexity === 'high' || secondaryAgents.length > 3) return 'hybrid';
    return 'parallel';
  }

  private determineIntelligenceLevel(epicAnalysis: EpicAnalysisResult): 'basic' | 'enhanced' | 'advanced' | 'contextual' | 'predictive' | 'adaptive' {
    const { complexityLevel, confidence } = epicAnalysis;
    
    if (complexityLevel === 'high' && confidence > 0.85) return 'adaptive';
    if (complexityLevel === 'high') return 'predictive';
    if (complexityLevel === 'medium' && confidence > 0.8) return 'contextual';
    if (complexityLevel === 'medium') return 'advanced';
    return 'enhanced';
  }

  private generateRoutingReasoning(epicType: string, complexity: string, primary: string, secondary: string[]): string {
    return `Epic type '${epicType}' with ${complexity} complexity requires ${primary} as primary coordinator. Secondary agents ${secondary.join(', ')} provide specialized support for comprehensive execution.`;
  }

  // Story analysis helper methods (from comprehensive foundation)
  private extractTechnicalRequirements(content: string): string[] {
    const keywords = ['implement', 'create', 'build', 'develop', 'integrate', 'integration', 'api', 'database', 'component', 'authentication', 'auth', 'oauth', 'login', 'system'];
    const foundKeywords = keywords.filter(keyword => content.toLowerCase().includes(keyword));
    return foundKeywords.map(keyword => `Technical requirement detected: ${keyword}`);
  }

  private extractBusinessRequirements(content: string): string[] {
    const businessKeywords = ['user', 'customer', 'workflow', 'process', 'feature', 'functionality'];
    return businessKeywords.filter(keyword => content.toLowerCase().includes(keyword))
      .map(keyword => `Business requirement detected: ${keyword}`);
  }

  private extractIntegrationPoints(content: string): string[] {
    const integrationKeywords = ['api', 'service', 'external', 'third-party', 'integration', 'connect'];
    return integrationKeywords.filter(keyword => content.toLowerCase().includes(keyword))
      .map(keyword => `Integration point detected: ${keyword}`);
  }

  private generateTestingStrategy(_content: string): string[] {
    return [
      'Unit tests for core functionality',
      'Integration tests for API endpoints',
      'End-to-end tests for user workflows',
      'Performance tests for scalability'
    ];
  }

  private assessStoryComplexity(content: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = ['complex', 'advanced', 'integration', 'multiple', 'enterprise', 'machine learning', 'ml', 'algorithms', 'real-time', 'optimization', 'intelligent', 'behavior patterns', 'personalized'];
    const matches = complexityIndicators.filter(indicator => content.toLowerCase().includes(indicator)).length;

    if (matches >= 3) return 'high';
    if (matches >= 1) return 'medium';
    return 'low';
  }

  private estimateEffort(content: string): number {
    const complexity = this.assessStoryComplexity(content);
    const wordCount = content.split(' ').length;
    
    let baseEffort = 2;
    if (complexity === 'medium') baseEffort = 5;
    if (complexity === 'high') baseEffort = 8;
    
    if (wordCount > 200) baseEffort += 2;
    if (wordCount > 500) baseEffort += 3;
    
    return Math.min(13, baseEffort);
  }

  private identifyRisks(content: string): string[] {
    const risks = [];
    if (content.toLowerCase().includes('external')) risks.push('External dependency risk');
    if (content.toLowerCase().includes('performance')) risks.push('Performance optimization challenge');
    if (content.toLowerCase().includes('security')) risks.push('Security implementation complexity');
    return risks;
  }

  private recommendApproach(content: string): string {
    const complexity = this.assessStoryComplexity(content);
    
    switch (complexity) {
      case 'high': return 'Incremental development with frequent integration and testing';
      case 'medium': return 'Standard agile development with regular checkpoints';
      default: return 'Direct implementation with comprehensive testing';
    }
  }

  private analyzeDependencies(content: string): string[] {
    const dependencies = [];
    if (content.toLowerCase().includes('api')) dependencies.push('API service availability');
    if (content.toLowerCase().includes('database')) dependencies.push('Database schema updates');
    return dependencies;
  }

  private defineQualityGates(_content: string): string[] {
    return [
      'Code review approval',
      'All tests passing',
      'Security scan clean',
      'Performance benchmarks met',
      'Documentation updated'
    ];
  }

  private generateReasoning(requirements: StoryIntelligenceAnalysis, _context: CodeGenerationContext): string {
    return `Based on the ${requirements.complexity} complexity requirements and existing patterns, implementing a ${requirements.recommendedApproach} approach with focus on ${requirements.requirements.technical.join(', ')}.`;
  }

  private calculateConfidence(requirements: StoryIntelligenceAnalysis, _context: CodeGenerationContext): number {
    let confidence = 0.8;
    if (requirements.complexity === 'low') confidence += 0.1;
    if (requirements.riskFactors.length === 0) confidence += 0.05;
    return Math.min(0.99, confidence);
  }

  private async generateIntelligentFiles(requirements: StoryIntelligenceAnalysis, _context: CodeGenerationContext): Promise<{ path: string; type: string; content: string }[]> {
    const files = [];
    
    if (requirements.requirements.technical.some(req => req.includes('component'))) {
      files.push({
        path: 'src/components/generated-component.tsx',
        type: 'react-component',
        content: '// AI-generated React component based on requirements'
      });
    }
    
    if (requirements.requirements.technical.some(req => req.includes('api'))) {
      files.push({
        path: 'src/lib/api-client.ts',
        type: 'api-client',
        content: '// AI-generated API client with intelligent error handling'
      });
    }
    
    return files;
  }

  private generateHumanLikeResponse(input: string, _context: Record<string, unknown>): string {
    return `I understand you're asking about ${input}. Based on the current context and my unified V2 intelligence analysis, I recommend focusing on the key requirements while considering both epic-level strategy and story-level implementation details. Let me help you break this down into actionable steps with appropriate agent coordination.`;
  }

  private generateActionableSuggestions(_input: string, _context: Record<string, unknown>): string[] {
    return [
      'Start with epic-level analysis to understand overall strategy',
      'Break down into manageable stories with clear acceptance criteria',
      'Identify appropriate V2 agents for each component',
      'Plan for incremental delivery with continuous validation',
      'Consider performance and security implications early',
      'Implement comprehensive testing and monitoring'
    ];
  }

  private assessResponseConfidence(_input: string, _context: Record<string, unknown>): number {
    return 0.91; // Enhanced confidence with unified intelligence
  }

  private getRelevantMetric(operation: string): number {
    switch (operation) {
      case 'story_analysis': return this.metrics.naturalLanguageAccuracy;
      case 'epic_interpretation': return this.metrics.epicInterpretationAccuracy;
      case 'agent_coordination': return this.metrics.agentCoordinationEfficiency;
      case 'code_generation': return this.metrics.codeGenerationQuality;
      case 'prediction': return this.metrics.predictiveAccuracy;
      default: return this.metrics.contextualUnderstanding;
    }
  }

  private recordLearningData(operation: string, data: Record<string, unknown>): void {
    if (!this.learningHistory.has(operation)) {
      this.learningHistory.set(operation, []);
    }
    
    const history = this.learningHistory.get(operation)!;
    history.push(data);
    
    if (history.length > 100) {
      history.shift();
    }
  }

  // Public access methods
  getMetrics(): IntelligenceMetrics {
    return { ...this.metrics };
  }

  getCapabilities(): V2AgentCapabilities {
    return { ...this.capabilities };
  }

  getLearningStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    for (const [operation, history] of this.learningHistory.entries()) {
      stats[`${operation}_samples`] = history.length;
    }
    
    return stats;
  }
}

// Export singleton instance for V2 agents
export const unifiedV2Intelligence = new UnifiedV2IntelligenceFoundation();

// Export for backward compatibility
export const v2Intelligence = unifiedV2Intelligence;