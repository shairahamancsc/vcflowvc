'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { ClientsTable } from '@/components/clients-table';
import Link from 'next/link';
import { clients as mockClients } from '@/lib/data';
import { useState } from 'react';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);

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
          <ClientsTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
