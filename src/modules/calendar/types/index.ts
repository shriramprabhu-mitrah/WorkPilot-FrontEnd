import { Event } from 'react-big-calendar';

export type EventType = 'Sprint' | 'Meeting' | 'Task';

export interface CalendarEvent extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
}
