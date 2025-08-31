// AI Native Constants - Foundation Configuration
// Configuration for AI-driven platform following AWS Well-Architected principles

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  BEDROCK: 'bedrock',
  ANTHROPIC: 'anthropic',
} as const;

export const STORY_CONFIG = {
  MAX_HISTORY_LENGTH: 50,
  MAX_CHOICE_OPTIONS: 4,
  NARRATIVE_MAX_LENGTH: 500,
  SESSION_TIMEOUT_MINUTES: 30,
} as const;

export const AI_CONFIG = {
  DEFAULT_PROVIDER: AI_PROVIDERS.OPENAI,
  FALLBACK_PROVIDERS: [AI_PROVIDERS.BEDROCK, AI_PROVIDERS.ANTHROPIC],
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,
  TEMPERATURE: 0.7,
  MAX_TOKENS: 150,
} as const;

export const LIMINAL_THEMES = [
  'airport_departure_lounge',
  'train_between_stations', 
  'bus_late_night',
  'hospital_waiting_room',
  'elevator_between_floors',
  'ferry_crossing',
  'subway_platform',
  'parking_garage_stairwell',
] as const;

export const APP_CONFIG = {
  NAME: 'NOVELI.SH',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI Native Interactive Storytelling Platform',
  REPOSITORY: 'https://github.com/didgugoluke/liminal-transit',
  HOMEPAGE: 'https://noveli.sh',
} as const;

export const DEVELOPMENT_CONFIG = {
  VITE_PORT: 5173,
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.NODE_ENV === 'development',
} as const;

// AI Agent Orchestration Constants
export const AGENT_CONFIG = {
  EPIC_BREAKDOWN_AGENT: 'epic-breakdown',
  SCRUM_MASTER_AGENT: 'scrum-master', 
  DEVELOPMENT_AGENT: 'development',
  PROJECT_CLEANUP_AGENT: 'project-cleanup',
  OBSERVATORY_AGENT: 'observatory-monitor',
  HEALTH_CHECK_INTERVAL_MS: 15 * 60 * 1000, // 15 minutes
} as const;

export const GITHUB_CONFIG = {
  PROJECT_ID: 2,
  PROJECT_NAME: 'Noveli',
  RATE_LIMIT_DELAY_MS: 1000,
  MAX_RETRIES: 5,
} as const;