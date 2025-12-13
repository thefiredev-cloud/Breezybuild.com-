'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, loadingText = 'Loading...', children, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      font-semibold rounded-xl transition-all duration-200
      inline-flex items-center justify-center
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `.trim();

    const variants = {
      primary: `
        bg-gradient-cta text-white shadow-warm
        hover:shadow-warm-lg hover:scale-[1.02] active:scale-[0.98]
        focus:ring-breezy-500
      `.trim(),
      secondary: `
        bg-white text-breezy-600 border-2 border-breezy-200
        hover:border-breezy-400
        focus:ring-breezy-400
        dark:bg-sand-800 dark:text-breezy-400 dark:border-sand-600
      `.trim(),
      ghost: `
        bg-transparent text-breezy-600
        hover:bg-breezy-50
        focus:ring-breezy-400
        dark:text-breezy-400 dark:hover:bg-sand-800
      `.trim(),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{loadingText}</span>
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
