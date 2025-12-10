'use client';
import { StatCard } from './stat-card';
import { OverviewChart } from './overview-chart';
import { PerformanceChart } from './performance-chart';
import { Users, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { serviceRequests, users, clients } from '@/lib/data';

export function AdminDashboard() {
  const totalClients = clients.length;
  const pendingRequests = serviceRequests.filter((r) => r.status === 'Pending').length;
  const completedRequests = serviceRequests.filter((r) => r.status === 'Completed').length;
  const inProgressRequests = serviceRequests.filter((r) => r.status === 'In Progress').length;
  
  return (
    <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clients"
        value={totalClients}
        description="Number of active clients"
        icon={Users}
        color="text-sky-500"
      />
      <StatCard
        title="Pending Requests"
        value={pendingRequests}
        description="Awaiting technician assignment"
        icon={AlertTriangle}
        color="text-orange-500"
      />
      <StatCard
        title="In Progress"
        value={inProgressRequests}
        description="Currently being worked on"
        icon={Wrench}
        color="text-blue-500"
      />
      <StatCard
        title="Completed This Month"
        value={completedRequests}
        description="Tasks finished in the last 30 days"
        icon={CheckCircle}
        color="text-green-500"
      />

      <div className="lg:col-span-4 grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
        <OverviewChart requests={serviceRequests} />
        <PerformanceChart requests={serviceRequests} users={users} />
      </div>
    </div>
  );
}
