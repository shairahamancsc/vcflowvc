'use client';
import { Client, ServiceRequest } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from "../status-badge";
import { format } from "date-fns";
import { useState } from "react";
import { PortalRequestForm } from "./portal-request-form";
import { clientLogoutAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface PortalDashboardProps {
    client: Client;
    requests: ServiceRequest[];
}

export function PortalDashboard({ client, requests }: PortalDashboardProps) {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await clientLogoutAction();
        router.refresh();
    }

    if (isCreating) {
        return <PortalRequestForm onCancel={() => setIsCreating(false)} />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Welcome, {client.name}</h1>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
                 <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
            </header>

            <main className="flex-1 space-y-6 p-4 sm:p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>My Service Requests</CardTitle>
                            <CardDescription>Here is a list of your service requests and their status.</CardDescription>
                        </div>
                         <Button onClick={() => setIsCreating(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Request
                        </Button>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Created</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="font-medium">{request.title}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={request.status} />
                                    </TableCell>
                                    <TableCell>{request.assignedToName || 'Unassigned'}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
