import moment from 'moment';
import { CalendarEvent } from '../types';
import { getSprintPalette } from './calendarsViewStyle';
import { colors } from '@/src/styles/colors';

interface Props {
  event: CalendarEvent;
  title?: string;
  continuesPrior?: boolean;
  continuesAfter?: boolean;
}

const eventColors = {
  Meeting: {
    color: colors.priorityHighText,
    bg: colors.priorityHighBg,
  },
  Task: {
    color: colors.colTodo,
    bg: colors.colTodoBg,
  },
};

const CustomEvent = ({ event, continuesPrior, continuesAfter }: Props) => {
  if (event.type === 'Sprint') {
    const palette = getSprintPalette(event.colorIndex ?? event.id);
    const startDate = moment(event.start).format('MMM D');
    const endDate = moment(event.end).format('MMM D');
    const totalDays = Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24)));

    const rawStatus = (event.status || '').toLowerCase();
    const isCompleted = rawStatus.includes('complete') || rawStatus.includes('close') || rawStatus.includes('done');
    const isPlanned = rawStatus.includes('plan') || rawStatus === 'todo';
    const isActive = !isCompleted && !isPlanned;

    const displayStatus = isCompleted ? 'Completed' : isActive ? 'Active' : 'Planned';
    const tooltipText = `${event.title}\nStatus: ${displayStatus}\nTimeline: ${startDate} – ${endDate} (${totalDays}d)\nClick to view sprint tasks`;

    return (
      <div
        title={tooltipText}
        className={`group relative flex h-full w-full items-center justify-between gap-1 overflow-hidden px-1.5 py-0 text-xs transition-all duration-150 hover:brightness-105 active:scale-[0.99] ${
          continuesPrior ? 'rounded-l-none' : 'rounded-l-md'
        } ${continuesAfter ? 'rounded-r-none' : 'rounded-r-md'}`}
        style={{
          borderLeft: continuesPrior ? 'none' : `3.5px solid ${palette.accent}`,
          borderRight: continuesAfter ? `1px dashed ${palette.accent}` : 'none',
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full shadow-xs ring-1 ring-white/50 dark:ring-black/50"
            style={{ backgroundColor: palette.accent }}
          />
          <span className="truncate font-semibold tracking-tight text-[11px] leading-tight">
            {event.title}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`rounded-full px-1.5 py-0 text-[8.5px] font-bold uppercase tracking-wider ${
              isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80'
                : isCompleted
                  ? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 border border-gray-300/80 dark:border-slate-600/80'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/90 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-700/80'
            }`}
          >
            {displayStatus}
          </span>
          <span className="text-[9px] opacity-75 font-medium hidden xs:inline">
            {totalDays}d
          </span>
        </div>
      </div>
    );
  }

  const style = eventColors[event.type as 'Meeting' | 'Task'] || eventColors.Task;

  return (
    <div className="flex h-full w-full items-center gap-1.5 overflow-hidden rounded-md px-2 py-0.5 text-[#292727] dark:text-slate-200">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      <span className="truncate text-[11px] font-semibold">{event.title}</span>
    </div>
  );
};

export default CustomEvent;
