'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks';
import { Logo } from '@/components/logo';
import { User, Shield, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { users } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = isSupabaseConfigured ? createClient() : null;
  const { login: mockLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // Demo password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetCredentials = (role: 'admin' | 'technician') => {
    const user = users.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        await mockLogin(email);
      }
      
      toast({
        title: 'Login successful!',
        description: 'Redirecting to your dashboard.',
      });
      router.push('/dashboard');
      // For mock auth, we need to refresh to reflect the user state change
      if (!isSupabaseConfigured) router.refresh(); 

    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <Card className="w-full max-w-sm shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Select a role to pre-fill credentials and sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
             <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSetCredentials('admin')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Admin
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSetCredentials('technician')}
            >
              <User className="mr-2 h-5 w-5" />
              Technician
            </Button>
          </div>
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
            {isSupabaseConfigured && (
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
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Login'}
            </Button>
          </form>
           {!isSupabaseConfigured && (
              <p className="mt-4 text-xs text-center text-muted-foreground p-2 rounded-md bg-muted">
                Demo mode: Supabase is not configured. Using mock authentication.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
