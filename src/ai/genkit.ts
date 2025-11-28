import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Workaround: Write credentials to a temp file for Vertex AI ADC
if (process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
  const credentialsPath = path.join(os.tmpdir(), `google-credentials-${process.env.GCLOUD_PROJECT || 'default'}.json`);
  const credentials = {
    type: 'service_account',
    project_id: process.env.GCLOUD_PROJECT,
    private_key_id: 'undefined',
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: 'undefined',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLOUD_CLIENT_EMAIL)}`,
  };

  try {
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log(`[Genkit] Set GOOGLE_APPLICATION_CREDENTIALS to ${credentialsPath}`);
  } catch (err) {
    console.error('[Genkit] Failed to write credentials file:', err);
  }
}

export const ai = genkit({
  plugins: [vertexAI({
    location: 'us-central1',
    projectId: process.env.GCLOUD_PROJECT || 'claritydocs-479010',
  })],
  model: 'vertexai/gemini-2.5-flash',
});
