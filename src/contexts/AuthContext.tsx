import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserData } from '../types';
import { getUser, saveUser, getCurrentUser, setCurrentUser, logout as doLogout } from '../utils/storage';

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => string | null;
  register: (email: string, password: string) => string | null;
  logout: () => void;
  updateProfile: (data: Partial<Pick<UserData, 'nickname' | 'avatar'>>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  useEffect(() => { const u = getCurrentUser(); if (u) setUser(u); }, []);
  const refreshUser = () => { const u = getCurrentUser(); setUser(u); };
  const login = (email: string, password: string): string | null => {
    const u = getUser(email); if (!u) return '该邮箱未注册'; if (u.password !== password) return '密码错误';
    setCurrentUser(email); setUser(u); return null;
  };
  const register = (email: string, password: string): string | null => {
    if (getUser(email)) return '该邮箱已注册';
    const newUser: UserData = {
      email, password, nickname: email.split('@')[0], avatar: '',
      hearts: 5, points: 0, lastHeartRegen: Date.now(),
      progress: { english: 0, german: 0, russian: 0, french: 0, japanese: 0 }
    };
    saveUser(newUser); setCurrentUser(email); setUser(newUser); return null;
  };
  const handleLogout = () => { doLogout(); setUser(null); };
  const handleUpdateProfile = (data: Partial<Pick<UserData, 'nickname' | 'avatar'>>) => {
    if (!user) return; const updated = { ...user, ...data }; saveUser(updated); setUser(updated);
  };
  return (
    <AuthContext.Provider value={{ user, login, register, logout: handleLogout, updateProfile: handleUpdateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth'); return ctx; }
