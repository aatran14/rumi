import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import type { Task, Roommate, CalendarEvent, SyncMessage, SyncState } from '../types';
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
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncContext must be used within SyncProvider');
  return ctx;
}

function getServerUrl(): string | null {
  if (Platform.OS === 'web') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }
  return null;
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [tasks,     setTasksLocal]     = useState<Task[]>(SAMPLE_TASKS);
  const [roommates, setRoommatesLocal] = useState<Roommate[]>(SAMPLE_ROOMMATES);
  const [events,    setEventsLocal]    = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [connected, setConnected]      = useState(false);
  const wsRef           = useRef<WebSocket | null>(null);
  const reconnectTimer  = useRef<ReturnType<typeof setTimeout>>(undefined);

  const send = useCallback((msg: SyncMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    const url = getServerUrl();
    if (!url) return;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => { setConnected(true); send({ type: 'request_sync' }); };
      ws.onmessage = (e) => {
        try {
          const msg: SyncMessage = JSON.parse(e.data);
          switch (msg.type) {
            case 'sync':            setTasksLocal(msg.state.tasks); setRoommatesLocal(msg.state.roommates); setEventsLocal(msg.state.events); break;
            case 'update_tasks':    setTasksLocal(msg.tasks);     break;
            case 'update_roommates':setRoommatesLocal(msg.roommates); break;
            case 'update_events':   setEventsLocal(msg.events);   break;
          }
        } catch {}
      };
      ws.onclose = () => { setConnected(false); wsRef.current = null; reconnectTimer.current = setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
    } catch {}
  }, [send]);

  useEffect(() => {
    connect();
    return () => { clearTimeout(reconnectTimer.current); wsRef.current?.close(); };
  }, [connect]);

  const setTasks     = useCallback((t: Task[])      => { setTasksLocal(t);     send({ type: 'update_tasks',     tasks: t });     }, [send]);
  const setRoommates = useCallback((r: Roommate[])  => { setRoommatesLocal(r); send({ type: 'update_roommates', roommates: r }); }, [send]);
  const setEvents    = useCallback((e: CalendarEvent[]) => { setEventsLocal(e); send({ type: 'update_events',   events: e });    }, [send]);

  return (
    <SyncContext.Provider value={{ tasks, roommates, events, setTasks, setRoommates, setEvents, connected }}>
      {children}
    </SyncContext.Provider>
  );
}
