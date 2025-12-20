'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { ClientsTable } from '@/components/clients-table';
import Link from 'next/link';
import { Client } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/splash-screen';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getClients = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from('clients').select('*');
      setClients(data || []);
      setLoading(false);
    };
    getClients();
  }, []);
  
  if (loading) {
    return <SplashScreen />;
  }

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

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <ClientsTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
