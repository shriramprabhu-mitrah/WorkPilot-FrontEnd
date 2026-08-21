import moment from 'moment';
import { CalendarEvent } from '../types';

interface TodayCardProps {
  events: CalendarEvent[];
  currentDate: Date;
}

const TodayCard = ({ events, currentDate }: TodayCardProps) => {
  const todayEvents = events.filter((e) => moment(e.start).isSame(currentDate, 'day'));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-slate-100">Today</h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
        {moment(currentDate).format('ddd, MMMM D, YYYY')}
      </p>

      {todayEvents.length > 0 ? (
        <div className="space-y-3">
          {todayEvents.map((event) => (
            <div key={event.id} className="rounded-xl bg-blue-50 dark:bg-blue-900/30 px-3 py-3">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{event.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-slate-500">No events today</p>
      )}
    </div>
  );
};

export default TodayCard;
