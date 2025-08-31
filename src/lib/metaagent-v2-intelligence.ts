/**
 * MetaAgent Orchestrator V2 - Natural Language Processing Module
 * NOVELI.SH - AI Native Interactive Storytelling Platform
 * 
 * This module provides enhanced natural language understanding for epic interpretation
 * with 95%+ accuracy targeting as specified in the V2 requirements.
 */

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
}

export interface AgentRoutingRecommendation {
  primary: string;
  secondary: string[];
  reasoning: string;
  executionStrategy: 'sequential' | 'parallel' | 'hybrid';
  monitoringRequired: boolean;
}

export interface V2IntelligenceContext {
  issueNumber: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  analysisTimestamp: Date;
}

/**
 * Natural Language Epic Interpreter
 * Core component for analyzing epics with human-like understanding
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
    testing: ['testing', 'test', 'validation', 'quality', 'qa', 'verification'],
    security: ['security', 'auth', 'permission', 'secure', 'protection', 'safety'],
    ui: ['ui', 'interface', 'frontend', 'user', 'ux', 'design', 'visual']
  };

  /**
   * Analyzes an epic using advanced NLP techniques
   * Targets 95%+ accuracy as required by V2 specifications
   */
  async analyzeEpic(context: V2IntelligenceContext): Promise<EpicAnalysisResult> {
    const combinedText = `${context.title} ${context.body}`.toLowerCase();
    
    // Enhanced epic type classification with confidence scoring
    let bestMatch: { type: string; confidence: number; keywords: string[] } = { type: 'general', confidence: 0.0, keywords: [] };
    
    for (const [epicType, keywords] of Object.entries(this.epicPatterns)) {
      let matchCount = 0;
      let matchedKeywords: string[] = [];
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = combinedText.match(regex);
        if (matches) {
          matchCount += matches.length;
          matchedKeywords.push(keyword);
        }
      });
      
      // Weight confidence by keyword density and variety
      const keywordVariety = matchedKeywords.length / keywords.length;
      const keywordDensity = matchCount / combinedText.split(' ').length;
      const confidence = (keywordVariety * 0.7) + (keywordDensity * 0.3);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { type: epicType, confidence, keywords: matchedKeywords };
      }
    }

    // Advanced complexity assessment
    const complexityFactors = this.assessComplexity(context);
    
    // Success prediction based on multiple factors
    const successFactors = this.predictSuccess(context, complexityFactors);

    return {
      epicType: bestMatch.type,
      confidence: Math.min(bestMatch.confidence, 1.0),
      keywords: bestMatch.keywords,
      complexityLevel: complexityFactors.level,
      complexityScore: complexityFactors.score,
      successPrediction: successFactors.prediction,
      successScore: successFactors.score,
      taskCount: complexityFactors.taskCount,
      acceptanceCriteriaCount: complexityFactors.acceptanceCriteriaCount
    };
  }

  /**
   * Assesses epic complexity using multiple criteria
   */
  private assessComplexity(context: V2IntelligenceContext) {
    const body = context.body || '';
    const title = context.title || '';
    
    const factors = {
      wordCount: body.split(' ').length,
      taskCount: (body.match(/- \[ \]/g) || []).length,
      acceptanceCriteriaCount: (body.match(/- \[[ x]\]/g) || []).length,
      labelComplexity: context.labels.length,
      hasPriority: context.labels.some(label => /P[0-4]/.test(label)),
      hasEpicLabel: context.labels.includes('epic') || context.labels.includes('epic-story'),
      hasAiAgent: context.labels.includes('ai-agent'),
      hasMultipleSections: body.split('#').length - 1,
      hasCodeBlocks: (body.match(/```/g) || []).length / 2,
      titleComplexity: title.split(' ').length
    };

    let score = 0;
    if (factors.wordCount > 500) score += 2;
    if (factors.wordCount > 1000) score += 1;
    if (factors.taskCount > 5) score += 2;
    if (factors.taskCount > 10) score += 1;
    if (factors.acceptanceCriteriaCount > 3) score += 1;
    if (factors.acceptanceCriteriaCount > 6) score += 1;
    if (factors.labelComplexity > 3) score += 1;
    if (factors.hasPriority) score += 1;
    if (factors.hasEpicLabel) score += 2;
    if (factors.hasMultipleSections > 3) score += 1;
    if (factors.hasCodeBlocks > 2) score += 1;
    if (factors.titleComplexity > 8) score += 1;

    const level = score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low';

    return {
      level: level as 'low' | 'medium' | 'high',
      score,
      taskCount: factors.taskCount,
      acceptanceCriteriaCount: factors.acceptanceCriteriaCount,
      wordCount: factors.wordCount
    };
  }

  /**
   * Predicts success likelihood based on multiple factors
   */
  private predictSuccess(context: V2IntelligenceContext, complexityFactors: any) {
    const successCriteria = {
      hasAcceptanceCriteria: complexityFactors.acceptanceCriteriaCount > 0,
      hasAssignees: context.assignees.length > 0,
      hasPriority: context.labels.some(label => /P[0-4]/.test(label)),
      hasAiAgent: context.labels.includes('ai-agent'),
      reasonableComplexity: complexityFactors.level !== 'high',
      hasDefinedTasks: complexityFactors.taskCount > 0,
      hasGoodDescription: complexityFactors.wordCount > 100 && complexityFactors.wordCount < 2000,
      hasLabels: context.labels.length > 0
    };

    const score = Object.values(successCriteria).reduce((sum, criterion) => sum + (criterion ? 1 : 0), 0);
    const prediction = score >= 6 ? 'high' : score >= 4 ? 'medium' : 'low';

    return { prediction: prediction as 'low' | 'medium' | 'high', score };
  }

  /**
   * Generates intelligent agent routing recommendations
   */
  generateRoutingRecommendation(analysis: EpicAnalysisResult, context: V2IntelligenceContext): AgentRoutingRecommendation {
    let primary = 'scrum-master-agent';
    let secondary: string[] = [];
    let reasoning = 'Default routing to Scrum Master for story management';
    let executionStrategy: 'sequential' | 'parallel' | 'hybrid' = 'sequential';
    let monitoringRequired = false;

    // Enhanced routing logic based on epic type and complexity
    if (analysis.epicType === 'intelligence' && analysis.complexityLevel === 'high') {
      primary = 'github-copilot-claude4-agent';
      secondary = ['scrum-master-agent', 'development-agent'];
      reasoning = 'High-complexity AI intelligence epic requires specialized Claude 4 agent';
      executionStrategy = 'hybrid';
      monitoringRequired = true;
    } else if (analysis.epicType === 'foundation' || analysis.epicType === 'architecture') {
      primary = 'epic-breakdown-agent';
      secondary = ['scrum-master-agent'];
      reasoning = 'Foundation/architecture epic requires comprehensive breakdown';
      executionStrategy = 'sequential';
    } else if (context.labels.includes('epic') || context.labels.includes('epic-story')) {
      primary = 'epic-breakdown-agent';
      secondary = ['scrum-master-agent'];
      reasoning = 'Epic label detected - routing to Epic Breakdown Agent';
      executionStrategy = 'sequential';
    } else if (analysis.complexityLevel === 'high') {
      primary = 'scrum-master-agent';
      secondary = ['development-agent', 'observatory-monitoring'];
      reasoning = 'High complexity requires enhanced monitoring';
      executionStrategy = 'parallel';
      monitoringRequired = true;
    }

    // Add monitoring for high-risk scenarios
    if (analysis.successPrediction === 'low' || analysis.complexityLevel === 'high') {
      if (!secondary.includes('observatory-monitoring')) {
        secondary.push('observatory-monitoring');
      }
      monitoringRequired = true;
    }

    return {
      primary,
      secondary,
      reasoning,
      executionStrategy,
      monitoringRequired
    };
  }
}

/**
 * Context Preservation Manager
 * Maintains full context across agent handoffs as required by V2
 */
export class ContextPreservationManager {
  private contextHistory: Map<string, V2IntelligenceContext[]> = new Map();

  /**
   * Stores context for future agent handoffs
   */
  storeContext(issueNumber: number, context: V2IntelligenceContext): void {
    const key = issueNumber.toString();
    if (!this.contextHistory.has(key)) {
      this.contextHistory.set(key, []);
    }
    this.contextHistory.get(key)!.push({
      ...context,
      analysisTimestamp: new Date()
    });
  }

  /**
   * Retrieves preserved context for agent handoffs
   */
  getContext(issueNumber: number): V2IntelligenceContext | null {
    const key = issueNumber.toString();
    const contexts = this.contextHistory.get(key);
    if (contexts && contexts.length > 0) {
      const context = contexts[contexts.length - 1];
      return context || null;
    }
    return null;
  }

  /**
   * Gets context evolution history for learning
   */
  getContextHistory(issueNumber: number): V2IntelligenceContext[] {
    const key = issueNumber.toString();
    return this.contextHistory.get(key) || [];
  }
}

/**
 * Learning Framework for Continuous Improvement
 * Captures outcomes and feedback as required by V2 specifications
 */
export class LearningFramework {
  private learningData: Map<string, any> = new Map();

  /**
   * Records analysis outcome for learning
   */
  recordOutcome(issueNumber: number, analysis: EpicAnalysisResult, outcome: 'success' | 'failure' | 'partial'): void {
    const key = `${issueNumber}_${Date.now()}`;
    this.learningData.set(key, {
      issueNumber,
      analysis,
      outcome,
      timestamp: new Date(),
      confidence: analysis.confidence,
      prediction: analysis.successPrediction,
      actualOutcome: outcome
    });
  }

  /**
   * Gets learning insights for strategy optimization
   */
  getLearningInsights(): any {
    const entries = Array.from(this.learningData.values());
    
    if (entries.length === 0) {
      return { accuracy: 0, insights: [] };
    }

    // Calculate prediction accuracy
    const accurateePredictions = entries.filter(entry => {
      const predicted = entry.prediction;
      const actual = entry.actualOutcome;
      return (predicted === 'high' && actual === 'success') ||
             (predicted === 'medium' && (actual === 'success' || actual === 'partial')) ||
             (predicted === 'low' && actual !== 'success');
    });

    const accuracy = accurateePredictions.length / entries.length;

    // Generate insights
    const insights = [
      `Prediction accuracy: ${(accuracy * 100).toFixed(1)}%`,
      `Total analyses: ${entries.length}`,
      `Success rate: ${(entries.filter(e => e.actualOutcome === 'success').length / entries.length * 100).toFixed(1)}%`
    ];

    return { accuracy, insights, totalAnalyses: entries.length };
  }
}

// Export singleton instances for global use
export const naturalLanguageInterpreter = new NaturalLanguageEpicInterpreter();
export const contextManager = new ContextPreservationManager();
export const learningFramework = new LearningFramework();