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

    // Definitive fix: Check for the admin email first and return immediately if it matches.
    if (sbUser.email === 'shsirahaman.csc@gmail.com') {
      const { data: profile } = await supabase
        .from('users')
        .select('name, avatar_url, status')
        .eq('id', sbUser.id)
        .maybeSingle();

      return {
        id: sbUser.id,
        email: sbUser.email,
        name: profile?.name || sbUser.user_metadata?.name || sbUser.email,
        role: 'admin', // Force the role to admin.
        avatarUrl: profile?.avatar_url || sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || sbUser.email}`,
        status: profile?.status || 'Active',
      };
    }
    
    // For all other users, fetch their profile from the database.
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sbUser.id)
      .maybeSingle(); 
    
    if (error) {
      console.error('Error fetching user profile:', error, JSON.stringify(error, null, 2));
    }

    // Default to 'technician' if profile or role is missing for non-admin users.
    const userRole = profile?.role || 'technician';

    return {
      id: sbUser.id,
      email: sbUser.email!,
      name: profile?.name || sbUser.user_metadata?.name || sbUser.email!,
      role: userRole,
      avatarUrl: profile?.avatar_url || sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || sbUser.email!}`,
      status: profile?.status || 'Active',
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
