import type { Roommate } from '../types';
import { colors } from '../theme';

export const SAMPLE_ROOMMATES: Roommate[] = [
  {
    id: '1',
    name: 'Daniel',
    status: 'Home',
    statusEmoji: '\u{1F3E0}',
    bubble: '\u{1F512} Locked in!!!',
    bubbleColor: '#FF6B6B',
    timestamp: '4/3 2:39pm',
  },
  {
    id: '2',
    name: 'Gaya',
    status: 'Away',
    statusEmoji: '\u{1F44B}',
    bubble: '\u{1F92F} Bored af',
    bubbleColor: '#4ECDC4',
    timestamp: '4/3 1:40pm',
  },
  {
    id: '3',
    name: 'Adriel',
    status: 'Home',
    statusEmoji: '\u{1F3E0}',
    bubble: '\u{1F512} Locked in!!!',
    bubbleColor: colors.orange,
  },
  {
    id: '4',
    name: 'Andy',
    status: 'Home',
    statusEmoji: '\u{1F3E0}',
    bubble: '\u{1F480} leave me alone',
    bubbleColor: '#A29BFE',
  },
];
