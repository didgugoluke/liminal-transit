// Button Component - Enhanced Typography-First UI Foundation
// Premium accessible button component with mobile-first design

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'choice-yes' | 'choice-no' | 'restart';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isLoading?: boolean;
  'aria-label'?: string;
  className?: string;
}

const variantClasses = {
  primary: 'btn-choice border-blue-500 bg-blue-500 text-black hover:bg-blue-400',
  secondary: 'btn-choice border-gray-600 bg-gray-800 text-gray-100 hover:border-blue-500',
  'choice-yes': 'btn-choice border-green-500 bg-transparent text-green-500 hover:bg-green-500 hover:text-black active:bg-green-500 active:text-black',
  'choice-no': 'btn-choice border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-black active:bg-red-500 active:text-black',
  restart: 'btn-choice border-blue-500 bg-blue-500 text-black hover:bg-blue-400 active:bg-blue-400',
};

const sizeClasses = {
  small: 'px-3 py-2 text-sm min-h-11',
  medium: 'px-4 py-3 text-base min-h-12',
  large: 'px-6 py-4 text-lg min-h-14 font-medium',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  'aria-label': ariaLabel,
  className = '',
}: ButtonProps) {
  const baseClasses = [
    'btn-base',
    'ring-2 ring-transparent focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
    'transition-all duration-200',
    'touch-manipulation', // Optimize for touch devices
    'select-none', // Prevent text selection
    'relative', // For loading state positioning
    'outline-none',
  ];

  const classes = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  // Enhanced loading indicator with better accessibility
  const LoadingIndicator = () => (
    <span className="flex items-center gap-2" role="status" aria-label="Loading">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Processing</span>
      {children}
    </span>
  );

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-live="polite"
    >
      {isLoading ? <LoadingIndicator /> : children}
    </button>
  );
}