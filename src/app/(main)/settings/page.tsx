
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks';
import { Sun, Moon, Laptop, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction } from '@/app/actions';

const initialState = {
  message: '',
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save Changes
    </Button>
  );
}

export default function SettingsPage() {
  const { user, version } = useAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateProfileAction, initialState);

   useEffect(() => {
    if (state.message === 'Profile updated successfully') {
      toast({
        title: 'Profile Updated!',
        description: 'Your profile information has been successfully updated.',
      });
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, preferences, and more.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={user?.name || ''} />
              {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label className="text-base">Theme</Label>
            <p className="text-sm text-muted-foreground">Select the theme for the dashboard.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-5 w-5" /> Light
            </Button>
            <Button variant="outline" onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-5 w-5" /> Dark
            </Button>
            <Button variant="outline" onClick={() => setTheme('system')}>
              <Laptop className="mr-2 h-5 w-5" /> System
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are running VC Flow version <span className="font-semibold text-foreground">{version}</span>.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
