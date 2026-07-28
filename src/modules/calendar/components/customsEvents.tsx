import { CalendarEvent } from '../types';
import { colors } from '@/src/styles/colors';

interface Props {
  event: CalendarEvent;
}

const eventColors = {
  Sprint: {
    color: colors.colInReview,
    bg: colors.colInReviewBg,
  },
  Meeting: {
    color: colors.priorityHighText,
    bg: colors.priorityHighBg,
  },
  Task: {
    color: colors.colTodo,
    bg: colors.colTodoBg,
  },
};

const CustomEvent = ({ event }: Props) => {
  const style = eventColors[event.type];

  return (
    <div
      className="flex h-full w-full flex-col justify-center overflow-hidden rounded-md px-2 py-1"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      <span className="truncate text-[10px] font-medium">
        {event.start.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>

      <span className="truncate text-xs font-semibold">{event.title}</span>
    </div>
  );
};

export default CustomEvent;
