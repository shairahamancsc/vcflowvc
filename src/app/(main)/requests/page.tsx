'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { RequestsTable } from '@/components/requests-table';
import { serviceRequests } from '@/lib/data';
import { useAuth } from '@/lib/hooks';

export default function RequestsPage() {
  const { user } = useAuth();
  
  const displayRequests = user?.role === 'admin' 
    ? serviceRequests 
    : serviceRequests.filter(r => r.assignedToId === user?.id);
  
  const pageTitle = user?.role === 'admin' ? 'Service Requests' : 'My Tasks';
  const pageDescription = user?.role === 'admin' 
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
          <RequestsTable requests={displayRequests} />
        </CardContent>
      </Card>
    </div>
  );
}
