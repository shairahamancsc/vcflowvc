'use server';

import { summarizeServiceRequest } from '@/ai/flows/summarize-service-request';
import { z } from 'zod';
import type { ServiceRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import {v4 as uuidv4} from 'uuid';

const requestSchema = z.object({
  requestText: z.string().min(10, 'Please provide more detail in your request.'),
  title: z.string().min(1, 'Title is required.'),
  clientId: z.string().min(1, 'Client is required.'),
  priority: z.string(),
  assigneeId: z.string().optional(),
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
    assigneeId: formData.get('assignee'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { requestText, title, clientId, priority, assigneeId } = validatedFields.data;

  try {
    const aiResult = await summarizeServiceRequest({ requestText });
    
    // This is a mock implementation. In a real app, you would save this to a database.
    console.log("New Service Request (Simulated):", {
        id: uuidv4(),
        title,
        description: requestText,
        clientId,
        status: 'Pending',
        priority: priority,
        assignedToId: assigneeId === 'unassigned' ? null : assigneeId,
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aiSummary: aiResult.summary,
        aiSentiment: aiResult.sentiment,
    });
    
    revalidatePath('/requests');

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

    // Mock implementation
    console.log("New Client (Simulated):", {
        id: uuidv4(),
        ...validatedFields.data,
    });

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

    // Mock implementation
    console.log("New Dealer (Simulated):", {
        id: uuidv4(),
        ...validatedFields.data,
    });

    revalidatePath('/dealers');
    return { message: 'Dealer created successfully', errors: null };
}

export async function updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']) {
  // Mock implementation
  console.log(`Updating request ${requestId} to status ${status} (Simulated)`);
  
  revalidatePath('/requests');
  revalidatePath('/dashboard');
  return { success: true };
}
