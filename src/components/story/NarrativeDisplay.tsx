// Narrative Display - Enhanced Typography-First Story Presentation
// Premium reading experience with ambient animations and accessibility

import { useEffect, useRef, useState } from 'react';

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
  const [isNewContent, setIsNewContent] = useState(false);

  // Handle new content animation
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
    // Return undefined if no narrative (satisfies TypeScript)
    return undefined;
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
        {storyText}
      </div>
      
      {promptText && (
        <div 
          className="prompt-text animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
          aria-label={`Story choice prompt: ${promptText}`}
        >
          {promptText}
        </div>
      )}
      
      {isGenerating && <ThinkingIndicator />}
    </div>
  );
}