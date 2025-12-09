import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

export default async function Notes() {

  if (!isSupabaseConfigured) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Supabase Not Configured</CardTitle>
            <CardDescription>
                Please configure your Supabase URL and anon key in the .env file to see notes from your database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The 'notes' page will fetch and display data from your Supabase 'notes' table once you've connected your project.</p>
          </CardContent>
        </Card>
      )
  }

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
