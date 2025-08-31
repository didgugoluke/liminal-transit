// AI Native Utilities - Enhanced for Story Intelligence
// Core utilities supporting persistent characters and world state

import { StoryContext, AIResponse, Character, WorldState, StoryArc, StoryBeat } from '../../types';
import { STORY_CONFIG, LIMINAL_THEMES } from '../constants';

/**
 * Generate a random seed for story initialization
 */
export function generateStorySeed(): string {
  const theme = LIMINAL_THEMES[Math.floor(Math.random() * LIMINAL_THEMES.length)];
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${theme}_${timestamp}_${random}`;
}

/**
 * Create enhanced initial story context with story intelligence
 */
export function createInitialStoryContext(seed?: string): StoryContext {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const storySeed = seed || generateStorySeed();
  
  return {
    history: [],
    currentScene: '',
    choices: [],
    characters: [],
    worldState: createInitialWorldState(storySeed),
    storyArc: createInitialStoryArc(storySeed),
    metadata: {
      seed: storySeed,
      sessionId,
      startTime: now,
      lastUpdate: now,
      completionRate: 0,
      version: '2.0.0',
      aiModels: [],
      playerPreferences: {
        preferredPacing: 'medium',
        contentRating: 'teen',
        complexityLevel: 'intermediate',
        themePreferences: [],
        choiceStyle: 'thoughtful'
      }
    },
  };
}

/**
 * Create initial world state from seed
 */
function createInitialWorldState(seed: string): WorldState {
  const theme = seed.split('_')[0] || 'liminal_space';
  
  return {
    location: {
      id: 'initial_location',
      name: getLocationNameFromTheme(theme),
      description: getLocationDescriptionFromTheme(theme),
      atmosphere: 'expectant',
      connectedLocations: [],
      characters: [],
      artifacts: [],
      mood: 'neutral'
    },
    timeOfDay: getTimeFromSeed(seed),
    weather: getWeatherFromSeed(seed),
    atmosphere: 'liminal uncertainty',
    activeEvents: [],
    artifacts: [],
    secrets: []
  };
}

/**
 * Create initial story arc from seed
 */
function createInitialStoryArc(seed: string): StoryArc {
  const theme = seed.split('_')[0] || 'liminal_space';
  
  return {
    phase: 'setup',
    tension: 10 + (seedHash(seed) % 20), // 10-30 initial tension
    themes: getThemesFromSeed(theme),
    centralConflict: getCentralConflictFromTheme(theme),
    completionPercentage: 0,
    keyMoments: [],
    pacing: 'medium'
  };
}

/**
 * Enhanced story context validation
 */
export function validateStoryContext(context: StoryContext): boolean {
  if (!context.metadata?.sessionId) return false;
  if (context.history.length > STORY_CONFIG.MAX_HISTORY_LENGTH) return false;
  if (context.choices.length > STORY_CONFIG.MAX_CHOICE_OPTIONS) return false;
  if (context.characters.length > 20) return false; // Reasonable character limit
  if (!context.worldState || !context.storyArc) return false;
  return true;
}

/**
 * Enhanced completion rate calculation considering story arc
 */
export function calculateCompletionRate(context: StoryContext): number {
  const baseCompletion = calculateBasicCompletion(context.history.length);
  const arcCompletion = context.storyArc?.completionPercentage || 0;
  const characterDevelopment = calculateCharacterDevelopmentScore(context.characters);
  
  // Weighted average: 40% basic, 40% arc, 20% character development
  return Math.min(100, 
    (baseCompletion * 0.4) + (arcCompletion * 0.4) + (characterDevelopment * 0.2)
  );
}

/**
 * Calculate basic completion based on interaction count
 */
function calculateBasicCompletion(historyLength: number): number {
  const minInteractions = 5;
  const maxInteractions = 20;
  
  if (historyLength <= minInteractions) return (historyLength / minInteractions) * 50;
  return Math.min(50 + ((historyLength - minInteractions) / (maxInteractions - minInteractions)) * 50, 100);
}

/**
 * Calculate character development score
 */
function calculateCharacterDevelopmentScore(characters: Character[]): number {
  if (characters.length === 0) return 0;
  
  const totalDevelopment = characters.reduce((sum, char) => {
    const memoryScore = Math.min(100, char.memories.length * 10);
    const relationshipScore = char.relationships.size * 15;
    return sum + memoryScore + relationshipScore;
  }, 0);
  
  return Math.min(100, totalDevelopment / characters.length);
}

/**
 * Enhanced AI response formatting
 */
export function formatAIResponse(
  content: string,
  provider: string,
  metrics: { tokens: number; latency: number; confidence?: number },
  enhancedData?: { characters?: Character[]; worldState?: Partial<WorldState>; storyArc?: Partial<StoryArc> }
): AIResponse {
  return {
    content: content.trim(),
    provider,
    confidence: metrics.confidence || 0.8,
    tokens: metrics.tokens,
    latency: metrics.latency,
    ...(enhancedData?.characters && { characters: enhancedData.characters }),
    ...(enhancedData?.worldState && { worldState: enhancedData.worldState }),
    ...(enhancedData?.storyArc && { storyArc: enhancedData.storyArc })
  };
}

/**
 * Enhanced contextual prompt building with character awareness
 */
export function buildContextualPrompt(context: StoryContext, userChoice?: string): string {
  const { history, metadata, characters, worldState, storyArc } = context;
  const theme = metadata.seed?.split('_')[0] || 'liminal_space';
  
  let prompt = `Theme: ${theme}\n`;
  prompt += `Story Phase: ${storyArc?.phase || 'setup'}\n`;
  prompt += `Tension Level: ${storyArc?.tension || 10}/100\n`;
  
  // Add character context
  if (characters.length > 0) {
    prompt += `\nActive Characters:\n`;
    characters.forEach(char => {
      prompt += `- ${char.name}: ${char.currentMood.dominant} mood, ${char.archetypes.join(', ')}\n`;
    });
  }
  
  // Add world context
  if (worldState) {
    prompt += `\nLocation: ${worldState.location.name} (${worldState.atmosphere})\n`;
    prompt += `Time: ${worldState.timeOfDay}\n`;
  }
  
  if (history.length === 0) {
    prompt += `\nCreate an opening scene for an interactive story set in a ${theme.replace('_', ' ')}. `;
    prompt += `Introduce the setting and initial tension. Write 1-2 sentences maximum.`;
  } else {
    const recentBeats = history.slice(-3);
    prompt += `\nRecent Story:\n`;
    recentBeats.forEach((beat) => {
      if (typeof beat === 'string') {
        prompt += `${beat}\n`;
      } else if ('narrative' in beat) {
        prompt += `${beat.narrative}\n`;
      }
    });
    
    if (userChoice) {
      prompt += `\nUser chose: "${userChoice}"\n`;
    }
    
    prompt += `\nContinue the story with 1-2 sentences. Maintain liminal atmosphere and character consistency.`;
  }
  
  return prompt;
}

/**
 * Create story beat from narrative and choice
 */
export function createStoryBeat(
  narrative: string, 
  choice: any, 
  characters: Character[], 
  tension: number
): StoryBeat {
  return {
    id: `beat_${Date.now()}`,
    narrative,
    choice,
    timestamp: new Date(),
    characters,
    tension
  };
}

/**
 * Analyze narrative text for emotional content
 */
export function analyzeEmotionalTone(text: string): { 
  primary: string; 
  intensity: number; 
  emotions: { [key: string]: number } 
} {
  const emotionKeywords = {
    fear: ['danger', 'threat', 'afraid', 'terror', 'dark', 'shadow'],
    joy: ['beautiful', 'wonderful', 'happy', 'delight', 'bright', 'warm'],
    sadness: ['loss', 'empty', 'alone', 'grief', 'cold', 'distant'],
    surprise: ['sudden', 'unexpected', 'amazing', 'shock', 'gasp'],
    anger: ['rage', 'fury', 'mad', 'hostile', 'aggressive'],
    anticipation: ['waiting', 'expect', 'soon', 'ready', 'prepare']
  };

  const emotions: { [key: string]: number } = {};
  const words = text.toLowerCase().split(/\s+/);
  
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
    emotions[emotion] = matches;
  });

  const totalMatches = Object.values(emotions).reduce((sum, count) => sum + count, 0);
  const emotionEntries = Object.entries(emotions);
  const primaryEntry = emotionEntries.reduce((a, b) => (emotions[a[0]] > emotions[b[0]]) ? a : b);
  const primary = primaryEntry[0] || 'neutral';
  const intensity = Math.min(100, (totalMatches / words.length) * 1000);

  return { primary, intensity, emotions };
}

/**
 * Sanitize user input for AI prompts (enhanced)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 500) // Increased limit for richer inputs
    // Remove potential HTML/script tags
    .replace(/<.*?script.*?>.*?<\/.*?script.*?>/gi, '')
    .replace(/[<>]/g, '')
    // Remove common SQL injection patterns
    .replace(/(--|;|\/\*|\*\/|xp_)/gi, '')
    // Remove common prompt injection patterns
    .replace(/(###|---|<<|>>|{{|}}|\[.*?\]\(.*?\))/g, '')
    // Remove javascript: and data: URIs
    .replace(/(javascript:|data:)/gi, '')
    // Remove any remaining suspicious curly braces or brackets
    .replace(/[\{\}\[\]]/g, '')
    // Normalize whitespace
    .replace(/\n\n+/g, '\n');
}

/**
 * Error boundary helper for AI operations (enhanced)
 */
export function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string,
  retries: number = 0
): Promise<T> {
  return operation().catch(async (error) => {
    console.error(`AI Operation failed${context ? ` in ${context}` : ''}:`, error);
    
    if (retries > 0 && isRetryableError(error)) {
      await delay(1000 * (3 - retries)); // Exponential backoff
      return withErrorHandling(operation, fallback, context, retries - 1);
    }
    
    return fallback;
  });
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  const retryableMessages = ['timeout', 'network', 'rate limit', 'service unavailable'];
  const errorMessage = error.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced debounce function for AI calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;
  let pendingPromise: { resolve: (value: ReturnType<T>) => void; reject: (reason?: any) => void } | null = null;
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeout) {
      clearTimeout(timeout);
    }
    if (pendingPromise) {
      pendingPromise.reject(new Error('Debounced call superseded by a new call.'));
    }
    return new Promise<ReturnType<T>>((resolve, reject) => {
      pendingPromise = { resolve, reject };
      timeout = setTimeout(() => {
        try {
          const result = func(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          pendingPromise = null;
        }
      }, wait);
    });
  };
}

// Helper functions for seed-based generation

function getLocationNameFromTheme(theme: string): string {
  const locations = {
    'bus': 'Transit Terminal',
    'train': 'Railway Station',
    'airport': 'Departure Lounge',
    'hospital': 'Waiting Room',
    'queue': 'The Line'
  };
  return locations[theme as keyof typeof locations] || 'Liminal Space';
}

function getLocationDescriptionFromTheme(theme: string): string {
  const descriptions = {
    'bus': 'A dimly lit terminal where journeys begin and end',
    'train': 'Platform of arrivals and departures, thick with anticipation',
    'airport': 'Glass and steel sanctuary between destinations',
    'hospital': 'Sterile space where time moves differently',
    'queue': 'An orderly line that stretches into uncertainty'
  };
  return descriptions[theme as keyof typeof descriptions] || 'A space between spaces';
}

function getTimeFromSeed(seed: string): string {
  const times = ['pre-dawn', 'dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night'];
  const selectedTime = times[seedHash(seed) % times.length];
  return selectedTime || 'dawn';
}

function getWeatherFromSeed(seed: string): string {
  const weather = ['clear', 'cloudy', 'overcast', 'misty', 'windy', 'humid'];
  const selectedWeather = weather[seedHash(seed) % weather.length];
  return selectedWeather || 'clear';
}

function getThemesFromSeed(theme: string): string[] {
  const themeMap = {
    'bus': ['journey', 'transition', 'community'],
    'train': ['momentum', 'destination', 'rhythm'],
    'airport': ['departure', 'distance', 'anticipation'],
    'hospital': ['healing', 'waiting', 'uncertainty'],
    'queue': ['patience', 'order', 'belonging']
  };
  return themeMap[theme as keyof typeof themeMap] || ['journey', 'change'];
}

function getCentralConflictFromTheme(theme: string): string {
  const conflicts = {
    'bus': 'Finding your way in an unfamiliar route',
    'train': 'Reaching your destination before time runs out',
    'airport': 'Navigating between departure and arrival',
    'hospital': 'Confronting uncertainty while waiting',
    'queue': 'Maintaining your place while questioning the wait'
  };
  return conflicts[theme as keyof typeof conflicts] || 'Navigating the unknown';
}

function seedHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}