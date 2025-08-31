// Narrative Display - Typography-First Story Presentation
// Core component for displaying story text with atmospheric design

import { useEffect, useRef } from 'react';

export interface NarrativeDisplayProps {
  narrative: string;
  isGenerating?: boolean;
  className?: string;
}

export function NarrativeDisplay({ 
  narrative, 
  isGenerating = false, 
  className = '' 
}: NarrativeDisplayProps) {
  const textRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to new content
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
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

  return (
    <div 
      ref={textRef}
      className={`narrative-display ${className}`}
      role="region"
      aria-label="Story narrative"
      aria-live="polite"
    >
      <div className="narrative-text">
        {storyText}
      </div>
      
      {promptText && (
        <div className="prompt-text text-gray-400 mt-4">
          {promptText}
        </div>
      )}
      
      {isGenerating && (
        <div 
          className="generating-indicator mt-4 text-gray-500"
          aria-label="Generating next story beat"
        >
          <span className="inline-flex items-center gap-1">
            <svg 
              className="animate-pulse w-3 h-3" 
              fill="currentColor" 
              viewBox="0 0 8 8"
              aria-hidden="true"
            >
              <circle cx="4" cy="4" r="1" />
            </svg>
            <svg 
              className="animate-pulse w-3 h-3 animation-delay-150" 
              fill="currentColor" 
              viewBox="0 0 8 8"
              aria-hidden="true"
            >
              <circle cx="4" cy="4" r="1" />
            </svg>
            <svg 
              className="animate-pulse w-3 h-3 animation-delay-300" 
              fill="currentColor" 
              viewBox="0 0 8 8"
              aria-hidden="true"
            >
              <circle cx="4" cy="4" r="1" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}