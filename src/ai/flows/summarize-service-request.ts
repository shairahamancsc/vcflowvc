'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing service requests using AI.
 *
 * - summarizeServiceRequest - A function that takes a service request as input and returns a summarized version with sentiment analysis.
 * - SummarizeServiceRequestInput - The input type for the summarizeServiceRequest function.
 * - SummarizeServiceRequestOutput - The return type for the summarizeServiceRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeServiceRequestInputSchema = z.object({
  requestText: z
    .string()
    .describe('The text of the service request that needs to be summarized.'),
});

export type SummarizeServiceRequestInput = z.infer<
  typeof SummarizeServiceRequestInputSchema
>;

const SummarizeServiceRequestOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the service request.'),
  sentiment: z
    .string()
    .describe('The sentiment of the service request (e.g., positive, negative, neutral).'),
});

export type SummarizeServiceRequestOutput = z.infer<
  typeof SummarizeServiceRequestOutputSchema
>;

export async function summarizeServiceRequest(
  input: SummarizeServiceRequestInput
): Promise<SummarizeServiceRequestOutput> {
  return summarizeServiceRequestFlow(input);
}

const summarizeRequestPrompt = ai.definePrompt({
  name: 'summarizeRequestPrompt',
  input: {schema: SummarizeServiceRequestInputSchema},
  output: {schema: SummarizeServiceRequestOutputSchema},
  prompt: `Summarize the following service request and determine its sentiment.\n\nService Request: {{{requestText}}}\n\nSummary: \nSentiment: `,
});

const summarizeServiceRequestFlow = ai.defineFlow(
  {
    name: 'summarizeServiceRequestFlow',
    inputSchema: SummarizeServiceRequestInputSchema,
    outputSchema: SummarizeServiceRequestOutputSchema,
  },
  async input => {
    const {output} = await summarizeRequestPrompt(input);
    return output!;
  }
);
