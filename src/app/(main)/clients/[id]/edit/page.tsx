import { ClientForm } from '@/components/client-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getClient(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if(error || !data) {
        notFound();
    }
    return data;
}


export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to all clients
      </Link>
      <ClientForm client={client} />
    </div>
  );
}
