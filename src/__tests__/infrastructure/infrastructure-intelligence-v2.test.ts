/**
 * Infrastructure Intelligence Agent V2 Integration Tests
 * Tests for dual AI architecture integration and infrastructure optimization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { claude4ReasoningEngine, v2PerformanceMonitor } from '../../lib/claude4-reasoning-engine';
import { aiProvider } from '../../lib/ai-provider-service';
import { getAIProviderForTask } from '../../config/ai-providers.config';

describe('Infrastructure Intelligence Agent V2 Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dual AI Architecture Integration', () => {
    it('should route infrastructure tasks to development AI provider', () => {
      const provider = getAIProviderForTask('github-actions');
      
      expect(provider.provider).toBe('github-copilot-claude4');
      expect(provider.model).toBe('claude-3-5-sonnet-20241022');
      expect(provider.enabled).toBe(true);
    });

    it('should route narrative tasks to OpenAI provider', () => {
      const provider = getAIProviderForTask('narrative-generation');
      
      expect(provider.provider).toBe('openai');
      expect(provider.model).toBe('gpt-4o');
      expect(provider.enabled).toBe(true);
    });

    it('should have development AI configured for infrastructure tasks', () => {
      const provider = getAIProviderForTask('software-development');
      
      expect(provider.temperature).toBe(0.1); // Lower temperature for precise code
      expect(provider.maxTokens).toBe(8192);
      expect(provider.systemPrompt).toContain('AWS Well-Architected Framework');
    });

    it('should have fallback providers configured', () => {
      const provider = getAIProviderForTask('code-generation');
      
      expect(provider.fallback).toBeDefined();
      expect(provider.fallback?.provider).toBe('anthropic');
      expect(provider.fallback?.model).toBe('claude-3-5-sonnet-20241022');
    });
  });

  describe('Claude 4 Reasoning Engine', () => {
    it('should perform strategic analysis for infrastructure tasks', async () => {
      const context = {
        issueTitle: 'Infrastructure Optimization: self-optimizing-aws',
        issueBody: 'Performing self-optimizing-aws on AWS resources. Target: all-resources. Complexity: moderate',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'moderate',
        labels: ['epic-2', 'infrastructure', 'aws-optimization', 'ai-agent']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(context);

      expect(analysis).toHaveProperty('riskAssessment');
      expect(analysis).toHaveProperty('resourceOptimization');
      expect(analysis).toHaveProperty('strategicRecommendations');
      
      expect(analysis.riskAssessment).toHaveProperty('level');
      expect(analysis.riskAssessment).toHaveProperty('score');
      expect(analysis.riskAssessment).toHaveProperty('factors');
      expect(analysis.riskAssessment).toHaveProperty('mitigationStrategies');
    });

    it('should assess risk levels based on complexity', async () => {
      const highComplexityContext = {
        issueTitle: 'Complex Infrastructure Migration',
        issueBody: 'High complexity infrastructure migration with multiple dependencies',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'high',
        labels: ['critical', 'migration', 'dependencies']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(highComplexityContext);

      expect(['medium', 'high']).toContain(analysis.riskAssessment.level); // Should be at least medium for high complexity
      expect(analysis.riskAssessment.factors.length).toBeGreaterThan(0);
    });

    it('should provide resource optimization recommendations', async () => {
      const context = {
        issueTitle: 'Cost Optimization Task',
        issueBody: 'Optimize AWS costs for production environment',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'medium',
        labels: ['cost-optimization', 'production']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(context);

      expect(analysis.resourceOptimization).toHaveProperty('recommendedAgents');
      expect(analysis.resourceOptimization).toHaveProperty('parallelExecution');
      expect(analysis.resourceOptimization).toHaveProperty('monitoringLevel');
      expect(analysis.resourceOptimization).toHaveProperty('fallbackStrategy');
      expect(analysis.resourceOptimization).toHaveProperty('estimatedDuration');
      
      expect(analysis.resourceOptimization.recommendedAgents).toBeGreaterThan(0);
    });

    it('should generate strategic recommendations', async () => {
      const context = {
        issueTitle: 'AI Integration Task',
        issueBody: 'Implement Claude 4 integration for infrastructure optimization',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'moderate',
        labels: ['ai', 'claude', 'integration']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(context);

      expect(analysis.strategicRecommendations).toBeInstanceOf(Array);
      expect(analysis.strategicRecommendations.length).toBeGreaterThan(0);
      
      const recommendation = analysis.strategicRecommendations[0];
      expect(recommendation).toHaveProperty('priority');
      expect(recommendation).toHaveProperty('category');
      expect(recommendation).toHaveProperty('action');
      expect(recommendation).toHaveProperty('reasoning');
      expect(recommendation).toHaveProperty('expectedImpact');
    });
  });

  describe('AI Provider Service Infrastructure Integration', () => {
    it('should generate infrastructure code using development AI', async () => {
      const request = {
        domain: 'github-actions' as const,
        prompt: 'Create AWS Auto Scaling configuration',
        context: { 
          resourceType: 'ec2',
          environment: 'production',
          scalingPolicy: 'predictive'
        }
      };

      const response = await aiProvider.generateCode(request);

      expect(response.content).toContain('AI-Generated');
      expect(response.content).toContain('workflow');
      expect(response.provider).toBe('github-copilot-claude4');
      expect(response.model).toBe('claude-3-5-sonnet-20241022');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    });

    it('should route infrastructure requests to correct AI provider', async () => {
      const infrastructureRequest = {
        domain: 'technical-documentation' as const,
        prompt: 'Document AWS cost optimization strategy'
      };

      const response = await aiProvider.processRequest(infrastructureRequest);

      expect(response.provider).toBe('github-copilot-claude4');
      expect(response.content).toContain('Generated');
    });

    it('should provide infrastructure-specific code generation', async () => {
      const request = {
        domain: 'code-generation' as const,
        prompt: 'Create cost monitoring Lambda function',
        context: { language: 'typescript', platform: 'aws' }
      };

      const response = await aiProvider.generateCode(request);

      expect(response.content).toContain('TypeScript');
      expect(response.content).toContain('interface');
      expect(response.content).toContain('Error');
      expect(response.metadata.fallbackUsed).toBe(false);
    });

    it('should handle GitHub Actions workflow generation', async () => {
      const request = {
        domain: 'github-actions' as const,
        prompt: 'Create infrastructure deployment workflow'
      };

      const response = await aiProvider.generateCode(request);

      expect(response.content).toContain('name:');
      expect(response.content).toContain('on:');
      expect(response.content).toContain('jobs:');
      expect(response.content).toContain('runs-on: ubuntu-latest');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should record performance metrics', () => {
      v2PerformanceMonitor.recordMetric('nlp_accuracy', 0.92);
      v2PerformanceMonitor.recordMetric('claude4_response_time', 5000);
      v2PerformanceMonitor.recordMetric('routing_success', 0.95);

      const summary = v2PerformanceMonitor.getPerformanceSummary();

      expect(summary).toHaveProperty('nlp_accuracy');
      expect(summary).toHaveProperty('claude4_response_time');
      expect(summary).toHaveProperty('routing_success');
      
      expect(summary.nlp_accuracy.value).toBe(0.92);
      expect(summary.claude4_response_time.value).toBe(5000);
      expect(summary.routing_success.value).toBe(0.95);
    });

    it('should check performance thresholds', () => {
      // Record metrics below thresholds
      v2PerformanceMonitor.recordMetric('nlp_accuracy', 0.90); // Below 0.95 threshold
      v2PerformanceMonitor.recordMetric('routing_success', 0.85); // Below 0.90 threshold

      const thresholdCheck = v2PerformanceMonitor.checkPerformanceThresholds();

      expect(thresholdCheck).toHaveProperty('meetsThresholds');
      expect(thresholdCheck).toHaveProperty('overallScore');
      expect(thresholdCheck).toHaveProperty('failedThresholds');
      
      expect(thresholdCheck.meetsThresholds).toBe(false);
      expect(thresholdCheck.failedThresholds.length).toBeGreaterThan(0);
    });

    it('should pass performance thresholds with good metrics', () => {
      // Record metrics above thresholds
      v2PerformanceMonitor.recordMetric('nlp_accuracy', 0.98);
      v2PerformanceMonitor.recordMetric('routing_success', 0.95);

      const thresholdCheck = v2PerformanceMonitor.checkPerformanceThresholds();

      expect(thresholdCheck.overallScore).toBeGreaterThan(0.67);
    });
  });

  describe('Cost Optimization Intelligence', () => {
    it('should provide cost optimization metrics', () => {
      const metrics = aiProvider.getUsageMetrics();

      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('totalTokens');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('errorRate');
      
      expect(typeof metrics.totalRequests).toBe('number');
      expect(typeof metrics.totalTokens).toBe('number');
    });

    it('should track provider health for cost monitoring', () => {
      const health = aiProvider.getProviderHealth();

      expect(health).toHaveProperty('development');
      expect(health).toHaveProperty('narrative');
      
      expect(health.development).toHaveProperty('provider');
      expect(health.development).toHaveProperty('model');
      expect(health.development).toHaveProperty('enabled');
      expect(health.development).toHaveProperty('rateLimit');
      
      expect(health.development.provider).toBe('github-copilot-claude4');
      expect(health.narrative.provider).toBe('openai');
    });
  });

  describe('Self-Healing Capabilities', () => {
    it('should detect infrastructure issues through AI analysis', async () => {
      const context = {
        issueTitle: 'Self-Healing Infrastructure Setup',
        issueBody: 'Implement automated recovery mechanisms for production infrastructure',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'high',
        labels: ['self-healing', 'automation', 'production']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(context);

      // Should recommend enhanced or intensive monitoring for high-risk self-healing setup
      expect(['enhanced', 'intensive']).toContain(analysis.resourceOptimization.monitoringLevel);
      expect(['immediate', 'delayed']).toContain(analysis.resourceOptimization.fallbackStrategy);
    });

    it('should provide automated remediation strategies', async () => {
      const context = {
        issueTitle: 'Infrastructure Recovery Automation',
        issueBody: 'Automated infrastructure recovery with intelligent orchestration',
        epicType: 'infrastructure-intelligence',
        complexityLevel: 'high',
        labels: ['automation', 'recovery', 'high-risk']
      };

      const analysis = await claude4ReasoningEngine.performStrategicAnalysis(context);

      // Should have some strategic recommendations (at minimum delivery strategy and quality assurance)
      expect(analysis.strategicRecommendations.length).toBeGreaterThan(0);
      expect(analysis.strategicRecommendations.some(rec => 
        rec.category === 'Delivery Strategy' || rec.category === 'Quality Assurance'
      )).toBe(true);
    });
  });

  describe('AWS Well-Architected Framework Integration', () => {
    it('should include Well-Architected principles in system prompts', () => {
      const provider = getAIProviderForTask('architecture-decisions');
      
      expect(provider.systemPrompt).toContain('AWS Well-Architected Framework');
      expect(provider.systemPrompt).toContain('security');
      expect(provider.systemPrompt).toContain('Performance optimization');
    });

    it('should generate compliant infrastructure code', async () => {
      const request = {
        domain: 'code-generation' as const,
        prompt: 'Create Well-Architected compliant infrastructure',
        context: { 
          framework: 'aws-well-architected',
          pillars: ['security', 'reliability', 'performance']
        }
      };

      const response = await aiProvider.generateCode(request);

      expect(response.content).toContain('Error'); // Error handling class
      expect(response.content).toContain('Comprehensive'); // From comment
      expect(response.content).toContain('TypeScript');
    });
  });
});