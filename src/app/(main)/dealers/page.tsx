
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { DealersTable } from '@/components/dealers-table';
import Link from 'next/link';
import { Dealer } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

async function getDealers() {
  const supabase = createClient();
  const { data } = await supabase.from('dealers').select('*');
  return data || [];
}

export default async function DealersPage() {
  const dealers: Dealer[] = await getDealers();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealers</h1>
          <p className="text-muted-foreground">
            Manage your special customers and suppliers.
          </p>
        </div>
        <Button asChild>
          <Link href="/dealers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Dealer
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <DealersTable dealers={dealers} />
        </CardContent>
      </Card>
    </div>
  );
}
