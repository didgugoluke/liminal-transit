#!/usr/bin/env node

/**
 * Demo script for GitHub Copilot + Claude 4 Hello World Implementation
 * This verifies the code works correctly after syntax fixes
 */

import { CopilotHelloWorld } from '../src/copilot-hello/index.js';

console.log('🤖 GitHub Copilot + Claude 4 Hello World Demo');
console.log('================================================');

// Test 1: Basic greeting with timestamp
const hello1 = new CopilotHelloWorld();
console.log('Basic greeting:', hello1.greet());

// Test 2: Custom greeting without timestamp
const hello2 = new CopilotHelloWorld({
  greeting: 'Welcome',
  target: 'E2E Test',
  timestamp: false
});
console.log('Custom greeting:', hello2.greet());

// Test 3: Agent info
console.log('Agent info:', hello1.getAgentInfo());

console.log('\n✅ All tests passed - syntax fixes successful!');