import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


async function NotesList() {
    const supabase = createClient();
    const { data: notes, error } = await supabase.from("notes").select();

    if (error) {
        return (
            <Card>
              <CardHeader>
                <CardTitle>Error Fetching Notes</CardTitle>
                <CardDescription>
                    There was an issue fetching notes from your Supabase table. Please ensure your Supabase project is set up correctly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive">{error.message}</p>
              </CardContent>
            </Card>
          )
    }
    
    // This case can happen if the table exists but is empty.
    if (!notes || notes.length === 0) {
        return (
            <Card>
              <CardHeader>
                <CardTitle>No Notes Found</CardTitle>
                <CardDescription>
                    Your 'notes' table in Supabase doesn't have any data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You can add some data to your 'notes' table in the Supabase dashboard to see it appear here.</p>
              </CardContent>
            </Card>
          )
    }

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

function NotesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
    )
}


export default async function Notes() {
    // This check handles the case where Supabase is not configured at all.
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

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

    return (
        <Suspense fallback={<NotesSkeleton />}>
            <NotesList />
        </Suspense>
    )
}
