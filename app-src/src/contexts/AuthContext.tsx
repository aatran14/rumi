import React, { createContext, useContext, useState } from 'react';

const USER_COLORS = ['#FF6B6B','#4ECDC4','#FFD93D','#6C63FF','#FF9F43','#A29BFE','#00B894','#FD79A8'];

function pickRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export type User = { username: string; displayName: string; color: string };

type AuthContextValue = {
  user: User | null;
  signIn: (username: string) => void;
  signUp: (username: string, displayName: string) => void;
  setUserColor: (color: string) => void;
  signOut: () => void;
  availableColors: string[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const DEMO_USERS: Record<string, User> = {
  daniel: { username: 'daniel', displayName: 'Daniel', color: '#FF6B6B' },
  gaya:   { username: 'gaya',   displayName: 'Gaya',   color: '#4ECDC4' },
  adriel: { username: 'adriel', displayName: 'Adriel', color: '#FFD93D' },
  andy:   { username: 'andy',   displayName: 'Andy',   color: '#A29BFE' },
  guest:  { username: 'guest',  displayName: 'Guest',  color: '#6C63FF' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const signIn = (username: string) => {
    const k = username.trim().toLowerCase();
    if (DEMO_USERS[k]) setUser({ ...DEMO_USERS[k] });
  };
  const signUp = (username: string, displayName: string) =>
    setUser({ username: username.trim().toLowerCase(), displayName, color: pickRandomColor() });
  const setUserColor = (color: string) => setUser((prev) => (prev ? { ...prev, color } : null));
  const signOut = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, signIn, signUp, setUserColor, signOut, availableColors: USER_COLORS }}>
      {children}
    </AuthContext.Provider>
  );
}
