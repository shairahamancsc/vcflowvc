'use client';

import React, { useState } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { ServiceRequest } from '@/lib/types';
import { format } from 'date-fns';
import { StatusBadge } from './status-badge';
import { useAuth } from '@/lib/hooks';

interface RequestsTableProps {
  requests: ServiceRequest[];
}

export function RequestsTable({ requests: initialRequests }: RequestsTableProps) {
  const [requests, setRequests] = useState(initialRequests);
  const { user } = useAuth();

  const handleStatusChange = (requestId: string, status: ServiceRequest['status']) => {
    // In a real app, this would be an API call.
    // Here, we just update the local state.
    setRequests(requests.map(req => req.id === requestId ? { ...req, status } : req));
  }

  const isTechnician = user?.role === 'technician';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.clientName}</TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
            <TableCell>{request.priority}</TableCell>
            <TableCell>{request.assignedToName || 'Unassigned'}</TableCell>
            <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => handleStatusChange(request.id, status as ServiceRequest['status'])}
                      disabled={request.status === status}
                    >
                      Mark as {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
