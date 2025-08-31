// Enhanced Choice Mechanics - Rich Interaction System
// Advanced choice types with gesture support, timing, and consequence previews

import { Choice, StoryContext, Character } from '../types';

export type ChoiceType = 'binary' | 'multiple' | 'gesture' | 'timed' | 'conditional';

export interface EnhancedChoice extends Choice {
  type: ChoiceType;
  subChoices?: Choice[];
  gestureType?: 'swipe' | 'longPress' | 'doubleClick';
  timeLimit?: number;
  conditions?: ChoiceCondition[];
  preview?: string;
  characterReactions?: Record<string, CharacterReaction>;
}

export interface ChoiceCondition {
  type: 'character_mood' | 'world_state' | 'previous_choice' | 'relationship';
  target: string;
  value: string | number;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

export interface CharacterReaction {
  immediate: string;
  delayed?: string;
  moodChange: number; // -1 to 1
  relationshipImpact: number; // -1 to 1
}

/**
 * Generates enhanced choice options based on story context
 */
export function generateEnhancedChoices(context: StoryContext): EnhancedChoice[] {
  const { worldState, characters, metadata } = context;
  const choicesMade = metadata.choicesMade;
  
  // Early game: Simple binary choices
  if (choicesMade < 2) {
    return [
      {
        id: 'comply',
        text: 'Yes',
        type: 'binary',
        difficulty: 'easy',
        emotionalTone: 'positive',
        isRepeatable: false,
        characterReactions: {
          'bus_official': {
            immediate: 'nods approvingly',
            moodChange: 0.3,
            relationshipImpact: 0.2
          },
          'mysterious_passenger': {
            immediate: 'observes quietly',
            moodChange: 0,
            relationshipImpact: -0.1
          }
        }
      },
      {
        id: 'resist',
        text: 'No',
        type: 'binary',
        difficulty: 'medium',
        emotionalTone: 'negative',
        isRepeatable: false,
        characterReactions: {
          'bus_official': {
            immediate: 'frowns disapprovingly',
            moodChange: -0.4,
            relationshipImpact: -0.3
          },
          'mysterious_passenger': {
            immediate: 'leans forward with interest',
            moodChange: 0.2,
            relationshipImpact: 0.2
          }
        }
      }
    ];
  }
  
  // Mid game: Contextual multiple choices
  if (choicesMade < 5) {
    return generateContextualChoices(context);
  }
  
  // Late game: Complex conditional choices
  return generateConditionalChoices(context);
}

/**
 * Generates contextual multiple choice options
 */
function generateContextualChoices(context: StoryContext): EnhancedChoice[] {
  const { worldState, characters } = context;
  const choices: EnhancedChoice[] = [];
  
  // Base on world tension level
  if (worldState.tension > 0.7) {
    choices.push({
      id: 'defuse',
      text: 'Try to defuse the tension',
      type: 'multiple',
      difficulty: 'hard',
      emotionalTone: 'positive',
      isRepeatable: false,
      preview: 'Attempt to calm the situation with words',
      conditions: [{
        type: 'character_mood',
        target: 'bus_official',
        value: 'irritated',
        operator: 'equals'
      }]
    });
  }
  
  if (worldState.mystery > 0.6) {
    choices.push({
      id: 'investigate',
      text: 'Ask about the real purpose of this journey',
      type: 'multiple',
      difficulty: 'medium',
      emotionalTone: 'complex',
      isRepeatable: false,
      preview: 'Seek answers to the growing questions',
      characterReactions: {
        'mysterious_passenger': {
          immediate: 'exchanges a meaningful glance',
          moodChange: 0.1,
          relationshipImpact: 0.3
        }
      }
    });
  }
  
  // Always include a safe option
  choices.push({
    id: 'wait',
    text: 'Remain silent and observe',
    type: 'multiple',
    difficulty: 'easy',
    emotionalTone: 'neutral',
    isRepeatable: true,
    preview: 'Let events unfold naturally'
  });
  
  return choices;
}

/**
 * Generates complex conditional choices for experienced players
 */
function generateConditionalChoices(context: StoryContext): EnhancedChoice[] {
  const { characters, relationships, consequences } = context;
  const choices: EnhancedChoice[] = [];
  
  // Character-based choices
  const officialMood = characters.find(c => c.id === 'bus_official')?.currentMood;
  const passengerMood = characters.find(c => c.id === 'mysterious_passenger')?.currentMood;
  
  if (officialMood === 'irritated' && passengerMood === 'intrigued') {
    choices.push({
      id: 'ally_with_passenger',
      text: 'Signal to the mysterious passenger',
      type: 'gesture',
      gestureType: 'longPress',
      difficulty: 'hard',
      emotionalTone: 'complex',
      isRepeatable: false,
      preview: 'Form an unspoken alliance against authority',
      conditions: [{
        type: 'relationship',
        target: 'mysterious_passenger',
        value: 0.1,
        operator: 'greater'
      }],
      characterReactions: {
        'mysterious_passenger': {
          immediate: 'responds with a subtle nod',
          moodChange: 0.3,
          relationshipImpact: 0.5
        },
        'bus_official': {
          immediate: 'notices the exchange suspiciously',
          moodChange: -0.2,
          relationshipImpact: -0.3
        }
      }
    });
  }
  
  // Consequence-based choices
  if (consequences.some(c => !c.isRevealed)) {
    choices.push({
      id: 'confront_past',
      text: 'Address the consequences of your previous actions',
      type: 'timed',
      timeLimit: 10,
      difficulty: 'hard',
      emotionalTone: 'complex',
      isRepeatable: false,
      preview: 'Face the weight of your choices'
    });
  }
  
  return choices;
}

/**
 * Evaluates if a choice is available based on conditions
 */
export function isChoiceAvailable(choice: EnhancedChoice, context: StoryContext): boolean {
  if (!choice.conditions) return true;
  
  return choice.conditions.every(condition => {
    switch (condition.type) {
      case 'character_mood':
        const character = context.characters.find(c => c.id === condition.target);
        return character && character.currentMood === condition.value;
        
      case 'world_state':
        const stateValue = (context.worldState as any)[condition.target];
        return evaluateCondition(stateValue, condition.value, condition.operator);
        
      case 'relationship':
        const relationship = context.relationships.find(r => 
          r.character1Id === condition.target || r.character2Id === condition.target
        );
        return relationship && evaluateCondition(relationship.strength, condition.value, condition.operator);
        
      default:
        return true;
    }
  });
}

/**
 * Helper function to evaluate conditions
 */
function evaluateCondition(actual: any, expected: any, operator: string): boolean {
  switch (operator) {
    case 'equals': return actual === expected;
    case 'greater': return actual > expected;
    case 'less': return actual < expected;
    case 'contains': return String(actual).includes(String(expected));
    default: return false;
  }
}

/**
 * Processes an enhanced choice and returns the narrative outcome
 */
export function processEnhancedChoice(
  choice: EnhancedChoice,
  context: StoryContext
): { narrative: string; updatedContext: StoryContext } {
  let narrative = '';
  const updatedContext = { ...context };
  
  // Generate narrative based on choice type and character reactions
  switch (choice.type) {
    case 'binary':
      narrative = generateBinaryNarrative(choice, context);
      break;
      
    case 'multiple':
      narrative = generateMultipleChoiceNarrative(choice, context);
      break;
      
    case 'gesture':
      narrative = generateGestureNarrative(choice, context);
      break;
      
    case 'timed':
      narrative = generateTimedNarrative(choice, context);
      break;
      
    case 'conditional':
      narrative = generateConditionalNarrative(choice, context);
      break;
  }
  
  // Apply character reactions
  if (choice.characterReactions) {
    updatedContext.characters = context.characters.map(character => {
      const reaction = choice.characterReactions![character.id];
      if (reaction) {
        // Update character mood based on reaction
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
          currentMood: newMood
        };
      }
      return character;
    });
  }
  
  return { narrative, updatedContext };
}

/**
 * Generate narrative for different choice types
 */
function generateBinaryNarrative(choice: EnhancedChoice, context: StoryContext): string {
  const baseNarratives = {
    'comply': [
      "Your compliance creates a moment of calm, but tension still lingers in the air.",
      "The official accepts your cooperation, though other passengers watch with knowing looks.",
      "Agreement comes easily, yet something deeper stirs beneath the surface."
    ],
    'resist': [
      "Your defiance sends ripples through the cramped space of the bus.",
      "Resistance sparks something unexpected in the watching eyes around you.",
      "Your refusal hangs heavy, changing the very atmosphere of the journey."
    ]
  };
  
  const narratives = baseNarratives[choice.id as keyof typeof baseNarratives] || 
    ["The choice reverberates through the story in unexpected ways."];
  
  return narratives[Math.floor(Math.random() * narratives.length)];
}

function generateMultipleChoiceNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `Your decision to ${choice.text.toLowerCase()} shifts the narrative in profound ways. ${choice.preview || 'The consequences unfold gradually.'}`;
}

function generateGestureNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `The subtle ${choice.gestureType} creates an unspoken understanding. Communication happens beyond words.`;
}

function generateTimedNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `The urgency of the moment demands quick thinking. Your rapid decision carries the weight of instinct over deliberation.`;
}

function generateConditionalNarrative(choice: EnhancedChoice, context: StoryContext): string {
  return `The complex circumstances allow for this unique approach. Your understanding of the situation opens new possibilities.`;
}