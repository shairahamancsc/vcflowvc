'use server';

import { summarizeServiceRequest } from '@/ai/flows/summarize-service-request';
import { z } from 'zod';
import type { ServiceRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  requestText: z.string().min(10, 'Please provide more detail in your request.'),
  title: z.string().min(1, 'Title is required.'),
  clientId: z.string().min(1, 'Client is required.'),
  priority: z.string(),
  assignedToId: z.string().optional(),
});

type FormState = {
  message: string;
  summary?: string | null;
  sentiment?: string | null;
  errors?: {
    requestText?: string[];
    title?: string[];
    clientId?: string[];
    server?: string[];
  } | null;
}

export async function summarizeAndCreateRequest(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = requestSchema.safeParse({
    requestText: formData.get('description'),
    title: formData.get('title'),
    clientId: formData.get('client'),
    priority: formData.get('priority'),
    assignedToId: formData.get('assignee'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { requestText, title, clientId, priority, assignedToId } = validatedFields.data;
  const supabase = createClient();

  try {
    const aiResult = await summarizeServiceRequest({ requestText });
    
    const newRequest: Omit<ServiceRequest, 'id' | 'createdAt' | 'updated_at' | 'clientName' | 'assignedToName'> = {
      title,
      description: requestText,
      clientId,
      status: 'Pending',
      priority: priority as ServiceRequest['priority'],
      assignedToId: assigneeId === 'unassigned' ? undefined : assigneeId,
      aiSummary: aiResult.summary,
      aiSentiment: aiResult.sentiment,
    };

    const { error } = await supabase.from('service_requests').insert(newRequest);

    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return {
      message: 'Request created',
      summary: aiResult.summary,
      sentiment: aiResult.sentiment,
      errors: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      message: 'Failed to create request.',
      errors: {
        server: [error.message]
      },
    }
  }
}


const clientSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(1, 'Phone is required.'),
    address: z.string().min(1, 'Address is required.'),
});

export async function createClientAction(prevState: any, formData: FormData) {
    const validatedFields = clientSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createClient();
    const { error } = await supabase.from('clients').insert(validatedFields.data);

    if (error) {
        return { message: error.message, errors: null };
    }
    
    revalidatePath('/clients');
    return { message: 'Client created successfully', errors: null };
}

const dealerSchema = z.object({
  name: z.string().min(1, 'Company Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone is required.'),
});

export async function createDealerAction(prevState: any, formData: FormData) {
    const validatedFields = dealerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createClient();
    const { error } = await supabase.from('dealers').insert(validatedFields.data);

    if (error) {
        return { message: error.message, errors: null };
    }

    revalidatePath('/dealers');
    return { message: 'Dealer created successfully', errors: null };
}

export async function updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']) {
  const supabase = createClient();
  const { error } = await supabase
    .from('service_requests')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) {
    console.error('Error updating status:', error);
    return { success: false, message: error.message };
  }

  revalidatePath('/requests');
  revalidatePath('/dashboard');
  return { success: true };
}

const userSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'technician', 'customer']),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function createUserAction(prevState: any, formData: FormData) {
    const validatedFields = userSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { name, email, password, role } = validatedFields.data;
    const supabase = createClient();
    
    const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role,
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
            }
        }
    });

    if (authError || !authUser.user) {
         return { message: authError?.message || 'Could not authenticate user.', errors: null };
    }
    
    // Also insert into public users table which is handled by the trigger `handle_new_user`
    
    revalidatePath('/users');
    return { message: 'User created successfully', errors: null };
}

export async function updateUserStatusAction(userId: string, status: 'Active' | 'Blocked') {
  const supabase = createClient();
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/users');
  return { success: true };
}

export async function deleteUserAction(userId: string) {
    // Deleting a user from auth.users requires the Admin SDK, which is not available.
    // We will just delete from our public `users` table.
    const supabase = createClient();
    const { error } = await supabase.from('users').delete().eq('id', userId);

     if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/users');
    return { success: true };
}
