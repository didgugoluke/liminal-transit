/**
 * Tests for Simple Hello World Test - Copilot E2E Validation
 */

import { describe, it, expect } from 'vitest';
import { HelloWorld } from './index.js';

describe('HelloWorld E2E Test', () => {
  it('should create a HelloWorld instance', () => {
    const helloWorld = new HelloWorld();
    expect(helloWorld).toBeDefined();
    expect(helloWorld).toBeInstanceOf(HelloWorld);
  });

  it('should return "Hello, World!" from greet method', () => {
    const helloWorld = new HelloWorld();
    const greeting = helloWorld.greet();
    
    expect(greeting).toBe('Hello, World!');
    expect(typeof greeting).toBe('string');
  });

  it('should have proper TypeScript types', () => {
    const helloWorld = new HelloWorld();
    
    // Test that greet method returns string type
    const greeting: string = helloWorld.greet();
    expect(typeof greeting).toBe('string');
  });
});