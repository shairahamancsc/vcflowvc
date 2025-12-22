
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { upsertUserAction } from '@/app/actions';
import { User } from '@/lib/types';

interface UserFormProps {
  user?: User;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEditing ? 'Save Changes' : 'Create User'}
    </Button>
  );
}

const initialState = {
  message: '',
  errors: null,
};


export function UserForm({ user }: UserFormProps) {
  const isEditing = !!user;
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(upsertUserAction, initialState);

  useEffect(() => {
    if (state.message === 'User created successfully' || state.message === 'User updated successfully') {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
      router.push('/users');
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);


  return (
    <form ref={formRef} action={formAction}>
       {isEditing && <input type="hidden" name="id" value={user.id} />}
      <Card className="shadow-md w-full">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit User' : 'New User'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the details for this user.' : 'Fill out the details below to create a new user account.'}
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g., Priya Sharma" required defaultValue={user?.name}/>
               {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="e.g., priya@example.com" required defaultValue={user?.email} disabled={isEditing} />
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
           <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required defaultValue={user?.role || 'technician'}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
                 {state?.errors?.role && <p className="text-sm text-destructive">{state.errors.role[0]}</p>}
              </div>
               {!isEditing && (
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required={!isEditing} />
                    {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
                </div>
               )}
          </div>
          {state?.errors?.server && <p className="text-sm text-destructive">{state.errors.server[0]}</p>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
