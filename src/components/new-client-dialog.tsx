
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClientAction } from '@/app/actions';
import type { Client } from '@/lib/types';

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  onClientCreated: (client: Client) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Client'}
    </Button>
  );
}

const initialState = {
  success: false,
  message: '',
  errors: null,
  client: null,
};

export function NewClientDialog({ open, onOpenChange, phone, onClientCreated }: NewClientDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [state, formAction] = useActionState(createClientAction, initialState);

  useEffect(() => {
    if (state.success && state.client) {
      toast({
        title: 'Success!',
        description: 'New client has been created.',
      });
      formRef.current?.reset();
      onClientCreated(state.client);
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, onClientCreated]);

  // Reset form state when dialog opens or phone changes
  useEffect(() => {
    if(open) {
      // You might need a way to reset the action state if it doesn't do so automatically.
      // For now, we just reset the visual form.
      formRef.current?.reset();
    }
  }, [open, phone]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form ref={formRef} action={formAction}>
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              A client with this phone number was not found. Please add their details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={phone} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g., Ramesh Kumar" required />
              {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input id="email" name="email" type="email" placeholder="e.g., ramesh@example.com" />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" name="address" placeholder="e.g., 12/A, B.C. Road, Kolkata" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
