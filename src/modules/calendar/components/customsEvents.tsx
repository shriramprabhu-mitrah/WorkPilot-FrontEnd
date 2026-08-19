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
      className="flex h-full w-full items-center gap-1.5 overflow-hidden rounded-md px-2"
      style={{
        backgroundColor: '#f3f4f6',
        color: '#292727',
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: style.color,
        }}
      />

      <span className="truncate text-[11px] font-semibold">
        {event.title}
      </span>
    </div>
  );
};

export default CustomEvent;
