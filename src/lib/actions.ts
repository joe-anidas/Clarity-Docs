
'use server';

import { generatePlainLanguageSummary, GeneratePlainLanguageSummaryOutput } from '@/ai/flows/generate-plain-language-summary';
import { lookupTermDefinition } from '@/ai/flows/lookup-term-definitions';
import { processDocument } from '@/ai/flows/process-document-flow';
import { answerWhatIfQuestion } from '@/ai/flows/answer-what-if-question';
import { generateExamples } from '@/ai/flows/generate-examples';
import { z } from 'zod';
import { generateRiskScore, GenerateRiskScoreOutput } from '@/ai/flows/generate-risk-score';
import { generateContractTimeline } from '@/ai/flows/generate-contract-timeline';
import { generateNegotiationSuggestions } from '@/ai/flows/generate-negotiation-suggestions';
import { maskSensitiveData } from '@/ai/flows/mask-sensitive-data';

const summarizeSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty.'),
  agreementType: z.string().optional(),
});

export async function summarizeDocumentAction(input: { documentText: string, agreementType?: string }): Promise<Partial<GeneratePlainLanguageSummaryOutput> & { error?: string; maskedText?: string }> {
  try {
    const validatedInput = summarizeSchema.parse(input);
    
    // First, mask sensitive information
    const maskingResult = await maskSensitiveData({ documentText: validatedInput.documentText });
    
    // Then generate summary using masked text
    const result = await generatePlainLanguageSummary({
      documentText: maskingResult.maskedText,
      agreementType: validatedInput.agreementType,
    });
    
    // Return both the summary and the masked text
    return { 
      ...result, 
      maskedText: maskingResult.maskedText 
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate summary. Please try again.' };
  }
}

const lookupSchema = z.object({
  term: z.string().min(1, 'Term cannot be empty.'),
  context: z.string().min(1, 'Context cannot be empty.'),
});

export async function lookupTermAction(input: { term: string; context: string }) {
  try {
    const validatedInput = lookupSchema.parse(input);
    const result = await lookupTermDefinition(validatedInput);
    return { definition: result.definition };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to look up definition. Please try again.' };
  }
}

const processDocumentSchema = z.object({
  fileDataUri: z.string().min(1, 'File data URI cannot be empty.'),
});

export async function processDocumentAction(input: { fileDataUri: string }) {
  try {
    const validatedInput = processDocumentSchema.parse(input);
    // First, extract text from the document using Document AI
    const result = await processDocument(validatedInput);
    
    // Then, mask sensitive information in the extracted text
    const maskingResult = await maskSensitiveData({ documentText: result.text });
    
    return { 
      documentText: maskingResult.maskedText,
      maskedEntities: maskingResult.maskedEntities,
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to process document with Document AI. Please try again.' };
  }
}

const TranslationDataSchema = z.object({
    summary: z.array(z.object({ keyPoint: z.string(), description: z.string() })).optional(),
    dos: z.array(z.string()).optional(),
    donts: z.array(z.string()).optional(),
});
type TranslationData = z.infer<typeof TranslationDataSchema>;

const translateSchema = z.object({
  data: TranslationDataSchema,
  targetLanguage: z.string().min(1, 'Target language cannot be empty.'),
});

export async function translateTextAction(input: { data: TranslationData, targetLanguage: string }) {
  try {
    const validatedInput = translateSchema.parse(input);
    const { data, targetLanguage } = validatedInput;

    const { GOOGLE_CLOUD_API_KEY } = process.env;
    if (!GOOGLE_CLOUD_API_KEY) throw new Error('Missing GOOGLE_CLOUD_API_KEY from .env');

    const textsToTranslate: string[] = [];
    
    // Flatten all text fields into a single array
    data.summary?.forEach(item => textsToTranslate.push(item.keyPoint, item.description));
    data.dos?.forEach(item => textsToTranslate.push(item));
    data.donts?.forEach(item => textsToTranslate.push(item));
    
    if (textsToTranslate.length === 0) {
      return { translatedData: {} };
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_CLOUD_API_KEY}`;
    
    // Translate each text individually to maintain proper formatting for Indic languages
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ 
        q: textsToTranslate, 
        target: targetLanguage, 
        format: 'text',
        model: 'nmt' // Use Neural Machine Translation for better quality
      }),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      console.error('Translation API Error:', responseBody);
      throw new Error(responseBody.error?.message || 'Unknown API error.');
    }

    const translations = responseBody.data?.translations;
    if (!translations || translations.length === 0) throw new Error('Translation failed to return text.');

    const translatedTexts = translations.map((t: any) => t.translatedText.trim());
    let currentIndex = 0;
    
    const translatedData: TranslationData = {};

    if (data.summary) {
        translatedData.summary = data.summary.map(() => ({
            keyPoint: translatedTexts[currentIndex++],
            description: translatedTexts[currentIndex++],
        }));
    }
    if (data.dos) {
        translatedData.dos = data.dos.map(() => translatedTexts[currentIndex++]);
    }
    if (data.donts) {
        translatedData.donts = data.donts.map(() => translatedTexts[currentIndex++]);
    }

    return { translatedData };
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.issues ? JSON.stringify(error.issues) : (error.message || 'Please try again.');
    return { error: `Failed to translate text: ${errorMessage}` };
  }
}


const riskAnalysisSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty.'),
  agreementType: z.string().optional(),
});

export async function generateRiskScoreAction(input: { documentText: string, agreementType?: string }) {
  try {
    const validatedInput = riskAnalysisSchema.parse(input);
    const result = await generateRiskScore(validatedInput);
    return { riskScore: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate risk analysis. Please try again.' };
  }
}

const whatIfSchema = z.object({
    documentText: z.string().min(1, 'Document text cannot be empty.'),
    question: z.string().min(1, 'Question cannot be empty.'),
});

export async function answerWhatIfQuestionAction(input: { documentText: string, question: string }) {
    try {
        const validatedInput = whatIfSchema.parse(input);
        const result = await answerWhatIfQuestion(validatedInput);
        return { answer: result.answer };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to answer question. Please try again.' };
    }
}

const examplesSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty.'),
});

export async function generateExamplesAction(input: { documentText: string }) {
  try {
    const validatedInput = examplesSchema.parse(input);
    const result = await generateExamples(validatedInput);
    return { examples: result.examples };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate examples. Please try again.' };
  }
}

const timelineSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty.'),
  agreementType: z.string().optional(),
});

export async function generateContractTimelineAction(input: { documentText: string, agreementType?: string }) {
  try {
    const validatedInput = timelineSchema.parse(input);
    const result = await generateContractTimeline(validatedInput);
    return { timeline: result.timeline };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate contract timeline. Please try again.' };
  }
}

const negotiationSuggestionsSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty.'),
});

export async function generateNegotiationSuggestionsAction(input: { documentText: string }) {
    try {
        const validatedInput = negotiationSuggestionsSchema.parse(input);
        const result = await generateNegotiationSuggestions(validatedInput);
        return { suggestions: result.suggestions };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to generate negotiation suggestions. Please try again.' };
    }
}
