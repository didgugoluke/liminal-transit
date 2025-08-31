// Enhanced Story Engine - AI Native Character & Consequence System
// Advanced story intelligence with persistent characters and world state

import { StoryContext, Character, WorldState, Relationship, Consequence, Choice, Memory } from '../types';

/**
 * Creates initial enhanced story context with character system
 */
export function createEnhancedStoryContext(seed?: string): StoryContext {
  const sessionId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    history: [],
    currentScene: "The bus halts at dawn. Officials demand your ticket. Hand it over?",
    choices: [],
    metadata: {
      seed: seed || generateSeed(),
      sessionId,
      startTime: new Date(),
      lastUpdate: new Date(),
      completionRate: 0,
      choicesMade: 0,
      charactersMet: 0,
      consequencesRevealed: 0,
      storyBranch: 'main',
      difficulty: 'beginner',
      playerPreferences: {
        readingSpeed: 'normal',
        preferredChoiceStyle: 'cautious',
        characterInteractionStyle: 'friendly',
        narrativeComplexity: 'moderate',
        themePreferences: ['mystery', 'character-driven']
      }
    },
    characters: [
      createInitialCharacter('bus_official', 'Transit Official', ['authoritative', 'suspicious']),
      createInitialCharacter('mysterious_passenger', 'Fellow Passenger', ['observant', 'enigmatic'])
    ],
    worldState: {
      location: 'transit_bus',
      timeOfDay: 'dawn',
      atmosphere: 'tense',
      tension: 0.6,
      mystery: 0.8,
      continuity: 3,
      foreshadow: 0,
      playerRole: ['traveler', 'uncertain']
    },
    relationships: [],
    consequences: [],
    themes: ['liminal_space', 'authority', 'identity', 'uncertainty']
  };
}

/**
 * Creates an initial character with basic setup
 */
function createInitialCharacter(id: string, name: string, personality: string[]): Character {
  return {
    id,
    name,
    personality,
    memories: [],
    relationships: {},
    traits: personality.map(trait => ({
      name: trait,
      strength: 0.7,
      category: 'personality'
    })),
    currentMood: 'neutral',
    lastSeen: new Date()
  };
}

/**
 * Processes a choice and updates story state with enhanced consequences
 */
export function processEnhancedChoice(
  context: StoryContext,
  choice: 'Y' | 'N',
  narrative: string
): StoryContext {
  const updatedContext = { ...context };
  
  // Update basic history
  updatedContext.history = [
    ...context.history,
    narrative,
    `You chose: ${choice}`
  ];
  
  // Update metadata
  updatedContext.metadata = {
    ...context.metadata,
    lastUpdate: new Date(),
    choicesMade: context.metadata.choicesMade + 1,
    completionRate: calculateEnhancedCompletionRate(updatedContext)
  };
  
  // Process character interactions
  updatedContext.characters = updateCharacterMemories(
    context.characters,
    choice,
    narrative
  );
  
  // Update world state based on choice
  updatedContext.worldState = updateWorldState(context.worldState, choice);
  
  // Generate consequences
  const newConsequence = generateConsequence(choice, context);
  if (newConsequence) {
    updatedContext.consequences = [...context.consequences, newConsequence];
  }
  
  // Update relationships based on choice
  updatedContext.relationships = updateRelationships(
    context.relationships,
    context.characters,
    choice
  );
  
  return updatedContext;
}

/**
 * Updates character memories based on story events
 */
function updateCharacterMemories(
  characters: Character[],
  choice: 'Y' | 'N',
  narrative: string
): Character[] {
  return characters.map(character => {
    const memory: Memory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `Player chose ${choice} during: ${narrative}`,
      type: 'choice',
      emotionalWeight: choice === 'Y' ? 0.3 : -0.2, // Cooperation vs resistance
      timestamp: new Date(),
      relatedCharacters: [character.id]
    };
    
    // Update mood based on choice
    let newMood = character.currentMood;
    if (character.personality.includes('authoritative')) {
      newMood = choice === 'Y' ? 'pleased' : 'irritated';
    } else if (character.personality.includes('observant')) {
      newMood = 'intrigued';
    }
    
    return {
      ...character,
      memories: [...character.memories, memory].slice(-10), // Keep last 10 memories
      currentMood: newMood,
      lastSeen: new Date()
    };
  });
}

/**
 * Updates world state based on player choice
 */
function updateWorldState(worldState: WorldState, choice: 'Y' | 'N'): WorldState {
  return {
    ...worldState,
    tension: Math.max(0, Math.min(1, worldState.tension + (choice === 'Y' ? -0.1 : 0.2))),
    mystery: Math.max(0, Math.min(1, worldState.mystery + (choice === 'N' ? 0.1 : -0.05))),
    continuity: Math.max(0, Math.min(6, worldState.continuity + (choice === 'Y' ? 1 : 0))),
    foreshadow: worldState.foreshadow + (Math.random() < 0.3 ? 1 : 0)
  };
}

/**
 * Generates consequences for choices
 */
function generateConsequence(choice: 'Y' | 'N', context: StoryContext): Consequence | null {
  // Create meaningful consequences based on choice and context
  if (choice === 'N' && context.metadata.choicesMade === 0) {
    return {
      id: `consequence_${Date.now()}`,
      choiceId: 'initial_defiance',
      description: 'Your refusal to comply has marked you as suspicious',
      impact: 'short_term',
      severity: 'moderate',
      affectedCharacters: ['bus_official'],
      worldStateChanges: { tension: 0.8, playerRole: ['suspicious_traveler'] },
      isRevealed: false,
      revealCondition: 'next_authority_encounter'
    };
  }
  
  if (choice === 'Y' && context.metadata.choicesMade === 0) {
    return {
      id: `consequence_${Date.now()}`,
      choiceId: 'initial_compliance',
      description: 'Your compliance has earned temporary trust',
      impact: 'short_term',
      severity: 'minor',
      affectedCharacters: ['bus_official'],
      worldStateChanges: { tension: 0.4, playerRole: ['compliant_traveler'] },
      isRevealed: false,
      revealCondition: 'story_progression'
    };
  }
  
  return null;
}

/**
 * Updates relationships between characters
 */
function updateRelationships(
  relationships: Relationship[],
  characters: Character[],
  choice: 'Y' | 'N'
): Relationship[] {
  // For now, return existing relationships
  // This would be expanded to create new relationships based on character interactions
  return relationships;
}

/**
 * Calculates enhanced completion rate based on story elements
 */
function calculateEnhancedCompletionRate(context: StoryContext): number {
  const baseProgress = Math.min(90, context.history.length * 10);
  const characterBonus = context.metadata.charactersMet * 5;
  const consequenceBonus = context.metadata.consequencesRevealed * 3;
  
  return Math.min(100, baseProgress + characterBonus + consequenceBonus);
}

/**
 * Generates a unique seed for story context
 */
function generateSeed(): string {
  const prefixes = ['liminal', 'transit', 'dawn', 'threshold', 'passage'];
  const suffixes = ['journey', 'crossing', 'moment', 'space', 'encounter'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const random = Math.random().toString(36).substr(2, 8);
  
  return `${prefix}_${suffix}_${random}`;
}

/**
 * Generates enhanced narrative beats with character awareness
 */
export function generateEnhancedNarrative(
  context: StoryContext,
  choice: 'Y' | 'N'
): string {
  const { worldState, characters, consequences } = context;
  
  // Character-aware narrative generation
  const officialMood = characters.find(c => c.id === 'bus_official')?.currentMood || 'neutral';
  const tension = worldState.tension;
  const mystery = worldState.mystery;
  
  // Create context-aware narrative
  if (choice === 'Y' && officialMood === 'pleased') {
    const narratives = [
      "The official nods curtly. Behind you, whispers suggest not everyone is so compliant. The bus lurches forward into an uncertain dawn.",
      "Your ticket satisfies the official, but their eyes linger on the mysterious passenger beside you. Something unspoken passes between them.",
      "Compliance grants passage, yet the other passengers exchange glances that speak of deeper currents beneath this routine stop."
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  if (choice === 'N' && tension > 0.7) {
    const narratives = [
      "Your defiance ripples through the bus like a stone through still water. The official's hand moves toward their radio.",
      "Silence stretches taut as your refusal hangs in the air. Other passengers shrink back, leaving you isolated in your resistance.",
      "The official's expression hardens. In the dawn light, you glimpse the weight of authority preparing to descend."
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  // Fallback to mystery-based narratives
  if (mystery > 0.6) {
    return "The moment crystallizes around an unspoken truth. Nothing here is as simple as it appears.";
  }
  
  return "The story continues to unfold in ways that surprise even the narrator.";
}

/**
 * Checks if story should end based on enhanced conditions
 */
export function shouldStoryEnd(context: StoryContext): boolean {
  const { metadata, worldState, consequences } = context;
  
  // End conditions based on enhanced story state
  if (metadata.choicesMade >= 8) return true;
  if (worldState.tension >= 1.0) return true;
  if (consequences.length >= 5) return true;
  if (metadata.completionRate >= 100) return true;
  
  return false;
}