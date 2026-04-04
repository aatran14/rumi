import type { Task } from '../types';

export const SAMPLE_TASKS: Task[] = [
  { id: '1', title: 'Wipe Counters', assignee: 'Bob', weight: 3, deadlineDate: 'Jun 12, 2024', deadlineTime: '5:00 PM', repeat: false, done: false },
  { id: '2', title: 'Take out trash', assignee: 'Bob', weight: 2, deadlineDate: 'Jun 12, 2024', deadlineTime: '8:00 AM', repeat: true, repeatFrequency: 'Weekly', done: false },
  { id: '3', title: 'Vacuum living room', assignee: 'Bob', weight: 5, deadlineDate: 'Jun 14, 2024', deadlineTime: '12:00 PM', repeat: false, done: false },
  { id: '4', title: 'Eat more ranch', assignee: 'Bobbita', weight: 1, deadlineDate: 'Jun 10, 2024', deadlineTime: '9:41 AM', repeat: false, done: true },
];

export const TASK_FILTERS = ['today', 'archived', 'in progress', 'all'] as const;
