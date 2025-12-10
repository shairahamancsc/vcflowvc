'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Client
    </Button>
  );
}

export function ClientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // In a real app, this would call a server action to securely create a client.
  // For this prototype, we'll just show a success message.
  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name');
    const email = formData.get('email');
    console.log('Creating client (simulated):', { name, email });
    toast({
      title: 'Success!',
      description: 'New client has been created (simulated).',
    });
    formRef.current?.reset();
    router.push('/clients');
  };

  return (
    <form ref={formRef} action={handleSubmit}>
      <Card className="shadow-soft w-full">
        <CardHeader>
          <CardTitle>New Client</CardTitle>
          <CardDescription>Fill out the details below to add a new client.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g., John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="e.g., john@acme.com" required />
            </div>
          </div>
           <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="e.g., 555-123-4567" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="e.g., 123 Main St, Anytown, USA" required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
