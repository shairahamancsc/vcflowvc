'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

export interface AuthContextType {
  user: User | null;
  login: (role: 'admin' | 'technician') => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('serviceflow-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('serviceflow-user');
    }
    setLoading(false);
  }, []);

  const login = (role: 'admin' | 'technician') => {
    const userToLogin = users.find((u) => u.role === role);
    if (userToLogin) {
      setUser(userToLogin);
      localStorage.setItem('serviceflow-user', JSON.stringify(userToLogin));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('serviceflow-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
