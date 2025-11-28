import { DlpServiceClient } from '@google-cloud/dlp';

const dlp = new DlpServiceClient({
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export interface DlpMaskResult {
    maskedText: string;
    maskedEntities: Array<{
        entityType: string;
        originalText: string;
        maskedText: string;
    }>;
}

export async function maskSensitiveDataDLP(text: string): Promise<DlpMaskResult> {
    // Prioritize GCLOUD_PROJECT env var if set, otherwise fallback to client's project
    const projectId = process.env.GCLOUD_PROJECT || await dlp.getProjectId();

    const infoTypes = [
        { name: 'PERSON_NAME' },
        { name: 'EMAIL_ADDRESS' },
        { name: 'PHONE_NUMBER' },
        { name: 'INDIA_PAN_INDIVIDUAL' },
        { name: 'INDIA_AADHAAR_INDIVIDUAL' },
        { name: 'CREDIT_CARD_NUMBER' },
        // { name: 'DATE_OF_BIRTH' }, // Commented out to prevent masking contract dates
        { name: 'PASSPORT' },
        { name: 'INDIA_GST_INDIVIDUAL' }
    ];

    // Construct the inspection configuration
    const inspectConfig = {
        infoTypes: infoTypes,
        minLikelihood: 'LIKELIHOOD_UNSPECIFIED' as const,
    };

    // Construct the de-identification configuration
    const deidentifyConfig = {
        infoTypeTransformations: {
            transformations: [
                {
                    primitiveTransformation: {
                        replaceWithInfoTypeConfig: {}, // Replaces with [INFO_TYPE]
                    },
                },
            ],
        },
    };

    // Construct the request
    const request = {
        parent: `projects/${projectId}/locations/global`,
        item: {
            value: text,
        },
        inspectConfig: inspectConfig,
        deidentifyConfig: deidentifyConfig,
    };

    // Run de-identification
    const [response] = await dlp.deidentifyContent(request);
    const maskedText = response.item?.value || text;

    return {
        maskedText,
        maskedEntities: [],
    };
}
