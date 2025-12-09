'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as AppUser } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/config';

export interface AuthContextType {
  user: AppUser | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
      setSupabase(createClient());
    }
  }, []);


  const loadUser = useCallback(async () => {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const appUser = mockUsers.find(u => u.email === session.user.email);
        setUser(appUser || null);
      }
    } else if (!isSupabaseConfigured) {
      const storedUserEmail = localStorage.getItem('user-email');
      if (storedUserEmail) {
        const appUser = mockUsers.find(u => u.email === storedUserEmail);
        setUser(appUser || null);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUser();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setLoading(true);
          if (event === 'SIGNED_IN' && session?.user) {
            const appUser = mockUsers.find(u => u.email === session.user.email);
            setUser(appUser || null);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
          setLoading(false);
        }
      );
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, [loadUser, supabase]);
  
  const login = async (email: string) => {
    if (!isSupabaseConfigured) {
      const appUser = mockUsers.find(u => u.email === email);
      if (appUser) {
        localStorage.setItem('user-email', email);
        setUser(appUser);
      } else {
        throw new Error('User not found');
      }
    }
    // Supabase login is handled on the login page directly
  };


  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('user-email');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
