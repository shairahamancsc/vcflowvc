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
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(
    initialUsers.map(u => ({...u, status: 'Active' as 'Active' | 'Blocked' }))
  );
  const { toast } = useToast();

  const handleAction = (userId: string, action: 'delete' | 'block' | 'unblock') => {
     // In a real app, this would call a server action to securely update the user.
    // For this prototype, we'll just show a success message and update local state.
    toast({
      title: `Action: ${action}`,
      description: `User ${userId} has been ${action}d (simulated).`,
    });

    if (action === 'delete') {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, status: action === 'block' ? 'Blocked' : 'Active' } : u));
    }
  };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell>
              <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
            </TableCell>
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
                  <DropdownMenuItem>Edit User</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.status === 'Active' ? (
                     <DropdownMenuItem onClick={() => handleAction(user.id, 'block')}>
                      Block User
                    </DropdownMenuItem>
                  ) : (
                     <DropdownMenuItem onClick={() => handleAction(user.id, 'unblock')}>
                      Unblock User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onClick={() => handleAction(user.id, 'delete')}
                  >
                    Delete User
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
