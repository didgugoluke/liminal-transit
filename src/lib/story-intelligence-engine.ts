// Enhanced Story Intelligence Engine
// Persistent character system with AI-driven personality development

import { 
  StoryContext, 
  Character, 
  WorldState, 
  StoryArc, 
  Choice,
  ChoiceType,
  PersonalityTraits,
  Memory,
  StoryBeat,
  Location,
  ChoicePreview,
  CharacterReaction
} from '../types';

export class StoryIntelligenceEngine {
  private characters: Map<string, Character> = new Map();
  private worldState: WorldState;
  private storyArc: StoryArc;

  constructor(seed: string) {
    this.initializeStoryWorld(seed);
  }

  /**
   * Initialize the story world with persistent characters and state
   */
  private initializeStoryWorld(seed: string): void {
    // Generate initial characters based on seed
    this.characters = this.generateInitialCharacters(seed);
    
    // Set up world state
    this.worldState = this.createInitialWorldState(seed);
    
    // Initialize story arc
    this.storyArc = this.createInitialStoryArc(seed);
  }

  /**
   * Generate persistent characters with unique personalities
   */
  private generateInitialCharacters(seed: string): Map<string, Character> {
    const characters = new Map<string, Character>();
    
    // Generate 3-5 core characters that will persist throughout the story
    const characterTemplates = this.getCharacterTemplatesFromSeed(seed);
    
    characterTemplates.forEach((template, index) => {
      const character: Character = {
        id: `char_${index}_${seed.slice(-4)}`,
        name: template.name,
        personality: this.generatePersonalityTraits(seed, index),
        relationships: new Map(),
        appearance: template.appearance,
        background: template.background,
        goals: template.goals,
        memories: [],
        currentMood: {
          dominant: template.initialMood,
          intensity: 50 + (this.seedRandom(seed, index) * 30),
          influences: ['story_beginning']
        },
        archetypes: template.archetypes
      };
      
      characters.set(character.id, character);
    });

    // Establish initial relationships between characters
    this.establishInitialRelationships(characters, seed);
    
    return characters;
  }

  /**
   * Create dynamic choice system beyond binary Y/N
   */
  public generateEnhancedChoices(context: StoryContext): Choice[] {
    const currentTension = this.storyArc.tension;
    const activeCharacters = this.getActiveCharacters(context);
    
    // Determine choice type based on story context
    const choiceType = this.determineChoiceType(context, currentTension);
    
    switch (choiceType) {
      case 'binary':
        return this.generateBinaryChoices(context, activeCharacters);
        
      case 'multiple':
        return this.generateMultipleChoices(context, activeCharacters);
        
      case 'complex':
        return this.generateComplexChoices(context, activeCharacters);
        
      case 'emotional':
        return this.generateEmotionalChoices(context, activeCharacters);
        
      case 'strategic':
        return this.generateStrategicChoices(context, activeCharacters);
        
      default:
        return this.generateBinaryChoices(context, activeCharacters);
    }
  }

  /**
   * Generate choice previews showing potential consequences
   */
  public generateChoicePreview(choice: Choice, context: StoryContext): ChoicePreview {
    const affectedCharacters = choice.metadata.affectedCharacters;
    const characterReactions = affectedCharacters.map(charId => {
      const character = this.characters.get(charId);
      if (!character) return null;
      
      return this.predictCharacterReaction(character, choice, context);
    }).filter(Boolean);

    return {
      likelyOutcome: this.predictOutcome(choice, context),
      characterReactions,
      storyImpact: this.assessStoryImpact(choice, context),
      tensionChange: choice.metadata.tensionChange
    };
  }

  /**
   * Evolve character personalities based on story events
   */
  public evolveCharacter(characterId: string, storyEvent: StoryBeat): Character {
    const character = this.characters.get(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    // Analyze how the event affects the character
    const personalityShift = this.analyzePersonalityImpact(character, storyEvent);
    
    // Update personality traits gradually
    character.personality = this.adjustPersonalityTraits(
      character.personality, 
      personalityShift
    );

    // Create new memory
    const memory: Memory = {
      id: `mem_${Date.now()}_${characterId}`,
      content: storyEvent.narrative,
      emotion: this.extractEmotionalTone(storyEvent.narrative),
      importance: this.calculateMemoryImportance(storyEvent, character),
      timestamp: storyEvent.timestamp,
      associatedCharacters: storyEvent.characters.map(c => c.id)
    };

    character.memories.push(memory);

    // Limit memory to most important/recent
    character.memories = this.pruneMemories(character.memories);

    // Update current mood
    character.currentMood = this.updateMood(character, storyEvent);

    this.characters.set(characterId, character);
    return character;
  }

  /**
   * Manage story arc progression and tension
   */
  public updateStoryArc(context: StoryContext, lastChoice: Choice): StoryArc {
    // Calculate tension change
    const tensionChange = lastChoice.metadata.tensionChange;
    this.storyArc.tension = Math.max(0, Math.min(100, 
      this.storyArc.tension + tensionChange
    ));

    // Check for phase transitions
    this.storyArc = this.checkPhaseTransition(this.storyArc, context);

    // Update completion percentage
    this.storyArc.completionPercentage = this.calculateCompletionPercentage(context);

    // Update pacing based on user interaction patterns
    this.storyArc.pacing = this.adaptPacing(context);

    return this.storyArc;
  }

  /**
   * Maintain world state persistence
   */
  public updateWorldState(context: StoryContext, choice: Choice): WorldState {
    // Update location if choice involves movement
    if (choice.metadata.category === 'exploration') {
      this.worldState.location = this.handleLocationChange(choice, this.worldState);
    }

    // Update active events
    this.worldState.activeEvents = this.updateWorldEvents(
      this.worldState.activeEvents, 
      choice, 
      context
    );

    // Update atmosphere based on recent events
    this.worldState.atmosphere = this.updateAtmosphere(context, choice);

    return this.worldState;
  }

  // Helper methods for character generation
  private getCharacterTemplatesFromSeed(seed: string): any[] {
    // This would be enhanced with AI generation in practice
    // For now, returning deterministic templates based on seed
    const templates = [
      {
        name: "The Guide",
        appearance: "Weathered but wise",
        background: "A keeper of stories and secrets",
        goals: ["Preserve knowledge", "Guide others"],
        initialMood: "contemplative",
        archetypes: ["mentor", "mystic"]
      },
      {
        name: "The Skeptic", 
        appearance: "Sharp-eyed and cautious",
        background: "Questions everything and trusts few",
        goals: ["Uncover truth", "Protect themselves"],
        initialMood: "suspicious",
        archetypes: ["rebel", "detective"]
      },
      {
        name: "The Innocent",
        appearance: "Young and hopeful",
        background: "New to this world's complexities",
        goals: ["Learn and grow", "Help others"],
        initialMood: "curious",
        archetypes: ["innocent", "seeker"]
      }
    ];

    // Deterministically select based on seed
    const seedValue = this.seedHash(seed);
    return templates.slice(0, 2 + (seedValue % 4)); // 2-5 characters
  }

  private generatePersonalityTraits(seed: string, characterIndex: number): PersonalityTraits {
    const random = this.seedRandom(seed, characterIndex);
    
    return {
      openness: 30 + (random * 40), // Some variability but not extreme
      conscientiousness: 40 + (random * 30),
      extraversion: 20 + (random * 60),
      agreeableness: 35 + (random * 40),
      neuroticism: 15 + (random * 35),
      trustworthiness: 40 + (random * 40),
      curiosity: 50 + (random * 40),
      bravery: 30 + (random * 50)
    };
  }

  private establishInitialRelationships(characters: Map<string, Character>, seed: string): void {
    const charArray = Array.from(characters.values());
    
    for (let i = 0; i < charArray.length; i++) {
      for (let j = i + 1; j < charArray.length; j++) {
        const char1 = charArray[i];
        const char2 = charArray[j];
        
        // Generate relationship based on personality compatibility
        const compatibility = this.calculateCompatibility(char1.personality, char2.personality);
        const baseRelationship = this.createRelationship(compatibility);
        
        char1.relationships.set(char2.id, baseRelationship);
        char2.relationships.set(char1.id, baseRelationship);
      }
    }
  }

  private createInitialWorldState(seed: string): WorldState {
    const locations = this.generateLocationsFromSeed(seed);
    const firstLocation = locations[0];
    
    if (!firstLocation) {
      throw new Error('Failed to generate initial location');
    }
    
    return {
      location: firstLocation,
      timeOfDay: this.getInitialTimeFromSeed(seed),
      weather: this.getInitialWeatherFromSeed(seed),
      atmosphere: "tense anticipation",
      activeEvents: [],
      artifacts: [],
      secrets: this.generateInitialSecrets(seed)
    };
  }

  private createInitialStoryArc(seed: string): StoryArc {
    return {
      phase: 'setup',
      tension: 15 + (this.seedRandom(seed, 999) * 20), // Start with some tension
      themes: this.extractThemesFromSeed(seed),
      centralConflict: this.generateCentralConflict(seed),
      completionPercentage: 0,
      keyMoments: this.generateKeyMoments(seed),
      pacing: 'medium'
    };
  }

  // Utility methods
  private seedRandom(seed: string, salt: number): number {
    const hash = this.seedHash(seed + salt.toString());
    return (hash % 1000) / 1000;
  }

  private seedHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Additional helper methods would be implemented here...
  private determineChoiceType(context: StoryContext, tension: number): ChoiceType {
    if (tension > 80) return 'strategic';
    if (tension > 60) return 'complex';
    if (context.characters.length > 2) return 'multiple';
    return 'binary';
  }

  private getActiveCharacters(context: StoryContext): Character[] {
    return context.characters.filter(char => 
      this.characters.has(char.id)
    );
  }

  private generateBinaryChoices(context: StoryContext, characters: Character[]): Choice[] {
    // Traditional Y/N with enhanced metadata
    return [
      {
        id: 'choice_yes',
        text: 'Yes',
        type: 'binary',
        metadata: {
          impact: 'medium',
          category: 'action',
          aiConfidence: 85,
          affectedCharacters: characters.map(c => c.id),
          tensionChange: 5,
          consequences: []
        }
      },
      {
        id: 'choice_no',
        text: 'No', 
        type: 'binary',
        metadata: {
          impact: 'medium',
          category: 'action',
          aiConfidence: 85,
          affectedCharacters: characters.map(c => c.id),
          tensionChange: -3,
          consequences: []
        }
      }
    ];
  }

  private generateMultipleChoices(context: StoryContext, characters: Character[]): Choice[] {
    // 2-4 nuanced options
    return [
      {
        id: 'choice_diplomatic',
        text: 'Try to negotiate',
        type: 'multiple',
        metadata: {
          impact: 'medium',
          category: 'social',
          aiConfidence: 75,
          affectedCharacters: characters.map(c => c.id),
          tensionChange: -2,
          consequences: []
        }
      },
      {
        id: 'choice_direct',
        text: 'Take direct action',
        type: 'multiple',
        metadata: {
          impact: 'high',
          category: 'action',
          aiConfidence: 80,
          affectedCharacters: characters.map(c => c.id),
          tensionChange: 8,
          consequences: []
        }
      },
      {
        id: 'choice_observe',
        text: 'Wait and observe',
        type: 'multiple',
        metadata: {
          impact: 'low',
          category: 'strategic',
          aiConfidence: 70,
          affectedCharacters: [],
          tensionChange: 1,
          consequences: []
        }
      }
    ];
  }

  private generateComplexChoices(context: StoryContext, characters: Character[]): Choice[] {
    // Context-sensitive choices that adapt to current situation
    return this.generateMultipleChoices(context, characters);
  }

  private generateEmotionalChoices(context: StoryContext, characters: Character[]): Choice[] {
    // Choices based on character moods and relationships
    return this.generateMultipleChoices(context, characters);
  }

  private generateStrategicChoices(context: StoryContext, characters: Character[]): Choice[] {
    // High-impact choices affecting story direction
    return this.generateMultipleChoices(context, characters);
  }

  // Placeholder implementations for complex methods
  private predictCharacterReaction(character: Character, choice: Choice, context: StoryContext): CharacterReaction {
    return {
      characterId: character.id,
      reaction: "reacts thoughtfully",
      moodChange: 5,
      relationshipChange: 2
    };
  }

  private predictOutcome(choice: Choice, context: StoryContext): string {
    return "The situation evolves in an unexpected direction";
  }

  private assessStoryImpact(choice: Choice, context: StoryContext): string {
    return choice.metadata.impact === 'high' ? "Significant story impact" : "Minor story impact";
  }

  private analyzePersonalityImpact(character: Character, event: StoryBeat): Partial<PersonalityTraits> {
    return { curiosity: 1 }; // Minimal change
  }

  private adjustPersonalityTraits(current: PersonalityTraits, shift: Partial<PersonalityTraits>): PersonalityTraits {
    return { ...current, ...shift };
  }

  private extractEmotionalTone(narrative: string): string {
    // Simple emotion detection - would use AI in practice
    if (narrative.includes('danger') || narrative.includes('threat')) return 'fear';
    if (narrative.includes('beautiful') || narrative.includes('wonder')) return 'joy';
    return 'neutral';
  }

  private calculateMemoryImportance(event: StoryBeat, character: Character): number {
    return 50 + (event.tension / 2); // Simple importance based on tension
  }

  private pruneMemories(memories: Memory[]): Memory[] {
    // Keep only the 10 most important/recent memories
    return memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  }

  private updateMood(character: Character, event: StoryBeat): any {
    return {
      dominant: this.extractEmotionalTone(event.narrative),
      intensity: Math.min(100, character.currentMood.intensity + 5),
      influences: [...character.currentMood.influences, event.id]
    };
  }

  private checkPhaseTransition(arc: StoryArc, context: StoryContext): StoryArc {
    // Simple phase progression based on completion
    if (arc.completionPercentage > 80) arc.phase = 'resolution';
    else if (arc.completionPercentage > 60) arc.phase = 'falling';
    else if (arc.completionPercentage > 40) arc.phase = 'climax';
    else if (arc.completionPercentage > 20) arc.phase = 'rising';
    else if (arc.completionPercentage > 5) arc.phase = 'inciting';
    
    return arc;
  }

  private calculateCompletionPercentage(context: StoryContext): number {
    return Math.min(100, (context.history.length / 20) * 100); // Rough estimate
  }

  private adaptPacing(context: StoryContext): 'slow' | 'medium' | 'fast' {
    // Analyze user response times to adapt pacing
    return 'medium'; // Default for now
  }

  private handleLocationChange(choice: Choice, worldState: WorldState): Location {
    // Handle location transitions
    return worldState.location; // No change for now
  }

  private updateWorldEvents(events: any[], choice: Choice, context: StoryContext): any[] {
    return events; // No changes for now
  }

  private updateAtmosphere(context: StoryContext, choice: Choice): string {
    const tension = this.storyArc.tension;
    if (tension > 70) return "thick with tension";
    if (tension > 40) return "cautiously optimistic";
    return "peaceful";
  }

  private calculateCompatibility(p1: PersonalityTraits, p2: PersonalityTraits): number {
    // Simple compatibility calculation
    const diff = Math.abs(p1.agreeableness - p2.agreeableness) + 
                Math.abs(p1.extraversion - p2.extraversion);
    return Math.max(0, 100 - diff);
  }

  private createRelationship(compatibility: number): any {
    return {
      trust: 40 + (compatibility * 0.3),
      affection: 30 + (compatibility * 0.4),
      respect: 50 + (compatibility * 0.2),
      history: []
    };
  }

  private generateLocationsFromSeed(seed: string): Location[] {
    return [{
      id: 'initial_location',
      name: 'The Transit Space',
      description: 'A liminal space between destinations',
      atmosphere: 'anticipatory',
      connectedLocations: [],
      characters: [],
      artifacts: [],
      mood: 'neutral'
    }];
  }

  private getInitialTimeFromSeed(seed: string): string {
    const times = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night'];
    const time = times[this.seedHash(seed) % times.length];
    return time || 'dawn';
  }

  private getInitialWeatherFromSeed(seed: string): string {
    const weather = ['clear', 'cloudy', 'overcast', 'misty', 'windy'];
    const selectedWeather = weather[this.seedHash(seed) % weather.length];
    return selectedWeather || 'clear';
  }

  private generateInitialSecrets(seed: string): any[] {
    return []; // No secrets initially
  }

  private extractThemesFromSeed(seed: string): string[] {
    const themes = ['journey', 'transformation', 'connection', 'mystery', 'choice'];
    return themes.slice(0, 2 + (this.seedHash(seed) % 3));
  }

  private generateCentralConflict(seed: string): string {
    const conflicts = [
      'Finding one\'s true destination',
      'Reconciling past and future',
      'Choosing between safety and growth',
      'Understanding hidden connections'
    ];
    const conflict = conflicts[this.seedHash(seed) % conflicts.length];
    return conflict || conflicts[0];
  }

  private generateKeyMoments(seed: string): any[] {
    return [
      {
        id: 'inciting_incident',
        description: 'The moment everything changes',
        phase: 'inciting',
        completed: false,
        requiredConditions: ['tension_above_30']
      }
    ];
  }

  // Public getters for state access
  public getCharacters(): Map<string, Character> {
    return this.characters;
  }

  public getWorldState(): WorldState {
    return this.worldState;
  }

  public getStoryArc(): StoryArc {
    return this.storyArc;
  }
}