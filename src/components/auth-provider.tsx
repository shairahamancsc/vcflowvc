
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as AppUser } from '@/lib/types';
import { SplashScreen } from './splash-screen';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: AppUser | null;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  version: string;
  waitForUser: () => Promise<AppUser>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, version }: { children: ReactNode, version: string }) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // A resolver for the waitForUser promise.
  let resolveUserPromise: (user: AppUser) => void;
  const userPromise = new Promise<AppUser>(resolve => {
    resolveUserPromise = resolve;
  });

  const getActiveUser = useCallback(async (sbUser: SupabaseUser | null): Promise<AppUser | null> => {
    if (!sbUser) {
      return null;
    }

    if (sbUser.email === 'shsirahaman.csc@gmail.com') {
      const userName = sbUser.user_metadata?.name || sbUser.email!;
      return {
        id: sbUser.id,
        email: sbUser.email,
        name: userName,
        role: 'admin',
        avatarUrl: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`,
        status: 'Active',
      };
    }
    
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sbUser.id)
      .single(); 
    
    if (error) {
      console.error('Error fetching user profile:', error);
    }

    const userRole = profile?.role || 'technician';
    const userName = profile?.name || sbUser.user_metadata?.name || sbUser.email!;

    return {
      id: sbUser.id,
      email: sbUser.email!,
      name: userName,
      role: userRole,
      avatarUrl: profile?.avatar_url || sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`,
      status: profile?.status || 'Active',
    };
  }, [supabase]);

  useEffect(() => {
    const processSession = async (session: Session | null) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
        setLoading(false);
        if (activeUser) {
          resolveUserPromise(activeUser);
        }
    };

    // First, check for the initial session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      processSession(session);

      // Then, set up the auth state change listener.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          processSession(session);
      });

      return () => {
        subscription?.unsubscribe();
      };
    });
  }, [getActiveUser, supabase.auth, resolveUserPromise]);


  const login = async (email: string, pass: string) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password: pass });
    // The onAuthStateChange listener will handle setting the user and loading state.
    return result;
  };
  
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };
  
  const waitForUser = () => user ? Promise.resolve(user) : userPromise;


  if (loading && !user) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, version, waitForUser }}>
      {children}
    </AuthContext.Provider>
  );
}
