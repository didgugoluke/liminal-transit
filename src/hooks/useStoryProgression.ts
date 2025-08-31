// Story Progression Hook - AI Native State Management
// Core hook for managing interactive story state and progression

import { useState, useCallback } from 'react';
import { StoryContext } from '../types';
import { createInitialStoryContext, calculateCompletionRate } from '../lib/utils';
import { generateWorld, offlineBeat } from '../lib/rng';

export interface UseStoryProgressionReturn {
  context: StoryContext;
  narrative: string;
  isGenerating: boolean;
  isEnded: boolean;
  makeChoice: (choice: 'Y' | 'N') => Promise<void>;
  resetStory: (seed?: string) => void;
  setNarrative: (text: string) => void;
}

/**
 * Hook for managing story progression and state
 */
export function useStoryProgression(initialSeed?: string): UseStoryProgressionReturn {
  const [context, setContext] = useState<StoryContext>(() => 
    createInitialStoryContext(initialSeed)
  );
  const [narrative, setNarrative] = useState<string>(() => 
    "The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  // Generate world state based on context seed
  const world = generateWorld(context.metadata.seed || 'default');

  const makeChoice = useCallback(async (choice: 'Y' | 'N') => {
    if (isGenerating || isEnded) return;

    setIsGenerating(true);

    try {
      // Update world state based on choice coherence
      const coherent = (world.playerRole.includes("Hero") && choice === "Y") || 
                      (!world.playerRole.includes("Hero") && choice === "N");
      world.continuity = Math.max(0, Math.min(6, world.continuity + (coherent ? 1 : -1)));
      
      if (Math.random() < 0.25) {
        world.foreshadow += 1;
      }

      // Generate next story beat
      const nextBeat = offlineBeat(world, choice);
      
      // Update context with new choice and narrative
      setContext(prev => {
        const newHistory = [...prev.history, narrative, `You chose: ${choice}`];
        const newCompletionRate = calculateCompletionRate({
          ...prev,
          history: newHistory
        });

        return {
          ...prev,
          history: newHistory,
          currentScene: nextBeat,
          metadata: {
            ...prev.metadata,
            lastUpdate: new Date(),
            completionRate: newCompletionRate,
          }
        };
      });

      setNarrative(nextBeat);

      // Check if story has ended
      const hasEnded = /\(Restart\?\)$/i.test(nextBeat);
      setIsEnded(hasEnded);

    } catch (error) {
      console.error('Error generating next story beat:', error);
      // Fallback to simple continuation
      setNarrative("The moment passes. What happens next? (Y/N)");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, isEnded, world, narrative]);

  const resetStory = useCallback((seed?: string) => {
    const newContext = createInitialStoryContext(seed);
    setContext(newContext);
    setNarrative("The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)");
    setIsEnded(false);
    setIsGenerating(false);
  }, []);

  return {
    context,
    narrative,
    isGenerating,
    isEnded,
    makeChoice,
    resetStory,
    setNarrative,
  };
}