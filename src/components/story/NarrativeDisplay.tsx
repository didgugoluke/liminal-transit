// Narrative Display - Enhanced Typography-First Story Presentation
// Premium reading experience with ambient animations and accessibility

import { useEffect, useRef, useState } from 'react';
// Enhanced Narrative Display - Typography-First with Story Intelligence
// Advanced component for displaying story text with character awareness and atmospheric design

import { StoryContext, Character, WorldState } from '../../types';

export interface NarrativeDisplayProps {
  narrative: string;
  context?: StoryContext;
  isGenerating?: boolean;
  className?: string;
}

export function NarrativeDisplay({ 
  narrative, 
  context,
  isGenerating = false, 
  className = '' 
}: NarrativeDisplayProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isNewContent, setIsNewContent] = useState(false);

  // Handle new content animation
  // Auto-scroll to new content with smooth behavior
  useEffect(() => {
    if (narrative) {
      setIsNewContent(true);
      
      // Auto-scroll to new content with enhanced smoothness
      if (textRef.current) {
        textRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
      
      // Reset animation state
      const timer = setTimeout(() => setIsNewContent(false), 800);
      return () => clearTimeout(timer);
    }
  }, [narrative]);

  // Extract the choice prompt from narrative if present
  const hasChoicePrompt = /\(Y\/N\)$/.test(narrative);
  const hasRestartPrompt = /\(Restart\?\)$/.test(narrative);
  
  // Split narrative and prompt for better typography
  let storyText = narrative;
  let promptText = '';
  
  if (hasChoicePrompt) {
    storyText = narrative.replace(/\s*\(Y\/N\)$/, '');
    promptText = '(Y/N)';
  } else if (hasRestartPrompt) {
    storyText = narrative.replace(/\s*\(Restart\?\)$/, '');
    promptText = '(Restart?)';
  }

  // Enhanced thinking indicator component
  const ThinkingIndicator = () => (
    <div 
      className="generating-indicator"
      aria-label="AI is crafting the next story beat"
      role="status"
    >
      <div className="flex items-center justify-center gap-1">
        <span className="w-2 h-2 bg-current rounded-full animate-thinking-pulse" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 bg-current rounded-full animate-thinking-pulse" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 bg-current rounded-full animate-thinking-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
      <div className="sr-only">
        Please wait while the AI generates your story
      </div>
    </div>
  );

  // Get atmospheric information from context
  const worldState = context?.worldState;
  const recentCharacters = context?.characters?.filter(c => 
    Date.now() - c.lastSeen.getTime() < 300000 // Active in last 5 minutes
  ) || [];

  // Calculate atmospheric indicators
  const tensionLevel = worldState ? Math.round(worldState.tension * 100) : 0;
  const mysteryLevel = worldState ? Math.round(worldState.mystery * 100) : 0;

  return (
    <div 
      ref={textRef}
      className={`narrative-display ${className}`}
      role="region"
      aria-label="Story narrative"
    >
      <div 
        className={`narrative-text ${isNewContent ? 'animate-narrative-reveal' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
      {/* Atmospheric context bar */}
      {worldState && (
        <div className="story-atmosphere mb-6 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                📍 {worldState.location.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center gap-1">
                🌅 {worldState.timeOfDay}
              </span>
              <span className="flex items-center gap-1">
                💭 {worldState.atmosphere}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span>Tension:</span>
                <div className="w-12 h-1 bg-gray-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${tensionLevel}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span>Mystery:</span>
                <div className="w-12 h-1 bg-gray-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${mysteryLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main narrative text */}
      <div className="narrative-text">
        {storyText}
      </div>
      
      {/* Active characters indicator */}
      {recentCharacters.length > 0 && (
        <div className="character-presence mt-6 p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
          <div className="text-xs text-blue-300 mb-2">Present Characters</div>
          <div className="flex flex-wrap gap-2">
            {recentCharacters.map(character => (
              <CharacterIndicator key={character.id} character={character} />
            ))}
          </div>
        </div>
      )}

      {/* Choice prompt */}
      {promptText && (
        <div 
          className="prompt-text animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
          aria-label={`Story choice prompt: ${promptText}`}
        >
          {promptText}
        <div className="prompt-text mt-6">
          {promptText}
        </div>
      )}
      
      {/* AI generation indicator */}
      {isGenerating && (
        <div 
          className="generating-indicator mt-6"
          aria-label="Generating next story beat"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-current rounded-full animate-pulse animation-delay-150" />
              <div className="w-2 h-2 bg-current rounded-full animate-pulse animation-delay-300" />
            </div>
            <span className="text-sm">AI crafting story...</span>
          </div>
        </div>
      )}
      
      {isGenerating && <ThinkingIndicator />}
    </div>
  );
}

/**
 * Character indicator component for showing active characters
 */
function CharacterIndicator({ character }: { character: Character }) {
  const moodColors = {
    pleased: 'text-green-400 border-green-600',
    irritated: 'text-red-400 border-red-600',
    intrigued: 'text-yellow-400 border-yellow-600',
    neutral: 'text-gray-400 border-gray-600',
    suspicious: 'text-orange-400 border-orange-600'
  };

  const moodColor = moodColors[character.currentMood as keyof typeof moodColors] || moodColors.neutral;

  return (
    <div 
      className={`character-indicator px-2 py-1 rounded text-xs border ${moodColor}`}
      title={`${character.name} - ${character.currentMood}`}
    >
      <span className="font-medium">{character.name}</span>
      <span className="ml-1 opacity-75">({character.currentMood})</span>
    </div>
  );
}