import React from 'react';

interface WpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const WpTextarea = ({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: WpTextareaProps) => {
  return (
    <div className="mb-5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-bold text-[var(--color-text-body)] dark:text-slate-100"
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={[
          'min-h-[100px] w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none transition-all',
          'border-[var(--color-gray-300)] dark:border-slate-600',
          'text-[var(--color-text-body)] dark:text-slate-100',
          'bg-white dark:bg-slate-800',
          'placeholder:text-[var(--color-gray-400)] dark:placeholder:text-slate-500',
          'focus:border-[var(--color-primary-focus)]',
          'focus:ring-2 focus:ring-[rgba(37,99,235,0.2)]',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-red-100'
            : '',
          props.disabled
            ? 'cursor-not-allowed bg-[var(--color-gray-100)] text-[var(--color-gray-400)] dark:bg-slate-700 dark:text-slate-500'
            : '',

          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}

      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--color-gray-400)] dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
};
