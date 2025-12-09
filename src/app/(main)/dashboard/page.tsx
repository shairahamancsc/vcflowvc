'use client';

import { useAuth } from '@/lib/hooks';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { TechDashboard } from '@/components/dashboard/tech-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        {user?.role === 'admin' ? 'Admin Dashboard' : 'Technician Dashboard'}
      </h1>
      {user?.role === 'admin' ? <AdminDashboard /> : <TechDashboard />}
    </div>
  );
}
