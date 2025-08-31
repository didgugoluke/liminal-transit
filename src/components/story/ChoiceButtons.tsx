// Choice Buttons - Enhanced Binary Y/N Interaction System
// Mobile-first, accessible design with premium interactions
// Enhanced Choice Buttons - Rich Interaction System
// Advanced choice interface with gesture support, timing, and previews

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { EnhancedChoice } from '../../lib/enhanced-choice-system';

export interface EnhancedChoiceButtonsProps {
  choices: EnhancedChoice[];
  onChoice: (choice: EnhancedChoice) => void;
  onRestart?: (() => void) | undefined;
  isGenerating?: boolean;
  isEnded?: boolean;
  disabled?: boolean;
  className?: string;
}

// Legacy interface for backward compatibility
export interface ChoiceButtonsProps {
  onChoiceY: () => void;
  onChoiceN: () => void;
  onRestart?: (() => void) | undefined;
  isGenerating?: boolean;
  isEnded?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EnhancedChoiceButtons({
  choices,
  onChoice,
  onRestart,
  isGenerating = false,
  isEnded = false,
  disabled = false,
  className = '',
}: EnhancedChoiceButtonsProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle timed choices
  useEffect(() => {
    const timedChoice = choices.find(c => c.type === 'timed' && c.timeLimit);
    if (timedChoice && timedChoice.timeLimit && !isGenerating) {
      setTimeRemaining(timedChoice.timeLimit);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            // Auto-select first available choice when time runs out
            onChoice(choices[0]);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [choices, onChoice, isGenerating]);

  // Handle keyboard navigation for enhanced choices
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isGenerating || isEnded || disabled) return;

      const key = event.key.toLowerCase();
      
      // Number keys for multiple choice selection
      const numKey = parseInt(key);
      if (numKey >= 1 && numKey <= choices.length) {
        event.preventDefault();
        onChoice(choices[numKey - 1]);
        return;
      }

      // Legacy Y/N support for binary choices
      if (choices.length === 2 && choices.every(c => c.type === 'binary')) {
        if (key === 'y') {
          event.preventDefault();
          onChoice(choices[0]);
        } else if (key === 'n') {
          event.preventDefault();
          onChoice(choices[1]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [choices, onChoice, isGenerating, isEnded, disabled]);

  // Handle long press for gesture choices
  const handleMouseDown = useCallback((choice: EnhancedChoice) => {
    if (choice.type === 'gesture' && choice.gestureType === 'longPress') {
      const timer = setTimeout(() => {
        onChoice(choice);
        setLongPressTimer(null);
      }, 1000); // 1 second long press
      
      setLongPressTimer(timer);
    }
  }, [onChoice]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleDoubleClick = useCallback((choice: EnhancedChoice) => {
    if (choice.type === 'gesture' && choice.gestureType === 'doubleClick') {
      onChoice(choice);
    }
  }, [onChoice]);

  // Restart button for ended stories
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

  if (choices.length === 0) {
    return (
      <div className={`choice-buttons ${className}`}>
        <div className="text-center text-gray-500 text-sm">
          No choices available at this time.
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`enhanced-choice-buttons ${className}`}
      role="group"
      aria-label="Story choices"
    >
      {/* Timer display for timed choices */}
      {timeRemaining !== null && (
        <div className="timer-display mb-4 text-center">
          <div className="text-sm text-yellow-400 mb-2">
            Choose quickly! Time remaining: {timeRemaining}s
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((timeRemaining / (choices.find(c => c.timeLimit)?.timeLimit || 10)) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Choice buttons */}
      <div className={`choice-grid ${getChoiceLayoutClass(choices.length)}`}>
        {choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            index={index}
            onChoice={onChoice}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            disabled={disabled || isGenerating}
            isSelected={selectedChoice === choice.id}
          />
        ))}
      </div>
      
      {/* Interaction hints */}
      <div className="choice-hints mt-4 text-center text-xs text-gray-500 space-y-1">
        {choices.some(c => c.type === 'binary') && (
          <div className="sr-only">
            Use Y key for Yes, N key for No, or click the buttons
          </div>
        )}
        
        {choices.length > 2 && (
          <div>
            Use number keys (1-{choices.length}) or click to choose
          </div>
        )}
        
        {choices.some(c => c.type === 'gesture') && (
          <div className="text-blue-400">
            {choices.find(c => c.gestureType === 'longPress') && 
              'Hold down for gesture choices • '}
            {choices.find(c => c.gestureType === 'doubleClick') && 
              'Double-click for special actions'}
          </div>
        )}
      </div>
    </div>
  );
}

// Legacy Choice Buttons component for backward compatibility
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

/**
 * Individual choice button component
 */
interface ChoiceButtonProps {
  choice: EnhancedChoice;
  index: number;
  onChoice: (choice: EnhancedChoice) => void;
  onMouseDown: (choice: EnhancedChoice) => void;
  onMouseUp: () => void;
  onDoubleClick: (choice: EnhancedChoice) => void;
  disabled: boolean;
  isSelected: boolean;
}

function ChoiceButton({
  choice,
  index,
  onChoice,
  onMouseDown,
  onMouseUp,
  onDoubleClick,
  disabled,
  isSelected
}: ChoiceButtonProps) {
  const getButtonVariant = () => {
    switch (choice.type) {
      case 'gesture': return 'gesture';
      case 'timed': return 'urgent';
      case 'conditional': return 'special';
      default: return choice.emotionalTone === 'positive' ? 'choice-yes' : 
                choice.emotionalTone === 'negative' ? 'choice-no' : 'choice-neutral';
    }
  };

  const getDifficultyIcon = () => {
    switch (choice.difficulty) {
      case 'hard': return '⚡';
      case 'medium': return '◈';
      case 'easy': return '◯';
      case 'impossible': return '⭐';
      default: return '';
    }
  };

  return (
    <div className="choice-button-container">
      <Button
        onClick={() => choice.type !== 'gesture' && onChoice(choice)}
        onMouseDown={() => onMouseDown(choice)}
        onMouseUp={onMouseUp}
        onDoubleClick={() => onDoubleClick(choice)}
        variant={getButtonVariant()}
        size="large"
        disabled={disabled}
        aria-label={`Choice ${index + 1}: ${choice.text}`}
        className={`choice-button ${isSelected ? 'selected' : ''} ${choice.type}`}
        data-choice-type={choice.type}
      >
        <div className="choice-content">
          <div className="choice-main">
            <span className="choice-number">{index + 1}</span>
            <span className="choice-text">{choice.text}</span>
            <span className="choice-difficulty">{getDifficultyIcon()}</span>
          </div>
          
          {choice.preview && (
            <div className="choice-preview text-xs opacity-75 mt-1">
              {choice.preview}
            </div>
          )}
        </div>
      </Button>
      
      {choice.type === 'gesture' && (
        <div className="gesture-hint text-xs text-center mt-1 text-blue-400">
          {choice.gestureType === 'longPress' && 'Hold to activate'}
          {choice.gestureType === 'doubleClick' && 'Double-click'}
          {choice.gestureType === 'swipe' && 'Swipe gesture'}
        </div>
      )}
    </div>
  );
}

/**
 * Get CSS class for choice layout based on number of choices
 */
function getChoiceLayoutClass(count: number): string {
  switch (count) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-2 gap-4';
    case 3: return 'grid-cols-1 sm:grid-cols-3 gap-3';
    case 4: return 'grid-cols-2 gap-3';
    default: return 'grid-cols-1 sm:grid-cols-2 gap-3';
  }
}