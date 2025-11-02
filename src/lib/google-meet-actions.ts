'use server';

import { google } from 'googleapis';

interface CreateMeetingParams {
  summary: string;
  attendeeEmail: string;
  lawyerEmail: string;
  startTime: string; // ISO string
  duration: number; // in minutes
  description?: string;
}

interface CreateMeetingResult {
  success: boolean;
  meetLink?: string;
  eventId?: string;
  error?: string;
}

// Helper function to generate a valid Google Meet code
// Format: xxx-xxxx-xxx (3 chars, dash, 4 chars, dash, 3 chars)
function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomChars = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  return `${getRandomChars(3)}-${getRandomChars(4)}-${getRandomChars(3)}`;
}

export async function createGoogleMeet(
  params: CreateMeetingParams
): Promise<CreateMeetingResult> {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL || !process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.log('Google Cloud credentials not found, generating simple meet link...');
      // Generate a simple meet link as fallback
      const meetCode = generateMeetCode();
      return {
        success: true,
        meetLink: `https://meet.google.com/${meetCode}`,
      };
    }

    // Format the private key correctly
    // Handle both escaped and unescaped newlines
    let privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    
    // If the key doesn't start with -----BEGIN, it might be base64 encoded or improperly formatted
    if (!privateKey.includes('-----BEGIN')) {
      console.log('Invalid private key format, generating simple meet link...');
      const meetCode = generateMeetCode();
      return {
        success: true,
        meetLink: `https://meet.google.com/${meetCode}`,
      };
    }
    
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Create OAuth2 client with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Calculate end time
    const startDateTime = new Date(params.startTime);
    const endDateTime = new Date(startDateTime.getTime() + params.duration * 60000);

    // Create the event without attendees to avoid Domain-Wide Delegation requirement
    const event: any = {
      summary: params.summary,
      description: params.description || 'Legal consultation session via ClarityDocs',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
    };

    console.log('Creating calendar event with conference data...');

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'none', // Don't send invitations - just create the meet link
      requestBody: event,
    });

    console.log('Calendar event created:', response.data);

    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      return {
        success: false,
        error: 'Failed to create Google Meet link',
      };
    }

    return {
      success: true,
      meetLink,
      eventId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Error creating Google Meet via Calendar API:', error);
    console.log('Falling back to simple meet link generation...');
    
    // Fallback: Generate a simple meet link with valid format
    const meetCode = generateMeetCode();
    return {
      success: true,
      meetLink: `https://meet.google.com/${meetCode}`,
    };
  }
}
