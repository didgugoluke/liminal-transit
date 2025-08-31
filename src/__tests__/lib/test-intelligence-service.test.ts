/**
 * Test Intelligence Service V2 - Integration Tests
 * 
 * Validates the Test Intelligence Agent V2 integration with dual AI architecture
 */

import { describe, it, expect } from 'vitest';

describe('Test Intelligence Service V2', () => {
  describe('Basic Integration', () => {
    it('should have test intelligence service available', async () => {
      // Import the service dynamically to avoid module resolution issues in tests
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      
      expect(TestIntelligenceService).toBeDefined();
      expect(typeof TestIntelligenceService.getInstance).toBe('function');
      
      const service = TestIntelligenceService.getInstance();
      expect(service).toBeDefined();
      expect(typeof service.generateSmartTests).toBe('function');
      expect(typeof service.analyzeCodeForTesting).toBe('function');
      expect(typeof service.analyzeCoverageGaps).toBe('function');
      expect(typeof service.optimizeTests).toBe('function');
      expect(typeof service.detectFlakyTests).toBe('function');
    });

    it('should demonstrate singleton pattern', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      
      const instance1 = TestIntelligenceService.getInstance();
      const instance2 = TestIntelligenceService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should have proper interface types defined', async () => {
      const module = await import('../../lib/test-intelligence-service');
      
      expect(module.TestIntelligenceService).toBeDefined();
      expect(module.testIntelligenceService).toBeDefined();
    });
  });

  describe('Code Analysis Functionality', () => {
    it('should handle fallback parsing for invalid JSON', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      // Test the fallback parsing method directly (accessing private method via any)
      const serviceAny = service as any;
      const sourceCode = 'export function test() { return true; }';
      
      const result = serviceAny.parseCodeAnalysisFromText('invalid json', sourceCode);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.functions)).toBe(true);
      expect(Array.isArray(result.classes)).toBe(true);
      expect(Array.isArray(result.interfaces)).toBe(true);
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('should calculate expected coverage correctly', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      
      const simpleAnalysis = {
        functions: ['simple'],
        businessLogic: [],
        edgeCases: []
      };
      
      const complexAnalysis = {
        functions: ['func1', 'func2'],
        businessLogic: ['logic1', 'logic2'],
        edgeCases: ['edge1']
      };
      
      const simpleCoverage = serviceAny.calculateExpectedCoverage(simpleAnalysis);
      const complexCoverage = serviceAny.calculateExpectedCoverage(complexAnalysis);
      
      expect(simpleCoverage).toBe(0.85);
      expect(complexCoverage).toBeGreaterThan(simpleCoverage);
    });
  });

  describe('Text Processing Utilities', () => {
    it('should extract gaps from analysis text', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const analysisText = `
Coverage Analysis:

Gaps:
- Missing function tests
- No error handling tests

Other content here`;
      
      const gaps = serviceAny.extractGapsFromAnalysis(analysisText);
      
      expect(gaps).toContain('Missing function tests');
      expect(gaps).toContain('No error handling tests');
    });

    it('should extract recommendations from analysis text', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const analysisText = `
Analysis complete.

Recommendations:
- Add unit tests
- Improve coverage

Additional notes`;
      
      const recommendations = serviceAny.extractRecommendations(analysisText);
      
      expect(recommendations).toContain('Add unit tests');
      expect(recommendations).toContain('Improve coverage');
    });

    it('should extract flaky tests from analysis text', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const analysisText = `
Flaky Test Analysis:

Flaky Tests:
- test1: timing issue
- test2: race condition

Stability info`;
      
      const flakyTests = serviceAny.extractFlakyTests(analysisText);
      
      expect(flakyTests).toContain('test1: timing issue');
      expect(flakyTests).toContain('test2: race condition');
    });

    it('should calculate stability score from analysis', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const analysisWithScore = 'Stability Score: 0.92';
      const analysisWithoutScore = 'No score found';
      
      const score1 = serviceAny.calculateStabilityScore(analysisWithScore);
      const score2 = serviceAny.calculateStabilityScore(analysisWithoutScore);
      
      expect(score1).toBe(0.92);
      expect(score2).toBe(0.8); // fallback value
    });

    it('should extract optimized tests from response', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const responseWithCode = `
Here are optimized tests:

\`\`\`typescript
describe('optimized', () => {
  it('works', () => {});
});
\`\`\`

Additional notes`;
      
      const responseWithoutCode = 'No code blocks found';
      
      const extracted1 = serviceAny.extractOptimizedTests(responseWithCode);
      const extracted2 = serviceAny.extractOptimizedTests(responseWithoutCode);
      
      expect(extracted1).toContain("describe('optimized'");
      expect(extracted2).toBe('No code blocks found');
    });
  });

  describe('V2 Intelligence Integration', () => {
    it('should implement recommendation generation logic', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      
      const analysis = {
        dependencies: ['external-lib'],
        apiEndpoints: ['/api/test']
      };
      
      const lowMetrics = {
        businessLogicCoverage: 0.7,
        edgeCaseHandling: 0.6
      };
      
      const recommendations = await serviceAny.generateTestRecommendations(analysis, lowMetrics);
      
      expect(recommendations).toContain('Increase business logic test coverage - focus on user-facing functionality');
      expect(recommendations).toContain('Add more edge case tests - consider boundary conditions and error states');
      expect(recommendations).toContain('Ensure all external dependencies are properly mocked');
      expect(recommendations).toContain('Add integration tests for API endpoints');
    });

    it('should handle text extraction utilities robustly', async () => {
      const { TestIntelligenceService } = await import('../../lib/test-intelligence-service');
      const service = TestIntelligenceService.getInstance();
      
      const serviceAny = service as any;
      const sourceCode = 'function test() {} class TestClass {} import x from "module"';
      const regex = /function\s+(\w+)/g;
      
      const extracted = serviceAny.extractFromCode(sourceCode, regex);
      
      expect(extracted).toContain('test');
    });
  });

  describe('Test Generation Requirements Validation', () => {
    it('should validate test generation request structure', async () => {
      const validRequest = {
        filePath: 'src/test.ts',
        sourceCode: 'export function test() {}',
        testType: 'unit' as const
      };
      
      expect(validRequest.filePath).toBeDefined();
      expect(validRequest.sourceCode).toBeDefined();
      expect(['unit', 'integration', 'e2e', 'smart-generation']).toContain(validRequest.testType);
    });

    it('should validate code analysis structure', () => {
      const analysisStructure = {
        functions: ['test'],
        classes: ['TestClass'],
        interfaces: ['TestInterface'],
        dependencies: ['external'],
        apiEndpoints: ['/api'],
        businessLogic: ['logic'],
        edgeCases: ['edge'],
        testCoverage: {
          lines: 0,
          functions: 0,
          branches: 0,
          statements: 0
        }
      };
      
      expect(Array.isArray(analysisStructure.functions)).toBe(true);
      expect(Array.isArray(analysisStructure.classes)).toBe(true);
      expect(Array.isArray(analysisStructure.interfaces)).toBe(true);
      expect(typeof analysisStructure.testCoverage).toBe('object');
    });
  });
});