'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as AppUser } from '@/lib/types';
import { SplashScreen } from './splash-screen';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();

  const getActiveUser = useCallback(async (sbUser: SupabaseUser | null): Promise<AppUser | null> => {
    if (!sbUser) {
      return null;
    }
    
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sbUser.id)
      .maybeSingle(); // Use maybeSingle to avoid error if profile doesn't exist yet
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (profile) {
      return {
        id: sbUser.id,
        email: sbUser.email!,
        name: profile.name || sbUser.email!,
        role: profile.role || 'customer',
        avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`,
      };
    }

    // If profile is not found, create it
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: sbUser.id,
        name: sbUser.user_metadata?.name || sbUser.email!,
        role: 'customer',
        avatar_url: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sbUser.user_metadata?.name || sbUser.email!}`
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }

    return {
      id: sbUser.id,
      email: sbUser.email!,
      name: newProfile.name,
      role: newProfile.role,
      avatarUrl: newProfile.avatar_url,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const activeUser = await getActiveUser(session?.user ?? null);
        setUser(activeUser);
        setLoading(false);

        if (event === 'SIGNED_IN' && activeUser) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    // Also check initial session
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
