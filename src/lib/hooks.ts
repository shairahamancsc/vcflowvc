
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

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything until authentication state is resolved
    if (loading) {
      return;
    }
    
    const isStaffUser = !!user;
    const isClientLoggedIn = !!Cookies.get('client_id');
    
    const isStaffPath = pathname.startsWith('/dashboard') || pathname.startsWith('/requests') || pathname.startsWith('/clients') || pathname.startsWith('/users') || pathname.startsWith('/settings') || pathname.startsWith('/dealers') || pathname.startsWith('/notes');
    const isPortalPath = pathname.startsWith('/portal');

    // Rule 1: Logged-in staff on a public staff page (like /login) should be redirected to dashboard
    if (isStaffUser && staffPublicPaths.includes(pathname)) {
      router.push('/dashboard');
      return;
    }

    // Rule 2: Logged-in client on a public client page should be redirected to portal
    if (isClientLoggedIn && (clientPublicPaths.includes(pathname))) {
      router.push('/portal');
      return;
    }

    // Rule 3: Not-logged-in user trying to access a protected staff page
    if (!isStaffUser && isStaffPath) {
      router.push('/login');
      return;
    }

    // Rule 4: Not-logged-in client trying to access portal
    if (!isClientLoggedIn && isPortalPath) {
      router.push('/');
      return;
    }

  }, [user, loading, router, pathname]);
}
