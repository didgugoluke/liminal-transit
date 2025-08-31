// AI Native Types - Enhanced for Story Intelligence
// Core interfaces for AI-driven storytelling platform with persistent characters

export interface StoryContext {
  history: StoryBeat[];
  currentScene: string;
  choices: Choice[];
  metadata: StoryMetadata;
  characters: Character[];
  worldState: WorldState;
  storyArc: StoryArc;
}

export interface StoryBeat {
  id: string;
  narrative: string;
  choice: Choice | null;
  timestamp: Date;
  characters: Character[];
  tension: number; // 0-100 tension level
  location?: Location;
  
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
  personality: PersonalityTraits;
  relationships: Map<string, Relationship>;
  appearance?: string;
  background?: string;
  goals: string[];
  memories: Memory[];
  currentMood: Mood;
  archetypes: string[];
}

export interface PersonalityTraits {
  openness: number; // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // Story-specific traits
  trustworthiness: number;
  curiosity: number;
  bravery: number;
}

export interface Relationship {
  characterId: string;
  trust: number; // -100 to 100
  affection: number;
  respect: number;
  history: string[];
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
  emotion: string;
  importance: number; // 0-100
  timestamp: Date;
  associatedCharacters: string[];
}

export interface Mood {
  dominant: string; // primary emotion
  intensity: number; // 0-100
  influences: string[]; // what's affecting the mood
}

export interface WorldState {
  location: Location;
  timeOfDay: string;
  weather?: string;
  atmosphere: string;
  activeEvents: WorldEvent[];
  artifacts: Artifact[];
  secrets: Secret[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  connectedLocations: string[];
  characters: string[];
  artifacts: string[];
  mood: string;
}

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggeredBy?: string;
  affects: string[]; // character IDs or location IDs
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  significance: string;
  ownedBy?: string;
  location?: string;
}

export interface Secret {
  id: string;
  content: string;
  knownBy: string[]; // character IDs
  importance: number;
  revealed: boolean;
}

export interface StoryArc {
  phase: 'setup' | 'inciting' | 'rising' | 'climax' | 'falling' | 'resolution';
  tension: number; // current tension level 0-100
  themes: string[];
  centralConflict: string;
  completionPercentage: number;
  keyMoments: KeyMoment[];
  pacing: 'slow' | 'medium' | 'fast';
}

export interface KeyMoment {
  id: string;
  description: string;
  phase: string;
  completed: boolean;
  requiredConditions: string[];
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
  metadata: ChoiceMetadata;
  type: ChoiceType;
  preview?: ChoicePreview;
}

export interface ChoiceMetadata {
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'social' | 'action' | 'exploration' | 'moral' | 'strategic';
  aiConfidence: number;
  affectedCharacters: string[];
  tensionChange: number; // -20 to +20
  consequences: ConsequencePreview[];
}

export interface ConsequencePreview {
  type: 'immediate' | 'delayed' | 'ripple';
  description: string;
  probability: number; // 0-100
  severity: 'minor' | 'moderate' | 'major';
}

export type ChoiceType = 
  | 'binary' // Traditional Y/N
  | 'multiple' // 2-4 options
  | 'complex' // Context-sensitive choices
  | 'emotional' // Mood-based responses
  | 'strategic' // Long-term impact choices

export interface ChoicePreview {
  likelyOutcome: string;
  characterReactions: CharacterReaction[];
  storyImpact: string;
  tensionChange: number;
}

export interface CharacterReaction {
  characterId: string;
  reaction: string;
  moodChange: number; // -20 to +20
  relationshipChange: number; // -10 to +10
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
  version: string; // For story system version tracking
  aiModels: AIModelUsage[];
  playerPreferences: PlayerPreferences;
}

export interface AIModelUsage {
  modelName: string;
  usage: number; // token count
  cost: number;
  performance: number; // response time
}

export interface PlayerPreferences {
  preferredPacing: 'slow' | 'medium' | 'fast';
  contentRating: 'family' | 'teen' | 'mature';
  complexityLevel: 'simple' | 'intermediate' | 'advanced';
  themePreferences: string[];
  choiceStyle: 'decisive' | 'thoughtful' | 'exploratory';

  
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
  analyzeCharacter(character: Character, context: StoryContext): Promise<Character>;
  predictConsequences(choice: Choice, context: StoryContext): Promise<ConsequencePreview[]>;
  manageStoryArc(context: StoryContext): Promise<StoryArc>;
  isHealthy(): Promise<boolean>;
}

export interface AIResponse {
  content: string;
  provider: string;
  confidence: number;
  tokens: number;
  latency: number;
  characters?: Character[];
  worldState?: Partial<WorldState>;
  storyArc?: Partial<StoryArc>;
}

// Enhanced AI Native Development Types
export interface AgentTask {
  id: string;
  type: 'epic' | 'story' | 'task';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent: string;
  dependencies: string[];
  metadata: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedComplexity: number; // 1-10
  actualComplexity?: number;
}

export interface AgentHealth {
  agentId: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  metrics: AgentMetrics;
  capabilities: string[];
  currentLoad: number; // 0-100
}

export interface AgentMetrics {
  tasksCompleted: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  qualityScore: number; // 0-100
  resourceEfficiency: number; // 0-100
}