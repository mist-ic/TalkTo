import { Handler } from '@netlify/functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  // Handle both escaped and unescaped newlines
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

    console.log('Credentials found, initializing client...');
    
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
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' }),
      };
    }

    console.log('Initializing TTS client...');
    const client = getClient();
    console.log('TTS client initialized successfully');

    console.log('Sending TTS request with text:', text.substring(0, 50) + '...');
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { 
        audioEncoding: 'MP3',
        sampleRateHertz: 24000,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    });
    console.log('TTS request completed successfully');

    if (!response.audioContent) {
      throw new Error('No audio content received');
    }

    // Convert Buffer to base64 string properly
    const base64Audio = Buffer.from(response.audioContent).toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString(),
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
}; 