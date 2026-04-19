import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import type { Task, Roommate, CalendarEvent } from '../types';
import { SAMPLE_TASKS } from '../data/tasks';
import { SAMPLE_ROOMMATES } from '../data/roommates';
import { SAMPLE_EVENTS } from '../data/events';

type SyncContextValue = {
  tasks: Task[];
  roommates: Roommate[];
  events: CalendarEvent[];
  setTasks: (tasks: Task[]) => void;
  setRoommates: (roommates: Roommate[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  connected: boolean;
  roomId: string;
  resetRoom: () => void;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncContext must be used within SyncProvider');
  return ctx;
}

function getRoomIdFromUrl(): string {
  if (Platform.OS !== 'web') return 'default';
  try {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room && room.trim()) return room.trim();
  } catch {}
  return 'default';
}

function storageKey(roomId: string) {
  return `rumi:room:${roomId}`;
}

type RoomState = {
  tasks: Task[];
  roommates: Roommate[];
  events: CalendarEvent[];
};

function seedState(): RoomState {
  return {
    tasks: SAMPLE_TASKS,
    roommates: SAMPLE_ROOMMATES,
    events: SAMPLE_EVENTS,
  };
}

function loadRoom(roomId: string): RoomState {
  if (Platform.OS !== 'web') return seedState();
  try {
    const raw = window.localStorage.getItem(storageKey(roomId));
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<RoomState>;
    return {
      tasks: parsed.tasks ?? SAMPLE_TASKS,
      roommates: parsed.roommates ?? SAMPLE_ROOMMATES,
      events: parsed.events ?? SAMPLE_EVENTS,
    };
  } catch {
    return seedState();
  }
}

function saveRoom(roomId: string, state: RoomState) {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(storageKey(roomId), JSON.stringify(state));
  } catch {}
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const roomId = useMemo(getRoomIdFromUrl, []);
  const initial = useMemo(() => loadRoom(roomId), [roomId]);

  const [tasks, setTasksLocal] = useState<Task[]>(initial.tasks);
  const [roommates, setRoommatesLocal] = useState<Roommate[]>(initial.roommates);
  const [events, setEventsLocal] = useState<CalendarEvent[]>(initial.events);

  useEffect(() => {
    saveRoom(roomId, { tasks, roommates, events });
  }, [roomId, tasks, roommates, events]);

  const setTasks = useCallback((newTasks: Task[]) => setTasksLocal(newTasks), []);
  const setRoommates = useCallback((newRoommates: Roommate[]) => setRoommatesLocal(newRoommates), []);
  const setEvents = useCallback((newEvents: CalendarEvent[]) => setEventsLocal(newEvents), []);

  const resetRoom = useCallback(() => {
    const fresh = seedState();
    setTasksLocal(fresh.tasks);
    setRoommatesLocal(fresh.roommates);
    setEventsLocal(fresh.events);
    saveRoom(roomId, fresh);
  }, [roomId]);

  return (
    <SyncContext.Provider
      value={{
        tasks,
        roommates,
        events,
        setTasks,
        setRoommates,
        setEvents,
        connected: true,
        roomId,
        resetRoom,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
