"use client";

import React, { useState, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOutsideClick } from "@/src/hooks/useOutsideClick";

interface WpDatePickerProps {
  label?: string;
  value?: string; // ISO date string: "YYYY-MM-DD"
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

export const WpDatePicker = ({
  label,
  value = "",
  placeholder = "Select a date",
  error,
  hint,
  disabled = false,
  min,
  max,
  onChange,
}: WpDatePickerProps) => {
  const today = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const toISO = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isDisabled = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    return (min && iso < min) || (max && iso > max) ? true : false;
  };

  const handleSelect = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    onChange(iso);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
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
            "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all bg-white",
            error
              ? "border-[var(--color-error)]"
              : open
              ? "border-[var(--color-primary-focus)] ring-2 ring-[rgba(37,99,235,0.2)]"
              : "border-[var(--color-gray-300)] hover:border-[var(--color-gray-400)]",
            disabled ? "bg-[var(--color-gray-100)] cursor-not-allowed text-[var(--color-gray-400)]" : "cursor-pointer",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={`flex items-center gap-2 ${!value ? "text-[var(--color-gray-400)]" : "text-[var(--color-gray-900)]"}`}>
            <Calendar size={15} className="text-[var(--color-gray-400)]" />
            {value ? formatDisplay(value) : placeholder}
          </span>
          {value && !disabled ? (
            <X size={14} className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)]" onClick={handleClear} />
          ) : null}
        </button>

        {open && (
          <div className="absolute z-50 mt-1 bg-white border border-[var(--color-gray-200)] rounded-lg shadow-lg p-3 w-72">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-[var(--color-gray-100)]">
                <ChevronLeft size={16} className="text-[var(--color-gray-600)]" />
              </button>
              <span className="text-sm font-semibold text-[var(--color-gray-900)]">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-[var(--color-gray-100)]">
                <ChevronRight size={16} className="text-[var(--color-gray-600)]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <span key={d} className="text-center text-xs font-medium text-[var(--color-gray-400)] py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const iso = toISO(viewYear, viewMonth, day);
                const isSelected = iso === value;
                const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
                const disabled = isDisabled(day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(day)}
                    className={[
                      "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary-focus)] text-white font-semibold"
                        : isToday
                        ? "border border-[var(--color-primary-focus)] text-[var(--color-primary-focus)] font-semibold"
                        : "hover:bg-[var(--color-primary-light)] text-[var(--color-gray-700)]",
                      disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-gray-400)]">{hint}</p>}
    </div>
  );
};
