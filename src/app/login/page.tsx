'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks';
import { Logo } from '@/components/logo';
import { User, Shield } from 'lucide-react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'technician') => {
    login(role);
    // In a real app, the server would set this cookie upon successful login.
    // We mock it here for the middleware.
    Cookies.set('serviceflow-user-role', role, { expires: 1 });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <Card className="w-full max-w-sm shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Select a role to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="default"
              className="w-full h-12 text-lg bg-primary hover:bg-accent"
              onClick={() => handleLogin('admin')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Login as Admin
            </Button>
            <Button
              variant="secondary"
              className="w-full h-12 text-lg"
              onClick={() => handleLogin('technician')}
            >
              <User className="mr-2 h-5 w-5" />
              Login as Technician
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
