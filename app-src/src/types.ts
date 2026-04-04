import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

// --- Navigation Types ---

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  ToDo: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
  Roomies: undefined;
  Calendar: undefined;
  Notifications: undefined;
  Support: undefined;
  FAQ: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Settings: undefined;
  Updates: undefined;
  Profile: undefined;
};

export type TabScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type StackScreenNavigation = NativeStackNavigationProp<RootStackParamList>;

// --- Data Types ---

export type RepeatFrequency = 'Weekly' | 'Biweekly' | 'Monthly' | 'Custom';

export type Task = {
  id: string;
  title: string;
  assignee: string;
  weight: number;        // 1–10 points
  deadlineDate: string;  // e.g. "Jun 10, 2024"
  deadlineTime: string;  // e.g. "9:41 AM"
  repeat: boolean;
  repeatFrequency?: RepeatFrequency;
  done: boolean;
  /** @deprecated kept for compat with old sample data */
  due?: string;
};

export type Roommate = {
  id: string;
  name: string;
  status: 'Home' | 'Away';
  statusEmoji: string;
  bubble: string;
  bubbleColor: string;
  timestamp?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  repeats: boolean;
  notes: string;
  createdBy: string;
};

// --- Sync Protocol ---

export type SyncState = {
  tasks: Task[];
  roommates: Roommate[];
  events: CalendarEvent[];
};

export type SyncMessage =
  | { type: 'sync'; state: SyncState }
  | { type: 'update_tasks'; tasks: Task[] }
  | { type: 'update_roommates'; roommates: Roommate[] }
  | { type: 'update_events'; events: CalendarEvent[] }
  | { type: 'request_sync' };
