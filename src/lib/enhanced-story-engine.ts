// Enhanced Story Engine - AI Native Character & Consequence System
// Advanced story intelligence with persistent characters and world state

import { StoryContext, Character, WorldState, Relationship, Consequence, Choice, Memory } from '../types';
import { generateEnhancedChoices, EnhancedChoice } from './enhanced-choice-system';

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
 * Processes an enhanced choice and updates story state with advanced consequences
 */
export function processEnhancedChoiceSelection(
  context: StoryContext,
  choice: EnhancedChoice,
  narrative: string
): StoryContext {
  const updatedContext = { ...context };
  
  // Update basic history
  updatedContext.history = [
    ...context.history,
    narrative,
    `You chose: ${choice.text}`
  ];
  
  // Update metadata with enhanced tracking
  updatedContext.metadata = {
    ...context.metadata,
    lastUpdate: new Date(),
    choicesMade: context.metadata.choicesMade + 1,
    completionRate: calculateEnhancedCompletionRate(updatedContext)
  };
  
  // Process character interactions based on choice reactions
  if (choice.characterReactions) {
    updatedContext.characters = updateCharacterMemories(
      context.characters,
      choice.id,
      narrative
    );
    
    // Apply character mood changes from choice reactions
    updatedContext.characters = updatedContext.characters.map(character => {
      const reaction = choice.characterReactions![character.id];
      if (reaction) {
        let newMood = character.currentMood;
        if (reaction.moodChange > 0.2) {
          newMood = 'pleased';
        } else if (reaction.moodChange < -0.2) {
          newMood = 'irritated';
        } else if (Math.abs(reaction.moodChange) > 0.1) {
          newMood = 'intrigued';
        }
        
        return {
          ...character,
          currentMood: newMood,
          lastSeen: new Date()
        };
      }
      return character;
    });
  }
  
  // Update world state based on choice
  updatedContext.worldState = updateWorldStateFromChoice(context.worldState, choice);
  
  // Generate consequences for the choice
  const newConsequence = generateConsequenceFromChoice(choice, context);
  if (newConsequence) {
    updatedContext.consequences = [...context.consequences, newConsequence];
  }
  
  // Update relationships based on choice
  updatedContext.relationships = updateRelationships(
    context.relationships,
    context.characters,
    choice.id
  );
  
  return updatedContext;
}

/**
 * Updates character memories based on story events
 */
function updateCharacterMemories(
  characters: Character[],
  choiceId: string,
  narrative: string
): Character[] {
  return characters.map(character => {
    const memory: Memory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `Player chose ${choiceId} during: ${narrative}`,
      type: 'choice',
      emotionalWeight: choiceId.includes('comply') || choiceId.includes('yes') ? 0.3 : -0.2,
      timestamp: new Date(),
      relatedCharacters: [character.id]
    };
    
    return {
      ...character,
      memories: [...character.memories, memory].slice(-10), // Keep last 10 memories
      lastSeen: new Date()
    };
  });
}

/**
 * Updates world state based on enhanced choice
 */
function updateWorldStateFromChoice(worldState: WorldState, choice: EnhancedChoice): WorldState {
  let tensionChange = 0;
  let mysteryChange = 0;
  
  // Base changes on choice emotional tone and type
  switch (choice.emotionalTone) {
    case 'positive':
      tensionChange = -0.1;
      mysteryChange = -0.05;
      break;
    case 'negative':
      tensionChange = 0.2;
      mysteryChange = 0.1;
      break;
    case 'complex':
      tensionChange = 0.1;
      mysteryChange = 0.15;
      break;
  }
  
  // Modify based on choice type
  switch (choice.type) {
    case 'gesture':
      tensionChange += 0.1;
      mysteryChange += 0.2;
      break;
    case 'timed':
      tensionChange += 0.15;
      break;
    case 'conditional':
      mysteryChange += 0.1;
      break;
  }
  
  return {
    ...worldState,
    tension: Math.max(0, Math.min(1, worldState.tension + tensionChange)),
    mystery: Math.max(0, Math.min(1, worldState.mystery + mysteryChange)),
    continuity: Math.max(0, Math.min(6, worldState.continuity + (choice.emotionalTone === 'positive' ? 1 : 0))),
    foreshadow: worldState.foreshadow + (Math.random() < 0.3 ? 1 : 0)
  };
}

/**
 * Generates consequences for enhanced choices
 */
function generateConsequenceFromChoice(choice: EnhancedChoice, context: StoryContext): Consequence | null {
  // Create meaningful consequences based on choice and context
  if (choice.id === 'resist' && context.metadata.choicesMade === 0) {
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
  
  if (choice.id === 'comply' && context.metadata.choicesMade === 0) {
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
  
  // Gesture-based consequences
  if (choice.type === 'gesture') {
    return {
      id: `consequence_${Date.now()}`,
      choiceId: choice.id,
      description: 'Your subtle communication has created an unspoken bond',
      impact: 'long_term',
      severity: 'moderate',
      affectedCharacters: Object.keys(choice.characterReactions || {}),
      worldStateChanges: { mystery: Math.min(1, context.worldState.mystery + 0.3) },
      isRevealed: false,
      revealCondition: 'relationship_deepens'
    };
  }
  
  return null;
}

/**
 * Updates relationships between characters based on enhanced choice
 */
function updateRelationships(
  relationships: Relationship[],
  characters: Character[],
  choiceId: string
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
 * Generates enhanced narrative beats with character awareness and choice context
 */
export function generateEnhancedNarrativeFromChoice(
  context: StoryContext,
  choice: EnhancedChoice
): string {
  const { worldState, characters, consequences } = context;
  
  // Get current character moods
  const officialMood = characters.find(c => c.id === 'bus_official')?.currentMood || 'neutral';
  const passengerMood = characters.find(c => c.id === 'mysterious_passenger')?.currentMood || 'neutral';
  const tension = worldState.tension;
  const mystery = worldState.mystery;
  
  // Generate narrative based on choice type and character reactions
  switch (choice.type) {
    case 'binary':
      return generateBinaryChoiceNarrative(choice, context, officialMood, passengerMood, tension);
      
    case 'multiple':
      return generateMultipleChoiceNarrative(choice, context);
      
    case 'gesture':
      return generateGestureChoiceNarrative(choice, context);
      
    case 'timed':
      return generateTimedChoiceNarrative(choice, context);
      
    case 'conditional':
      return generateConditionalChoiceNarrative(choice, context);
      
    default:
      return "The story unfolds in unexpected directions, shaped by your choice.";
  }
}

function generateBinaryChoiceNarrative(
  choice: EnhancedChoice, 
  context: StoryContext, 
  officialMood: string, 
  passengerMood: string, 
  tension: number
): string {
  if (choice.id === 'comply' && officialMood === 'pleased') {
    const narratives = [
      "The official nods curtly. Behind you, whispers suggest not everyone is so compliant. The bus lurches forward into an uncertain dawn.",
      "Your ticket satisfies the official, but their eyes linger on the mysterious passenger beside you. Something unspoken passes between them.",
      "Compliance grants passage, yet the other passengers exchange glances that speak of deeper currents beneath this routine stop."
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  if (choice.id === 'resist' && tension > 0.7) {
    const narratives = [
      "Your defiance ripples through the bus like a stone through still water. The official's hand moves toward their radio.",
      "Silence stretches taut as your refusal hangs in the air. Other passengers shrink back, leaving you isolated in your resistance.",
      "The official's expression hardens. In the dawn light, you glimpse the weight of authority preparing to descend."
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  return "The choice reverberates through the story in unexpected ways.";
}

function generateMultipleChoiceNarrative(choice: EnhancedChoice, context: StoryContext): string {
  const narratives = {
    'defuse': "Your words cut through the tension like a blade through silk. Slowly, shoulders relax and breathing deepens.",
    'investigate': "The question hangs in the air, pregnant with possibility. Eyes meet across the aisle in silent acknowledgment.",
    'wait': "In stillness, you become a vessel for the story's current, letting it carry you toward unknown shores."
  };
  
  return narratives[choice.id as keyof typeof narratives] || 
    `Your decision to ${choice.text.toLowerCase()} shifts the narrative in profound ways.`;
}

function generateGestureChoiceNarrative(choice: EnhancedChoice, context: StoryContext): string {
  const gestureNarratives = {
    'longPress': "The sustained contact creates an electric moment of understanding.",
    'doubleClick': "The quick, decisive gesture speaks volumes in the language of conspiracy.",
    'swipe': "The fluid motion carries intention like a message in a bottle."
  };
  
  const gestureType = choice.gestureType || 'longPress';
  return gestureNarratives[gestureType] + " Unspoken alliances form in the space between heartbeats.";
}

function generateTimedChoiceNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `The pressure of time distills your instincts into pure action. ${choice.text} — a choice made without the luxury of deliberation, carrying the weight of immediacy.`;
}

function generateConditionalChoiceNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `Your deep understanding of the situation unlocks this moment of possibility. ${choice.text} — a path available only to those who have truly listened to the story's whispers.`;
}

/**
 * Gets available choices for the current story context
 */
export function getAvailableChoices(context: StoryContext): EnhancedChoice[] {
  return generateEnhancedChoices(context);
}

/**
 * Legacy function for backward compatibility
 */
export function generateEnhancedNarrative(
  context: StoryContext,
  choice: 'Y' | 'N'
): string {
  // Convert legacy Y/N to enhanced choice for compatibility
  const legacyChoice: EnhancedChoice = {
    id: choice === 'Y' ? 'comply' : 'resist',
    text: choice === 'Y' ? 'Yes' : 'No',
    type: 'binary',
    difficulty: 'easy',
    emotionalTone: choice === 'Y' ? 'positive' : 'negative',
    isRepeatable: false
  };
  
  return generateEnhancedNarrativeFromChoice(context, legacyChoice);
}

/**
 * Legacy function for backward compatibility  
 */
export function processEnhancedChoice(
  context: StoryContext,
  choice: 'Y' | 'N',
  narrative: string
): StoryContext {
  // Convert legacy Y/N to enhanced choice for compatibility
  const legacyChoice: EnhancedChoice = {
    id: choice === 'Y' ? 'comply' : 'resist',
    text: choice === 'Y' ? 'Yes' : 'No',
    type: 'binary',
    difficulty: 'easy',
    emotionalTone: choice === 'Y' ? 'positive' : 'negative',
    isRepeatable: false
  };
  
  return processEnhancedChoiceSelection(context, legacyChoice, narrative);
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