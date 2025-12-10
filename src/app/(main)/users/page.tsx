'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { UsersTable } from '@/components/users-table';
import Link from 'next/link';
import { User } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function UsersSkeleton() {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchUsers = async () => {
      setLoading(true);
      // Note: Supabase policy should restrict this to admins
      const { data, error } = await supabase.from('users').select('*');
      if (data) {
        setUsers(data);
      }
      if(error){
        console.error("Error fetching users", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

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

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          {loading ? <UsersSkeleton /> : <UsersTable users={users} />}
        </CardContent>
      </Card>
    </div>
  );
}
