// Button Component - Typography-First UI Foundation
// Accessible button component following design principles

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
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500 text-gray-100',
  'choice-yes': 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
  'choice-no': 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  restart: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white',
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
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
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'touch-manipulation', // Optimize for touch devices
  ];

  const classes = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
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
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}