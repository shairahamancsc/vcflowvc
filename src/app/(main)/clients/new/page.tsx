import { ClientForm } from '@/components/client-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to all clients
      </Link>
      <ClientForm />
    </div>
  );
}
