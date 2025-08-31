// AI Native Types - Foundation
// Core interfaces for AI-driven storytelling platform

export interface StoryContext {
  history: string[];
  currentScene: string;
  choices: Choice[];
  metadata: StoryMetadata;
  
  // Enhanced story intelligence
  characters: Character[];
  worldState: WorldState;
  relationships: Relationship[];
  consequences: Consequence[];
  themes: string[];
}

export interface Character {
  id: string;
  name: string;
  personality: string[];
  memories: Memory[];
  relationships: Record<string, number>; // character_id -> relationship_strength (-1 to 1)
  traits: CharacterTrait[];
  currentMood: string;
  lastSeen: Date;
}

export interface Memory {
  id: string;
  content: string;
  type: 'event' | 'conversation' | 'choice' | 'consequence';
  emotionalWeight: number; // -1 to 1
  timestamp: Date;
  relatedCharacters: string[];
}

export interface CharacterTrait {
  name: string;
  strength: number; // 0-1
  category: 'personality' | 'skill' | 'background' | 'motivation';
}

export interface WorldState {
  location: string;
  timeOfDay: string;
  atmosphere: string;
  tension: number; // 0-1
  mystery: number; // 0-1
  continuity: number; // 0-6 scale for story coherence
  foreshadow: number; // accumulated foreshadowing elements
  playerRole: string[];
}

export interface Relationship {
  id: string;
  character1Id: string;
  character2Id: string;
  type: 'friendship' | 'rivalry' | 'romantic' | 'family' | 'professional' | 'unknown';
  strength: number; // -1 to 1
  history: RelationshipEvent[];
  lastUpdate: Date;
}

export interface RelationshipEvent {
  id: string;
  type: 'interaction' | 'conflict' | 'cooperation' | 'betrayal' | 'support';
  description: string;
  impact: number; // -1 to 1
  timestamp: Date;
}

export interface Consequence {
  id: string;
  choiceId: string;
  description: string;
  impact: 'immediate' | 'short_term' | 'long_term' | 'permanent';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  affectedCharacters: string[];
  worldStateChanges: Partial<WorldState>;
  isRevealed: boolean;
  revealCondition?: string;
}

export interface Choice {
  id: string;
  text: string;
  consequence?: string;
  metadata?: ChoiceMetadata;
  
  // Enhanced choice mechanics
  type: 'binary' | 'multiple' | 'gesture' | 'timed' | 'conditional';
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  requiredTraits?: string[];
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'complex';
  consequencePreview?: string;
  timeLimit?: number; // seconds
  isRepeatable: boolean;
}

export interface StoryMetadata {
  seed?: string;
  userId?: string;
  sessionId: string;
  startTime: Date;
  lastUpdate: Date;
  completionRate: number;
  
  // Enhanced tracking
  choicesMade: number;
  charactersMet: number;
  consequencesRevealed: number;
  storyBranch: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  playerPreferences: PlayerPreferences;
}

export interface PlayerPreferences {
  readingSpeed: 'slow' | 'normal' | 'fast';
  preferredChoiceStyle: 'cautious' | 'bold' | 'unpredictable';
  characterInteractionStyle: 'friendly' | 'neutral' | 'challenging';
  narrativeComplexity: 'simple' | 'moderate' | 'complex';
  themePreferences: string[];
}

export interface ChoiceMetadata {
  impact: 'low' | 'medium' | 'high';
  category?: string;
  aiConfidence?: number;
  
  // Enhanced metadata
  characterReactions?: Record<string, string>; // character_id -> reaction
  worldStateImpact?: Partial<WorldState>;
  unlockConditions?: string[];
  previouslyChosen?: boolean;
  alternativeChoices?: string[];
}

export interface AIProvider {
  name: string;
  generateNarrative(prompt: string, context: StoryContext): Promise<string>;
  generateChoices(context: StoryContext): Promise<Choice[]>;
  isHealthy(): Promise<boolean>;
}

export interface AIResponse {
  content: string;
  provider: string;
  confidence: number;
  tokens: number;
  latency: number;
}

// AI Native Development Types
export interface AgentTask {
  id: string;
  type: 'epic' | 'story' | 'task';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent: string;
  dependencies: string[];
  metadata: Record<string, unknown>;
}

export interface AgentHealth {
  agentId: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
}