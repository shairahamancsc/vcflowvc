
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function Notes() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                    This is a placeholder page for notes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You can add your notes functionality here.</p>
            </CardContent>
        </Card>
    )
}
