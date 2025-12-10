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
  import { MoreHorizontal } from 'lucide-react';
  import { Dealer } from '@/lib/types';
  import { format } from 'date-fns';
  
  interface DealersTableProps {
    dealers: Dealer[];
  }
  
  export function DealersTable({ dealers }: DealersTableProps) {
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
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Manage Invoices</DropdownMenuItem>
                    <DropdownMenuItem>Pickup Requests</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Chat</DropdownMenuItem>
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  