'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface WpDatePickerProps {
  label?: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  showTime?: boolean;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
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

  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(today.getDate()).padStart(2, '0')}`;
  const datePart = value ? value.split('T')[0] : '';
  const timePart = value?.includes('T') ? value.split('T')[1] : '00:00:00';
  const initDate = datePart ? new Date(datePart + 'T00:00:00') : today;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [time, setTime] = useState(timePart);

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
  });

  const datePickerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // useEffect(() => {
  //   if (!value) return;
  //   const currentDate = value.split('T')[0];
  //   if (currentDate) {
  //     const selectedDate = new Date(currentDate + 'T00:00:00');
  //     setViewYear(selectedDate.getFullYear());
  //     setViewMonth(selectedDate.getMonth());
  //   }
  //   if (value.includes('T')) {
  //     setTime(value.split('T')[1]);
  //   }
  // }, [value]);
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (datePickerRef.current?.contains(target) || calendarRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const calendarWidth = 256;
      const calendarHeight = showTime ? 340 : 290;
      let left = rect.left + (rect.width - calendarWidth) / 2 - 20;
      let top = rect.top - calendarHeight + 178;
      if (left < 8) {
        left = 8;
      }
      if (left + calendarWidth > window.innerWidth - 8) {
        left = window.innerWidth - calendarWidth - 8;
      }
      if (top < 8) {
        top = 8;
      }
      setDropdownPos({
        top,
        left,
      });
    }
    setOpen((prev) => !prev);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonth = () => {
    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
      return;
    }
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  };

  const toISO = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDisabled = (day: number) => {
    const iso = toISO(viewYear, viewMonth, day);

    if (iso < todayISO) {
      return true;
    }

    if (min && iso < min) {
      return true;
    }

    if (max && iso > max) {
      return true;
    }

    return false;
  };

  const handleSelect = (day: number) => {
    const iso = toISO(viewYear, viewMonth, day);
    const newValue = showTime ? `${iso}T${time}` : iso;
    onChange(newValue);
    if (showTime) {
      return;
    }
    onCommit?.(newValue);
    setOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (datePart) {
      const newValue = `${datePart}T${newTime}`;
      onChange(newValue);
    }
  };

  const handleDone = () => {
    if (!datePart) {
      setOpen(false);
      return;
    }
    const fullValue = `${datePart}T${time}`;
    onChange(fullValue);
    onCommit?.(fullValue);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
    onCommit?.('');
    setTime('00:00:00');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold mb-2 text-[var(--color-text-body)] dark:text-slate-200">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative" ref={datePickerRef}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          className={[
            'w-full flex items-center justify-between px-3 py-2 h-11 rounded-lg text-sm transition-all',
            'bg-white dark:bg-slate-800',
            'border border-[var(--color-gray-300)] dark:border-slate-600',
            error
              ? 'border-[var(--color-error)] text-[var(--color-error)]'
              : open
                ? 'border-[var(--color-primary-focus)] bg-[var(--color-primary-light)] dark:bg-blue-900/20'
                : 'hover:border-[var(--color-gray-400)] dark:hover:border-slate-500',
            disabled
              ? 'cursor-not-allowed text-[var(--color-gray-400)] bg-[var(--color-gray-100)] dark:bg-slate-700'
              : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={`flex items-center gap-2 ${
              !value
                ? 'text-[var(--color-gray-400)] dark:text-slate-100'
                : 'text-[var(--color-gray-900)] dark:text-slate-100'
            }`}
          >
            <Calendar size={15} className="text-[var(--color-gray-400)] dark:text-slate-100" />
            {value ? formatDisplay(value, showTime) : placeholder}
          </span>
          {value && !disabled ? (
            <X
              size={14}
              className="text-[var(--color-gray-400)] dark:text-slate-500 hover:text-[var(--color-gray-600)] dark:hover:text-slate-300"
              onClick={handleClear}
            />
          ) : null}
        </button>

        {open &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={calendarRef}
              className="fixed z-[9999] w-64 rounded-lg border border-[var(--color-gray-200)] dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
                  className="p-1 rounded hover:bg-[var(--color-gray-100)] dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft
                    size={16}
                    className="text-[var(--color-gray-600)] dark:text-slate-300"
                  />
                </button>

                <span className="text-xs font-semibold text-[var(--color-gray-900)] dark:text-slate-100">
                  {MONTHS[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 rounded hover:bg-[var(--color-gray-100)] dark:hover:bg-slate-700"
                >
                  <ChevronRight
                    size={16}
                    className="text-[var(--color-gray-600)] dark:text-slate-300"
                  />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((day) => (
                  <span
                    key={day}
                    className="text-center text-[11px] font-medium text-[var(--color-gray-400)] dark:text-slate-500 py-0.5"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Date cells */}

              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({
                  length: firstDay,
                }).map((_, index) => (
                  <span key={`empty-${index}`} />
                ))}

                {Array.from({
                  length: daysInMonth,
                }).map((_, index) => {
                  const day = index + 1;

                  const iso = toISO(viewYear, viewMonth, day);

                  const isSelected = iso === datePart;

                  const isToday =
                    iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());

                  const dayDisabled = isDisabled(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => handleSelect(day)}
                      className={[
                        'w-6 h-6 mx-auto flex items-center justify-center rounded-full text-xs transition-colors',

                        isSelected
                          ? 'bg-[var(--color-primary-focus)] text-white font-semibold'
                          : isToday
                            ? 'border border-[var(--color-primary-focus)] text-[var(--color-primary-focus)] font-semibold dark:text-blue-400 dark:border-blue-400'
                            : 'hover:bg-[var(--color-primary-light)] dark:hover:bg-blue-900/30 text-[var(--color-gray-700)] dark:text-slate-200',

                        dayDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time picker */}

              {showTime && (
                <div className="mt-3 pt-3 border-t border-[var(--color-gray-200)] dark:border-slate-700 flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--color-gray-500)] dark:text-slate-400 font-medium">
                    Time
                  </span>

                  <input
                    type="time"
                    step={1}
                    value={time}
                    onChange={(event) => handleTimeChange(event.target.value)}
                    className="text-sm border border-[var(--color-gray-300)] dark:border-slate-600 rounded-md px-2 py-1 bg-white dark:bg-slate-700 text-[var(--color-gray-900)] dark:text-slate-100 focus:outline-none focus:border-[var(--color-primary-focus)]"
                  />

                  <button
                    type="button"
                    onClick={handleDone}
                    disabled={!datePart}
                    className="text-xs px-3 py-1 bg-[var(--color-primary-focus)] text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {hint && !error && (
        <p className="mt-1 text-xs text-[var(--color-gray-400)] dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
};
