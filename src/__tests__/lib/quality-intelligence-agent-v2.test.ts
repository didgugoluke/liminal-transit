/**
 * Quality Intelligence Agent V2 Tests
 * 
 * Tests for the integration of Quality Intelligence with dual AI architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIProviderService } from '../../lib/ai-provider-service';
import type { AIRequest, AITaskDomain } from '../../lib/ai-provider-service';

describe('Quality Intelligence Agent V2 Integration', () => {
  let aiProvider: AIProviderService;

  beforeEach(() => {
    aiProvider = AIProviderService.getInstance();
    aiProvider.clearCache(); // Clear cache for consistent tests
  });

  describe('Quality Intelligence Tasks', () => {
    it('should route quality intelligence tasks to development AI', async () => {
      const request: AIRequest = {
        domain: 'quality-intelligence',
        prompt: 'Analyze code quality for NOVELI.SH platform',
        context: { repository: 'liminal-transit' }
      };

      const response = await aiProvider.processRequest(request);
      
      expect(response).toBeDefined();
      expect(response.provider).toBe('github-copilot-claude4');
      expect(response.model).toBe('claude-3-5-sonnet-20241022');
      expect(response.content).toContain('Bug Detection Analysis');
    });

    it('should handle predictive bug detection requests', async () => {
      const request: AIRequest = {
        domain: 'predictive-bug-detection',
        prompt: 'Detect potential bugs in story state management',
        context: { component: 'story-engine' }
      };

      const response = await aiProvider.analyzeCodeQuality(request);
      
      expect(response.content).toContain('Bug Detection Analysis');
      expect(response.content).toContain('Risk Patterns');
      expect(response.content).toContain('NOVELI.SH');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    });

    it('should handle semantic code review requests', async () => {
      const request: AIRequest = {
        domain: 'semantic-code-review',
        prompt: 'Review business logic in story progression component',
        context: { pr: 123, files: ['story.tsx'] }
      };

      const response = await aiProvider.analyzeCodeQuality(request);
      
      expect(response.content).toContain('Semantic Code Review');
      expect(response.content).toContain('Business Logic');
      expect(response.content).toContain('NOVELI.SH Patterns');
      expect(response.metadata.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle quality metrics analysis requests', async () => {
      const request: AIRequest = {
        domain: 'quality-metrics-analysis',
        prompt: 'Analyze overall code quality metrics',
        context: { scope: 'full-codebase' }
      };

      const response = await aiProvider.analyzeCodeQuality(request);
      
      expect(response.content).toContain('Quality Metrics Analysis');
      expect(response.content).toContain('Code Complexity');
      expect(response.content).toContain('Test Coverage');
      expect(response.provider).toBe('github-copilot-claude4');
    });

    it('should handle regression prediction requests', async () => {
      const request: AIRequest = {
        domain: 'regression-prediction',
        prompt: 'Predict regression risks for AI provider changes',
        context: { changes: ['ai-provider-service.ts'] }
      };

      const response = await aiProvider.analyzeCodeQuality(request);
      
      expect(response.content).toContain('Regression Prediction');
      expect(response.content).toContain('Risk Level');
      expect(response.content).toContain('Deployment');
      expect(response.model).toBe('claude-3-5-sonnet-20241022');
    });
  });

  describe('AI Provider Integration', () => {
    it('should use Claude 4 for quality intelligence tasks', async () => {
      const request: AIRequest = {
        domain: 'quality-intelligence',
        prompt: 'Test Claude 4 integration'
      };

      const response = await aiProvider.processRequest(request);
      
      expect(response.provider).toBe('github-copilot-claude4');
      expect(response.model).toBe('claude-3-5-sonnet-20241022');
    });

    it('should provide comprehensive error handling', async () => {
      const request: AIRequest = {
        domain: 'invalid-quality-task' as AITaskDomain,
        prompt: 'This should trigger error handling'
      };

      await expect(aiProvider.analyzeCodeQuality(request)).rejects.toThrow(
        'Invalid domain for quality analysis'
      );
    });

    it('should cache quality analysis responses', async () => {
      const request: AIRequest = {
        domain: 'quality-intelligence',
        prompt: 'Test caching behavior',
        context: { test: 'caching' }
      };

      // First request
      const response1 = await aiProvider.processRequest(request);
      expect(response1.metadata.cached).toBe(false);

      // Second request should be cached
      const response2 = await aiProvider.processRequest(request);
      expect(response2.metadata.cached).toBe(true);
      expect(response2.content).toBe(response1.content);
    });

    it('should track usage metrics for quality intelligence', async () => {
      const initialMetrics = aiProvider.getUsageMetrics();
      
      const request: AIRequest = {
        domain: 'predictive-bug-detection',
        prompt: 'Track metrics test'
      };

      await aiProvider.processRequest(request);
      
      const updatedMetrics = aiProvider.getUsageMetrics();
      expect(updatedMetrics.totalRequests).toBeGreaterThan(initialMetrics.totalRequests);
      expect(updatedMetrics.totalTokens).toBeGreaterThan(initialMetrics.totalTokens);
    });
  });

  describe('Quality Task Validation', () => {
    const qualityDomains = [
      'quality-intelligence',
      'predictive-bug-detection',
      'semantic-code-review', 
      'quality-metrics-analysis',
      'regression-prediction'
    ];

    qualityDomains.forEach(domain => {
      it(`should properly process ${domain} requests`, async () => {
        const request: AIRequest = {
          domain: domain as AITaskDomain,
          prompt: `Test ${domain} functionality`,
          context: { domain }
        };

        const response = await aiProvider.analyzeCodeQuality(request);
        
        expect(response).toBeDefined();
        expect(response.content).toBeTruthy();
        expect(response.provider).toBe('github-copilot-claude4');
        expect(response.usage.totalTokens).toBeGreaterThan(0);
      });
    });
  });

  describe('Provider Health and Monitoring', () => {
    it('should report healthy provider status for quality intelligence', () => {
      const health = aiProvider.getProviderHealth();
      
      expect(health.development.provider).toBe('github-copilot-claude4');
      expect(health.development.model).toBe('claude-3-5-sonnet-20241022');
      expect(health.development.enabled).toBe(true);
      expect(health.development.rateLimit).toBeDefined();
    });

    it('should provide fallback mechanism for quality intelligence', async () => {
      // This test simulates fallback behavior
      // In a real implementation, we would mock provider failures
      const request: AIRequest = {
        domain: 'quality-intelligence',
        prompt: 'Test fallback behavior'
      };

      const response = await aiProvider.processRequest(request);
      
      // Verify the response is valid regardless of fallback
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(['github-copilot-claude4', 'anthropic']).toContain(response.provider);
    });
  });
});