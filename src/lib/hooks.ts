
'use client';

import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthRedirect({ to, when }: { to: string, when: 'loggedIn' | 'loggedOut'}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform redirects once the auth state is fully resolved
    if (loading) return;

    if (when === 'loggedIn' && user) {
      if(pathname !== to) {
        router.push(to);
      }
    }
    
    if (when === 'loggedOut' && !user) {
       // A list of public paths that don't need redirection when logged out.
      const publicPaths = ['/login', '/signup', '/', '/clients/signup'];
      if (publicPaths.includes(pathname) || pathname.startsWith('/clients/signup')) {
        return;
      }
      router.push(to);
    }
  }, [user, loading, router, to, when, pathname]);
}
