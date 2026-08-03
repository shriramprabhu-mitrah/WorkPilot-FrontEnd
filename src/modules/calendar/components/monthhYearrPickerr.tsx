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
    if (!open) {
      setYear(value.getFullYear());
    }
    setOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-lg font-semibold shadow-sm hover:bg-gray-50"
      >
        {moment(value).format('MMMM YYYY')}
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 w-72 sm:w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setYear(year - 1)} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronLeft size={18} />
            </button>

            <h3 className="font-semibold">{year}</h3>

            <button onClick={() => setYear(year + 1)} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronRight size={18} />
            </button>
          </div>

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
                  className={`rounded-lg p-3 text-sm transition ${
                    selected ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
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
