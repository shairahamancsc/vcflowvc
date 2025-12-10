import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (loading) return;

    if (when === 'loggedIn' && user) {
      router.push(to);
    }
    
    if (when === 'loggedOut' && !user) {
      router.push(to);
    }
  }, [user, loading, router, to, when]);
}
