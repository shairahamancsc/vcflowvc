
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
import { signUpAction } from '@/app/actions';
import { Logo } from '@/components/logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full h-12 text-lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Account
    </Button>
  );
}

const initialState = {
  message: '',
  errors: null,
};

export default function SignUpPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.message.includes('successful')) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
      router.push('/login');
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
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
              {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="e.g., jane@example.com" required />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <SubmitButton />
            <p className="text-muted-foreground text-sm">
              {'Already have an account? '}
              <Button variant="link" asChild className="p-0">
                <Link href="/login">
                  Log in
                </Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
