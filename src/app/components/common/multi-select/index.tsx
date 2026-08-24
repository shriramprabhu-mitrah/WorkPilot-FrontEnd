'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';

export interface WpMultiSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface WpMultiSelectProps {
  label?: string;
  options: WpMultiSelectOption[];
  value?: string[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  onChange: (value: string[]) => void;
}

export const WpMultiSelect = ({
  label,
  options,
  value = [],
  placeholder = 'Select options',
  error,
  hint,
  disabled = false,
  onChange,
}: WpMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveChip = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="mb-5 w-full" ref={ref}>
      {label && (
        <label className="mb-2 block text-sm font-bold text-[var(--color-text-body)] dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className={[
            'flex min-h-[42px] w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all',
            error
              ? 'border-[var(--color-error)] bg-white dark:bg-slate-800 focus:ring-red-100'
              : open
                ? 'border-[var(--color-primary-focus)] bg-white ring-2 ring-[rgba(37,99,235,0.2)] dark:bg-slate-800'
                : 'border-[var(--color-gray-300)] bg-white hover:border-[var(--color-gray-400)] dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500',
            disabled
              ? 'cursor-not-allowed bg-[var(--color-gray-100)] text-[var(--color-gray-400)] dark:bg-slate-700 dark:text-slate-500'
              : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {selectedOptions.length === 0 ? (
              <span className="text-[var(--color-gray-400)] dark:text-slate-400">
                {placeholder}
              </span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  {option.icon && <span className="flex items-center">{option.icon}</span>}

                  {option.label}

                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(option.value, e)}
                    className="rounded-full p-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-800/60"
                    disabled={disabled}
                  >
                    <X size={12} className="text-blue-700 dark:text-blue-300" />
                  </button>
                </span>
              ))
            )}
          </div>

          <ChevronDown
            size={16}
            className={`ml-2 shrink-0 text-[var(--color-gray-400)] transition-transform dark:text-slate-400 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--color-gray-200)] bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
            {options.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <li
                  key={option.value}
                  onClick={() => handleToggleOption(option.value)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-[var(--color-primary-focus)] dark:bg-blue-900/40 dark:text-blue-300'
                      : 'text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && <span className="flex items-center">{option.icon}</span>}

                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={14}
                      className="text-[var(--color-primary-focus)] dark:text-blue-400"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}

      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--color-gray-400)] dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
};
