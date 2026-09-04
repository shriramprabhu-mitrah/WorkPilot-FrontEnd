'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface WpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  showRequired?: boolean;
  wrapperClassName?: string;
}

export const WpInput = forwardRef<HTMLInputElement, WpInputProps>(
  (
    {
      label,
      icon,
      error,
      hint,
      type = 'text',
      id,
      showRequired,
      className = '',
      wrapperClassName = '',
      ...props
    }: WpInputProps,
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`relative ${label ? 'mb-5' : ''} ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-bold mb-2 text-[var(--color-text-body)] dark:text-slate-300"
          >
            {label}
            {showRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] flex items-center justify-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={[
              'w-full border rounded-lg text-sm outline-none transition-all box-border',
              'border-[var(--color-gray-300)]',
              !error
                ? 'focus:border-[var(--color-primary-focus)] focus:ring-2 focus:ring-[rgba(37,99,235,0.2)]'
                : 'focus:border-[var(--color-error)] focus:ring-2 focus:ring-red-100',
              icon ? 'pl-9 pr-3 py-[10px]' : 'pl-3 pr-3 py-[10px]',
              isPassword ? 'pr-9' : '',
              error
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-red-100'
                : '',
              props.disabled
                ? 'bg-[var(--color-gray-100)] cursor-not-allowed text-[var(--color-gray-400)]'
                : 'bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-100',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="absolute left-0 top-full mt-1 text-xs text-[var(--color-error)] whitespace-nowrap">
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
      </div>
    );
  }
);
WpInput.displayName = 'WpInput';
