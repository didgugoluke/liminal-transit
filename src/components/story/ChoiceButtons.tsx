// Choice Buttons - Binary Y/N Interaction System
// Typography-focused choice interface with accessibility

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
            aria-label="Restart the story"
            className="min-w-32"
          >
            Restart
          </Button>
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
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onChoiceY}
          variant="choice-yes"
          size="large"
          disabled={disabled || isGenerating}
          isLoading={isGenerating}
          aria-label="Choose Yes"
          className="min-w-24"
        >
          Yes
        </Button>
        <Button
          onClick={onChoiceN}
          variant="choice-no"
          size="large"
          disabled={disabled || isGenerating}
          aria-label="Choose No"
          className="min-w-24"
        >
          No
        </Button>
      </div>
      
      {/* Keyboard navigation hint */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <span className="sr-only">
          Use Y key for Yes, N key for No, or click the buttons
        </span>
        <span aria-hidden="true">
          Y / N
        </span>
      </div>
    </div>
  );
}