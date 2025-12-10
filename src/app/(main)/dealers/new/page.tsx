import { DealerForm } from '@/components/dealer-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewDealerPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/dealers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to all dealers
      </Link>
      <DealerForm />
    </div>
  );
}
