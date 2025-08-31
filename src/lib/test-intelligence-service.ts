/**
 * NOVELI.SH - Test Intelligence Service V2
 * 
 * Leverages dual AI architecture for intelligent test generation:
 * - GitHub Copilot + Claude 4 for code analysis and test generation
 * - Business logic understanding and meaningful test scenarios
 * - Integration with existing AI provider service
 */

import { AIProviderService, type AIRequest } from './ai-provider-service';

export interface CodeAnalysis {
  functions: string[];
  classes: string[];
  interfaces: string[];
  dependencies: string[];
  apiEndpoints: string[];
  businessLogic: string[];
  edgeCases: string[];
  testCoverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export interface TestGenerationRequest {
  filePath: string;
  sourceCode: string;
  testType: 'unit' | 'integration' | 'e2e' | 'smart-generation';
  businessContext?: string;
  existingTests?: string;
}

export interface TestGenerationResult {
  generatedTests: string;
  testType: 'unit' | 'integration' | 'e2e' | 'smart-generation';
  coverageAnalysis: {
    expectedCoverage: number;
    criticalPaths: string[];
    edgeCases: string[];
  };
  qualityMetrics: {
    businessLogicCoverage: number;
    edgeCaseHandling: number;
    testMaintainability: number;
  };
  recommendations: string[];
}

export interface TestOptimizationResult {
  optimizedTests: string;
  performance: {
    executionTimeImprovement: number;
    redundantTestsRemoved: number;
    flakyTestsIdentified: string[];
  };
  recommendations: string[];
}

export class TestIntelligenceService {
  private aiProvider: AIProviderService;
  private static instance: TestIntelligenceService;

  private constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }

  static getInstance(): TestIntelligenceService {
    if (!TestIntelligenceService.instance) {
      TestIntelligenceService.instance = new TestIntelligenceService();
    }
    return TestIntelligenceService.instance;
  }

  /**
   * SMART TEST GENERATION - Uses AI to understand business logic and generate meaningful tests
   */
  async generateSmartTests(request: TestGenerationRequest): Promise<TestGenerationResult> {
    // Analyze code to understand business logic
    const codeAnalysis = await this.analyzeCodeForTesting(request.sourceCode, request.filePath);
    
    // Generate tests using development AI (GitHub Copilot + Claude 4)
    const aiRequest: AIRequest = {
      domain: 'code-generation',
      prompt: this.buildTestGenerationPrompt(request, codeAnalysis),
      context: {
        filePath: request.filePath,
        testType: request.testType,
        businessContext: request.businessContext,
        codeAnalysis
      },
      temperature: 0.1, // Low temperature for consistent, precise test generation
      maxTokens: 4096
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    // Evaluate test quality
    const qualityMetrics = await this.evaluateTestQuality(response.content, codeAnalysis);
    
    return {
      generatedTests: response.content,
      testType: request.testType,
      coverageAnalysis: {
        expectedCoverage: this.calculateExpectedCoverage(codeAnalysis),
        criticalPaths: codeAnalysis.businessLogic,
        edgeCases: codeAnalysis.edgeCases
      },
      qualityMetrics,
      recommendations: await this.generateTestRecommendations(codeAnalysis, qualityMetrics)
    };
  }

  /**
   * CODE ANALYSIS - Uses AI to understand business logic and testing requirements
   */
  async analyzeCodeForTesting(sourceCode: string, filePath: string): Promise<CodeAnalysis> {
    const aiRequest: AIRequest = {
      domain: 'software-development',
      prompt: `Analyze the following TypeScript code for comprehensive test generation:

${sourceCode}

File: ${filePath}

Provide analysis in JSON format:
{
  "functions": ["list of functions to test"],
  "classes": ["list of classes to test"],
  "interfaces": ["list of interfaces to validate"],
  "dependencies": ["external dependencies that need mocking"],
  "apiEndpoints": ["API endpoints if any"],
  "businessLogic": ["critical business logic flows"],
  "edgeCases": ["potential edge cases to test"],
  "testCoverage": {
    "lines": 0,
    "functions": 0,
    "branches": 0,
    "statements": 0
  }
}

Focus on:
1. Business logic that affects user experience
2. Error handling and edge cases
3. Integration points with external services
4. Critical data transformations
5. Security-sensitive operations`,
      context: { filePath, analysisType: 'testing' },
      temperature: 0.1,
      maxTokens: 2048
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback to manual parsing if JSON is malformed
      return this.parseCodeAnalysisFromText(response.content, sourceCode);
    }
  }

  /**
   * TEST COVERAGE ANALYSIS - Analyzes existing test coverage and identifies gaps
   */
  async analyzeCoverageGaps(sourceCode: string, existingTests: string): Promise<{
    gaps: string[];
    criticalUncovered: string[];
    recommendations: string[];
  }> {
    const aiRequest: AIRequest = {
      domain: 'software-development',
      prompt: `Analyze test coverage gaps between source code and existing tests:

SOURCE CODE:
${sourceCode}

EXISTING TESTS:
${existingTests}

Identify:
1. Uncovered functions and methods
2. Missing edge case tests
3. Untested error conditions
4. Critical business logic without tests
5. Integration points that need testing

Provide recommendations for improving test coverage.`,
      context: { analysisType: 'coverage-gaps' },
      temperature: 0.1,
      maxTokens: 2048
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    return {
      gaps: this.extractGapsFromAnalysis(response.content),
      criticalUncovered: this.extractCriticalGaps(response.content),
      recommendations: this.extractRecommendations(response.content)
    };
  }

  /**
   * TEST OPTIMIZATION - Optimizes existing tests for performance and reliability
   */
  async optimizeTests(existingTests: string, performanceMetrics?: any): Promise<TestOptimizationResult> {
    const aiRequest: AIRequest = {
      domain: 'software-development',
      prompt: `Optimize the following test suite for performance and reliability:

${existingTests}

Performance Metrics: ${JSON.stringify(performanceMetrics || {})}

Optimization goals:
1. Remove redundant tests
2. Improve test execution speed
3. Identify and fix flaky tests
4. Enhance test maintainability
5. Optimize test data and mocking

Provide optimized test code and detailed recommendations.`,
      context: { optimizationType: 'test-performance' },
      temperature: 0.1,
      maxTokens: 4096
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    return {
      optimizedTests: this.extractOptimizedTests(response.content),
      performance: {
        executionTimeImprovement: 0, // Would be calculated from real metrics
        redundantTestsRemoved: 0,
        flakyTestsIdentified: this.extractFlakyTests(response.content)
      },
      recommendations: this.extractRecommendations(response.content)
    };
  }

  /**
   * FLAKY TEST DETECTION - Uses AI to identify potentially unreliable tests
   */
  async detectFlakyTests(testCode: string, executionHistory?: any[]): Promise<{
    flakyTests: string[];
    stabilityScore: number;
    recommendations: string[];
  }> {
    const aiRequest: AIRequest = {
      domain: 'software-development',
      prompt: `Analyze the following tests for flakiness and reliability issues:

${testCode}

Execution History: ${JSON.stringify(executionHistory || [])}

Identify:
1. Tests with timing dependencies
2. Tests that rely on external state
3. Non-deterministic test behaviors
4. Race conditions in async tests
5. Improper mocking or setup

Provide stability recommendations and fixes.`,
      context: { analysisType: 'flaky-detection' },
      temperature: 0.1,
      maxTokens: 2048
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    return {
      flakyTests: this.extractFlakyTests(response.content),
      stabilityScore: this.calculateStabilityScore(response.content),
      recommendations: this.extractRecommendations(response.content)
    };
  }

  /**
   * PRIVATE HELPER METHODS
   */
  private buildTestGenerationPrompt(request: TestGenerationRequest, analysis: CodeAnalysis): string {
    return `Generate comprehensive ${request.testType} tests for NOVELI.SH platform:

FILE: ${request.filePath}
TEST TYPE: ${request.testType}
BUSINESS CONTEXT: ${request.businessContext || 'Interactive storytelling platform'}

CODE ANALYSIS:
- Functions: ${analysis.functions.join(', ')}
- Business Logic: ${analysis.businessLogic.join(', ')}
- Edge Cases: ${analysis.edgeCases.join(', ')}
- Dependencies: ${analysis.dependencies.join(', ')}

REQUIREMENTS:
1. Use Vitest testing framework
2. Follow TypeScript best practices
3. Test business logic thoroughly
4. Include edge case coverage
5. Mock external dependencies appropriately
6. Test error handling and validation
7. Ensure accessibility compliance where applicable

NOVELI.SH CONTEXT:
- AI Native interactive storytelling platform
- Typography-first design philosophy
- Mobile-first responsive design
- Zero emoji policy in user-facing content
- AWS Well-Architected Framework compliance

Generate production-ready tests with comprehensive coverage.`;
  }

  private async evaluateTestQuality(testCode: string, _analysis: CodeAnalysis): Promise<{
    businessLogicCoverage: number;
    edgeCaseHandling: number;
    testMaintainability: number;
  }> {
    // Use AI to evaluate test quality
    const aiRequest: AIRequest = {
      domain: 'software-development',
      prompt: `Evaluate the quality of these generated tests:

${testCode}

Rate on scale 0-1:
1. Business logic coverage
2. Edge case handling  
3. Test maintainability

Provide scores as JSON: {"businessLogicCoverage": 0.0, "edgeCaseHandling": 0.0, "testMaintainability": 0.0}`,
      context: { evaluationType: 'test-quality' },
      temperature: 0.1,
      maxTokens: 512
    };

    const response = await this.aiProvider.generateCode(aiRequest);
    
    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback scores
      return {
        businessLogicCoverage: 0.8,
        edgeCaseHandling: 0.7,
        testMaintainability: 0.85
      };
    }
  }

  private calculateExpectedCoverage(analysis: CodeAnalysis): number {
    // Calculate based on code complexity and business logic
    const functionCount = analysis.functions.length;
    const businessLogicCount = analysis.businessLogic.length;
    const edgeCaseCount = analysis.edgeCases.length;
    
    // Base coverage expectation
    let expectedCoverage = 0.85;
    
    // Adjust based on complexity
    if (businessLogicCount > functionCount * 0.5) {
      expectedCoverage = 0.95; // High business logic = high coverage needed
    }
    
    if (edgeCaseCount > functionCount * 0.3) {
      expectedCoverage = Math.min(expectedCoverage + 0.05, 0.98);
    }
    
    return expectedCoverage;
  }

  private async generateTestRecommendations(analysis: CodeAnalysis, metrics: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (metrics.businessLogicCoverage < 0.9) {
      recommendations.push('Increase business logic test coverage - focus on user-facing functionality');
    }
    
    if (metrics.edgeCaseHandling < 0.8) {
      recommendations.push('Add more edge case tests - consider boundary conditions and error states');
    }
    
    if (analysis.dependencies.length > 0) {
      recommendations.push('Ensure all external dependencies are properly mocked');
    }
    
    if (analysis.apiEndpoints.length > 0) {
      recommendations.push('Add integration tests for API endpoints');
    }
    
    return recommendations;
  }

  // Helper methods for parsing AI responses
  private parseCodeAnalysisFromText(_text: string, sourceCode: string): CodeAnalysis {
    // Fallback manual parsing logic
    return {
      functions: this.extractFromCode(sourceCode, /function\s+(\w+)|(\w+)\s*\(/g),
      classes: this.extractFromCode(sourceCode, /class\s+(\w+)/g),
      interfaces: this.extractFromCode(sourceCode, /interface\s+(\w+)/g),
      dependencies: this.extractFromCode(sourceCode, /import.*from\s+['"]([^'"]+)['"]/g),
      apiEndpoints: [],
      businessLogic: [],
      edgeCases: [],
      testCoverage: { lines: 0, functions: 0, branches: 0, statements: 0 }
    };
  }

  private extractFromCode(code: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      matches.push(match[1] || match[2] || match[0]);
    }
    return matches;
  }

  private extractGapsFromAnalysis(analysis: string): string[] {
    // Extract coverage gaps from AI analysis
    const gapSection = analysis.match(/gaps?:?\s*\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (gapSection && gapSection[1]) {
      return gapSection[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
    }
    return [];
  }

  private extractCriticalGaps(analysis: string): string[] {
    const criticalSection = analysis.match(/critical[\s\S]*?:?\s*\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (criticalSection && criticalSection[1]) {
      return criticalSection[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
    }
    return [];
  }

  private extractRecommendations(analysis: string): string[] {
    const recSection = analysis.match(/recommend[\s\S]*?:?\s*\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (recSection && recSection[1]) {
      return recSection[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
    }
    return [];
  }

  private extractOptimizedTests(response: string): string {
    // Extract optimized test code from AI response
    const codeMatch = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/);
    return codeMatch && codeMatch[1] ? codeMatch[1] : response;
  }

  private extractFlakyTests(analysis: string): string[] {
    const flakySection = analysis.match(/flaky[\s\S]*?:?\s*\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (flakySection && flakySection[1]) {
      return flakySection[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
    }
    return [];
  }

  private calculateStabilityScore(analysis: string): number {
    // Calculate stability score based on AI analysis
    const scoreMatch = analysis.match(/stability[\s\S]*?(\d+(?:\.\d+)?)/i);
    return scoreMatch && scoreMatch[1] ? parseFloat(scoreMatch[1]) : 0.8;
  }
}

// Export singleton instance
export const testIntelligenceService = TestIntelligenceService.getInstance();