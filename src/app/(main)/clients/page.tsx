'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { ClientsTable } from '@/components/clients-table';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Client } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ClientsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchClients = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('clients').select('*');
      if (data) {
        setClients(data);
      }
      if (error) {
        console.error('Error fetching clients:', error);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client profiles.</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          {loading ? <ClientsSkeleton /> : <ClientsTable clients={clients} />}
        </CardContent>
      </Card>
    </div>
  );
}
