import type { Roommate } from '../types';

export const SAMPLE_ROOMMATES: Roommate[] = [
  { id: '1', name: 'Guest',  status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F44B} just got here',   bubbleColor: '#6C63FF', timestamp: 'just now' },
  { id: '2', name: 'Gaya',   status: 'Away', statusEmoji: '\u{1F44B}', bubble: '\u{1F92F} Bored af',     bubbleColor: '#4ECDC4', timestamp: '4/3 1:40pm' },
  { id: '3', name: 'Adriel', status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F512} Locked in!!!', bubbleColor: '#FF9F43' },
  { id: '4', name: 'Daniel', status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F480} leave me alone', bubbleColor: '#A29BFE' },
];
