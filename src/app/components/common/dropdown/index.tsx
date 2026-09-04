'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  showRequired?: boolean;
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
  showRequired = false,
  onChange,
}: WpDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const dropdownMenu =
    open && mounted ? (
      <ul
        style={{
          position: 'absolute',
          top: `${position.top + 4}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
        }}
        className="z-[9999] bg-white dark:bg-slate-800 border border-[var(--color-gray-200)] dark:border-slate-600 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1"
      >
        {options.map((option) => (
          <li
            key={option.value}
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(option.value);
              setOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-primary-light)] dark:hover:bg-blue-900/30 text-[var(--color-gray-700)] dark:text-slate-200"
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
    ) : null;

  return (
    <div className="w-full mb-5" ref={ref}>
      {label && (
        <label className="block text-sm font-bold mb-2 text-[var(--color-text-body)] dark:text-slate-300">
          {label}
          {showRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className={[
            'w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all',
            disabled
              ? 'bg-[var(--color-gray-100)] dark:bg-slate-700 border-[var(--color-gray-300)] dark:border-slate-600 text-[var(--color-gray-400)] dark:text-slate-500 cursor-not-allowed'
              : error
                ? 'bg-white dark:bg-slate-800 border-[var(--color-error)]'
                : open
                  ? 'bg-white dark:bg-slate-800 border-[var(--color-primary-focus)] ring-2 ring-[rgba(37,99,235,0.2)]'
                  : 'bg-white dark:bg-slate-800 border-[var(--color-gray-300)] dark:border-slate-600 hover:border-[var(--color-gray-400)] dark:hover:border-slate-500',
            !disabled && 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={`flex items-center gap-2 ${!selected ? 'text-[var(--color-gray-400)] dark:text-slate-100' : 'text-[var(--color-gray-900)] dark:text-slate-100'}`}
          >
            {selected?.icon && <span className="flex items-center">{selected.icon}</span>}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-[var(--color-gray-400)] dark:text-slate-100 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {mounted && dropdownMenu && createPortal(dropdownMenu, document.body)}
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
