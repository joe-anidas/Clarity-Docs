import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { ai } from './src/ai/genkit';

async function test() {
    console.log('Testing Vertex AI Authentication...');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

    try {
        const response = await ai.generate({
            model: 'vertexai/gemini-1.0-pro',
            prompt: 'Hello, are you working?',
            config: { temperature: 0 },
        });
        console.log('Response:', response.text());
        console.log('SUCCESS: Vertex AI is working!');
    } catch (error: any) {
        console.error('FAILURE DETAILS:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

test();
