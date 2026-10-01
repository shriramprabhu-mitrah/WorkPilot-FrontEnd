'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';
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
  onSearchChange?: (search: string) => void; // fires on every keystroke (parent debounces)
  isSearching?: boolean; // spinner while API call is in flight
  serverSideSearch?: boolean; // true = options already filtered by API, skip local filter
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
  onSearchChange,
  isSearching = false,
  serverSideSearch = false,
}: WpMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => {
    setOpen(false);
    if (search) {
      setSearch('');
      onSearchChange?.(''); // reset parent so the full list comes back
    }
  };

  useOutsideClick(ref, closeDropdown);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setSearch(next);
    setOpen(true);
    onSearchChange?.(next);
  };

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const visibleOptions =
    serverSideSearch || !search.trim()
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()));

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
    inputRef.current?.focus(); // keep typing after picking
  };

  const handleRemoveChip = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    }
    // Backspace on empty input removes the last chip
    if (e.key === 'Backspace' && !search && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="mb-5 w-full" ref={ref}>
      {label && (
        <label className="mb-2 block text-sm font-bold text-[var(--color-text-body)] dark:text-slate-100">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => {
            if (disabled) return;
            setOpen(true);
            inputRef.current?.focus();
          }}
          className={[
            'flex min-h-[42px] w-full items-center justify-between rounded-lg border px-3 py-1.5 text-sm transition-all',
            error
              ? 'border-[var(--color-error)] bg-white dark:bg-slate-800'
              : open
                ? 'border-[var(--color-primary-focus)] bg-white ring-2 ring-[rgba(37,99,235,0.2)] dark:bg-slate-800'
                : 'border-[var(--color-gray-300)] bg-white hover:border-[var(--color-gray-400)] dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500',
            disabled
              ? 'cursor-not-allowed bg-[var(--color-gray-100)] text-[var(--color-gray-400)] dark:bg-slate-700 dark:text-slate-500'
              : 'cursor-text',
          ].join(' ')}
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {option.icon && <span className="flex items-center">{option.icon}</span>}

                {option.label}

                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  onClick={(e) => handleRemoveChip(option.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRemoveChip(option.value, e as unknown as React.MouseEvent);
                    }
                  }}
                  className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-800/60"
                  aria-label={`Remove ${option.label}`}
                >
                  <X size={12} className="text-blue-700 dark:text-blue-300" />
                </span>
              </span>
            ))}

            <input
              ref={inputRef}
              type="text"
              value={search}
              disabled={disabled}
              onChange={handleSearchChange}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
              className="min-w-[80px] flex-1 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-[var(--color-gray-400)] disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          {isSearching ? (
            <Loader2 size={16} className="ml-2 shrink-0 animate-spin text-blue-500" />
          ) : (
            <ChevronDown
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                if (open) closeDropdown();
                else {
                  setOpen(true);
                  inputRef.current?.focus();
                }
              }}
              className={`ml-2 shrink-0 cursor-pointer text-[var(--color-gray-400)] transition-transform dark:text-slate-400 ${
                open ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>

        {open && !disabled && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--color-gray-200)] bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
            {visibleOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-[var(--color-gray-400)] dark:text-slate-400">
                {isSearching ? 'Searching...' : 'No results found'}
              </li>
            ) : (
              visibleOptions.map((option) => {
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
              })
            )}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}

      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--color-gray-400)] dark:text-slate-100">{hint}</p>
      )}
    </div>
  );
};