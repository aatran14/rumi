import type { Task } from '../types';

export const SAMPLE_TASKS: Task[] = [
  { id: '1',  title: 'Wipe kitchen counters', assignee: 'Daniel', weight: 2, deadlineDate: 'Apr 19, 2026', deadlineTime: '8:00 PM',  repeat: true,  repeatFrequency: 'Weekly',   done: false },
  { id: '2',  title: 'Take out trash',        assignee: 'Andy',   weight: 2, deadlineDate: 'Apr 20, 2026', deadlineTime: '7:00 AM',  repeat: true,  repeatFrequency: 'Weekly',   done: false },
  { id: '3',  title: 'Vacuum living room',    assignee: 'Gaya',   weight: 5, deadlineDate: 'Apr 21, 2026', deadlineTime: '12:00 PM', repeat: false,                              done: false },
  { id: '4',  title: 'Refill water filter',   assignee: 'Adriel', weight: 1, deadlineDate: 'Apr 19, 2026', deadlineTime: '5:00 PM',  repeat: false,                              done: true  },
  { id: '5',  title: 'Restock paper towels',  assignee: 'Gaya',   weight: 3, deadlineDate: 'Apr 22, 2026', deadlineTime: '6:00 PM',  repeat: false,                              done: false },
  { id: '6',  title: 'Clean bathroom',        assignee: 'Andy',   weight: 6, deadlineDate: 'Apr 23, 2026', deadlineTime: '9:00 AM',  repeat: true,  repeatFrequency: 'Biweekly', done: false },
  { id: '7',  title: 'Pay internet bill',     assignee: 'Daniel', weight: 4, deadlineDate: 'Apr 25, 2026', deadlineTime: '11:59 PM', repeat: true,  repeatFrequency: 'Monthly',  done: false },
  { id: '8',  title: 'Water the plants',      assignee: 'Adriel', weight: 1, deadlineDate: 'Apr 20, 2026', deadlineTime: '9:00 AM',  repeat: true,  repeatFrequency: 'Weekly',   done: false },
  { id: '9',  title: 'Do the dishes',         assignee: 'Daniel', weight: 3, deadlineDate: 'Apr 19, 2026', deadlineTime: '10:00 PM', repeat: false,                              done: true  },
  { id: '10', title: 'Buy groceries',         assignee: 'Gaya',   weight: 5, deadlineDate: 'Apr 20, 2026', deadlineTime: '4:00 PM',  repeat: false,                              done: false },
];

export const TASK_FILTERS = ['today', 'archived', 'in progress', 'all'] as const;
