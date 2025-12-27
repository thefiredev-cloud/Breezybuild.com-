'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200
            min-h-[44px]
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-zinc-300 focus:border-primary focus:ring-primary/20 dark:border-zinc-700 dark:focus:border-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            bg-white dark:bg-dark-surface text-zinc-900 dark:text-zinc-100
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
