// Enhanced Story Progression Hook - AI Native with Story Intelligence
// Advanced hook for managing intelligent story state with persistent characters

import { useState, useCallback, useRef, useEffect } from 'react';
import { StoryContext, Choice, ChoiceType, Character, StoryBeat } from '../types';
import { createInitialStoryContext, calculateCompletionRate } from '../lib/utils';
import { generateWorld, offlineBeat } from '../lib/rng';
import { StoryIntelligenceEngine } from '../lib/story-intelligence-engine';

export interface UseEnhancedStoryProgressionReturn {
  context: StoryContext;
  narrative: string;
  isGenerating: boolean;
  isEnded: boolean;
  availableChoices: Choice[];
  choiceType: ChoiceType;
  characters: Character[];
  storyTension: number;
  makeChoice: (choiceId: string) => Promise<void>;
  makeSimpleChoice: (choice: 'Y' | 'N') => Promise<void>; // Backward compatibility
  resetStory: (seed?: string) => void;
  setNarrative: (text: string) => void;
  getChoicePreview: (choiceId: string) => any;
  saveStoryState: () => void;
  loadStoryState: () => void;
}

/**
 * Enhanced hook for managing intelligent story progression with persistent characters
 */
export function useEnhancedStoryProgression(initialSeed?: string): UseEnhancedStoryProgressionReturn {
  const [context, setContext] = useState<StoryContext>(() => 
    createInitialStoryContext(initialSeed)
  );
  const [narrative, setNarrative] = useState<string>(() => 
    "The bus halts at dawn. Officials demand your ticket. Hand it over?"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [availableChoices, setAvailableChoices] = useState<Choice[]>([]);
  const [choiceType, setChoiceType] = useState<ChoiceType>('binary');

  // Story Intelligence Engine instance
  const storyEngine = useRef<StoryIntelligenceEngine | null>(null);
  const world = useRef(generateWorld(context.metadata.seed || 'default'));

  // Initialize Story Intelligence Engine
  useEffect(() => {
    if (!storyEngine.current) {
      storyEngine.current = new StoryIntelligenceEngine(context.metadata.seed || 'default');
      
      // Generate initial choices
      const initialChoices = storyEngine.current.generateEnhancedChoices(context);
      setAvailableChoices(initialChoices);
      setChoiceType(initialChoices[0]?.type || 'binary');
    }
  }, [context.metadata.seed]);

  // Get current characters and story state
  const characters = storyEngine.current?.getCharacters() ? 
    Array.from(storyEngine.current.getCharacters().values()) : [];
  const storyTension = storyEngine.current?.getStoryArc()?.tension || 0;

  /**
   * Enhanced choice handling with Story Intelligence
   */
  const makeChoice = useCallback(async (choiceId: string) => {
    if (isGenerating || isEnded || !storyEngine.current) return;

    const selectedChoice = availableChoices.find(choice => choice.id === choiceId);
    if (!selectedChoice) return;

    setIsGenerating(true);

    try {
      // Create story beat from current state
      const currentBeat: StoryBeat = {
        id: `beat_${Date.now()}`,
        narrative: narrative,
        choice: selectedChoice,
        timestamp: new Date(),
        characters: characters,
        tension: storyTension
      };

      // Update story intelligence
      const updatedArc = storyEngine.current.updateStoryArc(context, selectedChoice);
      const updatedWorldState = storyEngine.current.updateWorldState(context, selectedChoice);

      // Evolve characters based on choice
      const evolvedCharacters = characters.map(char => 
        storyEngine.current!.evolveCharacter(char.id, currentBeat)
      );

      // Generate next narrative beat
      let nextNarrative: string;
      if (selectedChoice.type === 'binary') {
        // Use existing RNG system for backward compatibility
        const legacyChoice = selectedChoice.id.includes('yes') ? 'Y' : 'N';
        nextNarrative = offlineBeat(world.current, legacyChoice);
      } else {
        // Generate contextual narrative based on choice
        nextNarrative = await generateContextualNarrative(selectedChoice, context, evolvedCharacters);
      }

      // Update context with enhanced story state
      setContext(prev => {
        const newHistory = [...prev.history, currentBeat];
        const newCompletionRate = calculateCompletionRate({
          ...prev,
          history: newHistory
        });

        return {
          ...prev,
          history: newHistory,
          currentScene: nextNarrative,
          characters: evolvedCharacters,
          worldState: updatedWorldState,
          storyArc: updatedArc,
          metadata: {
            ...prev.metadata,
            lastUpdate: new Date(),
            completionRate: newCompletionRate,
          }
        };
      });

      setNarrative(nextNarrative);

      // Generate next set of choices
      const nextChoices = storyEngine.current.generateEnhancedChoices({
        ...context,
        characters: evolvedCharacters,
        worldState: updatedWorldState,
        storyArc: updatedArc
      });

      setAvailableChoices(nextChoices);
      setChoiceType(nextChoices[0]?.type || 'binary');

      // Check if story has ended
      const hasEnded = /\(Restart\?\)$/i.test(nextNarrative) || 
                      updatedArc.completionPercentage >= 100;
      setIsEnded(hasEnded);

    } catch (error) {
      console.error('Error in enhanced story progression:', error);
      // Fallback to simple continuation
      setNarrative("The moment passes. What happens next?");
      setAvailableChoices(generateFallbackChoices());
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, isEnded, availableChoices, narrative, context, characters, storyTension]);

  /**
   * Backward compatibility for simple Y/N choices
   */
  const makeSimpleChoice = useCallback(async (choice: 'Y' | 'N') => {
    const choiceId = choice === 'Y' ? 'choice_yes' : 'choice_no';
    await makeChoice(choiceId);
  }, [makeChoice]);

  /**
   * Get preview of choice consequences
   */
  const getChoicePreview = useCallback((choiceId: string) => {
    if (!storyEngine.current) return null;
    
    const choice = availableChoices.find(c => c.id === choiceId);
    if (!choice) return null;

    return storyEngine.current.generateChoicePreview(choice, context);
  }, [availableChoices, context]);

  /**
   * Save story state to local storage
   */
  const saveStoryState = useCallback(() => {
    try {
      const storyState = {
        context,
        narrative,
        characters: characters.map(char => ({ ...char, relationships: Object.fromEntries(char.relationships) })),
        worldState: storyEngine.current?.getWorldState(),
        storyArc: storyEngine.current?.getStoryArc(),
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`noveli_story_${context.metadata.sessionId}`, JSON.stringify(storyState));
    } catch (error) {
      console.error('Failed to save story state:', error);
    }
  }, [context, narrative, characters]);

  /**
   * Load story state from local storage
   */
  const loadStoryState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(`noveli_story_${context.metadata.sessionId}`);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setContext(parsedState.context);
        setNarrative(parsedState.narrative);
        // Note: Full state restoration would require more complex serialization
      }
    } catch (error) {
      console.error('Failed to load story state:', error);
    }
  }, [context.metadata.sessionId]);

  /**
   * Reset story with enhanced intelligence
   */
  const resetStory = useCallback((seed?: string) => {
    const newContext = createInitialStoryContext(seed);
    setContext(newContext);
    setNarrative("The bus halts at dawn. Officials demand your ticket. Hand it over?");
    setIsEnded(false);
    setIsGenerating(false);
    
    // Reinitialize Story Intelligence Engine
    storyEngine.current = new StoryIntelligenceEngine(newContext.metadata.seed || 'default');
    world.current = generateWorld(newContext.metadata.seed || 'default');
    
    // Generate fresh initial choices
    const initialChoices = storyEngine.current.generateEnhancedChoices(newContext);
    setAvailableChoices(initialChoices);
    setChoiceType(initialChoices[0]?.type || 'binary');
  }, []);

  // Auto-save on context changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (context.history.length > 0) {
        saveStoryState();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [context, saveStoryState]);

  return {
    context,
    narrative,
    isGenerating,
    isEnded,
    availableChoices,
    choiceType,
    characters,
    storyTension,
    makeChoice,
    makeSimpleChoice,
    resetStory,
    setNarrative,
    getChoicePreview,
    saveStoryState,
    loadStoryState,
  };
}

/**
 * Generate contextual narrative based on choice and characters
 */
async function generateContextualNarrative(
  choice: Choice, 
  context: StoryContext, 
  characters: Character[]
): Promise<string> {
  // This would integrate with AI services in production
  // For now, return a contextual response based on choice type
  
  const narrativeTemplates = {
    diplomatic: [
      "Your words find their mark. The tension eases slightly.",
      "The diplomatic approach opens new possibilities.",
      "Through careful negotiation, a path forward emerges."
    ],
    direct: [
      "Swift action cuts through the uncertainty.",
      "Your decisive move changes everything.",
      "The direct approach yields immediate results."
    ],
    observe: [
      "Patience reveals hidden details.",
      "From the shadows, you gather crucial information.",
      "Careful observation uncovers new opportunities."
    ]
  };

  const choiceCategory = choice.metadata.category;
  const templates = narrativeTemplates[choiceCategory as keyof typeof narrativeTemplates] || 
                   ["The situation evolves in an unexpected direction."];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Add character reactions if applicable
  if (characters.length > 0 && choice.metadata.affectedCharacters.length > 0) {
    const reactingCharacter = characters.find(c => 
      choice.metadata.affectedCharacters.includes(c.id)
    );
    
    if (reactingCharacter) {
      return `${template} ${reactingCharacter.name} ${getCharacterReaction(reactingCharacter)}.`;
    }
  }

  return `${template} What happens next?`;
}

/**
 * Generate character reaction based on personality
 */
function getCharacterReaction(character: Character): string {
  const reactions = {
    high_trust: ["nods approvingly", "smiles with understanding", "expresses quiet approval"],
    low_trust: ["watches suspiciously", "frowns with concern", "steps back cautiously"],
    neutral: ["observes thoughtfully", "considers the implications", "remains attentive"]
  };

  // Simple reaction based on character's trustworthiness trait
  const trustLevel = character.personality.trustworthiness;
  let reactionType: keyof typeof reactions;
  
  if (trustLevel > 70) reactionType = 'high_trust';
  else if (trustLevel < 40) reactionType = 'low_trust';
  else reactionType = 'neutral';

  const possibleReactions = reactions[reactionType];
  const selectedReaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
  return selectedReaction || "observes quietly";
}

/**
 * Generate fallback choices when intelligence engine fails
 */
function generateFallbackChoices(): Choice[] {
  return [
    {
      id: 'choice_yes',
      text: 'Yes',
      type: 'binary',
      metadata: {
        impact: 'medium',
        category: 'action',
        aiConfidence: 50,
        affectedCharacters: [],
        tensionChange: 2,
        consequences: []
      }
    },
    {
      id: 'choice_no',
      text: 'No',
      type: 'binary',
      metadata: {
        impact: 'medium',
        category: 'action',
        aiConfidence: 50,
        affectedCharacters: [],
        tensionChange: -1,
        consequences: []
      }
    }
  ];
}