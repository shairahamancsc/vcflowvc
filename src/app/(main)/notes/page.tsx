import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Notes() {
  const supabase = createClient();
  const { data: notes } = await supabase.from("notes").select();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes from Supabase</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-muted rounded-lg">{JSON.stringify(notes, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}