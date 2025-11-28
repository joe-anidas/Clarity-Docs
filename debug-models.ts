const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Load credentials from temp file if it exists (from our workaround)
const projectId = process.env.GCLOUD_PROJECT || 'claritydocs-479010';
const location = 'us-west1';

// We need to ensure credentials are set for this script too
if (process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    const credentialsPath = path.join(os.tmpdir(), `google-credentials-${projectId}.json`);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log(`Using credentials from: ${credentialsPath}`);
}

async function listModels() {
    const vertex_ai = new VertexAI({ project: projectId, location: location });
    const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
    });

    console.log(`Attempting to access model in project ${projectId}, location ${location}...`);

    try {
        const resp = await generativeModel.generateContent('Hello');
        console.log('SUCCESS: Model accessed!');
        console.log('Response:', JSON.stringify(resp.response));
    } catch (err) {
        console.error('FAILURE: Could not access model.');
        console.error(err.message);
    }
}

listModels();
