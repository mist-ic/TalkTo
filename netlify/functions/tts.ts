import { Handler } from '@netlify/functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  try {
    console.log('Starting private key formatting...');
    // Remove any surrounding quotes and whitespace
    let formattedKey = key.trim().replace(/^["']|["']$/g, '');
    
    // Split by escaped newlines and filter out empty lines
    const lines = formattedKey.split('\\n').filter(line => line.trim());
    console.log(`Found ${lines.length} lines in private key`);
    
    // Reconstruct the key with proper formatting
    formattedKey = lines.join('\n');
    
    // Ensure proper header and footer
    if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.log('Adding missing BEGIN marker');
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
    }
    if (!formattedKey.endsWith('-----END PRIVATE KEY-----')) {
      console.log('Adding missing END marker');
      formattedKey = formattedKey + '\n-----END PRIVATE KEY-----';
    }
    
    return formattedKey;
  } catch (error) {
    console.error('Error in formatPrivateKey:', error);
    throw error;
  }
};

// Initialize client with better error handling
const getClient = () => {
  try {
    console.log('Starting TTS client initialization...');
    const privateKey = formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY);
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      console.error('Missing credentials:', {
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId,
        privateKeyLength: privateKey?.length || 0,
      });
      throw new Error('Missing required Google Cloud credentials');
    }

    console.log('Creating TTS client with:', {
      clientEmail,
      projectId,
      privateKeyLength: privateKey.length,
      privateKeyStart: privateKey.substring(0, 40) + '...',
      privateKeyEnd: '...' + privateKey.substring(privateKey.length - 40),
    });

    const client = new TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
    });

    console.log('TTS client created successfully');
    return client;
  } catch (error) {
    console.error('Error in getClient:', error);
    throw error;
  }
};

export const handler: Handler = async (event) => {
  console.log('TTS function invoked with method:', event.httpMethod);
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Parsing request body...');
    const { text } = JSON.parse(event.body || '{}');

    if (!text) {
      console.log('No text provided in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' }),
      };
    }

    console.log('Request text:', text.substring(0, 50) + '...');
    console.log('Getting TTS client...');
    const client = getClient();

    console.log('Making synthesizeSpeech request...');
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { 
        audioEncoding: 'MP3',
        sampleRateHertz: 24000,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    });
    console.log('synthesizeSpeech request completed');

    if (!response.audioContent) {
      console.error('No audio content in response');
      throw new Error('No audio content received');
    }

    console.log('Audio content received, length:', response.audioContent.length);
    const base64Audio = Buffer.from(response.audioContent).toString('base64');
    console.log('Audio converted to base64, length:', base64Audio.length);

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
    console.error('Error in TTS handler:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      }),
    };
  }
}; 