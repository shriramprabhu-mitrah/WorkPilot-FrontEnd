'use client';

import moment from 'moment';
import { CalendarEvent } from '../types';
import { Chip } from '@/src/app/components/common/chip';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  currentDate: Date;
}

const eventStyles = {
  Sprint: {
    color: '#8B5CF6',
    bg: '#F5F0FF',
    date: '#7C3AED',
  },
  Meeting: {
    color: '#F97316',
    bg: '#FFF5EB',
    date: '#EA580C',
  },
  Task: {
    color: '#2563EB',
    bg: '#EEF4FF',
    date: '#2563EB',
  },
};

const UpcomingEvents = ({ events, currentDate }: UpcomingEventsProps) => {
  const upcomingEvents = events
    .filter((event) => moment(event.start).isSame(currentDate, 'month'))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">Upcoming This Month</h2>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const style = eventStyles[event.type];

          return (
            <div
              key={event.id}
              className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex w-9 flex-col items-start">
                <span className="text-[11px] font-medium text-gray-500">
                  {moment(event.start).format('ddd')}
                </span>

                <span
                  className="mt-1 text-2xl font-bold leading-none"
                  style={{ color: style.date }}
                >
                  {moment(event.start).format('DD')}
                </span>
              </div>

              <div className="flex flex-1 flex-col">
                <p className="text-xs  text-gray-600">{event.title}</p>

                <Chip
                  label={event.type.toLowerCase()}
                  color={style.color}
                  bg={style.bg}
                  className="mt-2 w-fit rounded-md px-2 py-0.5 text-[10px]"
                />
              </div>
            </div>
          );
        })}

        {upcomingEvents.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">No events this month</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
