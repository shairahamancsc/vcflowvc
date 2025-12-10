'use client';

import { useAuth } from '@/lib/hooks';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { TechDashboard } from '@/components/dashboard/tech-dashboard';
import { ServiceRequest, User, Client } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/splash-screen';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    requests: ServiceRequest[];
    users: User[];
    clients: Client[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: requests } = await supabase.from('service_requests').select('*');
      const { data: usersData } = await supabase.from('users').select('id, name, email, role, avatar_url');
      const { data: clients } = await supabase.from('clients').select('*');

      const appUsers = usersData?.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email || '',
        role: u.role,
        avatarUrl: u.avatar_url || '',
      })) || [];

      setData({
        requests: requests as ServiceRequest[] || [],
        users: appUsers,
        clients: clients as Client[] || [],
      });
    };
    fetchData();
  }, []);


  if (!data || !user) {
    return <SplashScreen />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        {user.role === 'admin' ? 'Admin Dashboard' : 'Technician Dashboard'}
      </h1>
      {user.role === 'admin' ? <AdminDashboard {...data} /> : <TechDashboard requests={data.requests} users={data.users} />}
    </div>
  );
}
