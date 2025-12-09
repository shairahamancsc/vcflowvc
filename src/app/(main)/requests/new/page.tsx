import { RequestForm } from '@/components/request-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewRequestPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <Link href="/requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to all requests
      </Link>
      <RequestForm />
    </div>
  );
}
