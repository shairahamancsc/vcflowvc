
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { RequestsTable } from '@/components/requests-table';
import { ServiceRequest } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

async function getRequestsData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('service_requests').select(`
    *,
    client:clients(name),
    assignee:users(name)
  `);

  if (user && user.role !== 'admin') {
     const { data: profile } = await supabase.from('users').select('id, role').eq('id', user.id).single();
     if(profile?.role === 'technician') {
        query = query.eq('assignedToId', user.id);
     }
  }
  
  const { data, error } = await query;
  let role = 'admin';
  if(user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    role = profile?.role || 'technician';
  }


  if (error) {
    console.error("Error fetching requests:", error);
    return { requests: [], role: 'technician' };
  }

  const formattedData = data.map((r: any) => ({
    ...r,
    clientName: r.client?.name,
    assignedToName: r.assignee?.name,
  }));
  
  return { requests: formattedData, role };
}


export default async function RequestsPage() {
  const { requests, role } = await getRequestsData();
  const pageTitle = role === 'admin' ? 'Service Requests' : 'My Tasks';
  const pageDescription =
    role === 'admin'
      ? 'Manage and track all client service requests.'
      : 'Here are all the tasks assigned to you.';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {role === 'admin' && (
          <Button asChild>
            <Link href="/requests/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <RequestsTable requests={requests} />
        </CardContent>
      </Card>
    </div>
  );
}
