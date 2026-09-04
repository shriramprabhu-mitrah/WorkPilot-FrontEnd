import { EventPropGetter } from 'react-big-calendar';
import { CalendarEvent } from '../types';
import { colors } from '@/src/styles/colors';

export interface SprintColorPalette {
  name: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  accent: string;
  dotColor: string;
}

export const sprintPalettes: SprintColorPalette[] = [
  {
    name: 'indigo',
    bgLight: '#eef2ff',
    bgDark: '#1e1b4b',
    borderLight: '#6366f1',
    borderDark: '#818cf8',
    textLight: '#3730a3',
    textDark: '#e0e7ff',
    accent: '#4f46e5',
    dotColor: '#6366f1',
  },
  {
    name: 'emerald',
    bgLight: '#ecfdf5',
    bgDark: '#064e3b',
    borderLight: '#10b981',
    borderDark: '#34d399',
    textLight: '#065f46',
    textDark: '#d1fae5',
    accent: '#059669',
    dotColor: '#10b981',
  },
  {
    name: 'violet',
    bgLight: '#f5f3ff',
    bgDark: '#3b0764',
    borderLight: '#8b5cf6',
    borderDark: '#a78bfa',
    textLight: '#5b21b6',
    textDark: '#ede9fe',
    accent: '#7c3aed',
    dotColor: '#8b5cf6',
  },
  {
    name: 'amber',
    bgLight: '#fffbeb',
    bgDark: '#451a03',
    borderLight: '#f59e0b',
    borderDark: '#fbbf24',
    textLight: '#92400e',
    textDark: '#fef3c7',
    accent: '#d97706',
    dotColor: '#f59e0b',
  },
  {
    name: 'sky',
    bgLight: '#f0f9ff',
    bgDark: '#082f49',
    borderLight: '#0ea5e9',
    borderDark: '#38bdf8',
    textLight: '#0369a1',
    textDark: '#e0f2fe',
    accent: '#0284c7',
    dotColor: '#0ea5e9',
  },
  {
    name: 'rose',
    bgLight: '#fff1f2',
    bgDark: '#4c0519',
    borderLight: '#f43f5e',
    borderDark: '#fb7185',
    textLight: '#9f1239',
    textDark: '#ffe4e6',
    accent: '#e11d48',
    dotColor: '#f43f5e',
  },
  {
    name: 'teal',
    bgLight: '#f0fdfa',
    bgDark: '#134e4a',
    borderLight: '#14b8a6',
    borderDark: '#2dd4bf',
    textLight: '#115e59',
    textDark: '#ccfbf1',
    accent: '#0d9488',
    dotColor: '#14b8a6',
  },
];

export const getSprintPalette = (indexOrId?: number | string): SprintColorPalette => {
  if (typeof indexOrId === 'number') {
    return sprintPalettes[Math.abs(indexOrId) % sprintPalettes.length];
  }
  if (typeof indexOrId === 'string') {
    let hash = 0;
    for (let i = 0; i < indexOrId.length; i++) {
      hash = (hash << 5) - hash + indexOrId.charCodeAt(i);
      hash |= 0;
    }
    return sprintPalettes[Math.abs(hash) % sprintPalettes.length];
  }
  return sprintPalettes[0];
};

export const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  if (event.type === 'Sprint') {
    const palette = getSprintPalette(event.colorIndex ?? event.id);
    return {
      style: {
        backgroundColor: isDarkMode ? palette.bgDark : palette.bgLight,
        color: isDarkMode ? palette.textDark : palette.textLight,
        border: 'none',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '0',
        overflow: 'hidden',
      },
    };
  }

  const styleMap = {
    Meeting: {
      backgroundColor: isDarkMode ? '#7c2d12' : colors.priorityHighBg,
      color: isDarkMode ? '#fed7aa' : colors.priorityHighText,
    },
    Task: {
      backgroundColor: isDarkMode ? '#1e3a8a' : colors.colTodoBg,
      color: isDarkMode ? '#93c5fd' : colors.colTodo,
    },
  };

  const style = styleMap[event.type as 'Meeting' | 'Task'] || styleMap.Task;

  return {
    style: {
      backgroundColor: style.backgroundColor,
      color: style.color,
      border: 'none',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      padding: '1px 4px',
    },
  };
};
