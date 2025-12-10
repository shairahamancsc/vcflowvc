'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { SplashScreen } from './splash-screen';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthContextType {
  user: AppUser | null;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getActiveUser = async (sbUser: SupabaseUser | null): Promise<AppUser | null> => {
      if (!sbUser) {
        return null;
      }
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sbUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: sbUser.id,
        email: sbUser.email!,
        name: profile?.name || sbUser.email!,
        role: profile?.role || 'customer',
        avatarUrl: profile?.avatar_url || '',
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
        setLoading(false);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    // The onAuthStateChange listener will handle setting the user and loading state.
    if(error) {
      setLoading(false);
    }
    return { error };
  };
  
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
       {loading ? <SplashScreen /> : children}
    </AuthContext.Provider>
  );
}
