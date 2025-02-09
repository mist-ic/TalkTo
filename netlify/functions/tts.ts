import { Handler } from '@netlify/functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
};

// Initialize client with better error handling
const getClient = () => {
  try {
    const privateKey = formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY);
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      console.error('Missing credentials:', {
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId
      });
      throw new Error('Missing required Google Cloud credentials');
    }

    return new TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
    });
  } catch (error) {
    console.error('Error initializing TTS client:', error);
    throw error;
  }
};

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' }),
      };
    }

    console.log('Initializing TTS client...');
    const client = getClient();
    console.log('TTS client initialized successfully');

    console.log('Sending TTS request...');
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    });
    console.log('TTS request completed successfully');

    if (!response.audioContent) {
      throw new Error('No audio content received');
    }

    // Convert Buffer to base64
    const audioBase64 = Buffer.from(response.audioContent).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        audioContent: audioBase64 
      }),
    };
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
}; 