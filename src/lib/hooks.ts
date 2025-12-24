
'use client';

import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const staffPublicPaths = ['/login', '/signup'];
const clientPublicPaths = ['/', '/clients/signup'];

export function useAuthRedirect({ to, when }: { to: string, when: 'loggedIn' | 'loggedOut'}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything until authentication state is resolved
    if (loading) {
      return;
    }

    const isStaffPath = !clientPublicPaths.includes(pathname) && !pathname.startsWith('/portal');
    const isStaffPublicPath = staffPublicPaths.includes(pathname);
    
    const clientId = Cookies.get('client_id');
    const isClientLoggedIn = !!clientId;
    const isClientPublicPath = clientPublicPaths.includes(pathname);

    if (when === 'loggedIn') {
      // For staff
      if (user && isStaffPublicPath) {
        router.push(to);
      }
      // For clients
      if (isClientLoggedIn && isClientPublicPath) {
        router.push('/portal');
      }
    }

    if (when === 'loggedOut') {
       // For staff
       if (!user && isStaffPath && !isStaffPublicPath) {
         router.push(to);
       }
       // For clients
       if (!isClientLoggedIn && pathname.startsWith('/portal')) {
         router.push('/');
       }
    }

  }, [user, loading, router, to, when, pathname]);
}

    