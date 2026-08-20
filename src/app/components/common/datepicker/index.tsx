'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';

interface WpDatePickerProps {
  label?: string;
  value?: string; // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
  required?: boolean;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  showTime?: boolean;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void; // Called only when Done is clicked or date selected (no time)
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDisplay(iso: string, showTime?: boolean) {
  if (!iso) return '';
  const [datePart, timePart] = iso.split('T');
  const [y, m, d] = datePart.split('-');
  const base = `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  return showTime && timePart ? `${base} ${timePart}` : base;
}

export const WpDatePicker = ({
  label,
  required = false,
  value = '',
  placeholder = 'Select a date',
  error,
  hint,
  disabled = false,
  showTime = false,
  min,
  max,
  onChange,
  onCommit,
}: WpDatePickerProps) => {
  const today = new Date();
  const datePart = value ? value.split('T')[0] : '';
  const timePart = value?.includes('T') ? value.split('T')[1] : '00:00:00';
  const initDate = datePart ? new Date(datePart + 'T00:00:00') : today;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [time, setTime] = useState(timePart);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(true);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const toISO = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isDisabled = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    return (min && iso < min) || (max && iso > max) ? true : false;
  };

  const handleSelect = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    const newValue = showTime ? `${iso}T${time}` : iso;
    onChange(newValue);
    if (!showTime) {
      setOpen(false);
      onCommit?.(newValue);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (datePart) onChange(`${datePart}T${newTime}`);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    onCommit?.('');
    setTime('00:00:00');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold mb-2 text-[var(--color-text-body)]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          className={[
            'w-full flex items-center justify-between px-3 py-2 h-11 rounded-lg text-sm transition-all bg-white border border-[var(--color-gray-300)]',
            error
              ? 'border-[var(--color-error)] text-[var(--color-error)]'
              : open
                ? 'border-[var(--color-primary-focus)] bg-[var(--color-primary-light)]'
                : 'hover:border-[var(--color-gray-400)]',
            disabled
              ? 'cursor-not-allowed text-[var(--color-gray-400)] bg-[var(--color-gray-100)]'
              : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={`flex items-center gap-2 ${!value ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-gray-900)]'}`}
          >
            <Calendar size={15} className="text-[var(--color-gray-400)]" />
            {value ? formatDisplay(value, showTime) : placeholder}
          </span>
          {value && !disabled ? (
            <X
              size={14}
              className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)]"
              onClick={handleClear}
            />
          ) : null}
        </button>

        {open &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={ref}
              className="fixed z-[9999] w-64 rounded-lg border border-[var(--color-gray-200)] bg-white p-2 shadow-lg"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 rounded hover:bg-[var(--color-gray-100)]"
                >
                  <ChevronLeft size={16} className="text-[var(--color-gray-600)]" />
                </button>
                <span className="text-xs font-semibold text-[var(--color-gray-900)]">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 rounded hover:bg-[var(--color-gray-100)]"
                >
                  <ChevronRight size={16} className="text-[var(--color-gray-600)]" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <span
                    key={d}
                    className="text-center text-[11px] font-medium text-[var(--color-gray-400)] py-0.5"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-7 gap-y-1" onClick={(e) => e.stopPropagation()}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <span key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const iso = toISO(viewYear, viewMonth, day);
                  const isSelected = iso === datePart; // Compare date parts only
                  const isToday =
                    iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
                  const disabled = isDisabled(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(day)}
                      className={[
                        'w-6 h-6 mx-auto flex items-center justify-center rounded-full text-xs transition-colors',
                        isSelected
                          ? 'bg-[var(--color-primary-focus)] text-white font-semibold'
                          : isToday
                            ? 'border border-[var(--color-primary-focus)] text-[var(--color-primary-focus)] font-semibold'
                            : 'hover:bg-[var(--color-primary-light)] text-[var(--color-gray-700)]',
                        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {showTime && (
                <div className="mt-3 pt-3 border-t border-[var(--color-gray-200)] flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--color-gray-500)] font-medium">Time</span>
                  <input
                    type="time"
                    step={1}
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="text-sm border border-[var(--color-gray-300)] rounded-md px-2 py-1 focus:outline-none focus:border-[var(--color-primary-focus)] text-[var(--color-gray-900)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const fullValue = datePart ? `${datePart}T${time}` : '';
                      onCommit?.(fullValue);
                      setOpen(false);
                    }}
                    className="text-xs px-3 py-1 bg-[var(--color-primary-focus)] text-white rounded-md hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>,
            document.body
          )}
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
