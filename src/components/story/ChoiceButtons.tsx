// Choice Buttons - Enhanced Binary Y/N Interaction System
// Mobile-first, accessible design with premium interactions

import { Button } from '../ui/Button';

export interface ChoiceButtonsProps {
  onChoiceY: () => void;
  onChoiceN: () => void;
  onRestart?: (() => void) | undefined;
  isGenerating?: boolean;
  isEnded?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChoiceButtons({
  onChoiceY,
  onChoiceN,
  onRestart,
  isGenerating = false,
  isEnded = false,
  disabled = false,
  className = '',
}: ChoiceButtonsProps) {
  if (isEnded && onRestart) {
    return (
      <div 
        className={`choice-buttons ${className}`}
        role="group"
        aria-label="Story actions"
      >
        <div className="flex justify-center">
          <Button
            onClick={onRestart}
            variant="restart"
            size="large"
            disabled={disabled}
            aria-label="Restart the story with a new experience"
            className="btn-choice hover-lift press-down"
          >
            <span className="sr-only">Press R to </span>
            Restart
          </Button>
        </div>
        
        <div className="choice-hints">
          <div>
            <span className="sr-only">
              Story complete. Press R key to restart or click the button above.
            </span>
            <span aria-hidden="true" className="font-mono text-story-text-subtle">
              R
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`choice-buttons ${className}`}
      role="group"
      aria-label="Story choices"
    >
      <div className="flex gap-4 justify-center flex-col xs:flex-row">
        <Button
          onClick={onChoiceY}
          variant="choice-yes"
          size="large"
          disabled={disabled || isGenerating}
          isLoading={isGenerating}
          aria-label="Choose Yes - Continue with this option"
          className="btn-choice-yes hover-lift press-down touch-target-lg"
        >
          <span className="sr-only">Press Y to choose </span>
          Yes
        </Button>
        <Button
          onClick={onChoiceN}
          variant="choice-no"
          size="large"
          disabled={disabled || isGenerating}
          aria-label="Choose No - Decline this option"
          className="btn-choice-no hover-lift press-down touch-target-lg"
        >
          <span className="sr-only">Press N to choose </span>
          No
        </Button>
      </div>
      
      {/* Enhanced keyboard navigation hints */}
      <div className="choice-hints">
        <div>
          <span className="sr-only">
            Use Y key for Yes, N key for No, or click the buttons
          </span>
          <span aria-hidden="true" className="font-mono">
            Y / N
          </span>
        </div>
        {!isGenerating && (
          <div className="text-story-text-subtle">
            Use Y key for Yes, N key for No, or click the buttons
          </div>
        )}
      </div>
    </div>
  );
}