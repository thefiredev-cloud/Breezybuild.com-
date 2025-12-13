'use client';

import { TextareaHTMLAttributes, forwardRef, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-sand-700 dark:text-sand-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            resize-y min-h-[100px]
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-sand-200 focus:border-breezy-400 focus:ring-breezy-200 dark:border-sand-600 dark:focus:border-breezy-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-sand-400
            bg-white dark:bg-sand-800 dark:text-white
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

Textarea.displayName = 'Textarea';
