import React, { createContext, useContext, useState } from 'react';

const USER_COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#FFD93D', // golden yellow
  '#6C63FF', // purple (brand accent)
  '#FF9F43', // warm orange
  '#A29BFE', // soft lavender
  '#00B894', // emerald
  '#FD79A8', // pink
];

function pickRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export type User = {
  username: string;
  displayName: string;
  color: string;
};

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

// Hardcoded users for the demo
const DEMO_USERS: Record<string, User> = {
  daniel: { username: 'daniel', displayName: 'Daniel', color: '#FF6B6B' },
  gaya: { username: 'gaya', displayName: 'Gaya', color: '#4ECDC4' },
  adriel: { username: 'adriel', displayName: 'Adriel', color: '#FFD93D' },
  andy: { username: 'andy', displayName: 'Andy', color: '#A29BFE' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (username: string) => {
    const key = username.trim().toLowerCase();
    const demo = DEMO_USERS[key];
    if (demo) {
      setUser({ ...demo });
    }
  };

  const signUp = (username: string, displayName: string) => {
    setUser({
      username: username.trim().toLowerCase(),
      displayName,
      color: pickRandomColor(),
    });
  };

  const setUserColor = (color: string) => {
    setUser((prev) => (prev ? { ...prev, color } : null));
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, setUserColor, signOut, availableColors: USER_COLORS }}
    >
      {children}
    </AuthContext.Provider>
  );
}
