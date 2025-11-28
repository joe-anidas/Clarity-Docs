'use server';
/**
 * @fileOverview An AI flow that detects and masks sensitive information in documents.
 * 
 * This flow identifies and replaces sensitive information such as:
 * - Personal names (individuals and organizations)
 * - Addresses and land details (survey numbers, plot numbers, etc.)
 * - Contact information (phone numbers, emails)
 * - Financial information (account numbers, amounts)
 * - Identification numbers (Aadhar, PAN, passport, etc.)
 * - Dates of birth
 */

import { ai } from '@/ai/genkit';
import { maskSensitiveDataDLP } from '@/lib/dlp';
import { z } from 'genkit';

const MaskSensitiveDataInputSchema = z.object({
  documentText: z.string().describe('The original document text to be masked.'),
});
export type MaskSensitiveDataInput = z.infer<typeof MaskSensitiveDataInputSchema>;

const MaskSensitiveDataOutputSchema = z.object({
  maskedText: z.string().describe('The document text with sensitive information masked.'),
  maskedEntities: z.array(z.object({
    entityType: z.string().describe('Type of sensitive entity (e.g., PERSON_NAME, ADDRESS, PHONE, EMAIL, etc.)'),
    originalText: z.string().describe('The original sensitive text that was masked'),
    maskedText: z.string().describe('The masked replacement text'),
  })).describe('List of all entities that were masked'),
});
export type MaskSensitiveDataOutput = z.infer<typeof MaskSensitiveDataOutputSchema>;

export async function maskSensitiveData(
  input: MaskSensitiveDataInput
): Promise<MaskSensitiveDataOutput> {
  return maskSensitiveDataFlow(input);
}

const maskSensitiveDataFlow = ai.defineFlow(
  {
    name: 'maskSensitiveDataFlow',
    inputSchema: MaskSensitiveDataInputSchema,
    outputSchema: MaskSensitiveDataOutputSchema,
  },
  async (input) => {
    const { documentText } = input;

    // Use Google Cloud DLP to mask sensitive data
    // This addresses VULN-001 by avoiding sending raw PII to the LLM.
    const { maskedText, maskedEntities } = await maskSensitiveDataDLP(documentText);

    return {
      maskedText,
      maskedEntities,
    };
  }
);
