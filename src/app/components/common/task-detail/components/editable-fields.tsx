import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, ChevronRight, Hash, Pencil, Plus } from 'lucide-react';
import type { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { PriorityDot } from './badges';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const EditableText = ({
  value,
  onChange,
  placeholder = 'None',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    onChange(draft.trim() || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`w-full text-sm border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="flex items-center gap-1.5 w-full text-left group/edit"
    >
      <span className={`text-sm font-medium ${value ? 'text-gray-800' : 'text-gray-400'}`}>
        {value || placeholder}
      </span>
      <Pencil
        size={12}
        className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
};

export const EditableDate = ({
  value,
  onChange,
  placeholder = 'None',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const today = new Date();

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const validParsed = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;

  const [viewYear, setViewYear] = useState(() => validParsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => validParsed?.getMonth() ?? today.getMonth());

  const openCalendar = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const safeYear = Number.isNaN(viewYear) ? today.getFullYear() : viewYear;
  const safeMonth = Number.isNaN(viewMonth)
    ? today.getMonth()
    : Math.min(11, Math.max(0, viewMonth));
  const firstDay = new Date(safeYear, safeMonth, 1).getDay();
  const daysInMonth = new Date(safeYear, safeMonth + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const selectDay = (day: number) => {
    const mm = String(safeMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${safeYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    validParsed &&
    validParsed.getFullYear() === safeYear &&
    validParsed.getMonth() === safeMonth &&
    validParsed.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === safeYear && today.getMonth() === safeMonth && today.getDate() === day;

  const displayValue = validParsed
    ? `${MONTHS[validParsed.getMonth()]} ${validParsed.getDate()}, ${validParsed.getFullYear()}`
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openCalendar}
        className="flex items-center gap-1.5 text-left group/edit"
      >
        {displayValue ? (
          <span className="flex items-center gap-1.5 text-sm text-gray-800">
            <Calendar size={12} className="text-gray-400" />
            {displayValue}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Calendar size={12} />
            {placeholder}
          </span>
        )}
        <Pencil
          size={11}
          className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={calendarRef}
            className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] p-4 w-80"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <span className="text-sm font-bold text-gray-800">
                {MONTHS[safeMonth]} {safeYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <span key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && selectDay(day)}
                  className={`h-9 w-full rounded-lg text-sm font-medium transition-colors ${
                    !day
                      ? 'invisible'
                      : day !== null && isSelected(day)
                        ? 'text-white font-bold'
                        : day !== null && isToday(day)
                          ? 'font-bold text-blue-600 bg-blue-50 ring-1 ring-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={
                    day !== null && isSelected(day)
                      ? { backgroundColor: colors.primary }
                      : undefined
                  }
                >
                  {day}
                </button>
              ))}
            </div>
            {value && (
              <button
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="mt-3 w-full text-xs font-medium text-gray-400 hover:text-red-500 transition-colors text-center pt-2 border-t border-gray-100"
              >
                Clear date
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export const EditableNumber = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const n = Number.parseInt(draft, 10);
    onChange(Number.isNaN(n) ? value : n);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-20 text-sm border border-blue-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="flex items-center gap-1.5 group/edit"
    >
      <span className="flex items-center gap-1.5 text-sm text-gray-800">
        <Hash size={12} className="text-gray-400" />
        {value}
      </span>
      <Pencil
        size={11}
        className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
};

const PRIORITY_LIST: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export const EditablePriority = ({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (v: Priority) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 group/edit">
        <PriorityDot priority={value} />
        <Pencil
          size={11}
          className="text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0"
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[130px]">
          {PRIORITY_LIST.map((priority) => (
            <button
              key={priority}
              onClick={() => {
                onChange(priority);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <PriorityDot priority={priority} />
              {priority === value && <Check size={11} className="ml-auto text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const EditableLabels = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const addLabel = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {value.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
        >
          {label}
          <button
            onClick={() => onChange(value.filter((item) => item !== label))}
            className="hover:text-red-500 transition-colors leading-none"
          >
            ×
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={addLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addLabel();
            if (e.key === 'Escape') {
              setDraft('');
              setAdding(false);
            }
          }}
          placeholder="Label…"
          className="text-xs border border-blue-400 rounded-full px-2 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors px-1"
        >
          <Plus size={11} /> Add
        </button>
      )}
    </div>
  );
};
