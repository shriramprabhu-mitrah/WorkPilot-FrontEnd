import { Event } from 'react-big-calendar';
import type { SprintDetail } from '@/src/types/project';

export type EventType = 'Sprint' | 'Meeting' | 'Task';

export interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  status?: string;
  colorIndex?: number;
  sprint?: SprintDetail;
}
