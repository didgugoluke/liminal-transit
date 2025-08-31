// Enhanced Story Progression Hook - AI Native State Management
// Core hook for managing interactive story state with character persistence

import { useState, useCallback } from 'react';
import { StoryContext } from '../types';
import { 
  createEnhancedStoryContext,
  processEnhancedChoice,
  generateEnhancedNarrative,
  shouldStoryEnd
} from '../lib/enhanced-story-engine';

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
 * Enhanced hook for managing story progression with character persistence and consequences
 */
export function useStoryProgression(initialSeed?: string): UseStoryProgressionReturn {
  const [context, setContext] = useState<StoryContext>(() => 
    createEnhancedStoryContext(initialSeed)
  );
  const [narrative, setNarrative] = useState<string>(() => 
    "The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const makeChoice = useCallback(async (choice: 'Y' | 'N') => {
    if (isGenerating || isEnded) return;

    setIsGenerating(true);

    try {
      // Process choice with enhanced story intelligence
      const updatedContext = processEnhancedChoice(context, choice, narrative);
      
      // Generate next narrative beat with character awareness
      const nextNarrative = generateEnhancedNarrative(updatedContext, choice);
      
      // Update context
      setContext(updatedContext);
      setNarrative(nextNarrative);

      // Check if story should end with enhanced conditions
      const hasEnded = shouldStoryEnd(updatedContext);
      if (hasEnded) {
        setIsEnded(true);
        setNarrative(nextNarrative + " (Restart?)");
      }

    } catch (error) {
      console.error('Error generating enhanced story beat:', error);
      // Fallback to simple continuation
      setNarrative("The moment passes, heavy with unspoken possibilities. What happens next? (Y/N)");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, isEnded, context, narrative]);

  const resetStory = useCallback((seed?: string) => {
    const newContext = createEnhancedStoryContext(seed);
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