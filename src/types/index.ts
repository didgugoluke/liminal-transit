// AI Native Types - Foundation
// Core interfaces for AI-driven storytelling platform

export interface StoryContext {
  history: string[];
  currentScene: string;
  choices: Choice[];
  metadata: StoryMetadata;
}

export interface Choice {
  id: string;
  text: string;
  consequence?: string;
  metadata?: ChoiceMetadata;
}

export interface StoryMetadata {
  seed?: string;
  userId?: string;
  sessionId: string;
  startTime: Date;
  lastUpdate: Date;
  completionRate: number;
}

export interface ChoiceMetadata {
  impact: 'low' | 'medium' | 'high';
  category?: string;
  aiConfidence?: number;
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