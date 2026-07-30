import { EventPropGetter } from 'react-big-calendar';
import { CalendarEvent } from '../types';
import { colors } from '@/src/styles/colors';

export const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
  const styleMap = {
    Sprint: {
      backgroundColor: colors.colInReviewBg,
      color: colors.colInReview,
    },
    Meeting: {
      backgroundColor: colors.priorityHighBg,
      color: colors.priorityHighText,
    },
    Task: {
      backgroundColor: colors.colTodoBg,
      color: colors.colTodo,
    },
  };

  const style = styleMap[event.type];

  return {
    style: {
      backgroundColor: style.backgroundColor,
      color: style.color,
      border: 'none',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      padding: '2px 10px',
    },
  };
};
