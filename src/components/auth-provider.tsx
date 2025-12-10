'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as AppUser } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthContextType {
  user: AppUser | null;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser, client: SupabaseClient) => {
    const { data: profile, error } = await client
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } else {
      setUser(profile);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (supabase) {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user, supabase);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    };
    checkUser();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setLoading(true);
          if (session?.user) {
            await fetchUserProfile(session.user, supabase);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, [supabase, fetchUserProfile]);
  
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
