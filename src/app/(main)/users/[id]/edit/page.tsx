import { UserForm } from '@/components/user-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { User } from '@/lib/types';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('users').select('*').eq('id', params.id).single();

  if (error || !data) {
    notFound();
  }

  const user = {
    id: data.id,
    name: data.name,
    email: data.email || '',
    role: data.role,
    avatarUrl: data.avatar_url || '',
    status: data.status || 'Active',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to all users
      </Link>
      <UserForm user={user} />
    </div>
  );
}
