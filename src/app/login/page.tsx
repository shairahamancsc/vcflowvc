
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useAuthRedirect } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  useAuthRedirect({ to: '/dashboard', when: 'loggedIn' });

  const { toast } = useToast();
  const { login, waitForUser } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: loginError } = await login(email, password);

    if (loginError) {
      const errorMessage = loginError.message || 'An unexpected error occurred.';
      console.error('Login failed:', loginError);
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Login successful!',
        description: 'Redirecting to your dashboard.',
      });
      // Wait for the user context to be updated before redirecting
      await waitForUser();
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Admin & Staff Login</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center justify-center text-sm">
           <p className="text-muted-foreground text-xs">
                Not an admin?{' '}
                <Link href="/" className="underline hover:text-primary">
                   Go to Customer Portal
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
