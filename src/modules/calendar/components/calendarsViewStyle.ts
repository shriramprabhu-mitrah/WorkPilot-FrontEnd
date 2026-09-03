import { EventPropGetter } from 'react-big-calendar';
import { CalendarEvent } from '../types';
import { colors } from '@/src/styles/colors';

export const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
  // Check if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const styleMap = {
    Sprint: {
      backgroundColor: isDarkMode ? '#312e81' : colors.colInReviewBg, // Dark indigo for dark mode
      color: isDarkMode ? '#c4b5fd' : colors.colInReview, // Light purple text for dark mode
    },
    Meeting: {
      backgroundColor: isDarkMode ? '#7c2d12' : colors.priorityHighBg,
      color: isDarkMode ? '#fed7aa' : colors.priorityHighText,
    },
    Task: {
      backgroundColor: isDarkMode ? '#1e3a8a' : colors.colTodoBg,
      color: isDarkMode ? '#93c5fd' : colors.colTodo,
    },
  };

  const style = styleMap[event.type];

  return {
    style: {
      backgroundColor: style.backgroundColor,
      color: style.color,
      border: 'none',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      padding: '1px 4px',
    },
  };
};
