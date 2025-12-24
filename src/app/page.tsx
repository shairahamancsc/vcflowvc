
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { sendOtpAction, verifyOtpAction } from '@/app/actions';
import { Logo } from '@/components/logo';
import { useAuthRedirect } from '@/lib/hooks';

function SendOtpButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full h-12 text-lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Send Code
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

const sendOtpInitialState: {
    message: string;
    success: boolean;
    errors: any;
    action?: 'redirect_to_signup';
} = {
  message: '',
  success: false,
  errors: null,
};

const verifyOtpInitialState = {
    message: '',
    success: false,
    errors: null,
};

export default function CustomerLoginPage() {
  useAuthRedirect({ to: '/portal', when: 'loggedIn' });
  const { toast } = useToast();
  const router = useRouter();
  
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  
  const [sendState, sendFormAction] = useActionState(sendOtpAction, sendOtpInitialState);
  const [verifyState, verifyFormAction] = useActionState(verifyOtpAction, verifyOtpInitialState);
  
  const sendFormRef = useRef<HTMLFormElement>(null);
  const verifyFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (sendState.success) {
      toast({
        title: 'Code Sent!',
        description: 'Check your phone for the verification code.',
      });
      setOtpSent(true);
    } else if (sendState.action === 'redirect_to_signup') {
        router.push(`/clients/signup?phone=${encodeURIComponent(phone)}`);
    } else if (sendState.message) {
      toast({
        title: 'Error',
        description: sendState.message,
        variant: 'destructive',
      });
    }
  }, [sendState, toast, router, phone]);

  useEffect(() => {
    if (verifyState.success) {
      toast({
        title: 'Success!',
        description: 'You are now logged in. Redirecting...',
      });
      verifyFormRef.current?.reset();
      // The useAuthRedirect hook will handle redirecting to the portal.
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
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
          <CardDescription>
            {otpSent ? 'Enter the code sent to your phone.' : 'Check the status of your service requests.'}
          </CardDescription>
        </CardHeader>
        
        {!otpSent ? (
            <form ref={sendFormRef} action={sendFormAction}>
                <CardContent className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center gap-2">
                          <span className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-base font-medium text-muted-foreground">
                            +91
                          </span>
                          <Input 
                              id="phone" 
                              name="phone" 
                              placeholder="9876543210" 
                              required 
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="text-base"
                          />
                        </div>
                        {sendState?.errors?.phone && <p className="text-sm text-destructive">{sendState.errors.phone[0]}</p>}
                    </div>
                    {sendState.message && !sendState.success && (
                        <p className="text-sm text-destructive text-center">{sendState.message}</p>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <SendOtpButton />
                     <p className="text-muted-foreground text-center text-xs">
                        New here? We'll help you create an account.
                    </p>
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
                     <Button variant="link" size="sm" onClick={() => {
                         setOtpSent(false);
                         sendFormRef.current?.reset();
                         verifyFormRef.current?.reset();
                     }}>
                        Use a different phone number
                    </Button>
                </CardFooter>
            </form>
        )}

        <CardFooter className="flex-col gap-4 pt-0">
            <p className="text-muted-foreground text-center text-xs">
            Admin or Technician?{' '}
            <Link href="/login" className="underline hover:text-primary">
                Login here
            </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    