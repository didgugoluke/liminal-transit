# Architecture Document: AI Native NOVELI.SH Platform

## System Overview
NOVELI.SH is built using Clean Architecture principles with strict separation of concerns, designed for 100% AI-driven interactive storytelling with autonomous data management. The system emphasizes maximum testability, modularity, and maintainability with AWS-native infrastructure and AI-governed data architecture.

## Architecture Layers

### Domain Layer (src/lib/)
Pure business logic with no external dependencies focused on AI narrative generation and autonomous data governance.

**Core Modules:**
- `ai-engine.ts` - AI provider abstraction and narrative generation
- `prompt-builder.ts` - Dynamic prompt construction and context management
- `context-manager.ts` - Story context tracking and coherence
- `data-governance.ts` - AI-driven schema evolution and optimization
- `telemetry-tracker.ts` - Comprehensive AI interaction tracking
- `constants.ts` - Application constants and configuration

**Key Functions:**
```typescript
// AI Provider Interface
interface AIProvider {
  generateNarrative(prompt: string, context: StoryContext): Promise<string>;
  validateResponse(response: string): boolean;
  estimateCost(tokens: number): number;
  getModelCapabilities(): ModelCapabilities;
  trackTelemetry(interaction: AIInteraction): Promise<void>;
}

// Autonomous Data Management Interface
interface DataGovernanceAgent {
  analyzeSchemaUsage(): Promise<UsageAnalysis>;
  optimizeIndexes(): Promise<OptimizationResult>;
  evolveSchema(changes: SchemaChange[]): Promise<EvolutionResult>;
  generateDocumentation(): Promise<DataDictionary>;
  enforceCompliance(policies: CompliancePolicy[]): Promise<ComplianceReport>;
}

// Story Context Management
function buildContextualPrompt(history: StoryBeat[], seed: string): string
function manageStoryContext(context: StoryContext, choice: Choice, narrative: string): StoryContext
function seedStoryStart(seedStr: string): StoryContext
function trackDataLineage(operation: DataOperation): Promise<LineageRecord>
```

### Application Layer (src/hooks/)
Orchestrates AI integration, manages application state, handles backend persistence, and coordinates data governance.

**Custom Hooks:**
- `useStoryProgression.ts` - Core story state and AI integration
- `useAIProvider.ts` - Modular AI service management with telemetry
- `useSessionStorage.ts` - Story session persistence with AI optimization
- `useBackendSync.ts` - DynamoDB synchronization and offline capability
- `useAuth.ts` - Cognito authentication with RBAC and user management
- `useStoryHistory.ts` - Story completion tracking and analytics
- `useDataGovernance.ts` - Real-time data health monitoring and optimization
- `useCostGovernance.ts` - AI cost tracking and budget enforcement
- `useTelemetryAnalytics.ts` - Prompt performance analysis and optimization

### Infrastructure Layer (src/lib/providers/)
AI service integrations, AWS infrastructure abstractions, persistent storage, and autonomous data management.

**Responsibilities:**
- AWS Bedrock integration (Claude, Titan models) with cost tracking
- OpenAI and Anthropic API communication with telemetry
- Request routing, load balancing, and intelligent failover
- Error handling with automated recovery and optimization
- Real-time data governance and schema evolution
- Comprehensive AI interaction logging and analysis
## Data Architecture & Management

### AI-Governed Data Model
The platform implements a comprehensive **Level 0 and Level 1 data model** with autonomous AI management:

**Core Data Domains:**
- **User Management** - Complete user lifecycle with AI personalization
- **Storytelling Engine** - Interactive narrative generation and context management  
- **AI Orchestration** - Comprehensive AI lifecycle and telemetry tracking
- **Operational Excellence** - System health, performance, and compliance monitoring
- **AI Agent Management** - Autonomous agent coordination and optimization
- **Security Governance** - Enterprise-grade security and access control

**Autonomous Data Governance:**
```typescript
// AI-managed schema evolution
interface SchemaEvolutionAgent {
  analyzeUsagePatterns(): Promise<UsageAnalysis>;
  optimizeIndexes(): Promise<IndexOptimization>;
  suggestSchemaChanges(): Promise<SchemaChange[]>;
  validateDataIntegrity(): Promise<IntegrityReport>;
  generateDocumentation(): Promise<DataDictionary>;
}

// Real-time data health monitoring
interface DataHealthMonitor {
  trackQueryPerformance(): Promise<PerformanceMetrics>;
  detectAnomalies(): Promise<AnomalyReport>;
  optimizeStorage(): Promise<StorageOptimization>;
  enforceCompliance(): Promise<ComplianceStatus>;
}
```

### Multi-Dimensional Data Architecture
- **Transactional Layer** - Real-time story sessions and user interactions
- **Analytical Layer** - AI telemetry, performance metrics, and business intelligence
- **Archive Layer** - Long-term data retention with intelligent tiering
- **Vector Layer** - Semantic embeddings for AI-driven recommendations
- **Event Store** - Complete audit trail with event sourcing patterns

## Infrastructure Layer
*AWS-native services with Well-Architected compliance and AI optimization*

### Core AWS Services
- **Amazon RDS (PostgreSQL)** - Primary database with Multi-AZ deployment
- **Amazon DynamoDB** - Session management and real-time interactions  
- **AWS Lambda** - Serverless compute with AI orchestration
- **Amazon API Gateway** - RESTful API with automated scaling
- **Amazon EventBridge** - Event-driven architecture coordination
- **Amazon S3** - Static assets and data archival with intelligent tiering
- **Amazon CloudFront** - Global CDN with edge computing capabilities
- **AWS WAF** - Web application firewall with AI threat detection

### AI Infrastructure Services
- **Amazon Bedrock** - Foundation models with cost optimization
- **Amazon SageMaker** - Custom AI model training and deployment
- **Amazon Comprehend** - Natural language processing and sentiment analysis
- **Amazon Pinpoint** - Personalized user engagement and analytics
- **AWS X-Ray** - Distributed tracing and AI performance monitoring
- **Amazon CloudWatch** - Comprehensive monitoring with AI insights

### Data Infrastructure
```typescript
// Autonomous infrastructure scaling
interface InfrastructureAgent {
  analyzeTrafficPatterns(): Promise<TrafficAnalysis>;
  optimizeResourceAllocation(): Promise<ResourceOptimization>;
  predictScalingNeeds(): Promise<ScalingPrediction>;
  manageCostEfficiency(): Promise<CostOptimization>;
  ensureCompliance(): Promise<ComplianceValidation>;
}

// Data lifecycle management
interface DataLifecycleManager {
  implementTieringPolicies(): Promise<TieringResult>;
  manageRetentionPolicies(): Promise<RetentionResult>;
  optimizeStorageCosts(): Promise<StorageOptimization>;
  enforceDataGovernance(): Promise<GovernanceResult>;
}
```

### Autonomous Operations
- **Self-Healing Systems** - Automated recovery and failover
- **Predictive Scaling** - AI-driven resource optimization
- **Cost Governance** - Real-time spend optimization and alerts
- **Security Automation** - Continuous compliance and threat response
- **Performance Optimization** - Autonomous query and infrastructure tuning

### Enterprise Compliance Infrastructure
- **Multi-Tenant Isolation** - Row-level security with automatic tenant separation
- **Encryption at Rest/Transit** - AWS KMS integration with key rotation
- **Audit Trail Management** - Complete event sourcing with tamper-proof logs
- **Backup and Recovery** - Automated point-in-time recovery with cross-region replication
- **Disaster Recovery** - Multi-AZ deployment with RTO/RPO guarantees

### Presentation Layer (src/components/)
UI components focused on clean, accessible interactive storytelling.

**Component Structure:**
```
components/
├── ui/              # Reusable base components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── index.ts     # Barrel exports
├── story/           # Story-specific components
│   ├── StoryInterface.tsx
│   ├── NarrativeDisplay.tsx
│   ├── ChoiceButtons.tsx
│   ├── StoryProgress.tsx
│   └── StorySave.tsx
├── auth/            # Authentication components
│   ├── LoginForm.tsx
│   ├── UserProfile.tsx
│   └── AuthGuard.tsx
└── layout/          # Layout components
    ├── ErrorBoundary.tsx
    └── AppLayout.tsx
```

## Data Flow

### AI-Driven State Management
```
Seed Input → Story Context Creation → AI Prompt Generation
                                    ↓
User Choice → Context Update → AI Narrative Generation → DynamoDB Persistence
                              ↓                          ↓
Quality Validation → UI Update → Next Choice Presentation → Session Storage
```

### AI Provider Failover
```
Primary AI (Bedrock) → Request Processing → Response Validation
        ↓ (if fails)          ↓ (if invalid)
Secondary AI (OpenAI) → Fallback Processing → Quality Check
        ↓ (if fails)          ↓ (if invalid)
Tertiary AI (Claude) → Final Attempt → Error Handling
```

## Component Design Patterns

### AI-First Composition Pattern
```typescript
// AI-driven story interface
<StoryInterface>
  <NarrativeDisplay 
    narrative={currentNarrative} 
    isGenerating={isAIProcessing} 
  />
  <ChoiceButtons 
    onChoice={handleChoice} 
    disabled={isAIProcessing} 
  />
  <StoryProgress 
    context={storyContext} 
    provider={currentAIProvider} 
  />
</StoryInterface>
```

### AI Provider Interface Pattern
```typescript
interface AIProviderProps {
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  fallbackProviders: AIProvider[];
  onError: (error: AIError) => void;
  persistenceEnabled: boolean;
}

const AIProviderManager: React.FC<AIProviderProps> = ({
  provider,
  onProviderChange,
  fallbackProviders,
  onError,
  persistenceEnabled
}) => {
  // Provider management and persistence implementation
};
```

### Story State Management Pattern
```typescript
interface StoryState {
  context: StoryContext;
  narrative: string;
  isGenerating: boolean;
  currentProvider: AIProvider;
  error: AIError | null;
  sessionId: string;
  userId?: string;
  isSyncing: boolean;
  lastSaved: Date | null;
}

function useStoryProgression(initialSeed: string) {
  const [state, setState] = useState<StoryState>(() => 
    initializeStoryState(initialSeed)
  );
  
  const { syncToBackend, loadFromBackend } = useBackendSync();
  
  const makeChoice = useCallback(async (choice: 'Y' | 'N') => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const narrative = await generateNarrative(
        buildContextualPrompt(state.context.history, choice),
        state.context
      );
      
      const newState = {
        ...state,
        narrative,
        context: manageStoryContext(state.context, choice, narrative),
        isGenerating: false,
        error: null
      };
      
      setState(newState);
      
      // Sync to backend if user is authenticated
      if (newState.userId) {
        await syncToBackend(newState);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error as AIError 
      }));
    }
  }, [state.context, syncToBackend]);
  
  const resetStory = useCallback((newSeed?: string) => {
    setState(initializeStoryState(newSeed || generateRandomSeed()));
  }, []);
  
  return { state, makeChoice, resetStory };
}
```

## Testing Strategy

### Unit Tests (src/__tests__/unit/)
Test pure functions in isolation.

```typescript
describe('mulberry32', () => {
  it('produces deterministic sequences', () => {
    const rng1 = mulberry32(123);
    const rng2 = mulberry32(123);
    
    expect([rng1(), rng1(), rng1()]).toEqual([rng2(), rng2(), rng2()]);
  });
});
```

### Integration Tests (src/__tests__/integration/)
Test component interactions and API integrations.

```typescript
describe('GPT Integration', () => {
  it('falls back to offline mode on API failure', async () => {
    mockGPTAPI.mockRejectedValue(new Error('API Error'));
    
    const result = await processChoice(world, 'Y');
    
    expect(result).toMatch(/\(Y\/N\)$/);
  });
});
```

### Component Tests (src/__tests__/components/)
Test UI behavior and user interactions.

```typescript
describe('SetupScreen', () => {
  it('enables GPT button when valid key entered', () => {
    render(<SetupScreen onContinue={jest.fn()} onOffline={jest.fn()} />);
    
    fireEvent.change(screen.getByLabelText(/api key/i), {
      target: { value: 'sk-valid-key-12345' }
    });
    
    expect(screen.getByText('Use GPT')).not.toBeDisabled();
  });
});
```

## Performance Considerations

### Bundle Optimization
- Code splitting at route level
- Lazy loading for non-critical components
- Tree shaking for unused exports
- Dynamic imports for heavy dependencies

### Runtime Performance
- React.memo for expensive renders
- useMemo for expensive calculations
- useCallback for stable references
- Virtual scrolling for long logs (if needed)

### Memory Management
- Cleanup event listeners in useEffect
- Abort fetch requests on component unmount
- Limit log history to reasonable size
- Optimize re-renders with dependency arrays

## Security Implementation

### API Key Management
```typescript
// Secure key storage
const API_KEY_STORAGE_KEY = 'liminal_transit_api_key';

function storeAPIKey(key: string): void {
  if (validateAPIKey(key)) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }
}

function getAPIKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}
```

### Input Validation
```typescript
function validateSeed(seed: string): boolean {
  return /^[a-zA-Z0-9-_]{1,50}$/.test(seed);
}

function sanitizeUserInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
```

### Production Build
```dockerfile
# Multi-stage production build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
```

## Monitoring and Observability

### Error Tracking
- Component error boundaries
- Global error handlers
- API error logging
- Performance monitoring

### Analytics (Privacy-Focused)
- Choice distribution analysis
- Session duration tracking
- Offline/online mode usage
- Performance metrics

### Health Checks
- Bundle size monitoring
- Core Web Vitals tracking
- API response time alerts
- Dependency vulnerability scans
