import moment from 'moment';
import { CalendarEvent } from '../types';
import { Chip } from '@/src/app/components/common/chip';
import { colors } from '@/src/styles/colors';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  currentDate: Date;
  onSprintClick?: (event: CalendarEvent) => void;
}

const eventStyles = {
  Sprint: { color: colors.colInReview, bg: colors.colInReviewBg, date: colors.colInReview },
  Meeting: {
    color: colors.priorityHighText,
    bg: colors.priorityHighBg,
    date: colors.priorityHighText,
  },
  Task: { color: colors.primary, bg: colors.primaryLight, date: colors.primary },
};

const UpcomingEvents = ({ events, currentDate, onSprintClick }: UpcomingEventsProps) => {
  const upcomingEvents = events
    .filter((e) => moment(e.start).isSame(currentDate, 'month'))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-slate-100">
        Upcoming This Month
      </h2>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const style = eventStyles[event.type];
          return (
            <div
              key={event.id}
              onClick={() => {
                if (event.type === 'Sprint') {
                  onSprintClick?.(event);
                }
              }}
              className={`flex gap-2 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 transition-colors ${
                event.type === 'Sprint'
                  ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  : ''
              }`}
            >
              <div className="flex w-9 flex-col items-start">
                <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
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
                <p className="text-xs text-gray-600 dark:text-slate-300">{event.title}</p>
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
          <p className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            No events this month
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
