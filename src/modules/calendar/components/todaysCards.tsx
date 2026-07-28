import moment from 'moment';
import { CalendarEvent } from '../types';

interface TodayCardProps {
  events: CalendarEvent[];
  currentDate: Date;
}

const TodayCard = ({ events, currentDate }: TodayCardProps) => {
  const today = currentDate;

  const todayEvents = events.filter((event) => moment(event.start).isSame(today, 'day'));
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold">Today</h3>

      <p className="mb-4 text-sm text-gray-500">{moment(today).format('ddd, MMMM D, YYYY')}</p>

      {todayEvents.length > 0 ? (
        <div className="space-y-3">
          {todayEvents.map((event) => (
            <div key={event.id} className="rounded-xl bg-blue-50 px-3 py-3">
              <p className="text-sm font-medium text-blue-700">{event.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No events today</p>
      )}
    </div>
  );
};

export default TodayCard;
