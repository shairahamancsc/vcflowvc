'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { RequestsTable } from '@/components/requests-table';
import { useAuth } from '@/lib/hooks';
import { createClient } from '@/lib/supabase/client';
import { ServiceRequest } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchRequests = async () => {
      setLoading(true);
      let query = supabase.from('service_requests').select(`
        *,
        clients ( name )
      `).order('created_at', { ascending: false });

      if(user?.role === 'technician') {
        query = query.eq('assignedToId', user.id);
      }

      const { data, error } = await query;
      
      if (data) {
        const transformedData = data.map(r => ({
          ...r,
          clientName: (r.clients as { name: string })?.name || 'Unknown Client',
        })) as ServiceRequest[];
        setRequests(transformedData);
      }

      if (error) {
        console.error('Error fetching service requests:', error);
      }
      setLoading(false);
    };

    if (user) {
      fetchRequests();
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
          {loading ? <RequestsSkeleton /> : <RequestsTable requests={requests} />}
        </CardContent>
      </Card>
    </div>
  );
}
