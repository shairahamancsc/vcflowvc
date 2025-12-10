'use server';

import { summarizeServiceRequest } from '@/ai/flows/summarize-service-request';
import { z } from 'zod';
import { serviceRequests, clients, users } from '@/lib/data';
import type { ServiceRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const inputSchema = z.object({
  requestText: z.string().min(10, 'Please provide more detail in your request.'),
  title: z.string().min(1, 'Title is required.'),
  clientId: z.string().min(1, 'Client is required.'),
  priority: z.string(),
  assigneeId: z.string(),
});

type FormState = {
  message: string;
  summary?: string | null;
  sentiment?: string | null;
  errors?: {
    requestText?: string[];
    title?: string[];
    clientId?: string[];
  } | null;
}

export async function summarizeAndCreateRequest(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = inputSchema.safeParse({
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
    
    const client = clients.find(c => c.id === clientId);
    const assignee = users.find(u => u.id === assigneeId);

    const newRequest: ServiceRequest = {
        id: `req-${Date.now()}`,
        title,
        description: requestText,
        clientId,
        clientName: client?.name || 'Unknown Client',
        status: 'Pending',
        priority: priority as ServiceRequest['priority'],
        assignedToId: assignee?.id,
        assignedToName: assignee?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: aiResult.summary,
        aiSentiment: aiResult.sentiment,
    };
    
    // In a real app, you'd save this to a database.
    // For this prototype, we'll push it to the in-memory array.
    serviceRequests.unshift(newRequest);
    
    revalidatePath('/requests');

    return {
      message: 'Request created',
      summary: aiResult.summary,
      sentiment: aiResult.sentiment,
      errors: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate summary or create request.',
      errors: null,
    }
  }
}
