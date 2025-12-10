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
import { MoreHorizontal, Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAction, updateUserStatusAction } from '@/app/actions';

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(
    initialUsers.map(u => ({...u, status: u.status || 'Active' }))
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (userId: string, status: 'Active' | 'Blocked') => {
    startTransition(async () => {
      const result = await updateUserStatusAction(userId, status);
      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
        toast({ title: 'Success', description: `User status updated to ${status}.`});
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
      }
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        setUsers(users.filter(u => u.id !== userId));
        toast({ title: 'Success', description: 'User deleted.'});
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
      }
    });
  }


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
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem disabled={isPending}>Edit User</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.status === 'Active' ? (
                     <DropdownMenuItem disabled={isPending} onClick={() => handleStatusChange(user.id, 'Blocked')}>
                      Block User
                    </DropdownMenuItem>
                  ) : (
                     <DropdownMenuItem disabled={isPending} onClick={() => handleStatusChange(user.id, 'Active')}>
                      Unblock User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    disabled={isPending}
                    onClick={() => handleDelete(user.id)}
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
