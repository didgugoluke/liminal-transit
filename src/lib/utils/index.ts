// AI Native Utilities - Foundation Helper Functions
// Core utilities following AI Native development patterns

import { StoryContext, AIResponse } from '../../types';
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
 * Create initial story context
 */
export function createInitialStoryContext(seed?: string): StoryContext {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  
  return {
    history: [],
    currentScene: '',
    choices: [],
    metadata: {
      seed: seed || generateStorySeed(),
      sessionId,
      startTime: now,
      lastUpdate: now,
      completionRate: 0,
    },
  };
}

/**
 * Validate story context integrity
 */
export function validateStoryContext(context: StoryContext): boolean {
  if (!context.metadata?.sessionId) return false;
  if (context.history.length > STORY_CONFIG.MAX_HISTORY_LENGTH) return false;
  if (context.choices.length > STORY_CONFIG.MAX_CHOICE_OPTIONS) return false;
  return true;
}

/**
 * Calculate story progression percentage
 */
export function calculateCompletionRate(context: StoryContext): number {
  const minInteractions = 5;
  const maxInteractions = 20;
  const interactions = context.history.length;
  
  if (interactions <= minInteractions) return (interactions / minInteractions) * 50;
  return Math.min(50 + ((interactions - minInteractions) / (maxInteractions - minInteractions)) * 50, 100);
}

/**
 * Format AI response for consistency
 */
export function formatAIResponse(
  content: string,
  provider: string,
  metrics: { tokens: number; latency: number; confidence?: number }
): AIResponse {
  return {
    content: content.trim(),
    provider,
    confidence: metrics.confidence || 0.8,
    tokens: metrics.tokens,
    latency: metrics.latency,
  };
}

/**
 * Sanitize user input for AI prompts
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 200) // Limit length
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
 * Generate contextual prompt for AI
 */
export function buildContextualPrompt(context: StoryContext, userChoice?: string): string {
  const { history, metadata } = context;
  const theme = metadata.seed?.split('_')[0] || 'liminal_space';
  
  let prompt = `Theme: ${theme}\n`;
  
  if (history.length === 0) {
    prompt += `Create an opening scene for an interactive story set in a ${theme.replace('_', ' ')}. `;
    prompt += `Write 1-2 sentences maximum. Create atmosphere and intrigue.`;
  } else {
    const recentHistory = history.slice(-3).join('\n');
    prompt += `Previous narrative:\n${recentHistory}\n\n`;
    
    if (userChoice) {
      prompt += `User chose: "${userChoice}"\n\n`;
    }
    
    prompt += `Continue the story with 1-2 sentences. Maintain the liminal, transitional atmosphere.`;
  }
  
  return prompt;
}

/**
 * Error boundary helper for AI operations
 */
export function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  return operation().catch((error) => {
    console.error(`AI Operation failed${context ? ` in ${context}` : ''}:`, error);
    return fallback;
  });
}

/**
 * Debounce function for AI calls
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
      // If a previous promise is pending, reject it as it's being superseded
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