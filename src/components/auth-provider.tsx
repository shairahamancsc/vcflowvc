'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { SplashScreen } from './splash-screen';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
      await supabase.auth.signOut();
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

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUser = await getActiveUser(session?.user ?? null);
      setUser(activeUser);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
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
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
       {loading ? <SplashScreen /> : children}
    </AuthContext.Provider>
  );
}
