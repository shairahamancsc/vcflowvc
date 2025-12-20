
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { summarizeAndCreateRequest } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2, Frown, Smile, Meh, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Client, User } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Combobox } from './ui/combobox';
import { NewClientDialog } from './new-client-dialog';

const initialState = {
  message: '',
  summary: null,
  sentiment: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Request
    </Button>
  );
}

function SentimentIcon({ sentiment }: { sentiment: string | null }) {
    if (!sentiment) return null;
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes('positive')) return <Smile className="h-5 w-5 text-green-500" />;
    if (lowerSentiment.includes('negative')) return <Frown className="h-5 w-5 text-red-500" />;
    if (lowerSentiment.includes('neutral')) return <Meh className="h-5 w-5 text-gray-500" />;
    return null;
}


export function RequestForm() {
  const [formState, formAction] = useActionState(summarizeAndCreateRequest, initialState);
  const [description, setDescription] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientPhone, setNewClientPhone] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: clientsData } = await supabase.from('clients').select('*');
      setClients(clientsData || []);

      const { data: usersData } = await supabase.from('users').select('id, name, email, role, avatar_url, status');
       const appUsers = usersData?.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email || '',
        role: u.role,
        avatarUrl: u.avatar_url || '',
        status: u.status || 'Active',
      })) || [];
      setUsers(appUsers);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formState.message === 'Request created') {
      toast({
        title: 'Success!',
        description: 'New service request has been created.',
      });
      formRef.current?.reset();
      setDescription('');
      router.push('/requests');
    } else if (formState.message && formState.message !== 'Validation failed') {
        toast({
            title: 'Error creating request',
            description: formState.errors?.server?.[0] || formState.message,
            variant: 'destructive'
        })
    }
  }, [formState, toast, router]);
  
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name} (${client.phone})`,
  }));

  const handleClientCreation = (phone: string) => {
    setNewClientPhone(phone);
    setIsNewClientDialogOpen(true);
  }

  const onClientCreated = (newClient: Client) => {
    setClients(prevClients => [...prevClients, newClient]);
    setSelectedClientId(newClient.id);
    setIsNewClientDialogOpen(false);
  }

  return (
    <>
      <NewClientDialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        phone={newClientPhone}
        onClientCreated={onClientCreated}
      />
      <form ref={formRef} action={formAction}>
        <Card className="shadow-md w-full">
          <CardHeader>
            <CardTitle>New Service Request</CardTitle>
            <CardDescription>Fill out the details below to create a new service request.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Combobox
                  name="client"
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  options={clientOptions}
                  placeholder="Select or type a phone number..."
                  searchPlaceholder="Search by name or phone..."
                  noResultsText="No client found."
                  onCreateNew={handleClientCreation}
                />
                {formState?.errors?.clientId && (
                  <p className="text-sm text-destructive">{formState.errors.clientId[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Request Title</Label>
                <Input id="title" name="title" placeholder="e.g., Server is down" />
                {formState?.errors?.title && (
                  <p className="text-sm text-destructive">{formState.errors.title[0]}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please provide a detailed description of the issue."
                className="min-h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {formState?.errors?.requestText && (
                  <p className="text-sm text-destructive">{formState.errors.requestText[0]}</p>
              )}
            </div>
            
            {formState.summary && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                              <Wand2 className="h-5 w-5 text-primary" />
                              AI Summary
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm font-medium">
                              <SentimentIcon sentiment={formState.sentiment} />
                              {formState.sentiment}
                          </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80">{formState.summary}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="Medium">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To</Label>
                <Select name="assignee">
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.filter(u => u.role === 'technician').map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">An AI summary will be generated from your description.</p>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </>
  );
}

    