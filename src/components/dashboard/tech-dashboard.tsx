'use client';
import { StatCard } from './stat-card';
import { PerformanceChart } from './performance-chart';
import { useAuth } from '@/lib/hooks';
import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ServiceRequest, User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function TechDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('service_requests')
        .select(`*, clients (name)`)
        .eq('assignedToId', user.id);

      if (data) {
         const transformedData = data.map(r => ({
          ...r,
          clientName: (r.clients as { name: string })?.name || 'Unknown Client',
        })) as ServiceRequest[];
        setTasks(transformedData);
      }
      if (error) {
        console.error('Error fetching tasks:', error);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  if (!user) return null;

  const pendingTasks = tasks.filter((r) => r.status === 'Pending').length;
  const inProgressTasks = tasks.filter(
    (r) => r.status === 'In Progress'
  ).length;
  const completedTasks = tasks.filter((r) => r.status === 'Completed').length;
  const recentTasks = tasks
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
      <StatCard
        title="My Pending Tasks"
        value={pendingTasks}
        description="Tasks assigned to you"
        icon={AlertTriangle}
        color="text-orange-500"
      />
      <StatCard
        title="My In-Progress Tasks"
        value={inProgressTasks}
        description="Tasks you are working on"
        icon={Wrench}
        color="text-blue-500"
      />
      <StatCard
        title="My Completed Tasks"
        value={completedTasks}
        description="Total tasks you've completed"
        icon={CheckCircle}
        color="text-green-500"
      />

      <div className="lg:col-span-3 grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle>My Recent Tasks</CardTitle>
            <CardDescription>Your 5 most recently assigned tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : (
                 <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.clientName}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === 'Completed' ? 'default' : 'secondary'
                        }
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
        <PerformanceChart requests={tasks} users={[]} />
      </div>
    </div>
  );
}
