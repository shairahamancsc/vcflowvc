'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
      // If profile doesn't exist, it might be a new user, so we create a partial profile.
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
        setLoading(false);
      }
    );
    
    // Check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const activeUser = await getActiveUser(session.user);
        setUser(activeUser);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [getActiveUser, supabase.auth]);


  const login = async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
