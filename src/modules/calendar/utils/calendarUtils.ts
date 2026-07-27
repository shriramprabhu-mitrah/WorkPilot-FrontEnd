import { CalendarEvent } from '../types';

export const expandMultiDayEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  return events.flatMap((event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (start.toDateString() === end.toDateString()) {
      return event;
    }

    const expanded: CalendarEvent[] = [];
    const current = new Date(start);

    while (current <= end) {
      const eventStart = new Date(current);
      eventStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

      const eventEnd = new Date(current);
      eventEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);

      expanded.push({
        ...event,
        id: Number(`${event.id}${expanded.length + 1}`),
        start: eventStart,
        end: eventEnd,
      });

      current.setDate(current.getDate() + 1);
    }
    return expanded;
  });
};
