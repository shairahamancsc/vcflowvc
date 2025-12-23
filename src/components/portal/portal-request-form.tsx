'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, ArrowLeft, Smile, Frown, Meh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRequestFromPortal } from '@/app/actions';
import { useRouter } from 'next/navigation';


interface PortalRequestFormProps {
    onCancel: () => void;
}

const initialState = {
  message: '',
  summary: null,
  sentiment: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Submit Request
    </Button>
  );
}

function SentimentIcon({ sentiment }: { sentiment: string | null }) {
    if (!sentiment) return null;
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes('positive')) return <Smile className="h-5 w-5 text-green-500" />;
    if (lowerSentiment.includes('negative')) return <Frown className="h-5 w-5 text-red-500" />;
    if (lowerSentiment.includes('neutral')) return <Meh className="h-5 w-5 text-gray-500" />;
    return null;
}


export function PortalRequestForm({ onCancel }: PortalRequestFormProps) {
  const [formState, formAction] = useActionState(createRequestFromPortal, initialState);
  const [description, setDescription] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    if (formState.message.includes('successfully')) {
      toast({
        title: 'Success!',
        description: 'Your new service request has been submitted.',
      });
      formRef.current?.reset();
      setDescription('');
      onCancel(); // Return to dashboard
    } else if (formState.message && formState.message !== 'Validation failed') {
        toast({
            title: 'Error submitting request',
            description: formState.errors?.server?.[0] || formState.message,
            variant: 'destructive'
        })
    }
  }, [formState, toast, onCancel]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 sm:p-6">
       <div className="max-w-4xl mx-auto w-full">
            <Button variant="link" className="p-0 mb-4" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <form ref={formRef} action={formAction}>
            <Card className="shadow-md w-full">
                <CardHeader>
                <CardTitle>New Service Request</CardTitle>
                <CardDescription>Please describe the issue you are experiencing.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                
                <div className="space-y-2">
                    <Label htmlFor="title">Request Title</Label>
                    <Input id="title" name="title" placeholder="e.g., My computer is running slow" />
                    {formState?.errors?.title && (
                        <p className="text-sm text-destructive">{formState.errors.title[0]}</p>
                    )}
                </div>
            
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                    id="description"
                    name="description"
                    placeholder="Please provide a detailed description of the issue."
                    className="min-h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />
                    {formState?.errors?.description && (
                        <p className="text-sm text-destructive">{formState.errors.description[0]}</p>
                    )}
                </div>
                
                {formState.summary && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wand2 className="h-5 w-5 text-primary" />
                                    AI Summary
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <SentimentIcon sentiment={formState.sentiment} />
                                    {formState.sentiment}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">{formState.summary}</p>
                        </CardContent>
                    </Card>
                )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">An AI summary will be generated from your description.</p>
                <SubmitButton />
                </CardFooter>
            </Card>
            </form>
       </div>
    </div>
  );
}
