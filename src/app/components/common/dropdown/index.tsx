'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';

export interface WpDropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface WpDropdownProps {
  label?: string;
  options: WpDropdownOption[];
  value?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const WpDropdown = ({
  label,
  options,
  value,
  placeholder = 'Select an option',
  error,
  hint,
  disabled = false,
  onChange,
}: WpDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

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
            'w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all',
            disabled
              ? 'bg-[var(--color-gray-100)] border-[var(--color-gray-300)] text-[var(--color-gray-400)] cursor-not-allowed'
              : error
                ? 'bg-white border-[var(--color-error)] focus:ring-red-100'
                : open
                  ? 'bg-white border-[var(--color-primary-focus)] ring-2 ring-[rgba(37,99,235,0.2)]'
                  : 'bg-white border-[var(--color-gray-300)] hover:border-[var(--color-gray-400)]',

            !disabled && 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={`flex items-center gap-2 ${!selected ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-900)]'}`}
          >
            {selected?.icon && <span className="flex items-center">{selected.icon}</span>}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-[var(--color-gray-400)] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-gray-200)] rounded-lg shadow-lg max-h-56 overflow-y-auto py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-primary-light)] text-[var(--color-gray-700)]"
              >
                <span className="flex items-center gap-2">
                  {option.icon && <span className="flex items-center">{option.icon}</span>}
                  {option.label}
                </span>
                {value === option.value && (
                  <Check size={14} className="text-[var(--color-primary-focus)]" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
