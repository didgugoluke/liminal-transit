import { describe, it, expect, beforeEach } from 'vitest';
import { 
  UnifiedV2IntelligenceFoundation, 
  NaturalLanguageEpicInterpreter,
  type V2IntelligenceContext,
  type EpicAnalysisResult,
  type StoryIntelligenceAnalysis,
  unifiedV2Intelligence
} from '../../lib/v2-intelligence-foundation-unified';

describe('Unified V2 Intelligence Foundation - Conflict Resolution', () => {
  let intelligence: UnifiedV2IntelligenceFoundation;
  let epicInterpreter: NaturalLanguageEpicInterpreter;

  beforeEach(() => {
    intelligence = new UnifiedV2IntelligenceFoundation();
    epicInterpreter = new NaturalLanguageEpicInterpreter();
  });

  describe('Unified Architecture Capabilities', () => {
    it('should have all V2 capabilities from both implementations', () => {
      const capabilities = intelligence.getCapabilities();
      
      // From comprehensive foundation (copilot/fix-112)
      expect(capabilities.naturalLanguageProcessing).toBe(true);
      expect(capabilities.contextualCodeGeneration).toBe(true);
      expect(capabilities.predictiveIntelligence).toBe(true);
      expect(capabilities.continuousLearning).toBe(true);
      expect(capabilities.humanLikeCollaboration).toBe(true);
      
      // From MetaAgent V2 (copilot/fix-118)
      expect(capabilities.epicInterpretation).toBe(true);
      expect(capabilities.agentOrchestration).toBe(true);
    });

    it('should have enhanced metrics including both implementations', () => {
      const metrics = intelligence.getMetrics();
      
      // Original metrics from comprehensive foundation
      expect(metrics.naturalLanguageAccuracy).toBeGreaterThanOrEqual(0.85);
      expect(metrics.codeGenerationQuality).toBeGreaterThanOrEqual(0.80);
      expect(metrics.predictiveAccuracy).toBeGreaterThanOrEqual(0.75);
      expect(metrics.learningRate).toBeGreaterThan(0);
      expect(metrics.contextualUnderstanding).toBeGreaterThanOrEqual(0.80);
      
      // Enhanced metrics from MetaAgent V2
      expect(metrics.epicInterpretationAccuracy).toBeGreaterThanOrEqual(0.85);
      expect(metrics.agentCoordinationEfficiency).toBeGreaterThanOrEqual(0.80);
    });
  });

  describe('Epic Intelligence Analysis (from MetaAgent V2)', () => {
    it('should analyze epic content with 95%+ accuracy targeting', async () => {
      const context: V2IntelligenceContext = {
        issueNumber: 112,
        title: 'Epic 2: AI Agent V2 Intelligence Foundation',
        body: 'Transform V1 automation agents into intelligent V2 agents with natural language processing, contextual code generation, and predictive intelligence capabilities using GitHub Copilot + Claude 4.',
        labels: ['epic', 'v2-intelligence', 'ai-agents'],
        assignees: ['copilot'],
        analysisTimestamp: new Date()
      };

      const analysis = await epicInterpreter.analyzeEpic(context);

      expect(analysis.epicType).toBe('intelligence');
      expect(analysis.confidence).toBeGreaterThan(0.8); // Should be high confidence
      expect(analysis.complexityLevel).toBe('high'); // V2 intelligence is complex
      expect(analysis.keywords).toContain('intelligence');
      expect(analysis.keywords).toContain('ai');
      expect(analysis.taskCount).toBeGreaterThan(8); // Complex epics have many tasks
      expect(analysis.acceptanceCriteriaCount).toBeGreaterThan(5);
    });

    it('should correctly assess epic complexity with scoring', async () => {
      const simpleContext: V2IntelligenceContext = {
        title: 'Add button to homepage',
        body: 'Simple UI update to add a button',
        labels: ['enhancement'],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const complexContext: V2IntelligenceContext = {
        title: 'Enterprise AI orchestration with multi-agent coordination',
        body: 'Complex enterprise integration with multiple advanced external services, machine learning algorithms, real-time optimization, and intelligent behavior patterns',
        labels: ['epic', 'complex'],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const simpleAnalysis = await epicInterpreter.analyzeEpic(simpleContext);
      const complexAnalysis = await epicInterpreter.analyzeEpic(complexContext);

      expect(simpleAnalysis.complexityLevel).toBe('low');
      expect(complexAnalysis.complexityLevel).toBe('high');
      expect(complexAnalysis.complexityScore).toBeGreaterThan(simpleAnalysis.complexityScore);
      expect(complexAnalysis.taskCount).toBeGreaterThan(simpleAnalysis.taskCount);
    });

    it('should predict success based on epic characteristics', async () => {
      const wellDefinedContext: V2IntelligenceContext = {
        title: 'Foundation setup with clear requirements',
        body: 'Well-defined foundation setup with specific requirements, clear acceptance criteria, and established patterns',
        labels: ['foundation'],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const vagueContext: V2IntelligenceContext = {
        title: 'Complex integration',
        body: 'Some complex stuff',
        labels: [],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const wellDefinedAnalysis = await epicInterpreter.analyzeEpic(wellDefinedContext);
      const vagueAnalysis = await epicInterpreter.analyzeEpic(vagueContext);

      expect(wellDefinedAnalysis.successScore).toBeGreaterThan(vagueAnalysis.successScore);
      expect(wellDefinedAnalysis.confidence).toBeGreaterThan(vagueAnalysis.confidence);
    });
  });

  describe('Unified Intelligence Analysis', () => {
    it('should perform both epic and story analysis in unified workflow', async () => {
      const context: V2IntelligenceContext = {
        storyNumber: 'epic2-unified-test',
        title: 'V2 Agent Intelligence Foundation',
        body: `Create an AI-powered agent coordination system that analyzes user requirements
               in natural language, generates contextual code implementations, and provides
               predictive insights for deployment optimization. The system should integrate
               with GitHub Copilot and Claude 4 for enhanced intelligence capabilities.`,
        labels: ['v2-intelligence', 'ai-agents', 'epic'],
        assignees: ['copilot'],
        analysisTimestamp: new Date()
      };

      const result = await intelligence.analyzeUnifiedIntelligence(context);

      // Should have both analyses
      expect(result.epicAnalysis).toBeDefined();
      expect(result.storyAnalysis).toBeDefined();

      // Epic analysis should detect intelligence type
      expect(result.epicAnalysis.epicType).toBe('intelligence');
      expect(result.epicAnalysis.complexityLevel).toBe('high');

      // Story analysis should extract requirements
      expect(result.storyAnalysis!.requirements.technical.length).toBeGreaterThan(0);
      expect(result.storyAnalysis!.complexity).toBe('high');
      expect(result.storyAnalysis!.estimatedEffort).toBeGreaterThan(5);

      // Should bridge epic and story analysis
      expect(result.epicAnalysis.storyAnalysis).toBe(result.storyAnalysis);
    });

    it('should handle epic-only analysis when story content is minimal', async () => {
      const context: V2IntelligenceContext = {
        issueNumber: 999,
        title: 'Simple epic',
        body: 'Short', // Minimal content
        labels: ['epic'],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const result = await intelligence.analyzeUnifiedIntelligence(context);

      expect(result.epicAnalysis).toBeDefined();
      expect(result.storyAnalysis).toBeUndefined(); // No story analysis for minimal content
    });
  });

  describe('Agent Routing Recommendations (from MetaAgent V2)', () => {
    it('should recommend appropriate agents based on epic analysis', async () => {
      const intelligenceEpicAnalysis: EpicAnalysisResult = {
        epicType: 'intelligence',
        confidence: 0.92,
        keywords: ['ai', 'agent', 'intelligence', 'claude'],
        complexityLevel: 'high',
        complexityScore: 4.2,
        successPrediction: 'medium',
        successScore: 0.65,
        taskCount: 15,
        acceptanceCriteriaCount: 8
      };

      const context: V2IntelligenceContext = {
        title: 'AI Intelligence Epic',
        body: 'Complex AI system',
        labels: ['intelligence'],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const routing = await intelligence.generateAgentRouting(intelligenceEpicAnalysis, context);

      expect(routing.primary).toBe('MetaAgent Orchestrator V2'); // Intelligence epic should use MetaAgent
      expect(routing.secondary).toContain('Quality Intelligence Agent V2');
      expect(routing.executionStrategy).toBe('hybrid'); // High complexity should use hybrid
      expect(routing.monitoringRequired).toBe(true); // High complexity requires monitoring
      expect(routing.intelligenceLevel).toBe('adaptive'); // High complexity + high confidence gets adaptive intelligence
      expect(routing.reasoning).toContain('intelligence');
    });

    it('should adjust strategy based on complexity and success prediction', async () => {
      const lowComplexityAnalysis: EpicAnalysisResult = {
        epicType: 'development',
        confidence: 0.85,
        keywords: ['development', 'simple'],
        complexityLevel: 'low',
        complexityScore: 1.2,
        successPrediction: 'high',
        successScore: 0.85,
        taskCount: 3,
        acceptanceCriteriaCount: 3
      };

      const highRiskAnalysis: EpicAnalysisResult = {
        epicType: 'integration',
        confidence: 0.65,
        keywords: ['integration', 'complex'],
        complexityLevel: 'high',
        complexityScore: 4.8,
        successPrediction: 'low',
        successScore: 0.35,
        taskCount: 20,
        acceptanceCriteriaCount: 12
      };

      const context: V2IntelligenceContext = {
        title: 'Test Epic',
        body: 'Test epic body',
        labels: [],
        assignees: [],
        analysisTimestamp: new Date()
      };

      const lowComplexityRouting = await intelligence.generateAgentRouting(lowComplexityAnalysis, context);
      const highRiskRouting = await intelligence.generateAgentRouting(highRiskAnalysis, context);

      // Low complexity should be simpler
      expect(lowComplexityRouting.executionStrategy).toBe('sequential');
      expect(lowComplexityRouting.secondary.length).toBeLessThan(highRiskRouting.secondary.length);
      expect(lowComplexityRouting.intelligenceLevel).toBe('enhanced');

      // High risk should have more support
      expect(highRiskRouting.secondary).toContain('MetaAgent Orchestrator V2'); // Low success adds MetaAgent
      expect(highRiskRouting.intelligenceLevel).toBe('predictive');
      expect(highRiskRouting.monitoringRequired).toBe(true);
    });
  });

  describe('Story Intelligence Analysis (from Comprehensive Foundation)', () => {
    it('should analyze story requirements with comprehensive extraction', async () => {
      const storyContent = `
        Create a user authentication system with secure OAuth integration,
        database user management, API endpoints for user operations,
        and comprehensive testing with performance optimization.
      `;

      const analysis = await intelligence.analyzeStoryIntelligence(storyContent, 'unified-story-test');

      expect(analysis.requirements.technical).toContain('Technical requirement detected: authentication');
      expect(analysis.requirements.technical).toContain('Technical requirement detected: api');
      expect(analysis.requirements.technical).toContain('Technical requirement detected: database');
      expect(analysis.requirements.business).toContain('Business requirement detected: user');
      expect(analysis.requirements.integration).toContain('Integration point detected: api');
      expect(analysis.requirements.testing).toContain('Unit tests for core functionality');
      
      expect(analysis.complexity).toBe('medium'); // Multiple integrations = medium complexity
      expect(analysis.estimatedEffort).toBeGreaterThan(3);
      expect(analysis.riskFactors).toContain('Performance optimization challenge');
      expect(analysis.dependencies).toContain('API service availability');
      expect(analysis.qualityGates).toContain('Security scan clean');
    });
  });

  describe('Predictive Intelligence (Enhanced)', () => {
    it('should generate insights for both epic and story analysis', async () => {
      const epicAnalysis: EpicAnalysisResult = {
        epicType: 'intelligence',
        confidence: 0.88,
        keywords: ['ai', 'intelligence', 'complex'],
        complexityLevel: 'high',
        complexityScore: 4.5,
        successPrediction: 'low',
        successScore: 0.4,
        taskCount: 18,
        acceptanceCriteriaCount: 10
      };

      const storyAnalysis: StoryIntelligenceAnalysis = {
        requirements: {
          technical: ['Technical requirement detected: database', 'Technical requirement detected: api'],
          business: ['Business requirement detected: user'],
          integration: ['Integration point detected: external'],
          testing: ['Unit tests', 'Integration tests']
        },
        complexity: 'high',
        estimatedEffort: 8,
        riskFactors: ['External dependency'],
        recommendedApproach: 'Incremental development',
        dependencies: ['Database'],
        qualityGates: ['Security review']
      };

      const context = {
        repository: 'liminal-transit',
        existingPatterns: ['TypeScript', 'React'],
        architecturalConstraints: ['AI Native'],
        codebaseStyle: 'TypeScript',
        testingStrategy: 'Comprehensive',
        performanceRequirements: ['Fast response']
      };

      const epicInsights = await intelligence.generatePredictiveInsights(context, epicAnalysis);
      const storyInsights = await intelligence.generatePredictiveInsights(context, storyAnalysis);

      // Epic insights should include coordination concerns
      expect(epicInsights.some(i => i.description.includes('many tasks'))).toBe(true);
      expect(epicInsights.some(i => i.description.includes('Low success prediction'))).toBe(true);

      // Story insights should include technical concerns
      expect(storyInsights.some(i => i.type === 'performance')).toBe(true);
      expect(storyInsights.some(i => i.type === 'security')).toBe(true);
      expect(storyInsights.some(i => i.type === 'deployment')).toBe(true);
    });
  });

  describe('Continuous Learning (Enhanced)', () => {
    it('should update all enhanced metrics based on operations', () => {
      const initialMetrics = intelligence.getMetrics();

      // Test epic interpretation learning
      intelligence.updateMetrics('epic_interpretation', 0.95);
      let updatedMetrics = intelligence.getMetrics();
      expect(updatedMetrics.epicInterpretationAccuracy).toBeGreaterThan(initialMetrics.epicInterpretationAccuracy);

      // Test agent coordination learning
      intelligence.updateMetrics('agent_coordination', 0.90);
      updatedMetrics = intelligence.getMetrics();
      expect(updatedMetrics.agentCoordinationEfficiency).toBeGreaterThan(initialMetrics.agentCoordinationEfficiency);

      // Test story analysis learning
      intelligence.updateMetrics('story_analysis', 0.92);
      updatedMetrics = intelligence.getMetrics();
      expect(updatedMetrics.naturalLanguageAccuracy).toBeGreaterThan(initialMetrics.naturalLanguageAccuracy);
    });

    it('should adapt learning rate based on overall performance', () => {
      const initialMetrics = intelligence.getMetrics();
      const initialLearningRate = initialMetrics.learningRate;

      // Simulate high performance across all areas
      intelligence.updateMetrics('story_analysis', 0.95);
      intelligence.updateMetrics('epic_interpretation', 0.93);
      intelligence.updateMetrics('code_generation', 0.91);

      const finalMetrics = intelligence.getMetrics();
      
      // Learning rate should decrease when performance is high
      expect(finalMetrics.learningRate).toBeLessThan(initialLearningRate);
    });
  });

  describe('Human-like Collaboration (Enhanced)', () => {
    it('should provide unified intelligence in collaborative responses', async () => {
      const userInput = 'How should I approach implementing this complex AI agent system?';
      const context = {
        epicType: 'intelligence',
        complexity: 'high',
        hasAgentCoordination: true
      };

      const collaboration = await intelligence.generateCollaborativeResponse(userInput, context);

      expect(collaboration.response).toContain('unified V2 intelligence');
      expect(collaboration.response).toContain('epic-level strategy');
      expect(collaboration.response).toContain('story-level implementation');
      expect(collaboration.suggestions).toContain('Start with epic-level analysis to understand overall strategy');
      expect(collaboration.suggestions).toContain('Identify appropriate V2 agents for each component');
      expect(collaboration.confidence).toBeGreaterThan(0.85); // Should be confident with unified intelligence
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing V2 interfaces', () => {
      // Test singleton access
      expect(unifiedV2Intelligence).toBeInstanceOf(UnifiedV2IntelligenceFoundation);
      
      // Test that metrics include all expected properties
      const metrics = unifiedV2Intelligence.getMetrics();
      expect(metrics).toHaveProperty('naturalLanguageAccuracy');
      expect(metrics).toHaveProperty('epicInterpretationAccuracy');
      expect(metrics).toHaveProperty('agentCoordinationEfficiency');
      
      // Test that capabilities are comprehensive
      const capabilities = unifiedV2Intelligence.getCapabilities();
      expect(capabilities).toHaveProperty('naturalLanguageProcessing');
      expect(capabilities).toHaveProperty('epicInterpretation');
      expect(capabilities).toHaveProperty('agentOrchestration');
    });
  });

  describe('Conflict Resolution Validation', () => {
    it('should successfully synthesize capabilities from both conflicting implementations', async () => {
      // Test comprehensive foundation capabilities (from copilot/fix-112)
      const storyAnalysis = await intelligence.analyzeStoryIntelligence(
        'Create user authentication with database integration', 
        'test-story'
      );
      expect(storyAnalysis).toBeDefined();
      expect(storyAnalysis.requirements.technical.length).toBeGreaterThan(0);

      // Test MetaAgent capabilities (from copilot/fix-118)
      const epicContext: V2IntelligenceContext = {
        title: 'AI Agent Intelligence Epic',
        body: 'Complex AI intelligence system with natural language processing',
        labels: ['intelligence'],
        assignees: [],
        analysisTimestamp: new Date()
      };
      
      const unified = await intelligence.analyzeUnifiedIntelligence(epicContext);
      expect(unified.epicAnalysis).toBeDefined();
      expect(unified.epicAnalysis.epicType).toBe('intelligence');

      // Test agent routing (MetaAgent capability)
      const routing = await intelligence.generateAgentRouting(unified.epicAnalysis, epicContext);
      expect(routing).toBeDefined();
      expect(routing.primary).toBeTruthy();
      expect(routing.intelligenceLevel).toBeTruthy();

      // Verify unified functionality works together
      expect(unified.epicAnalysis.storyAnalysis).toBe(unified.storyAnalysis);
    });

    it('should have enhanced metrics covering both implementation areas', () => {
      const metrics = intelligence.getMetrics();
      
      // Should have original comprehensive foundation metrics
      expect(metrics.naturalLanguageAccuracy).toBeDefined();
      expect(metrics.codeGenerationQuality).toBeDefined();
      expect(metrics.predictiveAccuracy).toBeDefined();
      
      // Should have new MetaAgent metrics
      expect(metrics.epicInterpretationAccuracy).toBeDefined();
      expect(metrics.agentCoordinationEfficiency).toBeDefined();
      
      // All metrics should be in valid range
      Object.values(metrics).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });
});

// Integration test for the complete unified workflow
describe('Unified V2 Intelligence Integration Test', () => {
  let intelligence: UnifiedV2IntelligenceFoundation;

  beforeEach(() => {
    intelligence = new UnifiedV2IntelligenceFoundation();
  });

  it('should execute complete unified V2 workflow: Epic → Story → Routing → Generation → Prediction', async () => {
    // Step 1: Unified Intelligence Analysis
    const context: V2IntelligenceContext = {
      issueNumber: 118,
      title: 'Epic 2: V2 Agent Foundations Synthesis',
      body: `
        Synthesize the best elements from multiple V2 agent implementations into a unified
        foundation that combines comprehensive intelligence capabilities with advanced
        MetaAgent orchestration. Implement natural language epic interpretation,
        contextual code generation, predictive intelligence, and agent coordination.
      `,
      labels: ['epic', 'v2-intelligence', 'synthesis', 'ai-agents'],
      assignees: ['copilot'],
      analysisTimestamp: new Date()
    };

    const unified = await intelligence.analyzeUnifiedIntelligence(context);
    
    // Verify epic analysis
    expect(unified.epicAnalysis.epicType).toBe('intelligence');
    expect(unified.epicAnalysis.complexityLevel).toBe('high');
    expect(unified.epicAnalysis.confidence).toBeGreaterThan(0.8);
    
    // Verify story analysis
    expect(unified.storyAnalysis).toBeDefined();
    expect(unified.storyAnalysis!.complexity).toBe('high');
    expect(unified.storyAnalysis!.requirements.technical.length).toBeGreaterThan(0);

    // Step 2: Agent Routing
    const routing = await intelligence.generateAgentRouting(unified.epicAnalysis, context);
    
    expect(routing.primary).toBe('MetaAgent Orchestrator V2');
    expect(routing.intelligenceLevel).toBe('predictive');
    expect(routing.executionStrategy).toBe('hybrid');
    expect(routing.secondary.length).toBeGreaterThan(2);

    // Step 3: Code Generation Context
    const codeContext = {
      repository: 'liminal-transit',
      existingPatterns: ['AI Native', 'TypeScript', 'V2 Agents'],
      architecturalConstraints: ['Unified Intelligence', 'Conflict Resolution'],
      codebaseStyle: 'TypeScript',
      testingStrategy: 'Comprehensive V2 testing',
      performanceRequirements: ['Intelligence synthesis', 'Agent coordination']
    };

    const codeGeneration = await intelligence.generateContextualCode(unified.storyAnalysis!, codeContext);
    
    expect(codeGeneration.confidence).toBeGreaterThan(0.8);
    expect(codeGeneration.reasoning).toContain('high complexity');
    expect(codeGeneration.files.length).toBeGreaterThan(0);

    // Step 4: Predictive Intelligence
    const predictions = await intelligence.generatePredictiveInsights(codeContext, unified.epicAnalysis);
    
    expect(predictions.length).toBeGreaterThan(0);
    expect(predictions.some(p => p.type === 'deployment')).toBe(true);
    expect(predictions.some(p => p.type === 'quality')).toBe(true);

    // Step 5: Learning Update
    intelligence.updateMetrics('epic_interpretation', 0.94);
    intelligence.updateMetrics('story_analysis', 0.92);
    intelligence.updateMetrics('agent_coordination', 0.89);

    const finalMetrics = intelligence.getMetrics();
    expect(finalMetrics.epicInterpretationAccuracy).toBeGreaterThan(0.88);
    expect(finalMetrics.naturalLanguageAccuracy).toBeGreaterThan(0.85);
    expect(finalMetrics.agentCoordinationEfficiency).toBeGreaterThan(0.83);

    // Verify the complete workflow demonstrates unified intelligence
    expect(unified.epicAnalysis.storyAnalysis).toBe(unified.storyAnalysis);
    expect(routing.reasoning).toContain('intelligence');
    expect(predictions.every(p => p.confidence > 0.5)).toBe(true);
  });
});