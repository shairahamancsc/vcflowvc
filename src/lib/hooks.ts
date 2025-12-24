
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
    // Don't perform any redirects until the auth state is fully resolved.
    if (loading) {
      return;
    }

    const isPublicPath = ['/login', '/signup', '/', '/clients/signup'].some(p => pathname.startsWith(p));
    
    // Redirect logged-in users away from public pages.
    if (when === 'loggedIn' && user) {
       if (isPublicPath) {
         router.push(to);
       }
    }
    
    // Redirect logged-out users away from protected pages.
    if (when === 'loggedOut' && !user) {
      if (!isPublicPath) {
        router.push(to);
      }
    }
  }, [user, loading, router, to, when, pathname]);
}
