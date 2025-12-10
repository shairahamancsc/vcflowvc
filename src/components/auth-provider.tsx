'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';
import { SplashScreen } from './splash-screen';

export interface AuthContextType {
  user: AppUser | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user
    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (loggedInUserEmail) {
      const foundUser = mockUsers.find(u => u.email === loggedInUserEmail);
      setUser(foundUser || null);
    }
    // Use a timeout to simulate async loading and show splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('loggedInUser', foundUser.email);
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
