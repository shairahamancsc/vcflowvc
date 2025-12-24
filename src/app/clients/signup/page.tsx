
'use client';

import { useActionState, useEffect, useRef, useState, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientAndLoginAction, verifyOtpAction } from '@/app/actions';
import { Logo } from '@/components/logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full h-12 text-lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Account & Send Code
    </Button>
  );
}

function VerifyOtpButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full h-12 text-lg">
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Verify & Login
      </Button>
    );
}

const createClientInitialState = {
  message: '',
  success: false,
  errors: null,
};

const verifyOtpInitialState = {
    message: '',
    success: false,
    errors: null,
};

function ClientSignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get('phone') || '';

  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState(phoneFromQuery);

  const [createState, createFormAction] = useActionState(createClientAndLoginAction, createClientInitialState);
  const [verifyState, verifyFormAction] = useActionState(verifyOtpAction, verifyOtpInitialState);

  const createFormRef = useRef<HTMLFormElement>(null);
  const verifyFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState.success) {
      toast({
        title: 'Account Created!',
        description: 'Check your phone for the verification code.',
      });
      setOtpSent(true);
    } else if (createState.message) {
      toast({
        title: 'Error',
        description: createState.message,
        variant: 'destructive',
      });
    }
  }, [createState, toast]);

  useEffect(() => {
    if (verifyState.success) {
      toast({
        title: 'Success!',
        description: 'You are now logged in. Redirecting...',
      });
      verifyFormRef.current?.reset();
      router.push('/portal'); // Redirect to portal after successful verification
    } else if (verifyState.message) {
      toast({
        title: 'Error',
        description: verifyState.message,
        variant: 'destructive',
      });
    }
  }, [verifyState, toast, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>
            {otpSent ? 'Enter the code sent to your phone to finish signing up.' : 'Just a few details to get you started.'}
          </CardDescription>
        </CardHeader>

        {!otpSent ? (
          <form ref={createFormRef} action={createFormAction}>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <span className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-base font-medium text-muted-foreground">
                    +91
                  </span>
                  <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                {createState?.errors?.phone && <p className="text-sm text-destructive">{createState.errors.phone[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g., Ramesh Kumar" required />
                {createState?.errors?.name && <p className="text-sm text-destructive">{createState.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input id="email" name="email" type="email" placeholder="e.g., ramesh@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input id="address" name="address" placeholder="e.g., 12/A, B.C. Road, Kolkata" />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <SubmitButton />
            </CardFooter>
          </form>
        ) : (
          <form ref={verifyFormRef} action={verifyFormAction}>
            <CardContent className="grid gap-4">
              <input type="hidden" name="phone" value={phone} />
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input id="token" name="token" placeholder="123456" required />
                {verifyState?.errors?.token && <p className="text-sm text-destructive">{verifyState.errors.token[0]}</p>}
              </div>
              {verifyState.message && !verifyState.success && (
                <p className="text-sm text-destructive text-center">{verifyState.message}</p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <VerifyOtpButton />
            </CardFooter>
          </form>
        )}

        <CardFooter className="flex-col gap-4 pt-0">
          <p className="text-muted-foreground text-center text-xs">
            Already have an account?{' '}
            <Link href="/" className="underline hover:text-primary">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function NewClientSignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientSignupForm />
        </Suspense>
    )
}
