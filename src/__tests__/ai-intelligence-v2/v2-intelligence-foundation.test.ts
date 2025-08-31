import { describe, it, expect, beforeEach } from 'vitest';
import { 
  V2IntelligenceFoundation, 
  type StoryIntelligenceAnalysis
} from '../../lib/ai-intelligence-foundation';

describe('V2 Intelligence Foundation - Epic 2', () => {
  let v2Intelligence: V2IntelligenceFoundation;

  beforeEach(() => {
    v2Intelligence = new V2IntelligenceFoundation();
  });

  describe('Core Intelligence Capabilities', () => {
    it('should initialize with baseline V2 metrics targeting Epic 2 goals', () => {
      const metrics = v2Intelligence.getMetrics();
      
      // Epic 2 baseline metrics should be realistic starting points
      expect(metrics.naturalLanguageAccuracy).toBeGreaterThanOrEqual(0.85);
      expect(metrics.codeGenerationQuality).toBeGreaterThanOrEqual(0.80);
      expect(metrics.predictiveAccuracy).toBeGreaterThanOrEqual(0.75);
      expect(metrics.learningRate).toBeGreaterThan(0);
      expect(metrics.contextualUnderstanding).toBeGreaterThanOrEqual(0.80);
    });

    it('should have all V2 agent capabilities enabled', () => {
      const capabilities = v2Intelligence.getCapabilities();
      
      expect(capabilities.naturalLanguageProcessing).toBe(true);
      expect(capabilities.contextualCodeGeneration).toBe(true);
      expect(capabilities.predictiveIntelligence).toBe(true);
      expect(capabilities.continuousLearning).toBe(true);
      expect(capabilities.humanLikeCollaboration).toBe(true);
    });
  });

  describe('Natural Language Story Intelligence', () => {
    it('should analyze story content and extract intelligent requirements', async () => {
      const storyContent = `
        Create a user authentication system with secure login, 
        password reset functionality, and integration with external OAuth providers.
        The system should handle high traffic and provide audit logging.
      `;

      const analysis = await v2Intelligence.analyzeStoryIntelligence(storyContent, 'test-story-123');

      expect(analysis).toBeDefined();
      expect(analysis.requirements.technical).toContain('Technical requirement detected: authentication');
      expect(analysis.requirements.business).toContain('Business requirement detected: user');
      expect(analysis.complexity).toMatch(/^(low|medium|high)$/);
      expect(analysis.estimatedEffort).toBeGreaterThan(0);
      expect(analysis.estimatedEffort).toBeLessThanOrEqual(13); // Story points scale
      expect(analysis.recommendedApproach).toContain('development');
      expect(Array.isArray(analysis.qualityGates)).toBe(true);
    });

    it('should assess story complexity based on content indicators', async () => {
      const complexStory = 'Complex enterprise integration with multiple advanced external services';
      const simpleStory = 'Add a button to the homepage';

      const complexAnalysis = await v2Intelligence.analyzeStoryIntelligence(complexStory, 'complex-story');
      const simpleAnalysis = await v2Intelligence.analyzeStoryIntelligence(simpleStory, 'simple-story');

      expect(complexAnalysis.complexity).toBe('high');
      expect(simpleAnalysis.complexity).toBe('low');
      expect(complexAnalysis.estimatedEffort).toBeGreaterThan(simpleAnalysis.estimatedEffort);
    });

    it('should identify risk factors in story requirements', async () => {
      const riskyStory = 'Integrate with external payment service with performance and security requirements';
      
      const analysis = await v2Intelligence.analyzeStoryIntelligence(riskyStory, 'risky-story');
      
      expect(analysis.riskFactors).toContain('External dependency risk');
      expect(analysis.riskFactors).toContain('Performance optimization challenge');
    });
  });

  describe('Contextual Code Generation', () => {
    it('should generate contextual code based on requirements and repository context', async () => {
      const mockRequirements: StoryIntelligenceAnalysis = {
        requirements: {
          technical: ['API integration', 'Database schema'],
          business: ['User authentication', 'Data processing'],
          integration: ['External service'],
          testing: ['Unit tests', 'Integration tests']
        },
        complexity: 'medium',
        estimatedEffort: 5,
        riskFactors: ['External dependency'],
        recommendedApproach: 'Incremental development',
        dependencies: ['API service'],
        qualityGates: ['Code review', 'Testing']
      };

      const context = {
        repository: 'liminal-transit',
        existingPatterns: ['React components', 'TypeScript'],
        architecturalConstraints: ['AI Native', 'Well-Architected'],
        codebaseStyle: 'TypeScript',
        testingStrategy: 'Comprehensive',
        performanceRequirements: ['Sub-second response']
      };

      const result = await v2Intelligence.generateContextualCode(mockRequirements, context);

      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.reasoning).toContain('complexity');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should adjust confidence based on complexity and context', async () => {
      const lowComplexityRequirements: StoryIntelligenceAnalysis = {
        requirements: { technical: [], business: [], integration: [], testing: [] },
        complexity: 'low',
        estimatedEffort: 2,
        riskFactors: [],
        recommendedApproach: 'Direct implementation',
        dependencies: [],
        qualityGates: []
      };

      const richContext = {
        repository: 'test-repo',
        existingPatterns: ['React', 'TypeScript', 'Testing'],
        architecturalConstraints: [],
        codebaseStyle: 'TypeScript',
        testingStrategy: 'Comprehensive',
        performanceRequirements: []
      };

      const result = await v2Intelligence.generateContextualCode(lowComplexityRequirements, richContext);

      // Lower complexity + rich context should yield higher confidence
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Predictive Intelligence', () => {
    it('should generate predictive insights for deployment, performance, and security', async () => {
      const mockStoryAnalysis: StoryIntelligenceAnalysis = {
        requirements: {
          technical: ['Database integration', 'API endpoints'],
          business: ['User authentication', 'Data processing'],
          integration: ['External service'],
          testing: ['Unit tests']
        },
        complexity: 'high',
        estimatedEffort: 8,
        riskFactors: ['External dependency'],
        recommendedApproach: 'Incremental development',
        dependencies: ['Database', 'API'],
        qualityGates: ['Security review']
      };

      const context = {
        repository: 'test-repo',
        existingPatterns: ['TypeScript'],
        architecturalConstraints: ['Security-first'],
        codebaseStyle: 'TypeScript',
        testingStrategy: 'Comprehensive',
        performanceRequirements: ['Fast response']
      };

      const insights = await v2Intelligence.generatePredictiveInsights(context, mockStoryAnalysis);

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);

      // Should detect deployment complexity
      const deploymentInsight = insights.find(i => i.type === 'deployment');
      expect(deploymentInsight).toBeDefined();
      expect(deploymentInsight?.severity).toMatch(/^(low|medium|high|critical)$/);

      // Should detect database/API performance concerns
      const performanceInsight = insights.find(i => i.type === 'performance');
      expect(performanceInsight).toBeDefined();

      // Should detect user authentication security requirements
      const securityInsight = insights.find(i => i.type === 'security');
      expect(securityInsight).toBeDefined();
      expect(securityInsight?.severity).toBe('high'); // Auth should be high severity
    });

    it('should provide actionable recommendations and preventive actions', async () => {
      const mockAnalysis: StoryIntelligenceAnalysis = {
        requirements: {
          technical: ['API integration'],
          business: ['User management'],
          integration: [],
          testing: []
        },
        complexity: 'medium',
        estimatedEffort: 5,
        riskFactors: [],
        recommendedApproach: 'Standard',
        dependencies: [],
        qualityGates: []
      };

      const context = {
        repository: 'test-repo',
        existingPatterns: [],
        architecturalConstraints: [],
        codebaseStyle: 'TypeScript',
        testingStrategy: 'Basic',
        performanceRequirements: []
      };

      const insights = await v2Intelligence.generatePredictiveInsights(context, mockAnalysis);

      insights.forEach(insight => {
        expect(insight.description).toBeTruthy();
        expect(insight.recommendation).toBeTruthy();
        expect(Array.isArray(insight.preventiveActions)).toBe(true);
        expect(insight.preventiveActions.length).toBeGreaterThan(0);
        expect(insight.confidence).toBeGreaterThan(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Continuous Learning System', () => {
    it('should update metrics based on operation outcomes', () => {
      const initialMetrics = v2Intelligence.getMetrics();
      const initialNLAccuracy = initialMetrics.naturalLanguageAccuracy;

      // Simulate successful story analysis
      v2Intelligence.updateMetrics('story_analysis', 0.95);

      const updatedMetrics = v2Intelligence.getMetrics();
      expect(updatedMetrics.naturalLanguageAccuracy).toBeGreaterThan(initialNLAccuracy);
    });

    it('should adapt learning rate based on performance', () => {
      const initialMetrics = v2Intelligence.getMetrics();

      // Simulate high performance to trigger learning rate adaptation
      v2Intelligence.updateMetrics('story_analysis', 0.95);
      v2Intelligence.updateMetrics('code_generation', 0.90);

      const updatedMetrics = v2Intelligence.getMetrics();
      
      // Learning rate should decrease when performance is high
      if (updatedMetrics.naturalLanguageAccuracy > 0.90 && 
          updatedMetrics.codeGenerationQuality > 0.85) {
        expect(updatedMetrics.learningRate).toBeLessThan(initialMetrics.learningRate);
      }
    });

    it('should maintain metrics within valid ranges', () => {
      // Test extreme values
      v2Intelligence.updateMetrics('story_analysis', 1.5); // Above 1.0
      v2Intelligence.updateMetrics('code_generation', -0.5); // Below 0.0

      const metrics = v2Intelligence.getMetrics();
      
      expect(metrics.naturalLanguageAccuracy).toBeLessThanOrEqual(0.99);
      expect(metrics.codeGenerationQuality).toBeGreaterThanOrEqual(0);
      expect(metrics.predictiveAccuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Human-like Collaboration', () => {
    it('should generate contextual collaborative responses', async () => {
      const userInput = 'How should I approach implementing the user authentication feature?';
      const context = {
        storyType: 'authentication',
        complexity: 'medium',
        repository: 'liminal-transit'
      };

      const collaboration = await v2Intelligence.generateCollaborativeResponse(userInput, context);

      expect(collaboration.response).toBeTruthy();
      expect(collaboration.response).toContain('recommend');
      expect(Array.isArray(collaboration.suggestions)).toBe(true);
      expect(collaboration.suggestions.length).toBeGreaterThan(0);
      expect(collaboration.confidence).toBeGreaterThan(0);
      expect(collaboration.confidence).toBeLessThanOrEqual(1);
    });

    it('should provide actionable suggestions for development tasks', async () => {
      const userInput = 'What are the best practices for this implementation?';
      const context = { taskType: 'implementation' };

      const collaboration = await v2Intelligence.generateCollaborativeResponse(userInput, context);

      expect(collaboration.suggestions).toContain('Start with the core functionality implementation');
      expect(collaboration.suggestions).toContain('Add comprehensive testing from the beginning');
      expect(collaboration.suggestions.some(s => s.includes('performance'))).toBe(true);
    });
  });

  describe('Intelligence Metrics and Monitoring', () => {
    it('should provide comprehensive metrics for monitoring', () => {
      const metrics = v2Intelligence.getMetrics();

      // All Epic 2 target metrics should be present
      expect(metrics).toHaveProperty('naturalLanguageAccuracy');
      expect(metrics).toHaveProperty('codeGenerationQuality');
      expect(metrics).toHaveProperty('predictiveAccuracy');
      expect(metrics).toHaveProperty('learningRate');
      expect(metrics).toHaveProperty('contextualUnderstanding');

      // Values should be within expected ranges
      Object.values(metrics).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should track learning statistics for performance analysis', async () => {
      // Generate some learning data
      await v2Intelligence.analyzeStoryIntelligence('Test story content', 'test-1');
      await v2Intelligence.analyzeStoryIntelligence('Another test story', 'test-2');

      const learningStats = v2Intelligence.getLearningStats();

      expect(learningStats).toHaveProperty('story_analysis_samples');
      expect(learningStats.story_analysis_samples).toBe(2);
    });
  });

  describe('Epic 2 Success Criteria Validation', () => {
    it('should demonstrate progress toward Epic 2 target metrics', () => {
      const metrics = v2Intelligence.getMetrics();

      // Current baseline should be reasonable foundation for Epic 2 targets
      expect(metrics.naturalLanguageAccuracy).toBeGreaterThan(0.80); // Target: 95%+
      expect(metrics.codeGenerationQuality).toBeGreaterThan(0.75);   // Target: 90%+
      expect(metrics.predictiveAccuracy).toBeGreaterThan(0.70);      // Target: 85%+
    });

    it('should validate V2 evolution from V1 automation to V2 intelligence', () => {
      const capabilities = v2Intelligence.getCapabilities();

      // V2 should have all intelligence capabilities that V1 lacked
      expect(capabilities.naturalLanguageProcessing).toBe(true);      // V1: Hardcoded
      expect(capabilities.contextualCodeGeneration).toBe(true);       // V1: Template-based
      expect(capabilities.predictiveIntelligence).toBe(true);         // V1: Reactive only
      expect(capabilities.continuousLearning).toBe(true);             // V1: Static
      expect(capabilities.humanLikeCollaboration).toBe(true);         // V1: Automated only
    });
  });
});

// V2 Integration Test for Epic 2 Workflow
describe('V2 Intelligence Integration - Epic 2 Workflow', () => {
  let v2Intelligence: V2IntelligenceFoundation;

  beforeEach(() => {
    v2Intelligence = new V2IntelligenceFoundation();
  });

  it('should execute complete V2 intelligence workflow: Story → Analysis → Generation → Prediction', async () => {
    // Step 1: Natural Language Story Analysis
    const storyContent = `
      Epic 2 Test Story: Create an intelligent feature recommendation system 
      that analyzes user behavior patterns and suggests personalized content 
      using machine learning algorithms with real-time performance optimization.
    `;

    const storyAnalysis = await v2Intelligence.analyzeStoryIntelligence(storyContent, 'epic2-test');
    
    expect(storyAnalysis.complexity).toBe('high'); // Should detect ML complexity
    expect(storyAnalysis.requirements.technical.length).toBeGreaterThan(0); // Should extract technical requirements

    // Step 2: Contextual Code Generation
    const context = {
      repository: 'liminal-transit',
      existingPatterns: ['AI Native', 'TypeScript', 'React'],
      architecturalConstraints: ['AWS Well-Architected', 'Enterprise Compliance'],
      codebaseStyle: 'TypeScript',
      testingStrategy: 'Comprehensive AI testing',
      performanceRequirements: ['Real-time ML inference', 'Sub-100ms response']
    };

    const codeGeneration = await v2Intelligence.generateContextualCode(storyAnalysis, context);
    
    expect(codeGeneration.confidence).toBeGreaterThan(0.7); // Should be confident with good context
    expect(codeGeneration.reasoning).toContain('complexity');

    // Step 3: Predictive Intelligence
    const predictiveInsights = await v2Intelligence.generatePredictiveInsights(context, storyAnalysis);
    
    expect(predictiveInsights.length).toBeGreaterThan(0);
    // Should generate insights of various types based on the story complexity
    expect(predictiveInsights.every(i => 
      ['deployment', 'performance', 'security', 'quality'].includes(i.type)
    )).toBe(true);

    // Step 4: Continuous Learning Update
    const initialMetrics = v2Intelligence.getMetrics();
    v2Intelligence.updateMetrics('story_analysis', 0.92);
    const updatedMetrics = v2Intelligence.getMetrics();
    
    expect(updatedMetrics.naturalLanguageAccuracy).toBeGreaterThanOrEqual(initialMetrics.naturalLanguageAccuracy);

    // Workflow should demonstrate V2 intelligence evolution
    expect(storyAnalysis).toBeDefined();
    expect(codeGeneration).toBeDefined(); 
    expect(predictiveInsights).toBeDefined();
    expect(updatedMetrics.naturalLanguageAccuracy).toBeGreaterThan(0.80);
  });
});