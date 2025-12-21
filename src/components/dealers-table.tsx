
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
  import { MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
  import { Dealer } from '@/lib/types';
  import { format } from 'date-fns';
  import { useTransition, useState } from 'react';
  import { deleteDealerAction } from '@/app/actions';
  import { useToast } from '@/hooks/use-toast';
  
  interface DealersTableProps {
    dealers: Dealer[];
  }
  
  export function DealersTable({ dealers: initialDealers }: DealersTableProps) {
    const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDelete = (dealerId: string) => {
      startTransition(async () => {
        const result = await deleteDealerAction(dealerId);
        if (result.success) {
          setDealers(dealers.filter(d => d.id !== dealerId));
          toast({ title: 'Success', description: 'Dealer deleted.' });
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
            <TableHead>Partner Since</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dealers.map((dealer) => (
            <TableRow key={dealer.id}>
              <TableCell className="font-medium">{dealer.name}</TableCell>
              <TableCell>{dealer.email}</TableCell>
              <TableCell>{dealer.phone}</TableCell>
              <TableCell>{format(new Date(dealer.created_at), 'MMM d, yyyy')}</TableCell>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Manage Invoices</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(dealer.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Dealer
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
  
