
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { upsertClientAction } from '@/app/actions';
import type { Client } from '@/lib/types';

interface ClientFormProps {
  client?: Client;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEditing ? 'Save Changes' : 'Create Client'}
    </Button>
  );
}

const initialState = {
  success: false,
  message: '',
  errors: null,
  client: null,
};

export function ClientForm({ client }: ClientFormProps) {
  const isEditing = !!client;
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(upsertClientAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      if (!isEditing) {
        formRef.current?.reset();
      }
      router.push('/clients');
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router, isEditing]);

  return (
    <form ref={formRef} action={formAction}>
      {isEditing && <input type="hidden" name="id" value={client.id} />}
      <Card className="shadow-md w-full">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Client' : 'New Client'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update the details for this client.'
              : 'Fill out the details below to add a new client.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={client?.name}
                placeholder="e.g., Ramesh Kumar"
                required
              />
               {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-base font-medium text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={client?.phone?.replace('+91', '')}
                  placeholder="9876543210"
                  required
                />
              </div>
              {state?.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email}
                placeholder="e.g., ramesh@example.com"
              />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={client?.address}
                placeholder="e.g., 12/A, B.C. Road, Kolkata"
              />
              {state?.errors?.address && <p className="text-sm text-destructive">{state.errors.address[0]}</p>}
            </div>
          </div>
          {state?.errors?.server && <p className="text-sm text-destructive">{state.errors.server[0]}</p>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
