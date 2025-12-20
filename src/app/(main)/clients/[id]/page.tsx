
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceRequest } from "@/lib/types";
import { RequestsTable } from "@/components/requests-table";

async function getClientDetails(id: string) {
    const supabase = createClient();
    
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
    
    if (clientError || !client) {
        notFound();
    }

    const { data: requests, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
            *,
            assignee:users(name)
        `)
        .eq('clientId', id)
        .order('createdAt', { ascending: false });

    if (requestsError) {
        console.error("Error fetching client requests:", requestsError);
    }
    
    const formattedRequests = requests?.map((r: any) => ({
        ...r,
        assignedToName: r.assignee?.name,
    })) || [];

    return { client, requests: formattedRequests };
}


export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
    const { client, requests } = await getClientDetails(params.id);

    return (
        <div className="space-y-6">
             <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to all clients
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{client.name}</CardTitle>
                            <CardDescription>Client Details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {client.email}</p>
                            <p><strong>Phone:</strong> {client.phone}</p>
                            <p><strong>Address:</strong> {client.address}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Service Requests</CardTitle>
                            <CardDescription>All requests associated with {client.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <RequestsTable requests={requests} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
