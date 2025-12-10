'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Button } from './ui/button';
import { LayoutDashboard, Users, Wrench, ListChecks, FileText, Handshake } from 'lucide-react';

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/requests', label: 'Service Requests', icon: Wrench },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/dealers', label: 'Dealers', icon: Handshake },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/notes', label: 'Notes', icon: FileText },
];

const techNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/requests', label: 'My Tasks', icon: ListChecks },
  { href: '/notes', label: 'Notes', icon: FileText },
];

export function SidebarNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems = user?.role === 'admin' ? adminNavItems : techNavItems;

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
            className="w-full justify-start text-base h-12"
          >
            <Link href={item.href}>
              <item.icon className="mr-4 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
