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
    
    // The user profile should now be created by the database trigger.
    // We just need to fetch it.
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sbUser.id)
      .maybeSingle(); // Use maybeSingle() to prevent error on 0 rows
    
    if (error) {
      console.error('Error fetching user profile:', error, JSON.stringify(error, null, 2));
      // If the profile is not found, it might be due to replication delay.
      // We'll return a basic user object for now and let the auth listener update it.
      return {
        id: sbUser.id,
        email: sbUser.email!,
        name: sbUser.user_metadata?.name || sbUser.email!,
        role: 'customer', // Default role
        avatarUrl: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sbUser.email!}`,
        status: 'Active',
      };
    }

    if (!profile) {
       // Profile doesn't exist yet, likely due to replication delay.
       // Return a temporary user object.
       return {
        id: sbUser.id,
        email: sbUser.email!,
        name: sbUser.user_metadata?.name || sbUser.email!,
        role: 'customer', // Default role
        avatarUrl: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sbUser.email!}`,
        status: 'Active',
      };
    }

    return {
      id: sbUser.id,
      email: sbUser.email!,
      name: profile.name || sbUser.email!,
      role: profile.role || 'customer',
      avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`,
      status: profile.status || 'Active',
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = await getActiveUser(session?.user ?? null);
      setUser(activeUser);
      setLoading(false);
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
        setLoading(false);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
