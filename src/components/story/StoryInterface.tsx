// Story Interface - Main Interactive Story Container
// Core component that orchestrates the story experience

import { useEffect, useCallback } from 'react';
import { useStoryProgression } from '../../hooks/useStoryProgression';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { NarrativeDisplay } from './NarrativeDisplay';
import { ChoiceButtons } from './ChoiceButtons';
import { StoryContext } from '../../types';

export interface StoryInterfaceProps {
  initialSeed?: string | undefined;
  className?: string;
}

export function StoryInterface({ initialSeed, className = '' }: StoryInterfaceProps) {
  const {
    context,
    narrative,
    isGenerating,
    isEnded,
    makeChoice,
    resetStory,
  } = useStoryProgression(initialSeed);

  // Persist story context to session storage
  const [, setSavedContext] = useSessionStorage<StoryContext | null>(
    'noveli-story-context',
    null
  );

  // Save context when it changes
  useEffect(() => {
    setSavedContext(context);
  }, [context, setSavedContext]);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isGenerating || isEnded) return;

    const key = event.key.toLowerCase();
    if (key === 'y') {
      event.preventDefault();
      makeChoice('Y');
    } else if (key === 'n') {
      event.preventDefault();
      makeChoice('N');
    } else if (key === 'r' && isEnded) {
      event.preventDefault();
      resetStory();
    }
  }, [isGenerating, isEnded, makeChoice, resetStory]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleChoiceY = useCallback(() => {
    makeChoice('Y');
  }, [makeChoice]);

  const handleChoiceN = useCallback(() => {
    makeChoice('N');
  }, [makeChoice]);

  const handleRestart = useCallback(() => {
    resetStory(context.metadata.seed);
  }, [resetStory, context.metadata.seed]);

  return (
    <div 
      className={`story-interface ${className}`}
      role="main"
      aria-label="Interactive story"
    >
      {/* Story metadata for accessibility */}
      <div className="sr-only">
        <div>Story seed: {context.metadata.seed}</div>
        <div>Progress: {Math.round(context.metadata.completionRate)}%</div>
        <div>Interactions: {context.history.length}</div>
      </div>

      {/* Main narrative display */}
      <div className="narrative-section mb-8">
        <NarrativeDisplay 
          narrative={narrative}
          context={context}
          isGenerating={isGenerating}
        />
      </div>

      {/* Choice interaction */}
      <div className="choice-section">
        <ChoiceButtons
          onChoiceY={handleChoiceY}
          onChoiceN={handleChoiceN}
          onRestart={isEnded ? handleRestart : undefined}
          isGenerating={isGenerating}
          isEnded={isEnded}
        />
      </div>

      {/* Debug info in development */}
      {import.meta.env.MODE === 'development' && (
        <details className="mt-8 text-xs text-gray-600">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-900 rounded text-gray-400 space-y-1">
            <div>Seed: {context.metadata.seed}</div>
            <div>Session: {context.metadata.sessionId}</div>
            <div>History length: {context.history.length}</div>
            <div>Completion: {context.metadata.completionRate.toFixed(1)}%</div>
            <div>Choices made: {context.metadata.choicesMade}</div>
            <div>Characters met: {context.metadata.charactersMet}</div>
            <div>Active characters: {context.characters?.length || 0}</div>
            <div>Consequences: {context.consequences?.length || 0}</div>
            <div>Story branch: {context.metadata.storyBranch}</div>
            <div>World state: {JSON.stringify(context.worldState, null, 2)}</div>
            <div>Started: {context.metadata.startTime.toLocaleString()}</div>
            <div>Updated: {context.metadata.lastUpdate.toLocaleString()}</div>
          </div>
        </details>
      )}
    </div>
  );
}