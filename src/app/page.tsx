
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { clientLoginAction } from '@/app/actions';
import { Logo } from '@/components/logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full h-12 text-lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Login to Portal
    </Button>
  );
}

const initialState = {
  message: '',
  errors: null,
};

export default function CustomerLoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(clientLoginAction, initialState);

  useEffect(() => {
    if (state.message === 'Login successful') {
      toast({
        title: 'Success!',
        description: 'You are now logged in.',
      });
      formRef.current?.reset();
      router.push('/portal');
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
          <CardDescription>Check the status of your service requests.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="Enter your phone number" required />
              {state?.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
            </div>
             {state.message && state.message !== 'Login successful' && (
                <p className="text-sm text-destructive text-center">{state.message}</p>
             )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <SubmitButton />
             <p className="text-muted-foreground text-center text-xs">
                Admin or Technician?{' '}
                <Link href="/login" className="underline hover:text-primary">
                    Login here
                </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
