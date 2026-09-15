'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-text-secondary select-none"
          >
            {label}
            {props.required && <span className="text-error ms-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {startIcon && (
            <div className="absolute start-3.5 flex items-center pointer-events-none text-text-muted">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-surface border rounded-lg transition-colors duration-150',
              'text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20',
              startIcon && 'ps-10',
              endIcon && 'pe-10',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-border focus:border-primary',
              disabled && 'bg-surface-subtle opacity-60 cursor-not-allowed',
              className
            )}
            {...props}
          />

          {endIcon && (
            <div className="absolute end-3.5 flex items-center text-text-muted">
              {endIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-error mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-text-muted mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
