
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Client, ServiceRequest } from "@/lib/types";
import { PortalDashboard } from "@/components/portal/portal-dashboard";

async function getClientData(): Promise<{ client: Client, requests: ServiceRequest[] }> {
    const cookieStore = cookies();
    const clientId = cookieStore.get('client_id')?.value;

    if (!clientId) {
        redirect('/');
    }

    const supabase = createClient();

    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
    
    if (clientError || !client) {
        console.error('Portal Error:', clientError);
        // Clear cookie if client not found
        cookieStore.set('client_id', '', { maxAge: -1 });
        redirect('/');
    }

    const { data: requests, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
            *,
            assignee:users(name)
        `)
        .eq('clientId', clientId)
        .order('createdAt', { ascending: false });

    if (requestsError) {
        console.error('Error fetching client requests:', requestsError);
        // Continue with an empty array of requests
    }
     const formattedRequests = requests?.map((r: any) => ({
        ...r,
        assignedToName: r.assignee?.name,
    })) || [];


    return { client, requests: formattedRequests };
}


export default async function PortalPage() {
    const { client, requests } = await getClientData();
    return <PortalDashboard client={client} requests={requests} />;
}
