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

    const systemPrompt = `You are a data privacy expert. Your task is to identify and mask ALL sensitive personal information in legal documents while preserving the document's structure and meaning.

ENTITIES TO MASK:
1. PERSON_NAME: All personal names, full names, first names, last names, initials
2. ORGANIZATION: Company names, business names, partnership firm names
3. ADDRESS: Complete addresses, street names, house numbers, building names, city, state, PIN codes
4. LAND_DETAILS: Survey numbers, plot numbers, property numbers, cadastral numbers, extent/area measurements
5. PHONE: Phone numbers, mobile numbers, landline numbers (with or without country code)
6. EMAIL: Email addresses
7. ID_NUMBER: Aadhar numbers, PAN numbers, passport numbers, driving license numbers, voter ID, GST numbers
8. FINANCIAL: Bank account numbers, IFSC codes, transaction amounts, salary figures
9. DATE_OF_BIRTH: Dates that appear to be birth dates
10. SIGNATURE: References to signatures or thumbprints

MASKING RULES:
- Replace PERSON_NAME with [PERSON_NAME_1], [PERSON_NAME_2], etc. (keep consistent for the same person)
- Replace ORGANIZATION with [ORGANIZATION_1], [ORGANIZATION_2], etc.
- Replace ADDRESS with [ADDRESS_1], [ADDRESS_2], etc.
- Replace LAND_DETAILS with [LAND_DETAIL_1], [LAND_DETAIL_2], etc.
- Replace PHONE with [PHONE_NUMBER_1], [PHONE_NUMBER_2], etc.
- Replace EMAIL with [EMAIL_1], [EMAIL_2], etc.
- Replace ID_NUMBER with [ID_NUMBER_1], [ID_NUMBER_2], etc.
- Replace FINANCIAL with [ACCOUNT_NUMBER_1], [AMOUNT_1], etc.
- Replace DATE_OF_BIRTH with [DOB_1], [DOB_2], etc.
- Keep generic roles like "Landlord", "Tenant", "Lessee", "Lessor" unmasked if they are used as titles
- Keep legal terminology and clause descriptions unmasked
- Maintain document structure, formatting, and readability

IMPORTANT:
- Be thorough and mask ALL instances of sensitive data
- Use consistent numbering for the same entity appearing multiple times
- Preserve the document's legal meaning and structure
- Do not mask generic legal terms, dates that are contract dates (not DOB), or standard legal language`;

    const userPrompt = `Mask all sensitive information in the following document:

${documentText}

Return:
1. The complete masked document text
2. A list of all masked entities with their types, original text, and masked replacements`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      prompt: userPrompt,
      output: {
        schema: MaskSensitiveDataOutputSchema,
      },
      config: {
        temperature: 0.1, // Low temperature for consistent masking
      },
    });

    if (!result.output) {
      throw new Error('Failed to mask sensitive data - no output generated');
    }

    return result.output;
  }
);
