'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { RequestsTable } from '@/components/requests-table';
import { useAuth } from '@/lib/hooks';
import { ServiceRequest } from '@/lib/types';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const getRequests = async () => {
      const supabase = createClient();
      let query = supabase.from('service_requests').select(`
        *,
        client:clients(name),
        assignee:users(name)
      `);

      if (user?.role === 'technician') {
        query = query.eq('assignedToId', user.id);
      }
      
      const { data, error } = await query;

      if (data) {
        const formattedData = data.map((r: any) => ({
          ...r,
          clientName: r.client?.name,
          assignedToName: r.assignee?.name,
        }));
        setRequests(formattedData);
      }
    };
    
    if (user) {
      getRequests();
    }
  }, [user]);

  const pageTitle = user?.role === 'admin' ? 'Service Requests' : 'My Tasks';
  const pageDescription =
    user?.role === 'admin'
      ? 'Manage and track all client service requests.'
      : 'Here are all the tasks assigned to you.';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {user?.role === 'admin' && (
          <Button asChild>
            <Link href="/requests/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <RequestsTable requests={requests} />
        </CardContent>
      </Card>
    </div>
  );
}
