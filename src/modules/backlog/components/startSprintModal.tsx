'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

interface StartSprintModalProps {
  sprint: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onStart: () => void;
}

const StartSprintModal = ({
  sprint,
  onClose,
  onStart,
}: StartSprintModalProps) => {
  const getToday = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const [startDate, setStartDate] = useState(getToday());
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [duration, setDuration] = useState('2');
  const [autoComplete, setAutoComplete] = useState(false);

  const calculateEndDate = () => {
    const date = new Date(`${startDate}T00:00:00`);

    date.setDate(date.getDate() + Number(duration) * 7 - 1);

    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const endDate = calculateEndDate();

  const handleStart = () => {
    onStart();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Start Sprint
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {/* Work item count */}
          <p className="mb-5 text-sm text-gray-700">
            <strong>1</strong> work item will be included in this sprint.
          </p>

          <p className="mb-2 text-sm text-gray-700">
            Required fields are marked with an asterisk{' '}
            <span className="text-red-500">*</span>
          </p>

          <div className="space-y-4">
            {/* Sprint name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Sprint name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={sprint.name}
                className="h-9 w-full rounded-md border border-gray-300  px-2.5 text-sm text-gray-700 outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Duration <span className="text-red-500">*</span>
              </label>

              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">1 week</option>
                <option value="2">2 weeks</option>
                <option value="3">3 weeks</option>
                <option value="4">4 weeks</option>
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Start date <span className="text-red-500">*</span>
              </label>

              <div className="flex h-9 items-center rounded-md border border-gray-300 bg-white">
                <Calendar
                  size={16}
                  className="ml-2.5 shrink-0 text-gray-500"
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-full flex-1 border-0 bg-transparent px-2 text-sm text-gray-700 outline-none"
                />

                <input
                  type="time"
                  value={(() => {
                    const [time, modifier] = startTime.split(' ');
                    let hours = time.split(':')[0];
                    const minutes = time.split(':')[1];

                    if (modifier === 'PM' && hours !== '12') {
                      hours = String(Number(hours) + 12);
                    }

                    if (modifier === 'AM' && hours === '12') {
                      hours = '00';
                    }

                    return `${hours.padStart(2, '0')}:${minutes}`;
                  })()}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const hour = Number(hours);

                    const formattedHour =
                      hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

                    const modifier = hour >= 12 ? 'PM' : 'AM';

                    setStartTime(
                      `${formattedHour}:${minutes} ${modifier}`
                    );
                  }}
                  className="mr-2 h-full w-[95px] border-0 bg-transparent text-sm text-gray-700 outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setStartTime('');
                  }}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Date format: MM/DD/YYYY. Time format: e.g. 1:00 PM.
              </p>
            </div>

            {/* End date */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                End date <span className="text-red-500">*</span>
              </label>

              <div className="flex h-9 items-center rounded-md border border-gray-300 bg-gray-100">
                <Calendar
                  size={16}
                  className="ml-2.5 text-gray-400"
                />

                <input
                  type="text"
                  value={endDate}
                  disabled
                  readOnly
                  className="flex-1 border-0 bg-transparent px-2 text-sm text-gray-400 outline-none"
                />

                <span className="mr-3 text-sm text-gray-400">
                  {startTime}
                </span>
              </div>
            </div>

            {/* Automatically complete sprint */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={autoComplete}
                onClick={() => setAutoComplete((prev) => !prev)}
                className={`relative flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${autoComplete ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
              >
                <span
                  className={`block h-3 w-3 rounded-full bg-white transition-transform ${autoComplete ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                />
              </button>

              <span className="text-sm font-semibold text-gray-700">
                Automatically complete sprint
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <WpButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </WpButton>

          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleStart}
          >
            Start
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default StartSprintModal;