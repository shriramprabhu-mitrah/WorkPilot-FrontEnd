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
    <div className="flex h-full w-full items-center gap-1.5 overflow-hidden rounded-md bg-gray-100 px-2 text-[#292727] dark:bg-gray-800 dark:text-slate-200"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          event.type === 'Sprint' ? 'bg-[var(--sprint-color)] dark:bg-gray-400' : ''
        }`}
        style={event.type === 'Sprint' ? undefined : { backgroundColor: style.color }}
      />

      <span className="truncate text-[11px] font-semibold">{event.title}</span>
    </div>
  );
};

export default CustomEvent;
