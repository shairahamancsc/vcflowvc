'use client';
import { StatCard } from './stat-card';
import { OverviewChart } from './overview-chart';
import { PerformanceChart } from './performance-chart';
import { Users, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ServiceRequest, User, Client } from '@/lib/types';
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingRequests: 0,
    completedRequests: 0,
    inProgressRequests: 0,
  });
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const fetchData = async () => {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' });
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (clientsData) setStats(prev => ({ ...prev, totalClients: clientsData.length }));
      if (requestsData) {
        setRequests(requestsData);
        setStats(prev => ({
          ...prev,
          pendingRequests: requestsData.filter((r) => r.status === 'Pending').length,
          completedRequests: requestsData.filter((r) => r.status === 'Completed').length,
          inProgressRequests: requestsData.filter((r) => r.status === 'In Progress').length,
        }));
      }
      if (usersData) setUsers(usersData);
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clients"
        value={stats.totalClients}
        description="Number of active clients"
        icon={Users}
        color="text-sky-500"
      />
      <StatCard
        title="Pending Requests"
        value={stats.pendingRequests}
        description="Awaiting technician assignment"
        icon={AlertTriangle}
        color="text-orange-500"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgressRequests}
        description="Currently being worked on"
        icon={Wrench}
        color="text-blue-500"
      />
      <StatCard
        title="Completed This Month"
        value={stats.completedRequests}
        description="Tasks finished in the last 30 days"
        icon={CheckCircle}
        color="text-green-500"
      />

      <div className="lg:col-span-4 grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
        <OverviewChart requests={requests} />
        <PerformanceChart requests={requests} users={users} />
      </div>
    </div>
  );
}
