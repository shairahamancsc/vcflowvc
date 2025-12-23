
'use server';

import { summarizeServiceRequest } from '@/ai/flows/summarize-service-request';
import { z } from 'zod';
import type { Client, ServiceRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  AuthApiError
} from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

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
    
    const newRequest: Omit<ServiceRequest, 'id' | 'createdAt' | 'updated_at' | 'clientName' | 'assignedToName' | 'completedAt'> = {
      title,
      description: requestText,
      clientId: clientId,
      status: 'Pending',
      priority: priority as ServiceRequest['priority'],
      assignedToId: assignedToId === 'unassigned' ? undefined : assignedToId,
      aiSummary: aiResult.summary,
      aiSentiment: aiResult.sentiment,
    };

    const { error } = await supabase.from('service_requests').insert(newRequest);

    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath('/requests');
    revalidatePath('/dashboard');
    revalidatePath('/portal');
    revalidatePath(`/clients/${clientId}`);


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
    email: z.string().email('Invalid email address.').optional().or(z.literal('')),
    phone: z.string().min(1, 'Phone is required.'),
    address: z.string().optional(),
});

export async function createClientAction(prevState: any, formData: FormData) {
    const validatedFields = clientSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createClient();
    const clientData = {
        ...validatedFields.data,
        id: uuidv4(),
        address: validatedFields.data.address || 'N/A',
        email: validatedFields.data.email || `${validatedFields.data.phone}@example.com`
    };

    const { data: newClient, error } = await supabase.from('clients').insert(clientData).select().single();

    if (error) {
        return { success: false, message: error.message, errors: null };
    }
    
    revalidatePath('/clients');
    return { success: true, message: 'Client created successfully', errors: null, client: newClient as Client };
}

export async function deleteClientAction(clientId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('clients').delete().eq('id', clientId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
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
    const dealerData = {
        ...validatedFields.data,
        id: uuidv4(),
    };

    const { error } = await supabase.from('dealers').insert(dealerData);

    if (error) {
        return { message: error.message, errors: null };
    }

    revalidatePath('/dealers');
    return { message: 'Dealer created successfully', errors: null };
}

export async function deleteDealerAction(dealerId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('dealers').delete().eq('id', dealerId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dealers');
    return { success: true };
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
  revalidatePath('/portal');
  return { success: true };
}

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['admin', 'technician']),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
});

export async function upsertUserAction(prevState: any, formData: FormData) {
    const supabase = createClient();
    const formObject = Object.fromEntries(formData.entries());
    
    // If there's an ID, we're updating. Don't require password.
    const finalUserSchema = formObject.id 
      ? userSchema 
      : userSchema.refine(data => data.password, { message: "Password is required for new users." });

    const validatedFields = finalUserSchema.safeParse(formObject);

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, name, email, role, password } = validatedFields.data;

    if (id) {
        // Update user in public.users table
        const { error } = await supabase
            .from('users')
            .update({ name, role })
            .eq('id', id);

        if (error) {
            return { message: error.message, errors: null };
        }

        revalidatePath('/users');
        revalidatePath(`/users/${id}/edit`);
        return { message: 'User updated successfully', errors: null };
    } else {
        // Create new user
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password: password!,
            options: {
                data: {
                    name,
                    role,
                    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
                }
            }
        });

        if (authError) {
          if (authError instanceof AuthApiError && authError.code === 'email_exists') {
            return { message: 'A user with this email already exists. Please use a different email.', errors: null };
          }
          return { message: authError.message || 'Could not authenticate user.', errors: null };
        }
        
        revalidatePath('/users');
        return { message: 'User created successfully', errors: null };
    }
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
    const supabase = createClient();
    
    // First, delete from public.users table. This should cascade if set up, but we do it explicitly.
    const { error: publicError } = await supabase.from('users').delete().eq('id', userId);

    if (publicError) {
        console.error('Error deleting from public.users:', publicError);
        return { success: false, message: `Failed to delete user profile: ${publicError.message}` };
    }
    
    // Note: Deleting from auth.users requires admin privileges and is a separate, more complex operation.
    // For this app, we will only remove them from the public table, effectively soft-deleting them from the app's view.

    revalidatePath('/users');
    return { success: true, message: 'User deleted successfully.' };
}

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});

export async function updateProfileAction(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Not authenticated', errors: null };
    }

    const validatedFields = profileSchema.safeParse({
      name: formData.get('name')
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    // Update user in auth
    const { error: authError } = await supabase.auth.updateUser({ 
        data: { name: validatedFields.data.name } 
    });

    if(authError) {
      return { message: authError.message, errors: null };
    }

    // Update user in public users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ name: validatedFields.data.name })
      .eq('id', user.id);

    if (dbError) {
        return { message: dbError.message, errors: null };
    }

    revalidatePath('/settings');
    return { message: 'Profile updated successfully', errors: null };
}

export async function signUpAction(prevState: any, formData: FormData) {
  const supabase = createClient();
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  });

  const validatedFields = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // The admin user is a special case and should be created with the 'admin' role.
  const role = email === 'shsirahaman.csc@gmail.com' ? 'admin' : 'technician';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      },
    },
  });

  if (error) {
    return {
      message: error.message,
      errors: null,
    };
  }

  revalidatePath('/');
  return { message: 'Sign up successful! Please check your email to confirm your account.', errors: null };
}

const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number including country code.'),
});

export async function sendOtpAction(prevState: any, formData: FormData) {
  const validatedFields = sendOtpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { phone } = validatedFields.data;
  const supabase = createClient();

  const { data: client } = await supabase.from('clients').select('id').eq('phone', phone).single();

  if (!client) {
    return { success: false, message: 'No account found with this phone number.', action: 'redirect_to_signup', errors: null };
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (otpError) {
    return { success: false, message: `Failed to send OTP: ${otpError.message}`, errors: null };
  }

  return { success: true, message: 'OTP sent successfully', errors: null };
}

const verifyOtpSchema = z.object({
    phone: z.string(),
    token: z.string().min(6, 'OTP must be 6 digits.').max(6, 'OTP must be 6 digits.'),
});

export async function verifyOtpAction(prevState: any, formData: FormData) {
    const validatedFields = verifyOtpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { phone, token } = validatedFields.data;
    const supabase = createClient();

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
    });
    
    if (verifyError) {
        return { success: false, message: `Verification failed: ${verifyError.message}`, errors: null };
    }

    if (!data.session) {
        return { success: false, message: 'Could not establish a session. Please try again.', errors: null };
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .single();

    if (clientError || !client) {
        return { success: false, message: 'Could not find a client profile for this phone number.', errors: null };
    }

    cookies().set('client_id', client.id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 }); // 24 hour session
    cookies().set('client_name', client.name, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
    cookies().set('client_phone', client.phone, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });

    revalidatePath('/');
    return { success: true, message: 'Login successful', errors: null };
}


export async function clientLogoutAction() {
  cookies().delete('client_id');
  cookies().delete('client_name');
  cookies().delete('client_phone');
  
  const supabase = createClient();
  await supabase.auth.signOut();

  revalidatePath('/');
}

// Action for customer to create a request from their portal
export async function createRequestFromPortal(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const clientId = cookieStore.get('client_id')?.value;

  if (!clientId) {
    return { message: "Authentication error. Please log in again.", errors: null };
  }

  const portalRequestSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().min(10, 'Please provide more detail in your request.'),
  });
  
  const validatedFields = portalRequestSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
      return {
          message: 'Validation failed',
          errors: validatedFields.error.flatten().fieldErrors,
      };
  }

  const { title, description } = validatedFields.data;
  const supabase = createClient();

  try {
    const aiResult = await summarizeServiceRequest({ requestText: description });

    const newRequest: Omit<ServiceRequest, 'id' | 'createdAt' | 'updated_at' | 'clientName' | 'assignedToName' | 'completedAt'> = {
      title,
      description,
      clientId,
      status: 'Pending',
      priority: 'Medium', // Default priority for portal requests
      aiSummary: aiResult.summary,
      aiSentiment: aiResult.sentiment,
    };
    
    const { error } = await supabase.from('service_requests').insert(newRequest);

    if (error) throw new Error(error.message);

    revalidatePath('/portal');
    return { message: 'Request submitted successfully!', errors: null, summary: aiResult.summary, sentiment: aiResult.sentiment };
  } catch (error: any) {
    console.error('Portal request creation error:', error);
    return { message: 'Failed to submit request.', errors: { server: [error.message] } };
  }
}

const newClientSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone is required.'),
    address: z.string().optional(),
});


export async function createClientAndLoginAction(prevState: any, formData: FormData) {
    const validatedFields = newClientSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createClient();
    const { phone, name, email, address } = validatedFields.data;
    
    const clientData = {
        id: uuidv4(),
        phone,
        name,
        address: address || 'N/A',
        email: email || `${phone}@example.com`
    };

    const { error: insertError } = await supabase.from('clients').insert(clientData);

    if (insertError) {
        // Handle case where phone number might already exist due to a race condition.
        if (insertError.code === '23505') { // unique_violation
            return { success: false, message: 'A client with this phone number already exists. Please try logging in.', errors: null };
        }
        return { success: false, message: insertError.message, errors: null };
    }
    
    // After creating the client, send OTP
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });

    if (otpError) {
        return { success: false, message: `Account created, but failed to send OTP: ${otpError.message}`, errors: null };
    }

    return { success: true, message: 'Account created and OTP sent successfully!', errors: null };
}
