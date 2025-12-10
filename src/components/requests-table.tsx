'use client';

import React, { useState, useTransition } from 'react';
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
import { MoreHorizontal, FileText, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { ServiceRequest } from '@/lib/types';
import { format } from 'date-fns';
import { StatusBadge } from './status-badge';
import { useAuth } from '@/lib/hooks';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { updateServiceRequestStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


function SentimentIcon({ sentiment }: { sentiment: string | null }) {
    if (!sentiment) return null;
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes('positive')) return <Smile className="h-5 w-5 text-green-500" />;
    if (lowerSentiment.includes('negative')) return <Frown className="h-5 w-5 text-red-500" />;
    if (lowerSentiment.includes('neutral')) return <Meh className="h-5 w-5 text-gray-500" />;
    return null;
}

const statusOptions: ServiceRequest['status'][] = [
    'Pending',
    'In Progress',
    'Awaiting Parts',
    'Ready for Pickup',
    'Out for Delivery',
    'Completed',
    'Cancelled'
];

export function RequestsTable({ requests: initialRequests }: RequestsTableProps) {
  const [requests, setRequests] = useState(initialRequests);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (requestId: string, status: ServiceRequest['status']) => {
    startTransition(async () => {
      const result = await updateServiceRequestStatus(requestId, status);
      if(result.success) {
        setRequests(requests.map(req => req.id === requestId ? { ...req, status, updated_at: new Date().toISOString() } : req));
        toast({
          title: "Status Updated",
          description: `Request status changed to "${status}".`,
        });
      } else {
        toast({
          title: "Error updating status",
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  }

  const isAdminOrTech = user?.role === 'admin' || user?.role === 'technician';

  return (
    <>
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
              <TableCell>{format(new Date(request.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      {isPending && selectedRequest?.id === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {isAdminOrTech && <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        {statusOptions.map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(request.id, status)}
                            disabled={request.status === status || isPending}
                          >
                            Mark as {status}
                          </DropdownMenuItem>
                        ))}
                    </>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedRequest?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Full details for the service request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 text-sm">
            <p><strong className="font-medium">Client:</strong> {selectedRequest?.clientName}</p>
            <p><strong className="font-medium">Description:</strong> {selectedRequest?.description}</p>
            
            {selectedRequest?.aiSummary && (
                <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                         <CardTitle className="text-base flex items-center gap-2">
                            AI Summary
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <SentimentIcon sentiment={selectedRequest.aiSentiment || null} />
                            {selectedRequest.aiSentiment}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80">{selectedRequest.aiSummary}</p>
                    </CardContent>
                </Card>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface RequestsTableProps {
  requests: ServiceRequest[];
}
