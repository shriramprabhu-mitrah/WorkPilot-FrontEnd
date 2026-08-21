'use client';

import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

const months = moment.months();

const MonthYearPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(value.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (!open) setYear(value.getFullYear());
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-lg font-semibold text-gray-900 dark:text-slate-100 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        {moment(value).format('MMMM YYYY')}
        <ChevronDown size={16} className="text-gray-500 dark:text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-72 sm:w-80 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 shadow-xl">
          {/* Year navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setYear(year - 1)}
              className="rounded-lg p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{year}</h3>
            <button
              onClick={() => setYear(year + 1)}
              className="rounded-lg p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const selected = index === value.getMonth() && year === value.getFullYear();
              return (
                <button
                  key={month}
                  onClick={() => {
                    onChange(new Date(year, index, 1));
                    setOpen(false);
                  }}
                  className={`rounded-lg p-3 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
