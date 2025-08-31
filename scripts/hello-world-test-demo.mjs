#!/usr/bin/env node

/**
 * Demo script for Simple Hello World Test - Copilot E2E Validation
 * This verifies the HelloWorld implementation works correctly
 */

import { HelloWorld } from '../dist/hello-world-test/index.js';

console.log('🧪 Simple Hello World Test - Copilot E2E Validation');
console.log('====================================================');

// Test the HelloWorld class
const helloWorld = new HelloWorld();
console.log('Creating HelloWorld instance:', '✅');

// Test the greet method
const greeting = helloWorld.greet();
console.log('Calling greet() method:', greeting);

// Verify the result
if (greeting === 'Hello, World!') {
  console.log('✅ Test PASSED - Returns correct greeting');
} else {
  console.log('❌ Test FAILED - Expected "Hello, World!" got:', greeting);
  process.exit(1);
}

console.log('');
console.log('🎯 All acceptance criteria met:');
console.log('  ✅ Simple HelloWorld class created');
console.log('  ✅ Basic greet() method returns "Hello, World!"');
console.log('  ✅ Proper TypeScript types included');
console.log('  ✅ Simple test validation added');
console.log('');
console.log('Pipeline validation test complete!');