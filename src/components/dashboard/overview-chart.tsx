'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServiceRequest } from '@/lib/types';
import { format, subMonths, startOfMonth } from 'date-fns';

interface OverviewChartProps {
  requests: ServiceRequest[];
}

export function OverviewChart({ requests }: OverviewChartProps) {
  const data = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const month = startOfMonth(date);
    return {
      name: format(month, 'MMM'),
      Pending: 0,
      'In Progress': 0,
      Completed: 0,
    };
  });

  requests.forEach(req => {
    const monthStr = format(new Date(req.createdAt), 'MMM');
    const monthData = data.find(d => d.name === monthStr);
    if (monthData && req.status !== 'Cancelled') {
      monthData[req.status]++;
    }
  });

  return (
     <Card className="col-span-1 lg:col-span-2 shadow-soft">
      <CardHeader>
        <CardTitle>Service Requests Overview</CardTitle>
        <CardDescription>Requests over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="Pending" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="In Progress" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Completed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
