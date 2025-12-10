'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServiceRequest, User } from '@/lib/types';
import { useAuth } from '@/lib/hooks';

interface PerformanceChartProps {
  requests: ServiceRequest[];
  users: User[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function PerformanceChart({ requests, users: allUsers }: PerformanceChartProps) {
  const { user } = useAuth();
  const isTechnician = user?.role === 'technician';

  const data = isTechnician
    ? [
        { name: 'Completed', value: requests.filter(r => r.assignedToId === user.id && r.status === 'Completed').length },
        { name: 'In Progress', value: requests.filter(r => r.assignedToId === user.id && r.status === 'In Progress').length },
        { name: 'Pending', value: requests.filter(r => r.assignedToId === user.id && r.status === 'Pending').length },
      ]
    : allUsers
        .filter(u => u.role === 'technician')
        .map(u => ({
          name: u.name,
          value: requests.filter(r => r.assignedToId === u.id && r.status === 'Completed').length,
        }));

  return (
    <Card className="col-span-1 shadow-md">
      <CardHeader>
        <CardTitle>{isTechnician ? 'My Task Status' : 'Team Performance'}</CardTitle>
        <CardDescription>{isTechnician ? 'Overview of your assigned tasks.' : 'Completed tasks per technician.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
