import { Handler } from '@netlify/functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  try {
    // Remove any surrounding quotes and whitespace
    let formattedKey = key.trim().replace(/^["']|["']$/g, '');
    
    // Split by escaped newlines and filter out empty lines
    const lines = formattedKey.split('\\n').filter(line => line.trim());
    
    // Reconstruct the key with proper formatting
    formattedKey = lines.join('\n');
    
    // Ensure proper header and footer
    if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
    }
    if (!formattedKey.endsWith('-----END PRIVATE KEY-----')) {
      formattedKey = formattedKey + '\n-----END PRIVATE KEY-----';
    }
    
    // Log key structure for debugging
    const keyLines = formattedKey.split('\n');
    console.log('Key structure check:', {
      totalLines: keyLines.length,
      hasCorrectHeader: keyLines[0] === '-----BEGIN PRIVATE KEY-----',
      hasCorrectFooter: keyLines[keyLines.length - 1] === '-----END PRIVATE KEY-----',
      middleLineLength: keyLines.length > 2 ? keyLines[1].length : 0,
    });
    
    return formattedKey;
  } catch (error) {
    console.error('Error formatting private key:', error);
    throw error;
  }
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
        hasProjectId: !!projectId,
        privateKeyLength: privateKey?.length || 0,
      });
      throw new Error('Missing required Google Cloud credentials');
    }

    console.log('Credentials found, creating client with:', {
      clientEmail,
      projectId,
      privateKeyLength: privateKey.length,
      privateKeyStart: privateKey.substring(0, 40) + '...',
      privateKeyEnd: '...' + privateKey.substring(privateKey.length - 40),
    });
    
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