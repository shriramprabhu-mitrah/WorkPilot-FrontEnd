import { useEffect, useRef, useState } from 'react';
import { Check, Hash, Pencil, Plus } from 'lucide-react';
import type { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { PriorityDot } from './badges';
import { WpDatePicker } from '@/src/app/components/common/datepicker';

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
  includeTime = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  includeTime?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync with parent when value prop changes.
  // Defer updating local state to avoid calling setState() synchronously within the effect.
  useEffect(() => {
    if (value === localValue) return;

    const timeoutId = setTimeout(() => setLocalValue(value), 0);
    return () => clearTimeout(timeoutId);
  }, [value, localValue]);

  const handleCommit = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative z-[100]">
      <WpDatePicker
        value={localValue}
        onChange={setLocalValue} // Update local state for intermediate changes (calendar UI)
        onCommit={handleCommit} // Call API only on Done/commit
        placeholder={placeholder}
        showTime={includeTime}
      />
    </div>
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
                setOpen(false);
                onChange(priority);
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
