'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { SidebarNav } from '@/components/sidebar-nav';
import { Header } from '@/components/header';
import { SplashScreen } from '@/components/splash-screen';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <SplashScreen />;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex lg:w-72">
        <SidebarNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
