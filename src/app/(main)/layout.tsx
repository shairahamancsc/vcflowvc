'use client';

import { ReactNode } from 'react';
import { useAuthRedirect } from '@/lib/hooks';
import { SidebarNav } from '@/components/sidebar-nav';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/hooks';
import { SplashScreen } from '@/components/splash-screen';

export default function MainLayout({ children }: { children: ReactNode }) {
  useAuthRedirect({ to: '/login', when: 'loggedOut' });
  const { user } = useAuth();

  if (!user) {
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
