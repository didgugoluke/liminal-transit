// RNG and Story Generation Tests
// Tests for deterministic random number generation and story utilities

import { describe, it, expect, beforeEach } from 'vitest';
import { mulberry32, hashStringToSeed, pick, generateWorld, offlineBeat } from '../../lib/rng';

describe('RNG Utilities', () => {
  describe('hashStringToSeed', () => {
    it('generates consistent hashes for same input', () => {
      const input = 'test-string';
      const hash1 = hashStringToSeed(input);
      const hash2 = hashStringToSeed(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('number');
    });

    it('generates different hashes for different inputs', () => {
      const hash1 = hashStringToSeed('string1');
      const hash2 = hashStringToSeed('string2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('handles empty string', () => {
      const hash = hashStringToSeed('');
      expect(typeof hash).toBe('number');
    });
  });

  describe('mulberry32', () => {
    it('generates deterministic sequence from same seed', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);
      
      const sequence1 = [rng1(), rng1(), rng1()];
      const sequence2 = [rng2(), rng2(), rng2()];
      
      expect(sequence1).toEqual(sequence2);
    });

    it('generates numbers between 0 and 1', () => {
      const rng = mulberry32(12345);
      
      for (let i = 0; i < 100; i++) {
        const num = rng();
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThan(1);
      }
    });

    it('generates different sequences from different seeds', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(54321);
      
      const sequence1 = [rng1(), rng1(), rng1()];
      const sequence2 = [rng2(), rng2(), rng2()];
      
      expect(sequence1).not.toEqual(sequence2);
    });
  });

  describe('pick', () => {
    it('picks elements from array deterministically', () => {
      const rng = mulberry32(12345);
      const arr = ['a', 'b', 'c', 'd', 'e'];
      
      const picked1 = pick(rng, arr);
      
      // Reset RNG with same seed
      const rng2 = mulberry32(12345);
      const picked2 = pick(rng2, arr);
      
      expect(picked1).toBe(picked2);
      expect(arr).toContain(picked1);
    });

    it('throws error for empty array', () => {
      const rng = mulberry32(12345);
      expect(() => pick(rng, [])).toThrow('Cannot pick from empty array');
    });

    it('returns only element from single-element array', () => {
      const rng = mulberry32(12345);
      const arr = ['only'];
      
      expect(pick(rng, arr)).toBe('only');
    });
  });
});

describe('World Generation', () => {
  describe('generateWorld', () => {
    it('generates consistent world from same seed', () => {
      const world1 = generateWorld('test-seed');
      const world2 = generateWorld('test-seed');
      
      expect(world1.seed).toBe(world2.seed);
      expect(world1.playerRole).toBe(world2.playerRole);
      expect(world1.destination).toBe(world2.destination);
      expect(world1.genre).toBe(world2.genre);
    });

    it('generates different worlds from different seeds', () => {
      const world1 = generateWorld('seed1');
      const world2 = generateWorld('seed2');
      
      expect(world1.seed).not.toBe(world2.seed);
      // At least one property should be different (very high probability)
      const sameContent = 
        world1.playerRole === world2.playerRole &&
        world1.destination === world2.destination &&
        world1.genre === world2.genre;
      expect(sameContent).toBe(false);
    });

    it('includes required world properties', () => {
      const world = generateWorld('test');
      
      expect(world).toHaveProperty('seed');
      expect(world).toHaveProperty('rng');
      expect(world).toHaveProperty('playerRole');
      expect(world).toHaveProperty('destination');
      expect(world).toHaveProperty('genre');
      expect(world).toHaveProperty('continuity');
      expect(world).toHaveProperty('foreshadow');
      expect(world).toHaveProperty('agents');
      
      expect(typeof world.rng).toBe('function');
      expect(Array.isArray(world.agents)).toBe(true);
    });

    it('initializes with default values', () => {
      const world = generateWorld('test');
      
      expect(world.continuity).toBe(3);
      expect(world.foreshadow).toBe(0);
      expect(world.agents).toHaveLength(3);
    });
  });

  describe('offlineBeat', () => {
    let world: ReturnType<typeof generateWorld>;

    beforeEach(() => {
      world = generateWorld('test-seed');
    });

    it('generates story text ending with choice or restart', () => {
      const beat = offlineBeat(world);
      
      const hasChoice = beat.endsWith('(Y/N)');
      const hasRestart = beat.endsWith('(Restart?)');
      
      expect(hasChoice || hasRestart).toBe(true);
    });

    it('generates different content for Y vs N choices', () => {
      // Generate many beats to find different patterns
      const yBeats = new Set();
      const nBeats = new Set();
      
      for (let i = 0; i < 50; i++) {
        const worldY = generateWorld(`test-${i}`);
        const worldN = generateWorld(`test-${i}`);
        
        const yBeat = offlineBeat(worldY, 'Y');
        const nBeat = offlineBeat(worldN, 'N');
        
        yBeats.add(yBeat);
        nBeats.add(nBeat);
      }
      
      // Should have some variety in beats
      expect(yBeats.size).toBeGreaterThan(1);
      expect(nBeats.size).toBeGreaterThan(1);
    });

    it('occasionally generates ending beats', () => {
      let foundEnding = false;
      
      // Test many iterations to find an ending
      for (let i = 0; i < 200; i++) {
        const testWorld = generateWorld(`ending-test-${i}`);
        const beat = offlineBeat(testWorld);
        
        if (beat.endsWith('(Restart?)')) {
          foundEnding = true;
          break;
        }
      }
      
      expect(foundEnding).toBe(true);
    });

    it('maintains consistent format with sense and hook elements', () => {
      const beat = offlineBeat(world);
      
      if (!beat.endsWith('(Restart?)')) {
        // Should contain atmospheric elements
        expect(beat).toMatch(/The air tastes of/);
        expect(beat.endsWith('(Y/N)')).toBe(true);
      }
    });
  });
});