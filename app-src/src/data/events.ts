import type { CalendarEvent } from '../types';

export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Soju Night',
    allDay: false,
    startDate: 'Wed, April 2, 2026',
    startTime: '1:30 PM',
    endDate: 'Wed, April 2, 2026',
    endTime: '3:30 PM',
    repeats: false,
    notes: 'Person A, B, C are coming over to our apartment we getting crunked tonight.',
    createdBy: 'Billy Bob Joe',
  },
];
