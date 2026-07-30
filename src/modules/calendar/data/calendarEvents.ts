import { CalendarEvent } from '../types';
export const calendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Sprint Planning',
    start: new Date(2026, 6, 27, 10, 0),
    end: new Date(2026, 6, 29, 11, 0),
    type: 'Sprint',
  },
  {
    id: 2,
    title: 'Client Meeting',
    start: new Date(2026, 6, 30, 14, 0),
    end: new Date(2026, 6, 31, 15, 0),
    type: 'Meeting',
  },
  {
    id: 3,
    title: 'Task Deadline',
    start: new Date(2026, 7, 1, 16, 0),
    end: new Date(2026, 7, 2, 17, 0),
    type: 'Task',
  },
  {
    id: 4,
    title: 'Sprint Planning',
    start: new Date(2026, 6, 15, 14, 0),
    end: new Date(2026, 6, 18, 17, 0),
    type: 'Sprint',
  },
];
