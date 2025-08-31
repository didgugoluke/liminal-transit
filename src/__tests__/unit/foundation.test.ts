import { describe, it, expect } from 'vitest';
import { generateStorySeed, createInitialStoryContext, validateStoryContext } from '../../lib/utils';

describe('AI Native Foundation Utils', () => {
  it('should generate a valid story seed', () => {
    const seed = generateStorySeed();
    expect(seed).toBeDefined();
    expect(typeof seed).toBe('string');
    expect(seed.length).toBeGreaterThan(0);
    expect(seed.includes('_')).toBe(true);
  });

  it('should create valid initial story context', () => {
    const context = createInitialStoryContext();
    expect(context).toBeDefined();
    expect(context.history).toEqual([]);
    expect(context.choices).toEqual([]);
    expect(context.metadata.sessionId).toBeDefined();
    expect(context.metadata.seed).toBeDefined();
    expect(context.metadata.completionRate).toBe(0);
  });

  it('should validate story context correctly', () => {
    const validContext = createInitialStoryContext();
    expect(validateStoryContext(validContext)).toBe(true);

    const invalidContext = { ...validContext, metadata: { ...validContext.metadata, sessionId: '' } };
    expect(validateStoryContext(invalidContext)).toBe(false);
  });

  it('should create context with custom seed', () => {
    const customSeed = 'test_seed_123';
    const context = createInitialStoryContext(customSeed);
    expect(context.metadata.seed).toBe(customSeed);
  });
});