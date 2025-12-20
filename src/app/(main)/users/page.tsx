
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { UsersTable } from '@/components/users-table';
import Link from 'next/link';
import { User } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

async function getUsers() {
    const supabase = createClient();
    const { data } = await supabase.from('users').select('*');
    const appUsers: User[] = data?.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email || '',
      role: u.role,
      avatarUrl: u.avatar_url || '',
      status: u.status || 'Active',
    })) || [];
    return appUsers;
}

export default async function UsersPage() {
  const users = await getUsers();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage users.
          </p>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New User
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
