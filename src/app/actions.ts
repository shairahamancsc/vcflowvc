'use server';

import { summarizeServiceRequest } from '@/ai/flows/summarize-service-request';
import { z } from 'zod';

const inputSchema = z.object({
  requestText: z.string().min(10, 'Please provide more detail in your request.'),
});

export async function summarizeRequestAction(prevState: any, formData: FormData) {
  const validatedFields = inputSchema.safeParse({
    requestText: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      summary: null,
      sentiment: null,
    };
  }
  
  try {
    const result = await summarizeServiceRequest({ requestText: validatedFields.data.requestText });
    return {
      message: 'Summary generated',
      summary: result.summary,
      sentiment: result.sentiment,
      errors: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate summary.',
      summary: null,
      sentiment: null,
      errors: null,
    }
  }
}
