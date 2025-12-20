
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { TechDashboard } from '@/components/dashboard/tech-dashboard';
import { ServiceRequest, User, Client } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

async function getDashboardData() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { requests: [], users: [], clients: [], currentUser: null };
  }
  
  const { data: requests } = await supabase.from('service_requests').select(`
    *,
    client:clients(name)
  `);
  const { data: usersData } = await supabase.from('users').select('id, name, email, role, avatar_url, status');
  const { data: clients } = await supabase.from('clients').select('*');
  
  const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  const appUsers: User[] = usersData?.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email || '',
    role: u.role,
    avatarUrl: u.avatar_url || '',
    status: u.status || 'Active',
  })) || [];

  const currentUser: User | null = profile ? {
    id: profile.id,
    name: profile.name,
    email: profile.email || '',
    role: profile.role,
    avatarUrl: profile.avatar_url || '',
    status: profile.status || 'Active',
  } : null;

  const formattedRequests = requests?.map((r: any) => ({
        ...r,
        clientName: r.client?.name,
  })) || [];


  return {
    requests: formattedRequests as ServiceRequest[],
    users: appUsers,
    clients: clients as Client[] || [],
    currentUser,
  };
}


export default async function DashboardPage() {
  const { requests, users, clients, currentUser } = await getDashboardData();

  if (!currentUser) {
    // This should ideally not happen due to middleware, but as a fallback.
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        {currentUser.role === 'admin' ? 'Admin Dashboard' : 'Technician Dashboard'}
      </h1>
      {currentUser.role === 'admin' ? (
        <AdminDashboard requests={requests} users={users} clients={clients} />
      ) : (
        <TechDashboard requests={requests} users={users} />
      )}
    </div>
  );
}
