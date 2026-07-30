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
    <div className="w-full mb-5" ref={ref}>
      {label && (
        <label className="block text-sm font-bold mb-2 text-[var(--color-text-body)]">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className={[
            'w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all bg-white min-h-[42px]',
            error
              ? 'border-[var(--color-error)] focus:ring-red-100'
              : open
                ? 'border-[var(--color-primary-focus)] ring-2 ring-[rgba(37,99,235,0.2)]'
                : 'border-[var(--color-gray-300)] hover:border-[var(--color-gray-400)]',
            disabled
              ? 'bg-[var(--color-gray-100)] cursor-not-allowed text-[var(--color-gray-400)]'
              : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {selectedOptions.length === 0 ? (
              <span className="text-[var(--color-gray-400)]">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                >
                  {option.icon && <span className="flex items-center">{option.icon}</span>}
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(option.value, e)}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    disabled={disabled}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            size={16}
            className={`text-[var(--color-gray-400)] transition-transform ml-2 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-gray-200)] rounded-lg shadow-lg max-h-56 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <li
                  key={option.value}
                  onClick={() => handleToggleOption(option.value)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-primary-light)] ${
                    isSelected
                      ? 'bg-blue-50 text-[var(--color-primary-focus)]'
                      : 'text-[var(--color-gray-700)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && <span className="flex items-center">{option.icon}</span>}
                    {option.label}
                  </span>
                  {isSelected && <Check size={14} className="text-[var(--color-primary-focus)]" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
