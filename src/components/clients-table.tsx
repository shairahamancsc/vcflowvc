
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Loader2, Edit } from 'lucide-react';
import { Client } from '@/lib/types';
import { format } from 'date-fns';
import { useTransition, useState } from 'react';
import { deleteClientAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients: initialClients }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = (clientId: string) => {
    startTransition(async () => {
      const result = await deleteClientAction(clientId);
      if (result.success) {
        setClients(clients.filter(c => c.id !== clientId));
        toast({ title: 'Success', description: 'Client deleted.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Client Since</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">
                <Link href={`/clients/${client.id}`} className="hover:underline">
                    {client.name}
                </Link>
            </TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{format(new Date(client.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/clients/${client.id}`}>View Client</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="#">Edit Client</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(client.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Client
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
