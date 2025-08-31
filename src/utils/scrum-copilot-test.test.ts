/**
 * Test for Scrum Master → GitHub Copilot Integration
 */

import { describe, it, expect } from 'vitest';
import { testScrumCopilotIntegration, type TestResult } from './scrum-copilot-test.js';

describe('Scrum Master → Copilot Integration', () => {
  it('should return a successful test result', () => {
    const result: TestResult = testScrumCopilotIntegration();
    
    // Validate the result structure
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toBe('Scrum Master → Copilot integration working perfectly!');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should return a valid ISO timestamp', () => {
    const result: TestResult = testScrumCopilotIntegration();
    
    // Validate timestamp is a valid ISO string
    const parsedDate = new Date(result.timestamp);
    expect(parsedDate.getTime()).not.toBeNaN();
  });

  it('should have correct TypeScript types', () => {
    const result: TestResult = testScrumCopilotIntegration();
    
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
    expect(typeof result.timestamp).toBe('string');
  });
});